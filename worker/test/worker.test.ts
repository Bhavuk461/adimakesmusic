// Run with: npm run pay:test   (Node's built-in runner; no real keys, no network)
import { strict as assert } from "node:assert";
import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, it } from "node:test";
import worker, { forgetOrders, readBooking, toRecord, type Env } from "../src/index.ts";

const SITE = "https://adimakesmusic.in";
const PASSWORD = "correct horse battery staple";
const env: Env = {
  RAZORPAY_KEY_ID: "rzp_test_key",
  RAZORPAY_KEY_SECRET: "test_secret_not_real",
  DASHBOARD_PASSWORD: PASSWORD,
  ALLOWED_ORIGINS: `${SITE},https://www.adimakesmusic.in`,
};

const daysAhead = (n: number) => new Date(Date.now() + n * 86400_000).toISOString().slice(0, 10);

const booking = (over: Record<string, unknown> = {}) => ({
  optionId: "band-2h",
  date: daysAhead(30),
  time: "20:00",
  event: "Wedding, sangeet or mehendi",
  venue: "The Courtyard, Gurugram",
  name: "Priya Sharma",
  phone: "+91 98765 43210",
  email: "priya@example.com",
  notes: "First dance: Tum Hi Ho",
  ...over,
});

const call = (
  path: string,
  init: { method?: string; origin?: string | null; body?: unknown; auth?: string; env?: Env } = {},
) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (init.origin !== null) headers.Origin = init.origin ?? SITE;
  if (init.auth !== undefined) headers.Authorization = `Bearer ${init.auth}`;
  const method = init.method ?? (init.body === undefined ? "GET" : "POST");
  return worker.fetch(
    new Request(`https://pay.example.workers.dev${path}`, {
      method,
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    }),
    init.env ?? env,
  );
};

/* Razorpay's API, faked: it keeps orders and payments in memory, records what
   the worker sends, and answers the way the real one does. */
type FakePayment = {
  id: string;
  amount: number;
  currency: string;
  status: "authorized" | "captured" | "refunded" | "failed";
  method: string;
  vpa?: string;
  amount_refunded: number;
  refund_status: "partial" | "full" | null;
  error_description?: string;
  created_at: number;
};
type FakeOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
  attempts: number;
  notes: Record<string, string> | unknown[];
  created_at: number;
  payments: FakePayment[];
  payment?: unknown;
};
type Sent = { method: string; path: string; auth: string | null; body: Record<string, unknown> | undefined };

let orders: FakeOrder[] = [];
let sent: Sent[] = [];
let failCreate = 0;
let seq = 0;
const realFetch = globalThis.fetch;
const now = () => Math.floor(Date.now() / 1000);

function seed(
  date: string,
  state: "paid" | "refunded" | "part refunded" | "authorized" | "failed" | "not paid",
  over: Partial<FakeOrder> = {},
) {
  const amount = 3060000;
  const id = `order_SEED${++seq}`;
  const pay = (status: FakePayment["status"], extra: Partial<FakePayment> = {}): FakePayment => ({
    id: `pay_SEED${seq}`,
    amount,
    currency: "INR",
    status,
    method: "upi",
    vpa: "priya@okhdfc",
    amount_refunded: 0,
    refund_status: null,
    created_at: now(),
    ...extra,
  });
  const payments =
    state === "paid"
      ? [pay("captured")]
      : state === "refunded"
        ? [pay("refunded", { amount_refunded: amount, refund_status: "full" })]
        : state === "part refunded"
          ? [pay("captured", { amount_refunded: 1530000, refund_status: "partial" })]
          : state === "authorized"
            ? [pay("authorized")]
            : state === "failed"
              ? [pay("failed", { error_description: "Payment was declined by the bank" })]
              : [];
  const order: FakeOrder = {
    id,
    amount,
    currency: "INR",
    receipt: `bk-seed-${seq}`,
    status: state === "not paid" ? "created" : state === "failed" ? "attempted" : "paid",
    attempts: payments.length,
    notes: { set: "The Band — 2 hours", option: "band-2h", date, time: "20:00", name: `Client ${seq}`, venue: "Somewhere" },
    created_at: now() - seq,
    payments,
    ...over,
  };
  orders.unshift(order);
  return order;
}

beforeEach(() => {
  orders = [];
  sent = [];
  failCreate = 0;
  forgetOrders();
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const method = init?.method ?? "GET";
    const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : undefined;
    sent.push({ method, path: url.pathname + url.search, auth: new Headers(init?.headers).get("Authorization"), body });
    const path = url.pathname.replace(/^\/v1/, "");

    if (method === "POST" && path === "/orders") {
      if (failCreate) return new Response(JSON.stringify({ error: { description: "secret detail" } }), { status: failCreate });
      const order: FakeOrder = {
        id: `order_TEST${++seq}`,
        amount: body!.amount as number,
        currency: body!.currency as string,
        receipt: body!.receipt as string,
        status: "created",
        attempts: 0,
        notes: (body!.notes as Record<string, string>) ?? [],
        created_at: now(),
        payments: [],
        payment: body!.payment,
      };
      orders.unshift(order);
      const { payments: _p, payment: _c, ...reply } = order;
      return Response.json(reply);
    }
    if (method === "GET" && path === "/orders") {
      const count = Number(url.searchParams.get("count") ?? 10);
      const skip = Number(url.searchParams.get("skip") ?? 0);
      const expand = url.searchParams.getAll("expand[]").includes("payments");
      const items = orders.slice(skip, skip + count).map(({ payments, payment: _c, ...o }) =>
        expand ? { ...o, payments: { entity: "collection", count: payments.length, items: payments } } : o,
      );
      return Response.json({ entity: "collection", count: items.length, items });
    }
    const m = /^\/payments\/(pay_\w+)(\/capture)?$/.exec(path);
    if (m) {
      const p = orders.flatMap((o) => o.payments).find((x) => x.id === m[1]);
      if (!p) return new Response("{}", { status: 404 });
      if (m[2] && method === "POST") p.status = "captured";
      return Response.json(p);
    }
    return new Response("{}", { status: 404 });
  }) as typeof fetch;
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

const created = () => sent.filter((s) => s.method === "POST" && s.path === "/v1/orders");

describe("CORS", () => {
  it("answers the preflight for the site, dashboard included", async () => {
    const res = await call("/bookings", { method: "OPTIONS" });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get("Access-Control-Allow-Origin"), SITE);
    assert.match(res.headers.get("Access-Control-Allow-Methods") ?? "", /GET/);
    assert.match(res.headers.get("Access-Control-Allow-Headers") ?? "", /Authorization/);
  });
  it("refuses other sites", async () => {
    assert.equal((await call("/order", { method: "OPTIONS", origin: "https://evil.example" })).status, 403);
    assert.equal((await call("/order", { origin: "https://evil.example", body: booking() })).status, 403);
    assert.equal((await call("/bookings", { origin: "https://evil.example", auth: PASSWORD })).status, 403);
    assert.equal(sent.length, 0, "nothing reaches Razorpay for a foreign origin");
  });
});

describe("POST /order", () => {
  it("creates an order priced by the server, not the browser", async () => {
    const res = await call("/order", { body: { ...booking(), amount: 100, price: 1 } });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.match(data.orderId, /^order_TEST/);
    assert.equal(data.keyId, "rzp_test_key");
    assert.equal(data.amount, 30600 * 100, "The Band, 2 hours = ₹30,600 in paise");
    assert.match(data.description, /^The Band — 2 hours · \d{1,2} [A-Z][a-z]{2} \d{4}$/);

    const [order] = created();
    assert.equal(order.auth, `Basic ${Buffer.from("rzp_test_key:test_secret_not_real").toString("base64")}`);
    assert.equal(order.body!.amount, 3060000);
    assert.equal(order.body!.currency, "INR");
    assert.ok(String(order.body!.receipt).startsWith("bk-"));
    assert.ok(String(order.body!.receipt).length <= 40, "Razorpay caps receipts at 40 characters");
    assert.deepEqual(order.body!.payment, {
      capture: "automatic",
      capture_options: { automatic_expiry_period: 12, manual_expiry_period: 7200, refund_speed: "normal" },
    });
    const notes = order.body!.notes as Record<string, string>;
    assert.equal(notes.set, "The Band — 2 hours");
    assert.equal(notes.option, "band-2h");
    assert.equal(notes.time, "20:00");
    assert.equal(notes.name, "Priya Sharma");
    assert.equal(notes.venue, "The Courtyard, Gurugram");
    assert.ok(Object.keys(notes).length <= 15, "Razorpay allows 15 notes");
    assert.ok(Object.values(notes).every((v) => v.length <= 256), "…of 256 characters each");
  });

  it("prices every option from the package list", async () => {
    const expected: Record<string, number> = { "solo-1h": 6120, "solo-2h": 7344, "band-1h": 24480, "band-2h": 30600, "band-3h": 36720 };
    let day = 10;
    for (const [optionId, rupees] of Object.entries(expected)) {
      const res = await call("/order", { body: booking({ optionId, date: daysAhead(day++) }) });
      assert.equal((await res.json()).amount, rupees * 100, optionId);
    }
  });

  it("rejects bad bookings without creating an order", async () => {
    const cases: [Record<string, unknown>, RegExp, string][] = [
      [{ optionId: "band-9h" }, /set/i, "optionId"],
      [{ date: "2020-01-01" }, /passed/i, "date"],
      [{ date: "not-a-date" }, /date/i, "date"],
      [{ time: "" }, /start time/i, "time"],
      [{ time: "25:00" }, /start time/i, "time"],
      [{ date: daysAhead(-1).slice(0, 10), time: "20:00" }, /passed/i, "date"],
      [{ event: "Rave" }, /occasion/i, "event"],
      [{ venue: "" }, /venue/i, "venue"],
      [{ name: "" }, /name/i, "name"],
      [{ phone: "12345" }, /number/i, "phone"],
      [{ email: "nope" }, /email/i, "email"],
    ];
    for (const [patch, message, field] of cases) {
      const res = await call("/order", { body: booking(patch) });
      assert.equal(res.status, 400, JSON.stringify(patch));
      const data = await res.json();
      assert.match(data.error, message);
      assert.equal(data.field, field);
    }
    assert.equal(sent.length, 0);
  });

  it("won't book a date that's already taken", async () => {
    const date = daysAhead(40);
    seed(date, "paid");
    const res = await call("/order", { body: booking({ date }) });
    assert.equal(res.status, 409);
    assert.deepEqual(await res.json(), { error: "That date is already booked — please pick another.", field: "date" });
    assert.equal(created().length, 0);
  });

  it("frees a date once its booking is refunded, and ignores unpaid checkouts", async () => {
    const date = daysAhead(41);
    seed(date, "refunded");
    seed(date, "not paid");
    seed(date, "failed");
    assert.equal((await call("/order", { body: booking({ date }) })).status, 200);
  });

  it("takes more than one booking a day when BOOKINGS_PER_DAY says so", async () => {
    const date = daysAhead(42);
    seed(date, "paid");
    const roomy = { ...env, BOOKINGS_PER_DAY: "2" };
    assert.equal((await call("/order", { body: booking({ date }), env: roomy })).status, 200);
    seed(date, "paid");
    assert.equal((await call("/order", { body: booking({ date }), env: roomy })).status, 409);
  });

  it("keeps Razorpay's error to itself", async () => {
    failCreate = 401;
    const res = await call("/order", { body: booking() });
    assert.equal(res.status, 502);
    assert.doesNotMatch(await res.text(), /secret/i);
  });

  it("says so when the keys haven't been set", async () => {
    const res = await call("/order", { body: booking(), env: { ...env, RAZORPAY_KEY_SECRET: "" } });
    assert.equal(res.status, 503);
  });

  it("refuses junk", async () => {
    const res = await worker.fetch(
      new Request("https://x.workers.dev/order", { method: "POST", headers: { Origin: SITE }, body: "{not json" }),
      env,
    );
    assert.equal(res.status, 400);
  });
});

describe("GET /availability", () => {
  it("lists taken dates and nothing else", async () => {
    const taken = daysAhead(50);
    seed(taken, "paid");
    seed(daysAhead(51), "not paid");
    seed(daysAhead(52), "refunded");
    seed(daysAhead(-5), "paid"); // already happened
    const res = await call("/availability");
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body, { configured: true, booked: [taken] });
    assert.doesNotMatch(JSON.stringify(body), /Client|Somewhere/, "no personal details");
  });
  it("says when online booking isn't on yet", async () => {
    const res = await call("/availability", { env: { ...env, RAZORPAY_KEY_ID: "" } });
    assert.deepEqual(await res.json(), { configured: false, booked: [] });
  });
});

describe("POST /verify", () => {
  const sign = (orderId: string, paymentId: string) =>
    createHmac("sha256", env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");

  it("accepts Razorpay's genuine signature, and captures a payment still waiting", async () => {
    const order = seed(daysAhead(60), "authorized");
    const paymentId = order.payments[0].id;
    const res = await call("/verify", {
      body: { razorpay_order_id: order.id, razorpay_payment_id: paymentId, razorpay_signature: sign(order.id, paymentId) },
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
    const capture = sent.find((s) => s.path === `/v1/payments/${paymentId}/capture`);
    assert.deepEqual(capture?.body, { amount: 3060000, currency: "INR" });
  });

  it("rejects a forged or mismatched signature", async () => {
    const forged = await call("/verify", {
      body: { razorpay_order_id: "order_TEST123", razorpay_payment_id: "pay_ABC", razorpay_signature: "0".repeat(64) },
    });
    assert.equal(forged.status, 400);
    const swapped = await call("/verify", {
      body: { razorpay_order_id: "order_OTHER", razorpay_payment_id: "pay_ABC", razorpay_signature: sign("order_TEST123", "pay_ABC") },
    });
    assert.equal(swapped.status, 400);
    assert.equal(sent.length, 0);
  });
});

describe("GET /bookings", () => {
  it("needs the right password", async () => {
    seed(daysAhead(70), "paid");
    assert.equal((await call("/bookings")).status, 401);
    assert.equal((await call("/bookings", { auth: "guess" })).status, 401);
    assert.equal((await call("/bookings", { auth: PASSWORD, env: { ...env, DASHBOARD_PASSWORD: "" } })).status, 503);
    assert.equal(sent.length, 0, "Razorpay isn't asked until the password checks out");
  });

  it("returns every booking, with its payment, and only ours", async () => {
    const date = daysAhead(80);
    seed(date, "paid");
    seed(date, "part refunded");
    seed(daysAhead(81), "refunded");
    seed(daysAhead(82), "authorized");
    seed(daysAhead(83), "failed");
    seed(daysAhead(84), "not paid");
    seed(daysAhead(85), "paid", { receipt: "invoice-77" }); // not from the booking page

    const res = await call("/bookings", { auth: PASSWORD });
    assert.equal(res.status, 200);
    const { bookings } = await res.json();
    assert.deepEqual(
      bookings.map((b: { status: string }) => b.status),
      ["not paid", "failed", "processing", "refunded", "part refunded", "paid"],
    );
    const paid = bookings.at(-1);
    assert.equal(paid.amount, 30600);
    assert.equal(paid.date, date);
    assert.equal(paid.time, "20:00");
    assert.equal(paid.set, "The Band — 2 hours");
    assert.equal(paid.payment.method, "upi");
    assert.equal(paid.payment.detail, "priya@okhdfc");
    assert.equal(bookings[4].amountRefunded, 15300);
    assert.equal(bookings[1].payment.error, "Payment was declined by the bank");
  });
});

describe("the booking record", () => {
  it("survives long notes, split across Razorpay's note slots", async () => {
    const notes = "Sing ".repeat(120).trim(); // 599 characters
    assert.equal((await call("/order", { body: booking({ notes }) })).status, 200);
    const sentNotes = created()[0].body!.notes as Record<string, string>;
    assert.ok(sentNotes.notes_2 && sentNotes.notes_3);
    assert.equal(toRecord({ ...orders[0], payments: { items: [] } } as never).notes, notes);
  });

  it("copes with Razorpay's empty notes, an empty array", () => {
    const record = toRecord({ id: "order_X", amount: 100, currency: "INR", receipt: "bk-x", status: "created", notes: [], created_at: 1 });
    assert.equal(record.name, "");
    assert.equal(record.status, "not paid");
  });

  it("trims and caps what it keeps", () => {
    const b = readBooking(booking({ name: "  Priya  ", notes: "x".repeat(5000) }));
    assert.ok(!("error" in b));
    if (!("error" in b)) {
      assert.equal(b.name, "Priya");
      assert.equal(b.notes.length, 600);
    }
  });

  it("won't take a time that's already gone today (India time)", () => {
    // 21 Nov 2026, 9:00 pm in India
    const at = Date.UTC(2026, 10, 21, 15, 30);
    assert.ok("error" in readBooking(booking({ date: "2026-11-21", time: "20:00" }), at));
    assert.ok(!("error" in readBooking(booking({ date: "2026-11-21", time: "22:00" }), at)));
  });
});
