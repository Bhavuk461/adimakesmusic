/**
 * The booking server: the only place the Razorpay secret lives.
 *
 *   GET  /              is it switched on?
 *   GET  /availability  dates that are already taken (no personal details)
 *   POST /order         booking details → a Razorpay order at that set's price
 *   POST /verify        Razorpay's checkout result → is the signature genuine?
 *   GET  /bookings      every booking, for the dashboard (password required)
 *
 * The site is static (GitHub Pages), and Razorpay refunds any payment that
 * isn't tied to an order created with the secret — hence this small server.
 * Prices come from src/lib/packages.ts; the browser only names an option, so
 * nobody can pay a different amount by editing the request.
 *
 * There is no database. Each booking is a Razorpay order with the booking
 * written into its notes, so the dashboard reads bookings — and their
 * payments and refunds — straight from Razorpay.
 *
 * Set it up with `npm run pay:setup` (see scripts/pay-setup.mjs).
 */
import { isConfirmed, type BookingRecord, type BookingStatus } from "../../src/lib/booking-record.ts";
import { EVENT_TYPES, findOption, optionLabel } from "../../src/lib/packages.ts";

export interface Env {
  /** Both halves of the Razorpay key pair are Cloudflare secrets (pay:setup). */
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  /** Opens the dashboard. A Cloudflare secret (pay:setup / pay:password). */
  DASHBOARD_PASSWORD?: string;
  /** Comma-separated origins allowed to call this worker. */
  ALLOWED_ORIGINS: string;
  /** How many paid bookings fill a date (wrangler.toml). Default 1. */
  BOOKINGS_PER_DAY?: string;
}

const RAZORPAY = "https://api.razorpay.com/v1";
const MAX_BODY = 8 * 1024;
/** Our receipts start with this — any other orders on the account aren't bookings. */
const RECEIPT_PREFIX = "bk-";
/** Razorpay lists 100 orders at a time; this reads up to 2,000. */
const MAX_PAGES = 20;

type Headers = Record<string, string>;

const json = (data: unknown, status: number, headers: Headers) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });

/** Now in India, as "yyyy-mm-ddThh:mm" — bookings are for dates and times there. */
const nowIST = (now = Date.now()) => new Date(now + 5.5 * 3600_000).toISOString().slice(0, 16);
const todayIST = (now = Date.now()) => nowIST(now).slice(0, 10);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "19 Jan 2027" — how the date reads in Razorpay's checkout and receipt. */
const prettyDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

function addYears(iso: string, years: number) {
  const [y, m, d] = iso.split("-");
  return `${Number(y) + years}-${m}-${d}`;
}

function text(body: Record<string, unknown>, key: string, max: number) {
  const v = body[key];
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

type Booking = {
  optionId: string;
  date: string;
  time: string;
  event: string;
  venue: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
};

/** Returns the cleaned booking, or the first thing wrong with it. */
export function readBooking(raw: unknown, now = Date.now()): Booking | { error: string; field?: string } {
  if (!raw || typeof raw !== "object") return { error: "Invalid request." };
  const b = raw as Record<string, unknown>;
  const booking: Booking = {
    optionId: text(b, "optionId", 32),
    date: text(b, "date", 10),
    time: text(b, "time", 5),
    event: text(b, "event", 60),
    venue: text(b, "venue", 160),
    name: text(b, "name", 80),
    phone: text(b, "phone", 24),
    email: text(b, "email", 120),
    notes: text(b, "notes", 600),
  };

  const today = todayIST(now);
  if (!findOption(booking.optionId)) return { error: "Pick a set first.", field: "optionId" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.date) || Number.isNaN(Date.parse(booking.date)))
    return { error: "Add the date of your event.", field: "date" };
  if (booking.date < today) return { error: "That date has already passed.", field: "date" };
  if (booking.date > addYears(today, 3)) return { error: "That date is too far ahead to book online.", field: "date" };
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(booking.time)) return { error: "Pick a start time.", field: "time" };
  if (`${booking.date}T${booking.time}` <= nowIST(now)) return { error: "That time has already passed.", field: "time" };
  if (!(EVENT_TYPES as readonly string[]).includes(booking.event)) return { error: "Tell us the occasion.", field: "event" };
  if (booking.venue.length < 2) return { error: "Add the venue and city.", field: "venue" };
  if (booking.name.length < 2) return { error: "Add your name.", field: "name" };
  const digits = booking.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return { error: "Add a number we can reach you on.", field: "phone" };
  if (booking.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email))
    return { error: "That email doesn't look right.", field: "email" };
  return booking;
}

/* ───────────────────────────── Razorpay ──────────────────────────── */

type RzpPayment = {
  id: string;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  method?: string;
  amount_refunded?: number;
  refund_status?: "partial" | "full" | null;
  bank?: string | null;
  wallet?: string | null;
  vpa?: string | null;
  email?: string | null;
  contact?: string | null;
  error_description?: string | null;
  created_at: number;
};

type RzpOrder = {
  id: string;
  amount: number;
  amount_paid?: number;
  currency: string;
  receipt?: string | null;
  status: "created" | "attempted" | "paid";
  attempts?: number;
  /** An object of notes — or [] when there are none. */
  notes?: Record<string, string> | unknown[];
  created_at: number;
  payments?: { items?: RzpPayment[] };
};

function razorpay(env: Env, path: string, init: { method?: string; body?: unknown } = {}) {
  return fetch(`${RAZORPAY}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`,
      ...(init.body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}

/** Every order the booking page has created, newest first, with its payments. */
async function fetchOrders(env: Env): Promise<RzpOrder[]> {
  const all: RzpOrder[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await razorpay(env, `/orders?count=100&skip=${page * 100}&expand[]=payments`);
    if (!res.ok) {
      console.error("razorpay order list failed", res.status);
      throw new Error("razorpay");
    }
    const items = ((await res.json()) as { items?: RzpOrder[] }).items ?? [];
    all.push(...items);
    if (items.length < 100) break;
  }
  return all.filter((o) => typeof o.receipt === "string" && o.receipt.startsWith(RECEIPT_PREFIX));
}

// A short-lived copy, so busy booking pages don't each ask Razorpay for the
// same list. Anything that changes a booking — or needs to be exact — skips it.
let recent: { at: number; orders: RzpOrder[] } | null = null;

async function listOrders(env: Env, fresh: boolean) {
  if (!fresh && recent && Date.now() - recent.at < 60_000) return recent.orders;
  const orders = await fetchOrders(env);
  recent = { at: Date.now(), orders };
  return orders;
}

/** Forget the cached order list (after a payment, and between tests). */
export function forgetOrders() {
  recent = null;
}

const notesOf = (o: RzpOrder): Record<string, string> =>
  o.notes && !Array.isArray(o.notes) ? (o.notes as Record<string, string>) : {};

/** The payment that settled the order — or, failing that, the latest attempt. */
function paymentOf(o: RzpOrder): RzpPayment | undefined {
  const items = o.payments?.items ?? [];
  return (
    items.find((p) => p.status === "captured" || p.status === "refunded") ??
    items.find((p) => p.status === "authorized") ??
    [...items].sort((a, b) => b.created_at - a.created_at)[0]
  );
}

function statusOf(o: RzpOrder, p: RzpPayment | undefined): BookingStatus {
  if (p?.status === "refunded" || p?.refund_status === "full") return "refunded";
  if (p?.status === "captured") return p.refund_status === "partial" ? "part refunded" : "paid";
  if (p?.status === "authorized") return "processing";
  if (o.status === "paid") return "paid";
  if (p?.status === "failed") return "failed";
  return "not paid";
}

export function toRecord(o: RzpOrder): BookingRecord {
  const n = notesOf(o);
  const p = paymentOf(o);
  return {
    orderId: o.id,
    receipt: o.receipt ?? "",
    createdAt: o.created_at,
    status: statusOf(o, p),
    amount: o.amount / 100,
    amountRefunded: (p?.amount_refunded ?? 0) / 100,
    set: n.set ?? "",
    optionId: n.option ?? "",
    date: n.date ?? "",
    time: n.time ?? "",
    occasion: n.occasion ?? "",
    venue: n.venue ?? "",
    name: n.name ?? "",
    phone: n.phone ?? "",
    email: n.email ?? "",
    notes: [n.notes, n.notes_2, n.notes_3].filter(Boolean).join(""),
    payment: p
      ? {
          id: p.id,
          method: p.method ?? "",
          detail: p.vpa || p.bank || p.wallet || "",
          at: p.created_at,
          email: p.email ?? "",
          contact: p.contact ?? "",
          error: p.status === "failed" ? (p.error_description ?? "") : "",
        }
      : null,
    attempts: o.attempts ?? (o.payments?.items ?? []).length,
  };
}

const perDay = (env: Env) => Math.max(1, Number.parseInt(env.BOOKINGS_PER_DAY ?? "", 10) || 1);

/** Dates from today on that already have as many confirmed bookings as a day takes. */
export function fullDates(orders: RzpOrder[], perDayLimit: number, today = todayIST()) {
  const count = new Map<string, number>();
  for (const o of orders) {
    const record = toRecord(o);
    if (record.date >= today && isConfirmed(record)) count.set(record.date, (count.get(record.date) ?? 0) + 1);
  }
  return [...count].filter(([, n]) => n >= perDayLimit).map(([date]) => date).sort();
}

/* ───────────────────────────── the routes ─────────────────────────── */

async function availability(env: Env, cors: Headers) {
  try {
    return json({ configured: true, booked: fullDates(await listOrders(env, false), perDay(env)) }, 200, cors);
  } catch {
    // the booking page still works without the list: /order checks again
    return json({ configured: true, booked: [] }, 200, cors);
  }
}

async function createOrder(raw: unknown, env: Env, cors: Headers) {
  const booking = readBooking(raw);
  if ("error" in booking) return json(booking, 400, cors);

  // one booking per date (or whatever BOOKINGS_PER_DAY says) — checked
  // against Razorpay itself, not the cached list
  let taken: string[];
  try {
    taken = fullDates(await listOrders(env, true), perDay(env));
  } catch {
    return json({ error: "We couldn't check that date just now. Please try again." }, 502, cors);
  }
  if (taken.includes(booking.date))
    return json({ error: "That date is already booked — please pick another.", field: "date" }, 409, cors);

  const { set, option } = findOption(booking.optionId)!;
  const description = `${optionLabel(set, option)} · ${prettyDate(booking.date)}`;

  // Razorpay keeps up to 15 notes of 256 characters with each order: this is
  // the booking record the dashboard reads back.
  const notes: Record<string, string> = {};
  const add = (k: string, v: string) => {
    if (v) notes[k] = v.slice(0, 256);
  };
  add("set", optionLabel(set, option));
  add("option", option.id);
  add("date", booking.date);
  add("time", booking.time);
  add("occasion", booking.event);
  add("venue", booking.venue);
  add("name", booking.name);
  add("phone", booking.phone);
  add("email", booking.email);
  // up to 600 characters of notes, in three slots
  (booking.notes.match(/[\s\S]{1,250}/g) ?? []).slice(0, 3).forEach((part, i) => add(i ? `notes_${i + 1}` : "notes", part));
  add("source", "adimakesmusic.in");

  const res = await razorpay(env, "/orders", {
    method: "POST",
    body: {
      amount: option.price * 100, // paise
      currency: "INR",
      receipt: `${RECEIPT_PREFIX}${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`,
      notes,
      // take the money as soon as the bank approves it, whatever the
      // account's default — an uncaptured payment is refunded after a few days
      payment: {
        capture: "automatic",
        capture_options: { automatic_expiry_period: 12, manual_expiry_period: 7200, refund_speed: "normal" },
      },
    },
  });

  if (!res.ok) {
    // the status is enough to debug from `npm run pay:logs`; never echo Razorpay's reply
    console.error("razorpay order failed", res.status);
    return json({ error: "We couldn't start the payment. Please try again in a minute." }, 502, cors);
  }

  const order = (await res.json()) as { id: string; amount: number; currency: string };
  return json(
    {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID,
      description,
    },
    200,
    cors,
  );
}

const enc = new TextEncoder();
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(message)));
}

/** Compares without leaking, through timing, how much of a guess was right. */
function sameText(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyPayment(raw: unknown, env: Env, cors: Headers) {
  const b = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const orderId = text(b, "razorpay_order_id", 64);
  const paymentId = text(b, "razorpay_payment_id", 64);
  const signature = text(b, "razorpay_signature", 128).toLowerCase();
  if (!/^order_\w+$/.test(orderId) || !/^pay_\w+$/.test(paymentId) || !/^[0-9a-f]{64}$/.test(signature))
    return json({ ok: false }, 400, cors);

  // Razorpay signs "order_id|payment_id" with the key secret
  const expected = await hmacHex(env.RAZORPAY_KEY_SECRET, `${orderId}|${paymentId}`);
  if (!sameText(expected, signature)) return json({ ok: false }, 400, cors);

  forgetOrders(); // the date is taken now
  // Belt and braces: the order asks Razorpay to capture automatically, but if
  // the payment is still only authorised, capture it here.
  try {
    const res = await razorpay(env, `/payments/${paymentId}`);
    if (res.ok) {
      const p = (await res.json()) as RzpPayment;
      if (p.status === "authorized")
        await razorpay(env, `/payments/${paymentId}/capture`, {
          method: "POST",
          body: { amount: p.amount, currency: p.currency },
        });
    }
  } catch {
    // the automatic capture still applies
  }
  return json({ ok: true }, 200, cors);
}

async function sha256(s: string) {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}

async function listBookings(request: Request, env: Env, cors: Headers) {
  if (!env.DASHBOARD_PASSWORD) return json({ error: "The dashboard password hasn't been set yet." }, 503, cors);
  const header = request.headers.get("Authorization") ?? "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  // hashed first, so the comparison is always over two equal-length strings
  if (!given || !sameText(await sha256(given), await sha256(env.DASHBOARD_PASSWORD))) {
    await new Promise((r) => setTimeout(r, 400)); // slows down guessing
    return json({ error: "That password didn't work." }, 401, cors);
  }
  try {
    const orders = await listOrders(env, true);
    return json({ bookings: orders.map(toRecord), fetchedAt: Date.now() }, 200, cors);
  } catch {
    return json({ error: "Razorpay didn't answer. Try again in a minute." }, 502, cors);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") ?? "";
    const allowed = (env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .includes(origin);
    const cors: Headers = allowed ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : { Vary: "Origin" };

    if (request.method === "OPTIONS") {
      if (!allowed) return new Response(null, { status: 403, headers: cors });
      return new Response(null, {
        status: 204,
        headers: {
          ...cors,
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const configured = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
    const route = `${request.method} ${url.pathname}`;

    if (route === "GET /") {
      return json({ ok: true, configured, dashboard: Boolean(env.DASHBOARD_PASSWORD) }, 200, cors);
    }
    if (!["GET /availability", "POST /order", "POST /verify", "GET /bookings"].includes(route)) {
      return json({ error: "Not found." }, 404, cors);
    }
    if (!allowed) return json({ error: "Not allowed." }, 403, cors);

    if (route === "GET /availability") {
      return configured ? availability(env, cors) : json({ configured: false, booked: [] }, 200, cors);
    }
    if (!configured) {
      return json({ error: "Online booking isn't switched on yet." }, 503, cors);
    }
    if (route === "GET /bookings") return listBookings(request, env, cors);

    if (Number(request.headers.get("Content-Length") ?? 0) > MAX_BODY) {
      return json({ error: "Invalid request." }, 413, cors);
    }
    let body: unknown;
    try {
      body = JSON.parse(await request.text());
    } catch {
      return json({ error: "Invalid request." }, 400, cors);
    }
    return route === "POST /order" ? createOrder(body, env, cors) : verifyPayment(body, env, cors);
  },
};
