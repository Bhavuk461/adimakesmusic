/**
 * A booking as the dashboard sees it — shared by the booking server
 * (worker/), which builds these from Razorpay orders, and the dashboard page,
 * which shows them. No imports, because the worker bundles it too.
 *
 * There's no database of our own: every booking *is* a Razorpay order, with
 * the booking written into the order's notes, so payments, refunds and the
 * booking itself can never disagree.
 */

export type BookingStatus =
  /** Paid in full. */
  | "paid"
  /** Paid, then part of it refunded. */
  | "part refunded"
  /** Paid, then refunded in full — the booking is off. */
  | "refunded"
  /** The bank has approved it and Razorpay is collecting the money. */
  | "processing"
  /** Checkout was opened, every payment attempt failed. */
  | "failed"
  /** Checkout was opened and closed without paying. */
  | "not paid";

export type BookingRecord = {
  orderId: string;
  /** Our own reference, "bk-…". */
  receipt: string;
  /** When checkout was opened (unix seconds). */
  createdAt: number;
  status: BookingStatus;
  /** Rupees. */
  amount: number;
  /** Rupees. */
  amountRefunded: number;
  /** "The Band — 2 hours" */
  set: string;
  optionId: string;
  /** yyyy-mm-dd */
  date: string;
  /** hh:mm, 24-hour */
  time: string;
  occasion: string;
  venue: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  /** The payment that settled it, or the latest attempt. */
  payment: null | {
    id: string;
    /** upi · card · netbanking · wallet · emi … */
    method: string;
    /** The UPI id, bank or wallet, where Razorpay tells us. */
    detail: string;
    /** unix seconds */
    at: number;
    email: string;
    contact: string;
    /** Why it failed, for failed attempts. */
    error: string;
  };
  /** How many times the client tried to pay. */
  attempts: number;
};

/** A booking that holds its date: money has been taken and not all handed back. */
export const isConfirmed = (b: Pick<BookingRecord, "status">) =>
  b.status === "paid" || b.status === "part refunded" || b.status === "processing";
