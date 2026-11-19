// Run with: npm run pay:test   (Node's built-in runner; no real keys, no network)
import { strict as assert } from "node:assert";
import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, it } from "node:test";
import worker, { readBooking, type Env } from "../src/index.ts";

const SITE = "https://adimakesmusic.in";
const env: Env = {
  RAZORPAY_KEY_ID: "rzp_test_key",
  RAZORPAY_KEY_SECRET: "test_secret_not_real",
  ALLOWED_ORIGINS: `${SITE},https://www.adimakesmusic.in`,
};

const inAMonth = () => {
  const d = new Date(Date.now() + 30 * 86400_000);
  return d.toISOString().slice(0, 10);
};

const booking = (over: Record<string, unknown> = {}) => ({
  optionId: "band-2h",
  date: inAMonth(),
  time: "20:00",
  event: "Wedding, sangeet or mehendi",
  venue: "The Courtyard, Gurugram",
  name: "Priya Sharma",
  phone: "+91 98765 43210",
  email: "priya@example.com",
  notes: "First dance: Tum Hi Ho",
  ...over,
});

const call = (path: string, init: { method?: string; origin?: string | null; body?: unknown } = {}) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (init.origin !== null) headers.Origin = init.origin ?? SITE;
  return worker.fetch(
    new Request(`https://pay.example.workers.dev${path}`, {
      method: init.method ?? "POST",
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    }),
    env,
  );
};

// Razorpay's API, faked: records what the worker sends, answers like the real one.
type Sent = { url: string; auth: string | null; body: Record<string, unknown> };
let sent: Sent[] = [];
let razorpayStatus = 200;
const realFetch = globalThis.fetch;

beforeEach(() => {
  sent = [];
  razorpayStatus = 200;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    const body = JSON.parse(String(init?.body ?? "{}"));
    sent.push({ url: String(input), auth: headers.get("Authorization"), body });
    if (razorpayStatus !== 200) return new Response(JSON.stringify({ error: { description: "secret detail" } }), { status: razorpayStatus });
    return new Response(JSON.stringify({ id: "order_TEST123", amount: body.amount, currency: body.currency, status: "created" }), {
      status: 200,
    });
  }) as typeof fetch;
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("CORS", () => {
  it("answers the preflight for the site", async () => {
    const res = await call("/order", { method: "OPTIONS" });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get("Access-Control-Allow-Origin"), SITE);
    assert.match(res.headers.get("Access-Control-Allow-Methods") ?? "", /POST/);
  });
  it("refuses other sites", async () => {
    assert.equal((await call("/order", { method: "OPTIONS", origin: "https://evil.example" })).status, 403);
    const res = await call("/order", { origin: "https://evil.example", body: booking() });
    assert.equal(res.status, 403);
    assert.equal(sent.length, 0, "no order is created for a foreign origin");
  });
});

describe("POST /order", () => {
  it("creates an order priced by the server, not the browser", async () => {
    const res = await call("/order", { body: { ...booking(), amount: 100, price: 1 } });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.orderId, "order_TEST123");
    assert.equal(data.keyId, "rzp_test_key");
    assert.equal(data.amount, 30000 * 100, "The Band, 2 hours = ₹30,000 in paise");
    assert.match(data.description, /^The Band — 2 hours · \d{1,2} [A-Z][a-z]{2} \d{4}$/);

    assert.equal(sent.length, 1);
    assert.equal(sent[0].url, "https://api.razorpay.com/v1/orders");
    assert.equal(sent[0].auth, `Basic ${Buffer.from("rzp_test_key:test_secret_not_real").toString("base64")}`);
    assert.equal(sent[0].body.amount, 3000000);
    assert.equal(sent[0].body.currency, "INR");
    assert.ok(String(sent[0].body.receipt).length <= 40, "Razorpay caps receipts at 40 characters");
    const notes = sent[0].body.notes as Record<string, string>;
    assert.equal(notes.set, "The Band — 2 hours");
    assert.equal(notes.name, "Priya Sharma");
    assert.equal(notes.venue, "The Courtyard, Gurugram");
    assert.ok(Object.keys(notes).length <= 15, "Razorpay allows 15 notes");
  });

  it("prices every option from the package list", async () => {
    const expected: Record<string, number> = { "solo-1h": 6000, "solo-2h": 7200, "band-1h": 24000, "band-2h": 30000, "band-3h": 36000 };
    for (const [optionId, rupees] of Object.entries(expected)) {
      const res = await call("/order", { body: booking({ optionId }) });
      assert.equal((await res.json()).amount, rupees * 100, optionId);
    }
  });

  it("rejects bad bookings without calling Razorpay", async () => {
    const cases: [Record<string, unknown>, RegExp][] = [
      [{ optionId: "band-9h" }, /set/i],
      [{ date: "2020-01-01" }, /passed/i],
      [{ date: "not-a-date" }, /date/i],
      [{ event: "Rave" }, /occasion/i],
      [{ venue: "" }, /venue/i],
      [{ name: "" }, /name/i],
      [{ phone: "12345" }, /number/i],
      [{ email: "nope" }, /email/i],
    ];
    for (const [patch, message] of cases) {
      const res = await call("/order", { body: booking(patch) });
      assert.equal(res.status, 400, JSON.stringify(patch));
      assert.match((await res.json()).error, message);
    }
    assert.equal(sent.length, 0);
  });

  it("keeps Razorpay's error to itself", async () => {
    razorpayStatus = 401;
    const res = await call("/order", { body: booking() });
    assert.equal(res.status, 502);
    const body = await res.text();
    assert.doesNotMatch(body, /secret/i);
  });

  it("says so when the secret hasn't been set", async () => {
    const res = await worker.fetch(
      new Request("https://x.workers.dev/order", { method: "POST", headers: { Origin: SITE }, body: JSON.stringify(booking()) }),
      { ...env, RAZORPAY_KEY_SECRET: "" },
    );
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

describe("POST /verify", () => {
  const sign = (orderId: string, paymentId: string) =>
    createHmac("sha256", env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");

  it("accepts Razorpay's genuine signature", async () => {
    const res = await call("/verify", {
      body: { razorpay_order_id: "order_TEST123", razorpay_payment_id: "pay_ABC", razorpay_signature: sign("order_TEST123", "pay_ABC") },
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
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
  });
});

describe("readBooking", () => {
  it("trims and caps what it keeps", () => {
    const b = readBooking(booking({ name: "  Priya  ", notes: "x".repeat(5000) }));
    assert.ok(!("error" in b));
    if (!("error" in b)) {
      assert.equal(b.name, "Priya");
      assert.equal(b.notes.length, 600);
    }
  });
});
