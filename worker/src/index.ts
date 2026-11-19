/**
 * The payment worker: the only place the Razorpay secret lives.
 *
 *   POST /order   booking details → a Razorpay order for that set's price
 *   POST /verify  Razorpay's checkout result → is the signature genuine?
 *
 * The site is static (GitHub Pages), and Razorpay refunds any payment that
 * isn't tied to an order created with the secret — hence this small server.
 * Prices come from src/lib/packages.ts; the browser only names an option, so
 * nobody can pay a different amount by editing the request.
 *
 * Deploy and configure it with the "pay:*" scripts in package.json.
 */
import { EVENT_TYPES, findOption, optionLabel } from "../../src/lib/packages.ts";

export interface Env {
  /** Public half of the key pair — fine to keep in wrangler.toml. */
  RAZORPAY_KEY_ID: string;
  /** Set with `npm run pay:secret`; never committed. */
  RAZORPAY_KEY_SECRET: string;
  /** Comma-separated origins allowed to call this worker. */
  ALLOWED_ORIGINS: string;
}

const RAZORPAY = "https://api.razorpay.com/v1";
const MAX_BODY = 8 * 1024;

type Headers = Record<string, string>;

const json = (data: unknown, status: number, headers: Headers) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });

/** Today in India, as yyyy-mm-dd — bookings are for dates there. */
const todayIST = (now = Date.now()) => new Date(now + 5.5 * 3600_000).toISOString().slice(0, 10);

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
export function readBooking(raw: unknown, today = todayIST()): Booking | { error: string } {
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

  if (!findOption(booking.optionId)) return { error: "Pick a set first." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.date) || Number.isNaN(Date.parse(booking.date)))
    return { error: "Add the date of your event." };
  if (booking.date < today) return { error: "That date has already passed." };
  if (booking.date > addYears(today, 3)) return { error: "That date is too far ahead to book online." };
  if (booking.time && !/^\d{2}:\d{2}$/.test(booking.time)) booking.time = "";
  if (!(EVENT_TYPES as readonly string[]).includes(booking.event)) return { error: "Tell us the occasion." };
  if (booking.venue.length < 2) return { error: "Add the venue and city." };
  if (booking.name.length < 2) return { error: "Add your name." };
  const digits = booking.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return { error: "Add a number we can reach you on." };
  if (booking.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email))
    return { error: "That email doesn't look right." };
  return booking;
}

async function createOrder(raw: unknown, env: Env, cors: Headers) {
  const booking = readBooking(raw);
  if ("error" in booking) return json({ error: booking.error }, 400, cors);

  const { set, option } = findOption(booking.optionId)!;
  const description = `${optionLabel(set, option)} · ${prettyDate(booking.date)}`;

  // Razorpay keeps up to 15 notes of 256 characters with each order: this is
  // the booking record you'll see next to the payment in the dashboard.
  const notes: Record<string, string> = {};
  const add = (k: string, v: string) => {
    if (v) notes[k] = v.slice(0, 256);
  };
  add("set", optionLabel(set, option));
  add("date", booking.date);
  add("time", booking.time);
  add("occasion", booking.event);
  add("venue", booking.venue);
  add("name", booking.name);
  add("phone", booking.phone);
  add("email", booking.email);
  add("notes", booking.notes);

  const res = await fetch(`${RAZORPAY}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: option.price * 100, // paise
      currency: "INR",
      receipt: `bk-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`,
      notes,
    }),
  });

  if (!res.ok) {
    // the status is enough to debug from `wrangler tail`; never echo Razorpay's reply
    console.error("razorpay order failed", res.status);
    return json({ error: "We couldn't start the payment. Please try again, or book on WhatsApp." }, 502, cors);
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

async function hmacHex(secret: string, message: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
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
  return sameText(expected, signature) ? json({ ok: true }, 200, cors) : json({ ok: false }, 400, cors);
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
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (request.method === "GET" && url.pathname === "/") {
      return json({ ok: true, configured: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) }, 200, cors);
    }
    if (request.method !== "POST" || (url.pathname !== "/order" && url.pathname !== "/verify")) {
      return json({ error: "Not found." }, 404, cors);
    }
    if (!allowed) return json({ error: "Not allowed." }, 403, cors);
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      return json({ error: "Online payment isn't switched on yet — please book on WhatsApp." }, 503, cors);
    }
    if (Number(request.headers.get("Content-Length") ?? 0) > MAX_BODY) {
      return json({ error: "Invalid request." }, 413, cors);
    }

    let body: unknown;
    try {
      body = JSON.parse(await request.text());
    } catch {
      return json({ error: "Invalid request." }, 400, cors);
    }

    return url.pathname === "/order" ? createOrder(body, env, cors) : verifyPayment(body, env, cors);
  },
};
