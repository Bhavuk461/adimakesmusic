import { findOption, optionLabel, rupees } from "@/lib/packages";

/** Everything the booking form collects. All strings, exactly as typed. */
export type BookingDetails = {
  optionId: string;
  /** yyyy-mm-dd, from the date input */
  date: string;
  /** hh:mm, from the time input — optional */
  time: string;
  event: string;
  venue: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export type BookingField = keyof BookingDetails;
export type BookingErrors = Partial<Record<BookingField, string>>;

export const EMPTY_BOOKING: BookingDetails = {
  optionId: "",
  date: "",
  time: "",
  event: "",
  venue: "",
  name: "",
  phone: "",
  email: "",
  notes: "",
};

/** The order fields appear on the page — errors are reported in the same order. */
export const FIELD_ORDER: BookingField[] = [
  "optionId",
  "date",
  "time",
  "event",
  "venue",
  "name",
  "phone",
  "email",
  "notes",
];

/** Today in the visitor's own time zone, as yyyy-mm-dd. */
export function todayISO(now = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

const digits = (s: string) => s.replace(/\D/g, "");

export function validateBooking(d: BookingDetails, today = todayISO()): BookingErrors {
  const e: BookingErrors = {};
  if (!findOption(d.optionId)) e.optionId = "pick a set and how long";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) e.date = "add the date of your event";
  else if (d.date < today) e.date = "that date has already passed";
  if (!d.event) e.event = "tell us what the occasion is";
  if (d.venue.trim().length < 2) e.venue = "add the venue and city";
  if (d.name.trim().length < 2) e.name = "add your name";
  const phone = digits(d.phone);
  if (phone.length < 10 || phone.length > 15) e.phone = "add a number we can reach you on";
  if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()))
    e.email = "that email doesn't look right";
  return e;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Sat, 14 Feb 2027" — and ", 8:00 pm" when a start time is given. */
export function describeWhen(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return "";
  const day = new Date(y, m - 1, d);
  let out = `${DAYS[day.getDay()]}, ${d} ${MONTHS[m - 1]} ${y}`;
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (t) {
    const h = Number(t[1]);
    out += `, ${h % 12 || 12}:${t[2]} ${h < 12 ? "am" : "pm"}`;
  }
  return out;
}

/** Shows +91 numbers the way people write them: +91 99581 77449. */
export function prettyPhone(raw: string) {
  const n = digits(raw);
  if (n.length === 10) return `+91 ${n.slice(0, 5)} ${n.slice(5)}`;
  if (n.length === 12 && n.startsWith("91")) return `+91 ${n.slice(2, 7)} ${n.slice(7)}`;
  return raw.trim();
}

/** The booking as a message — for WhatsApp, email, and the payment follow-up. */
export function bookingMessage(d: BookingDetails, opening: string) {
  const pick = findOption(d.optionId);
  const lines = [opening, ""];
  if (pick) lines.push(`Set: ${optionLabel(pick.set, pick.option)} (${rupees(pick.option.price)})`);
  lines.push(
    `Date: ${describeWhen(d.date, d.time)}`,
    `Event: ${d.event}`,
    `Venue: ${d.venue.trim()}`,
    `Name: ${d.name.trim()}`,
    `Phone: ${prettyPhone(d.phone)}`,
  );
  if (d.email.trim()) lines.push(`Email: ${d.email.trim()}`);
  if (d.notes.trim()) lines.push(`Notes: ${d.notes.trim()}`);
  lines.push("", "— sent from adimakesmusic.in/book");
  return lines.join("\n");
}

export function bookingSubject(d: BookingDetails) {
  const pick = findOption(d.optionId);
  return `Booking — ${pick ? optionLabel(pick.set, pick.option) : "live set"}, ${describeWhen(d.date, "")}`;
}
