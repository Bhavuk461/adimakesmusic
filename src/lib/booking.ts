import { findOption, optionLabel, rupees } from "@/lib/packages";

/** Everything the booking form collects. All strings, exactly as typed. */
export type BookingDetails = {
  optionId: string;
  /** yyyy-mm-dd, from the date input */
  date: string;
  /** hh:mm, 24-hour, from the start-time pads */
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

const p2 = (n: number) => String(n).padStart(2, "0");

/** Today in the visitor's own time zone, as yyyy-mm-dd. */
export function todayISO(now = new Date()) {
  return `${now.getFullYear()}-${p2(now.getMonth() + 1)}-${p2(now.getDate())}`;
}

/** The time now, as hh:mm. */
const nowHHMM = (now = new Date()) => `${p2(now.getHours())}:${p2(now.getMinutes())}`;

/**
 * Start times the booking page offers: from 10 in the morning to 11 at night,
 * in two rows of seven, at any quarter hour.
 */
export const START_HOURS = {
  day: [10, 11, 12, 13, 14, 15, 16],
  evening: [17, 18, 19, 20, 21, 22, 23],
} as const;
export const START_MINUTES = ["00", "15", "30", "45"] as const;

/** 20 → { hour: "8", half: "pm" }; noon reads as noon. */
export function clockHour(h: number) {
  return { hour: String(h % 12 || 12), half: h === 12 ? "noon" : h < 12 ? "am" : "pm" };
}

const digits = (s: string) => s.replace(/\D/g, "");

/**
 * `booked` — dates the booking server says are already taken. `now` is only
 * for "that time has already passed" on a booking for today.
 */
export function validateBooking(
  d: BookingDetails,
  { booked = [] as readonly string[], now = new Date() } = {},
): BookingErrors {
  const e: BookingErrors = {};
  const today = todayISO(now);
  if (!findOption(d.optionId)) e.optionId = "pick a set and how long";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) e.date = "add the date of your event";
  else if (d.date < today) e.date = "that date has already passed";
  else if (booked.includes(d.date)) e.date = "aditya's already booked that day — pick another date";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.time)) e.time = "pick a start time";
  else if (d.date === today && d.time <= nowHHMM(now)) e.time = "that time has already passed";
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

/** "20:30" → "8:30 pm" */
export function timeLabel(time: string) {
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!t) return "";
  const h = Number(t[1]);
  return `${h % 12 || 12}:${t[2]} ${h < 12 ? "am" : "pm"}`;
}

/** yyyy-mm-dd → its parts, for laying a date out in pieces. */
export function dateParts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: MONTHS[m - 1], day: d, weekday: DAYS[new Date(y, m - 1, d).getDay()] };
}

/** "Sat, 14 Feb 2027" — and ", 8:00 pm" when a start time is given. */
export function describeWhen(date: string, time: string) {
  const p = dateParts(date);
  if (!p) return "";
  const t = timeLabel(time);
  return `${p.weekday}, ${p.day} ${p.month} ${p.year}${t ? `, ${t}` : ""}`;
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

/**
 * The booked performance as a calendar file (.ics), for the "add to calendar"
 * button once it's paid. Times are India time, written out in UTC.
 */
export function calendarFile(d: BookingDetails, reference: string) {
  const pick = findOption(d.optionId);
  const [y, m, day] = d.date.split("-").map(Number);
  const [hh, mm] = d.time.split(":").map(Number);
  const start = Date.UTC(y, m - 1, day, hh, mm) - 5.5 * 3600_000;
  const end = start + (pick?.option.hours ?? 1) * 3600_000;
  const stamp = (t: number) => new Date(t).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  // commas, semicolons and backslashes are special in .ics text
  const esc = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");
  const title = `Aditya Chowhan live${pick ? ` — ${optionLabel(pick.set, pick.option)}` : ""}`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//adimakesmusic//booking//EN",
    "BEGIN:VEVENT",
    `UID:${reference}@adimakesmusic.in`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(d.venue.trim())}`,
    `DESCRIPTION:${esc(`${d.event}. Booked on adimakesmusic.in — payment ${reference}.`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
