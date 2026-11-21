import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { dateParts, describeWhen, prettyPhone, timeLabel, todayISO } from "@/lib/booking";
import { isConfirmed, type BookingRecord, type BookingStatus } from "@/lib/booking-record";
import { rupees } from "@/lib/packages";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The private bookings dashboard, at /dashboard/.
 *
 * Every booking is a Razorpay order (see worker/src/index.ts), so this page
 * asks the booking server for them with the dashboard password and lays them
 * out: what's coming up, what's been played, and checkouts that were opened
 * but never paid. The password is kept in this tab only — or on this device,
 * if "keep me signed in" is ticked.
 */

const ENDPOINT = SITE.payments.endpoint;
const STORE_KEY = "adimakesmusic-dashboard";

const LABEL = "text-[0.625rem] uppercase tracking-[0.4em] md:text-[0.6875rem]";
const SMALL = "text-[0.5625rem] uppercase tracking-[0.3em] md:text-[0.625rem]";
const onBlack = "focus-visible:outline-white";

type View = "upcoming" | "played" | "unpaid" | "all";
const VIEWS: { id: View; label: string }[] = [
  { id: "upcoming", label: "upcoming" },
  { id: "played", label: "played" },
  { id: "unpaid", label: "not paid" },
  { id: "all", label: "everything" },
];

type Loaded = { bookings: BookingRecord[]; fetchedAt: number };

type State =
  | { kind: "starting" }
  | { kind: "signed-out"; error?: string }
  /** viaForm: the password was just typed in, so the form stays on screen */
  | { kind: "opening"; viaForm: boolean }
  | { kind: "open"; data: Loaded; refreshing: boolean; error?: string };

/* ───────────────────────────── the password ───────────────────────── */

function stores(): Storage[] {
  try {
    return [sessionStorage, localStorage];
  } catch {
    return [];
  }
}
function savedKey() {
  for (const s of stores()) {
    try {
      const v = s.getItem(STORE_KEY);
      if (v) return v;
    } catch {
      /* storage blocked — they'll just sign in each time */
    }
  }
  return "";
}
function saveKey(key: string, remember: boolean) {
  try {
    (remember ? localStorage : sessionStorage).setItem(STORE_KEY, key);
  } catch {
    /* as above */
  }
}
function forgetKey() {
  for (const s of stores()) {
    try {
      s.removeItem(STORE_KEY);
    } catch {
      /* as above */
    }
  }
}

class WrongPassword extends Error {}

async function fetchBookings(key: string): Promise<Loaded> {
  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}/bookings`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
  } catch {
    throw new Error("couldn't reach the booking server — check the connection and try again");
  }
  const data = (await res.json().catch(() => ({}))) as Partial<Loaded> & { error?: string };
  if (res.status === 401) throw new WrongPassword("that password didn't work");
  if (!res.ok) throw new Error((data.error ?? "the booking server didn't answer").replace(/\.$/, "").toLowerCase());
  return { bookings: Array.isArray(data.bookings) ? data.bookings : [], fetchedAt: data.fetchedAt ?? Date.now() };
}

/* ───────────────────────────── formatting ─────────────────────────── */

const digits = (s: string) => s.replace(/\D/g, "");
/** For tel: and wa.me links — 10-digit numbers are Indian. */
const intlNumber = (phone: string) => (digits(phone).length === 10 ? `91${digits(phone)}` : digits(phone));

function daysFrom(today: string, date: string) {
  const at = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((at(date) - at(today)) / 86400_000);
}

function countdown(today: string, date: string) {
  if (!dateParts(date)) return "";
  const n = daysFrom(today, date);
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  if (n === -1) return "yesterday";
  return n > 1 ? `in ${n} days` : `${-n} days ago`;
}

const stamp = (unix: number) =>
  new Date(unix * 1000)
    .toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    .replace(/\b(am|pm)\b/gi, (m) => m.toLowerCase());

const METHODS: Record<string, string> = {
  upi: "UPI",
  card: "card",
  netbanking: "netbanking",
  wallet: "wallet",
  emi: "EMI",
  cardless_emi: "cardless EMI",
  paylater: "pay later",
  bank_transfer: "bank transfer",
};
const paidWith = (p: NonNullable<BookingRecord["payment"]>) =>
  [METHODS[p.method] ?? p.method, p.detail].filter(Boolean).join(" · ");

const mapsUrl = (venue: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;

/* ───────────────────────────── sorting it out ─────────────────────── */

const byWhen = (a: BookingRecord, b: BookingRecord) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`);

function sortOut(all: BookingRecord[], today: string): Record<View, BookingRecord[]> {
  const confirmed = all.filter(isConfirmed);
  // someone who gave up on one checkout and paid on the next isn't a lead
  const booked = new Set(confirmed.map((b) => `${digits(b.phone)}|${b.date}`));
  return {
    upcoming: confirmed.filter((b) => b.date >= today).sort(byWhen),
    played: confirmed.filter((b) => b.date < today).sort((a, b) => byWhen(b, a)),
    unpaid: all
      .filter((b) => (b.status === "not paid" || b.status === "failed") && !booked.has(`${digits(b.phone)}|${b.date}`))
      .sort((a, b) => b.createdAt - a.createdAt),
    all: [...all].sort((a, b) => b.createdAt - a.createdAt),
  };
}

function matches(b: BookingRecord, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [b.name, b.phone, digits(b.phone), b.email, b.venue, b.occasion, b.set, b.notes, b.orderId, b.payment?.id ?? "", b.date, describeWhen(b.date, b.time)]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((word) => hay.includes(word));
}

function exportCsv(rows: BookingRecord[]) {
  const head = ["event date", "start time", "set", "occasion", "venue", "client", "phone", "email", "notes", "amount (INR)", "refunded (INR)", "status", "paid with", "payment id", "order id", "checkout opened"];
  // a cell starting with = + - @ would run as a formula in a spreadsheet
  const cell = (v: string | number) => {
    let s = String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `\t${s}`;
    return /[",\r\n\t]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [head, ...rows.map((b) => [b.date, b.time, b.set, b.occasion, b.venue, b.name, b.phone, b.email, b.notes, b.amount, b.amountRefunded, b.status, b.payment ? paidWith(b.payment) : "", b.payment?.id ?? "", b.orderId, stamp(b.createdAt)])];
  const blob = new Blob(["﻿" + lines.map((r) => r.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `adimakesmusic-bookings-${todayISO()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ───────────────────────────── pieces ─────────────────────────────── */

const BADGE: Record<BookingStatus, string> = {
  paid: "border-black bg-black text-white",
  processing: "border-black text-black",
  "part refunded": "border-black text-black",
  refunded: "border-black/30 text-quiet-ink line-through decoration-1",
  failed: "border-dashed border-black text-black",
  "not paid": "border-dashed border-black/40 text-quiet-ink",
};

function Badge({ status }: { status: BookingStatus }) {
  return (
    <span className={cn(SMALL, "inline-flex w-fit items-center rounded-full border px-3 py-1.5 font-bold", BADGE[status])}>
      {status}
    </span>
  );
}

const outLink = "underline decoration-black/30 underline-offset-4 transition-colors hover:decoration-black";

function NewTab() {
  return <span className="sr-only"> (opens in a new tab)</span>;
}

function Detail({ term, wide, children }: { term: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={cn("min-w-0", wide && "sm:col-span-2")}>
      <dt className={cn(SMALL, "text-quiet-ink")}>{term}</dt>
      <dd className="mt-1 text-sm leading-relaxed [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

function Card({ b, today }: { b: BookingRecord; today: string }) {
  const id = useId();
  const when = dateParts(b.date);
  const time = timeLabel(b.time);
  const phone = intlNumber(b.phone);
  const off = b.status === "refunded" || b.status === "not paid" || b.status === "failed";

  return (
    <li>
      {/* phone: one column · tablet/laptop: when | details, money under the
          details · wide: when | details | money */}
      <article
        aria-labelledby={id}
        className="grid gap-6 rounded-2xl border border-black/10 bg-white p-5 md:grid-cols-[6.5rem_minmax(0,1fr)] md:gap-x-8 md:rounded-3xl md:p-7 xl:grid-cols-[7rem_minmax(0,1fr)_12rem]"
      >
        {/* when */}
        <div className="flex flex-wrap items-end gap-x-4 gap-y-1 md:block">
          {when ? (
            <>
              <p className={cn(LABEL, "w-full text-quiet-ink")}>{when.weekday}</p>
              <p className={cn("font-display text-6xl leading-none md:mt-1", off && "text-quiet-ink")}>{when.day}</p>
              <p className={cn(LABEL, "pb-1 text-quiet-ink md:pb-0")}>
                {when.month} {when.year}
              </p>
            </>
          ) : (
            <p className={cn(LABEL, "text-quiet-ink")}>no date</p>
          )}
          {time && <p className="font-display text-2xl leading-none md:mt-4">{time}</p>}
          {when && !off && <p className={cn(SMALL, "pb-1 text-quiet-ink md:mt-2 md:pb-0")}>{countdown(today, b.date)}</p>}
        </div>

        {/* what, where, who */}
        <div className="min-w-0">
          <h3 id={id} className="font-display text-2xl uppercase leading-none md:text-3xl">
            {b.set || "booking"}
            <span className="sr-only">, {describeWhen(b.date, b.time)}</span>
          </h3>
          {b.occasion && <p className="mt-2 text-sm">{b.occasion}</p>}
          {b.venue && (
            <p className="mt-1 text-sm">
              <a href={mapsUrl(b.venue)} target="_blank" rel="noopener noreferrer" className={outLink}>
                {b.venue}
                <NewTab />
              </a>{" "}
              <span aria-hidden>↗</span>
            </p>
          )}

          <dl className="mt-5 grid gap-x-6 gap-y-4 border-t border-black/10 pt-4 sm:grid-cols-2">
            <Detail term="client">{b.name || "—"}</Detail>
            <Detail term="phone">
              {b.phone ? (
                <>
                  <a href={`tel:+${phone}`} className={outLink}>
                    {prettyPhone(b.phone)}
                  </a>
                  {" · "}
                  <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className={outLink}>
                    whatsapp
                    <NewTab />
                  </a>
                </>
              ) : (
                "—"
              )}
            </Detail>
            <Detail term="email">
              {b.email ? (
                <a href={`mailto:${b.email}`} className={outLink}>
                  {b.email}
                </a>
              ) : (
                "—"
              )}
            </Detail>
            <Detail term="checkout opened">{stamp(b.createdAt)}</Detail>
            {b.notes && (
              <Detail term="notes" wide>
                {b.notes}
              </Detail>
            )}
          </dl>
        </div>

        {/* the money */}
        <div className="flex flex-col gap-3 border-t border-black/10 pt-5 md:col-start-2 xl:col-start-auto xl:items-end xl:border-0 xl:pt-0 xl:text-right">
          <Badge status={b.status} />
          <p className={cn("font-display text-4xl leading-none", off && "text-quiet-ink")}>{rupees(b.amount)}</p>
          {b.amountRefunded > 0 && <p className="text-sm">{rupees(b.amountRefunded)} refunded</p>}
          <dl className="space-y-1 text-xs leading-relaxed text-quiet-ink">
            {b.payment && (
              <>
                <div>
                  <dt className="sr-only">paid with</dt>
                  <dd>{paidWith(b.payment)}</dd>
                </div>
                {b.payment.error && (
                  <div>
                    <dt className="sr-only">why it failed</dt>
                    <dd>{b.payment.error}</dd>
                  </div>
                )}
                <div>
                  <dt className="sr-only">payment</dt>
                  <dd>
                    <a
                      href={`https://dashboard.razorpay.com/app/payments/${b.payment.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={outLink}
                    >
                      {b.payment.id}
                      <span className="sr-only"> in razorpay (opens in a new tab)</span>
                    </a>{" "}
                    <span aria-hidden>↗</span>
                  </dd>
                </div>
              </>
            )}
            <div>
              <dt className="sr-only">order</dt>
              <dd>{b.orderId}</dd>
            </div>
            {b.attempts > 1 && (
              <div>
                <dt className="sr-only">attempts</dt>
                <dd>{b.attempts} payment attempts</dd>
              </div>
            )}
          </dl>
        </div>
      </article>
    </li>
  );
}

const EMPTY: Record<View, string> = {
  upcoming: "nothing coming up yet — paid bookings land here the moment they're made.",
  played: "no shows played yet.",
  unpaid: "no unfinished checkouts — every one so far ended in a booking.",
  all: "no bookings yet.",
};

function Board({
  data,
  refreshing,
  error,
  onRefresh,
  onSignOut,
}: {
  data: Loaded;
  refreshing: boolean;
  error?: string;
  onRefresh: () => void;
  onSignOut: () => void;
}) {
  const [view, setView] = useState<View>("upcoming");
  const [query, setQuery] = useState("");
  const today = todayISO();
  const groups = useMemo(() => sortOut(data.bookings, today), [data, today]);
  const list = groups[view].filter((b) => matches(b, query));

  const next = groups.upcoming[0];
  const nextWhen = next ? dateParts(next.date) : null;
  const confirmed = data.bookings.filter(isConfirmed);
  const takings = confirmed.reduce((sum, b) => sum + b.amount - b.amountRefunded, 0);
  const updated = new Date(data.fetchedAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }).toLowerCase();

  return (
    <>
      <header className="bg-black text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 md:px-6">
          <a href="/" className={cn("text-xs font-bold uppercase tracking-[0.3em] md:text-sm", onBlack)}>
            adimakesmusic
          </a>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className={cn(
                SMALL,
                "min-h-10 rounded-full border border-white/50 px-4 font-bold transition-colors hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-60",
                onBlack,
              )}
            >
              {refreshing ? "refreshing…" : "refresh"}
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className={cn(SMALL, "min-h-10 rounded-full px-4 text-neutral-300 transition-colors hover:text-white", onBlack)}
            >
              sign out
            </button>
          </div>
        </div>
      </header>

      <main className="bg-[#f5f4f3] text-black">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-12 md:px-6 md:pb-32 md:pt-16">
          <p className={cn(LABEL, "tracking-[0.5em] text-quiet-ink")}>( private ) — updated {updated}</p>
          <h1 className="mt-3 font-display text-5xl uppercase leading-[0.9] md:text-7xl">
            the <span className="font-accent lowercase italic">bookings</span>
          </h1>
          <p role="status" className={cn(LABEL, "mt-4 min-h-[1lh] text-black")}>
            {error ? `( ! ) ${error}` : ""}
          </p>

          {/* at a glance */}
          <section aria-labelledby="db-glance" className="mt-8">
            <h2 id="db-glance" className="sr-only">
              At a glance
            </h2>
            {/* phone to laptop: next show and takings full width, the two
                counts side by side · wide screens: four across */}
            <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <div className="col-span-2 rounded-2xl bg-black p-5 text-white md:p-6 xl:col-span-1">
                <dt className={cn(LABEL, "text-quiet")}>next show</dt>
                <dd className="mt-3 font-display text-3xl uppercase leading-none md:text-4xl">
                  {nextWhen ? `${nextWhen.weekday} ${nextWhen.day} ${nextWhen.month}` : "—"}
                </dd>
                <dd className="mt-3 text-xs leading-relaxed text-neutral-400">
                  {next
                    ? [timeLabel(next.time), next.venue, countdown(today, next.date)].filter(Boolean).join(" · ")
                    : "nothing booked yet"}
                </dd>
              </div>
              <div className="rounded-2xl bg-black p-5 text-white md:p-6">
                <dt className={cn(LABEL, "text-quiet")}>coming up</dt>
                <dd className="mt-3 font-display text-4xl leading-none">{groups.upcoming.length}</dd>
                <dd className="mt-3 text-xs text-neutral-400">
                  {groups.upcoming.length === 1 ? "show booked" : "shows booked"}
                </dd>
              </div>
              <div className="rounded-2xl bg-black p-5 text-white md:p-6">
                <dt className={cn(LABEL, "text-quiet")}>not paid</dt>
                <dd className="mt-3 font-display text-4xl leading-none">{groups.unpaid.length}</dd>
                <dd className="mt-3 text-xs text-neutral-400">checkouts opened, never finished</dd>
              </div>
              <div className="col-span-2 rounded-2xl bg-black p-5 text-white md:p-6 xl:col-span-1">
                <dt className={cn(LABEL, "text-quiet")}>taken so far</dt>
                <dd className="mt-3 font-display text-4xl leading-none [overflow-wrap:anywhere]">{rupees(takings)}</dd>
                <dd className="mt-3 text-xs text-neutral-400">
                  from {confirmed.length} paid booking{confirmed.length === 1 ? "" : "s"}, after refunds
                </dd>
              </div>
            </dl>
          </section>

          {/* the list */}
          <section aria-labelledby="db-list" className="mt-14 md:mt-20">
            <h2 id="db-list" className="sr-only">
              Bookings — {VIEWS.find((v) => v.id === view)!.label}
            </h2>
            <div className="flex flex-col gap-4 border-b-2 border-black pb-4 xl:flex-row xl:items-center xl:justify-between">
              <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
                {VIEWS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    aria-pressed={view === v.id}
                    onClick={() => setView(v.id)}
                    className={cn(
                      SMALL,
                      "min-h-10 rounded-full border px-4 font-bold transition-colors",
                      view === v.id ? "border-black bg-black text-white" : "border-black/20 hover:border-black",
                    )}
                  >
                    {v.label} <span className={view === v.id ? "text-white/70" : "text-quiet-ink"}>{groups[v.id].length}</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search bookings"
                  placeholder="search name, phone, venue…"
                  className="min-h-10 w-full rounded-full border border-black/20 bg-white px-4 text-sm placeholder:text-quiet-ink focus:border-black focus:outline-none sm:w-64"
                />
                <button
                  type="button"
                  onClick={() => exportCsv(list)}
                  disabled={list.length === 0}
                  className={cn(SMALL, "min-h-10 rounded-full px-2 font-bold underline underline-offset-4 disabled:opacity-40")}
                >
                  export csv
                </button>
              </div>
            </div>

            <p className="sr-only" role="status">
              {list.length} {list.length === 1 ? "booking" : "bookings"} shown
            </p>

            {list.length > 0 ? (
              <ol aria-busy={refreshing} className="mt-6 space-y-3">
                {list.map((b) => (
                  <Card key={b.orderId} b={b} today={today} />
                ))}
              </ol>
            ) : (
              <p className={cn(LABEL, "mt-10 leading-loose text-quiet-ink")}>
                {query.trim() ? `nothing matches “${query.trim()}”.` : EMPTY[view]}
              </p>
            )}
          </section>

          <p className={cn(SMALL, "mt-16 leading-loose text-quiet-ink")}>
            read live from razorpay — refunds and payouts are handled in the{" "}
            <a href="https://dashboard.razorpay.com/" target="_blank" rel="noopener noreferrer" className="text-black underline underline-offset-4">
              razorpay dashboard
              <NewTab />
            </a>
            .
          </p>
        </div>
      </main>
    </>
  );
}

function SignIn({ error, busy, onSubmit }: { error?: string; busy: boolean; onSubmit: (key: string, remember: boolean) => void }) {
  const [key, setKey] = useState("");
  const [remember, setRemember] = useState(false);
  const [show, setShow] = useState(false);
  const ready = Boolean(ENDPOINT);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (key.trim()) onSubmit(key.trim(), remember);
      }}
      className="mt-10 max-w-md"
    >
      {/* lets password managers file the password under a name */}
      <input type="text" name="username" autoComplete="username" value="adimakesmusic bookings" readOnly hidden />
      <label htmlFor="db-key" className={cn(LABEL, "block text-quiet")}>
        password
      </label>
      <div className="relative mt-3">
        <input
          id="db-key"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          disabled={!ready}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "db-key-error" : undefined}
          className="block w-full rounded-none border-0 border-b border-white/40 bg-transparent py-3 pr-16 text-lg text-white focus:border-b-2 focus:border-white focus:pb-[11px] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          disabled={!ready}
          className={cn(SMALL, "absolute bottom-2 right-0 min-h-8 px-1 text-neutral-300 hover:text-white", onBlack)}
        >
          show
        </button>
      </div>
      <p id="db-key-error" role="alert" className={cn(LABEL, "mt-3 min-h-[1lh] leading-relaxed text-white")}>
        {error ? `( ! ) ${error}` : ""}
      </p>

      <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-neutral-300">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className={cn("h-4 w-4 accent-white", onBlack)}
        />
        keep me signed in on this device
      </label>

      <button
        type="submit"
        disabled={busy || !ready}
        className={cn(
          "mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-7 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.3em] text-black transition-colors hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-60 md:text-xs",
          onBlack,
        )}
      >
        {busy ? "opening…" : "open the book"} <span aria-hidden>→</span>
      </button>

      <p className={cn(SMALL, "mt-10 leading-loose text-quiet")}>
        {ready
          ? "for aditya and the team. forgot the password? set a new one with npm run pay:password."
          : "the booking server isn't connected to this build yet."}
      </p>
    </form>
  );
}

export default function DashboardPage() {
  const [state, setState] = useState<State>({ kind: "starting" });
  const keyRef = useRef("");
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const open = useCallback(async (key: string, remember?: boolean) => {
    setState((s) =>
      s.kind === "open" ? { ...s, refreshing: true, error: undefined } : { kind: "opening", viaForm: remember !== undefined },
    );
    try {
      const data = await fetchBookings(key);
      keyRef.current = key;
      if (remember !== undefined) saveKey(key, remember);
      setState({ kind: "open", data, refreshing: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "something went wrong";
      if (err instanceof WrongPassword) {
        forgetKey();
        keyRef.current = "";
        setState({ kind: "signed-out", error: message });
      } else {
        setState((s) => (s.kind === "open" ? { ...s, refreshing: false, error: message } : { kind: "signed-out", error: message }));
      }
    }
  }, []);

  // signed in already (this tab, or "keep me signed in")?
  useEffect(() => {
    const key = ENDPOINT ? savedKey() : "";
    if (key) void open(key);
    else setState({ kind: "signed-out" });
  }, [open]);

  // coming back to the tab after a while brings the list up to date
  useEffect(() => {
    const onShow = () => {
      const s = stateRef.current;
      if (document.visibilityState === "visible" && keyRef.current && s.kind === "open" && !s.refreshing && Date.now() - s.data.fetchedAt > 60_000)
        void open(keyRef.current);
    };
    document.addEventListener("visibilitychange", onShow);
    return () => document.removeEventListener("visibilitychange", onShow);
  }, [open]);

  const signOut = () => {
    forgetKey();
    keyRef.current = "";
    setState({ kind: "signed-out" });
  };

  if (state.kind === "open") {
    return (
      <div className="min-h-svh bg-[#f5f4f3] font-grotesk">
        <Board
          data={state.data}
          refreshing={state.refreshing}
          error={state.error}
          onRefresh={() => void open(keyRef.current)}
          onSignOut={signOut}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col bg-black font-grotesk text-white">
      <header className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6">
        <a href="/" className={cn("text-xs font-bold uppercase tracking-[0.3em] md:text-sm", onBlack)}>
          adimakesmusic
        </a>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-10 md:px-6 md:pt-20">
        <p className={cn(LABEL, "tracking-[0.5em] text-quiet")}>( private )</p>
        <h1 className="mt-3 font-display text-6xl uppercase leading-[0.9] md:text-8xl">
          the <span className="font-accent lowercase italic">bookings</span>
        </h1>
        {state.kind === "signed-out" || (state.kind === "opening" && state.viaForm) ? (
          <SignIn
            error={state.kind === "signed-out" ? state.error : undefined}
            busy={state.kind === "opening"}
            onSubmit={(key, remember) => void open(key, remember)}
          />
        ) : (
          <p role="status" className={cn(LABEL, "mt-10 text-neutral-300")}>
            opening the book…
          </p>
        )}
      </main>
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-50 opacity-[0.06]" />
    </div>
  );
}
