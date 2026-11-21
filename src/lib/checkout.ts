import type { BookingDetails } from "@/lib/booking";

/**
 * Online payment, in three steps:
 *   1. the payment worker (worker/) creates a Razorpay order — it decides the
 *      amount from the option id, so the price can't be tampered with here;
 *   2. Razorpay's own checkout opens over the page;
 *   3. the worker checks Razorpay's signature on the result.
 * Card, UPI and bank details only ever go to Razorpay.
 */

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailure = { error?: { description?: string } };

type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
  theme: { color: string };
  handler: (response: RazorpaySuccess) => void;
  modal: { ondismiss: () => void; escape: boolean; confirm_close: boolean };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", cb: (r: RazorpayFailure) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export type PayResult =
  | { status: "paid"; paymentId: string; orderId: string }
  | { status: "unverified"; paymentId: string; orderId: string }
  | { status: "dismissed" }
  | {
      status: "failed";
      message: string;
      /** The form field the server objected to, e.g. "date" when it's taken. */
      field?: string;
      /** The server says online booking isn't switched on. */
      off?: boolean;
    };

/** Whether online booking is on, and which dates are already taken. */
export type Availability = { configured: boolean; booked: string[] };

export async function availability(endpoint: string): Promise<Availability> {
  const res = await fetch(`${endpoint}/availability`, { cache: "no-store" });
  if (!res.ok) throw new Error("availability");
  const data = (await res.json()) as Partial<Availability>;
  return {
    configured: data.configured === true,
    booked: Array.isArray(data.booked) ? data.booked.filter((d): d is string => typeof d === "string") : [],
  };
}

class RequestError extends Error {
  status: number;
  field?: string;
  constructor(message: string, status: number, field?: string) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

const SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
let loading: Promise<void> | null = null;

/** Razorpay's script is only fetched once someone actually goes to pay. */
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loading = null;
      reject(new Error("checkout"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string; field?: string };
  if (!res.ok) throw new RequestError(data.error || "request", res.status, data.field);
  return data;
}

export async function pay(endpoint: string, booking: BookingDetails): Promise<PayResult> {
  let order: { orderId: string; amount: number; currency: string; keyId: string; description: string };
  try {
    order = await post(`${endpoint}/order`, booking);
    await loadCheckout();
  } catch (err) {
    if (err instanceof RequestError && err.message !== "request")
      return { status: "failed", message: err.message, field: err.field, off: err.status === 503 };
    return { status: "failed", message: "we couldn't open the payment page — check your connection and try again" };
  }

  return new Promise<PayResult>((resolve) => {
    let lastError = "";
    const rzp = new window.Razorpay!({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: "adimakesmusic",
      description: order.description,
      prefill: {
        name: booking.name.trim() || undefined,
        email: booking.email.trim() || undefined,
        contact: booking.phone.replace(/[^\d+]/g, "") || undefined,
      },
      theme: { color: "#000000" },
      handler: (r) => {
        // the money has moved at this point; the check below only decides
        // whether we can say so with certainty on this screen
        const ids = { paymentId: r.razorpay_payment_id, orderId: r.razorpay_order_id };
        post<{ ok: boolean }>(`${endpoint}/verify`, r)
          .then((v) => resolve({ status: v.ok ? "paid" : "unverified", ...ids }))
          .catch(() => resolve({ status: "unverified", ...ids }));
      },
      modal: {
        // a failed attempt can be retried inside Razorpay's window, so a
        // failure only counts once the visitor closes it
        ondismiss: () => resolve(lastError ? { status: "failed", message: lastError } : { status: "dismissed" }),
        escape: true,
        confirm_close: true,
      },
    });
    rzp.on("payment.failed", (r) => {
      lastError = r.error?.description || "the payment didn't go through";
    });
    rzp.open();
  });
}
