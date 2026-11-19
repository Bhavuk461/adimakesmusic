import { useEffect, useState, type ReactNode } from "react";
import Divider from "@/components/divider";
import Footer from "@/components/footer";
import SiteNav from "@/components/site-nav";
import SkipLinks from "@/components/skip-links";
import PixelField from "@/components/ui/pixel-field";
import {
  EMPTY_BOOKING,
  FIELD_ORDER,
  bookingMessage,
  bookingSubject,
  describeWhen,
  todayISO,
  validateBooking,
  type BookingDetails,
  type BookingErrors,
  type BookingField,
} from "@/lib/booking";
import { pay } from "@/lib/checkout";
import {
  EVENT_TYPES,
  SETS,
  findOption,
  hoursLabel,
  optionLabel,
  rupees,
  type BookableSet,
  type SetId,
} from "@/lib/packages";
import { SITE, mailtoUrl, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Square cover photos for the two sets. Drop the files in public/pics/ and
 * set `src` — until then each set shows a designed sleeve instead.
 */
const COVERS: Record<SetId, { src?: string; alt: string }> = {
  solo: { alt: "Aditya Chowhan performing solo with his guitar" },
  band: { alt: "Aditya Chowhan on stage with his band" },
};

/** From the technical rider: what the venue provides for the band. */
const RIDER = [
  "Mics and mic stands",
  "Mixer",
  "Amplifiers",
  "XLR cables",
  "DI boxes (direct injection)",
  "Stage monitors",
  "PA system",
  "A sound engineer",
];

const BOOK_WORDS = ["book live", "solo", "the band", "delhi ncr", "adimakesmusic", "vol. 01"];

const OPENING = "Hi! I'd like to book Aditya for a live set.";

const LABEL = "text-[0.625rem] uppercase tracking-[0.4em] md:text-[0.6875rem]";

const COUNT = ["", "one", "two", "three", "four", "five", "six", "seven", "eight"];

type Status =
  | { kind: "idle" }
  | { kind: "invalid" }
  | { kind: "sent"; via: "whatsapp" | "email" }
  | { kind: "working" }
  | { kind: "paid"; paymentId: string }
  | { kind: "unverified"; paymentId: string }
  | { kind: "dismissed" }
  | { kind: "failed"; message: string };

/* ───────────────────────────── hero ───────────────────────────── */

function BookHero() {
  return (
    <header className="relative overflow-hidden bg-black text-white">
      <PixelField />
      <SiteNav page="book" />

      <div className="relative z-10 flex flex-col items-center px-4 pb-28 pt-10 text-center md:pb-36 md:pt-14">
        <p className="mb-6 text-[0.625rem] uppercase tracking-[0.55em] text-quiet md:mb-8 md:text-xs">
          ( bookings ) — delhi ncr
        </p>

        {/* stacked by CSS, so the spaces between the lines are written out */}
        <h1 className="relative font-display uppercase leading-[0.84]">
          <span className="block text-[clamp(4rem,14vw,11rem)] tracking-[0.01em]">Book</span>{" "}
          <span className="text-outline block text-[clamp(4rem,14vw,11rem)] tracking-[0.01em]">
            Aditya
          </span>{" "}
          <span className="sr-only">Chowhan, </span>
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[5deg] whitespace-nowrap font-accent text-[clamp(2rem,6.5vw,4.75rem)] lowercase italic tracking-normal drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            live,&nbsp;for&nbsp;you
          </span>
        </h1>

        <p className="mt-9 max-w-md text-[0.625rem] font-medium uppercase leading-loose tracking-[0.28em] text-neutral-400 md:mt-11 md:text-xs">
          bollywood, live — solo with a guitar,
          <br />
          or the whole five-piece band.
        </p>
      </div>
    </header>
  );
}

/* ──────────────────────────── the sets ─────────────────────────── */

/** Stands in for a cover photo: a record sliding out of its sleeve. */
function Sleeve({ set }: { set: BookableSet }) {
  return (
    <div aria-hidden className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1.5px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="absolute left-[44%] top-1/2 aspect-square w-[86%] -translate-y-1/2">
        <div className="relative h-full w-full rounded-full border border-white/30 bg-[radial-gradient(circle,transparent_58%,rgba(255,255,255,0.05)_100%)] -rotate-[38deg] transition-transform duration-[1600ms] ease-out group-hover/set:rotate-[12deg]">
          <div className="absolute inset-[9%] rounded-full border border-white/15" />
          <div className="absolute inset-[18%] rounded-full border border-white/15" />
          <div className="absolute inset-[27%] rounded-full border border-dashed border-white/25" />
          <div className="absolute inset-[37%] rounded-full border border-white/40" />
          <div className="absolute left-1/2 top-1/2 h-[3%] w-[3%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />
          <div className="absolute left-1/2 top-0 h-[7%] w-px -translate-x-1/2 bg-white/50" />
        </div>
      </div>
      <span className="absolute left-5 top-5 text-[0.5625rem] uppercase tracking-[0.4em] text-white/85 md:left-6 md:top-6 md:text-[0.625rem]">
        side {set.side}
      </span>
      <span className="absolute right-5 top-5 text-[0.5625rem] uppercase tracking-[0.4em] text-white/85 md:right-6 md:top-6 md:text-[0.625rem]">
        vol. 01
      </span>
      {/* how many are on stage */}
      <span className="text-outline absolute -bottom-[0.14em] left-4 font-display text-[clamp(6rem,24vw,12rem)] leading-none md:left-5">
        {String(set.lineup.length).padStart(2, "0")}
      </span>
    </div>
  );
}

function SetCard({
  set,
  value,
  invalid,
  onPick,
}: {
  set: BookableSet;
  value: string;
  invalid: boolean;
  onPick: (id: string) => void;
}) {
  const cover = COVERS[set.id];
  const chosen = set.options.some((o) => o.id === value);

  return (
    <div role="group" aria-labelledby={`bk-${set.id}-name`} className="group/set flex flex-col">
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-2xl bg-black text-white outline outline-2 outline-offset-4 transition-[outline-color] duration-300 md:rounded-3xl",
          chosen ? "outline-black" : "outline-transparent",
        )}
      >
        {cover.src ? (
          <img
            src={cover.src}
            alt={cover.alt}
            width={1200}
            height={1200}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Sleeve set={set} />
        )}
      </div>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <h3 id={`bk-${set.id}-name`} className="font-display text-4xl uppercase leading-none md:text-5xl">
          {set.name}
        </h3>
        <span className={cn(LABEL, "text-quiet-ink")}>
          {COUNT[set.lineup.length] ?? set.lineup.length} on stage
        </span>
      </div>

      {/* reserves three lines on desktop, so both tracklists start level */}
      <ul className="mt-3 flex flex-wrap content-start gap-x-3 gap-y-1 text-[0.625rem] uppercase leading-relaxed tracking-[0.22em] text-quiet-ink md:min-h-[calc(3lh+0.5rem)] md:text-[0.6875rem]">
        {set.lineup.map((who) => (
          <li key={who} className="after:ml-3 after:content-['·'] last:after:content-none">
            {who}
          </li>
        ))}
      </ul>

      {/* the tracklist: one row per length of set */}
      <div className="mt-6 space-y-1 border-t-2 border-black pt-3">
        {set.options.map((o, i) => (
          <label
            key={o.id}
            htmlFor={`bk-${o.id}`}
            className={cn(
              "group/row -mx-3 flex min-h-[3.25rem] cursor-pointer items-center justify-between gap-4 rounded-xl px-3 transition-colors",
              "hover:bg-black/[0.05] has-[:checked]:bg-black has-[:checked]:text-white",
              "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-black",
            )}
          >
            <input
              id={`bk-${o.id}`}
              type="radio"
              name="set"
              value={o.id}
              checked={value === o.id}
              onChange={() => onPick(o.id)}
              aria-describedby={invalid ? "bk-set-error" : undefined}
              className="sr-only"
            />
            <span className="flex items-center gap-4">
              <span
                aria-hidden
                className="flex h-4 w-4 items-center justify-center rounded-full border border-current"
              >
                <span className="h-2 w-2 scale-0 rounded-full bg-current transition-transform group-has-[:checked]/row:scale-100" />
              </span>
              <span
                aria-hidden
                className="w-6 text-[0.625rem] uppercase tracking-[0.2em] text-quiet-ink group-has-[:checked]/row:text-white/60"
              >
                {set.side}
                {i + 1}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] md:text-sm">
                <span className="sr-only">{set.name}, </span>
                {hoursLabel(o.hours)}
              </span>
            </span>
            <span className="font-display text-2xl leading-none md:text-3xl">{rupees(o.price)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── the details ────────────────────────── */

const inputClass = cn(
  "mt-3 block w-full rounded-none border-0 border-b border-black/30 bg-transparent px-0 py-2.5 text-base text-black",
  "placeholder:text-quiet-ink focus:border-b-2 focus:border-black focus:pb-[9px] focus:outline-none",
  "aria-[invalid=true]:border-b-2 aria-[invalid=true]:border-black aria-[invalid=true]:pb-[9px]",
);

function Field({
  id,
  label,
  optional,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={cn(LABEL, "block text-quiet-ink")}>
        {label}
        {optional && <span> — optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-[0.6875rem] uppercase tracking-[0.2em] text-black">
          ( ! ) {error}
        </p>
      )}
    </div>
  );
}

/* ──────────────────────────── the ticket ─────────────────────────── */

const onBlack = "focus-visible:outline-white";
const primaryBtn = cn(
  "inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-white px-7 py-3.5 text-[0.6875rem] font-bold uppercase tracking-[0.3em] text-black transition-colors hover:bg-neutral-300 disabled:cursor-wait disabled:opacity-60 md:text-xs",
  onBlack,
);
const secondaryBtn = cn(
  "inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/60 px-7 py-3.5 text-[0.6875rem] uppercase tracking-[0.3em] text-white transition-colors hover:border-white hover:bg-white hover:text-black md:text-xs",
  onBlack,
);
const quietBtn = cn(
  "-my-2 cursor-pointer py-2 text-[0.625rem] uppercase tracking-[0.3em] text-neutral-400 underline-offset-4 transition-colors hover:text-white hover:underline md:text-[0.6875rem]",
  onBlack,
);

function statusMessage(status: Status, price: string): string {
  switch (status.kind) {
    case "invalid":
      return "( ! ) a few details are missing — they're marked above.";
    case "sent":
      return status.via === "whatsapp"
        ? `whatsapp opened with your booking typed out — just hit send. didn't open? message ${SITE.contact.whatsappDisplay}.`
        : "your email app opened with everything filled in — just hit send.";
    case "working":
      return "opening secure checkout…";
    case "paid":
      return `${price} received — payment id ${status.paymentId}. we'll confirm the details on whatsapp shortly.`;
    case "unverified":
      return `your payment went through (id ${status.paymentId}), but we couldn't confirm it automatically. send us that id on whatsapp and we'll take it from there.`;
    case "dismissed":
      return "checkout closed — nothing was charged.";
    case "failed":
      return `( ! ) ${status.message} — try again, or book on whatsapp.`;
    default:
      return "";
  }
}

function Ticket({
  details,
  status,
  payOnline,
  onAct,
}: {
  details: BookingDetails;
  status: Status;
  payOnline: boolean;
  onAct: (via: "pay" | "whatsapp" | "email") => void;
}) {
  const pick = findOption(details.optionId);
  const price = pick ? rupees(pick.option.price) : "";
  const summary = [details.date ? describeWhen(details.date, details.time) : "", details.venue.trim()]
    .filter(Boolean)
    .join(" · ");
  const done = status.kind === "paid" || status.kind === "unverified";
  const message = statusMessage(status, price);

  const followUp = () =>
    window.open(
      whatsappUrl(
        bookingMessage(
          details,
          `Hi! I just paid ${price} to book Aditya (payment id ${"paymentId" in status ? status.paymentId : ""}).`,
        ),
      ),
      "_blank",
      "noopener,noreferrer",
    );

  return (
    <div className="mt-16 overflow-hidden rounded-3xl bg-black text-white md:mt-20">
      <div className="grid md:grid-cols-[1fr_auto]">
        <div className="p-6 md:p-10">
          <p className={cn(LABEL, "text-quiet")}>03 — lock it in</p>
          <p className="mt-4 font-display text-3xl uppercase leading-[0.95] md:text-5xl">
            {done ? "booked ♪" : pick ? optionLabel(pick.set, pick.option) : "pick a set ↑"}
          </p>
          <p className={cn(LABEL, "mt-4 leading-relaxed text-neutral-400")}>
            {done && pick
              ? [optionLabel(pick.set, pick.option), summary].filter(Boolean).join(" · ")
              : summary || "your date and venue show up here"}
          </p>
        </div>

        {/* the stub, torn along the dashed line */}
        <div className="relative border-t border-dashed border-white/30 p-6 md:min-w-[17rem] md:border-l md:border-t-0 md:p-10">
          <span aria-hidden className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#f5f4f3]" />
          <span aria-hidden className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#f5f4f3] md:hidden" />
          <p className={cn(LABEL, "text-quiet")}>{done ? "paid" : "total"}</p>
          <p className="mt-3 font-display text-5xl leading-none md:text-6xl">{price || "₹ —"}</p>
          <p className={cn(LABEL, "mt-3 text-quiet")}>per performance</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/15 p-6 sm:flex-row sm:flex-wrap sm:items-center md:gap-4 md:p-10">
        {done ? (
          <button type="button" onClick={followUp} className={secondaryBtn}>
            message us on whatsapp
          </button>
        ) : payOnline ? (
          <>
            <button type="submit" disabled={status.kind === "working"} className={primaryBtn}>
              {status.kind === "working" ? "opening checkout…" : price ? `pay ${price} & book` : "pay & book"}
            </button>
            <button type="button" onClick={() => onAct("whatsapp")} className={secondaryBtn}>
              book on whatsapp instead
            </button>
            <button type="button" onClick={() => onAct("email")} className={quietBtn}>
              or email
            </button>
          </>
        ) : (
          <>
            <button type="submit" className={primaryBtn}>
              book on whatsapp <span aria-hidden>→</span>
            </button>
            <button type="button" onClick={() => onAct("email")} className={quietBtn}>
              or send it by email
            </button>
          </>
        )}
      </div>

      <p
        role="status"
        className={cn(
          LABEL,
          "px-6 leading-relaxed text-neutral-300 md:px-10",
          message ? "pb-6 md:pb-10" : "pb-0",
        )}
      >
        {message}
      </p>
    </div>
  );
}

/* ───────────────────────────── the page ──────────────────────────── */

export default function BookPage() {
  const [details, setDetails] = useState<BookingDetails>(EMPTY_BOOKING);
  const [errors, setErrors] = useState<BookingErrors>({});
  // validation runs live only once someone has tried to send
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // client-only, so the prerendered HTML doesn't bake in the build date
  const [minDate, setMinDate] = useState<string>();
  const payOnline = Boolean(SITE.payments.endpoint);

  useEffect(() => setMinDate(todayISO()), []);

  const update = (field: BookingField, value: string) => {
    const next = { ...details, [field]: value };
    setDetails(next);
    if (attempted) setErrors(validateBooking(next));
    if (status.kind !== "working" && status.kind !== "paid" && status.kind !== "unverified")
      setStatus({ kind: "idle" });
  };

  const focusFirstError = (errs: BookingErrors) => {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (!first) return false;
    const id = first === "optionId" ? `bk-${details.optionId || SETS[0].options[0].id}` : `bk-${first}`;
    document.getElementById(id)?.focus();
    return true;
  };

  const act = async (via: "pay" | "whatsapp" | "email") => {
    const errs = validateBooking(details);
    setErrors(errs);
    setAttempted(true);
    if (focusFirstError(errs)) {
      setStatus({ kind: "invalid" });
      return;
    }

    if (via === "whatsapp") {
      window.open(whatsappUrl(bookingMessage(details, OPENING)), "_blank", "noopener,noreferrer");
      setStatus({ kind: "sent", via });
      return;
    }
    if (via === "email") {
      window.location.href = mailtoUrl(bookingSubject(details), bookingMessage(details, OPENING));
      setStatus({ kind: "sent", via });
      return;
    }

    setStatus({ kind: "working" });
    const result = await pay(SITE.payments.endpoint, details);
    setStatus(
      result.status === "paid" || result.status === "unverified"
        ? { kind: result.status, paymentId: result.paymentId }
        : result.status === "failed"
          ? { kind: "failed", message: result.message }
          : { kind: "dismissed" },
    );
  };

  const err = (f: BookingField) =>
    errors[f] ? { "aria-invalid": true as const, "aria-describedby": `bk-${f}-error` } : {};

  return (
    <div className="relative min-h-svh overflow-x-clip bg-black font-grotesk">
      <SkipLinks to="#booking" />
      <BookHero />

      <main id="booking" tabIndex={-1} className="focus:outline-none">
        <Divider words={BOOK_WORDS} />

        <div className="relative bg-[#f5f4f3] pb-24 pt-28 text-black md:pb-32 md:pt-36">
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void act(payOnline ? "pay" : "whatsapp");
            }}
            className="mx-auto max-w-6xl px-4 md:px-6"
          >
            {/* 01 — the sets */}
            <section aria-labelledby="bk-sets-title">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
                <div>
                  <p className={cn(LABEL, "mb-3 tracking-[0.5em] text-quiet-ink")}>01 — pick your set</p>
                  <h2 id="bk-sets-title" className="font-display text-5xl uppercase leading-[0.9] md:text-7xl">
                    the <span className="font-accent lowercase italic">sets</span>
                  </h2>
                </div>
                <p className="max-w-[17rem] text-right text-[0.5625rem] uppercase leading-loose tracking-[0.25em] text-quiet-ink md:text-[0.6875rem]">
                  prices are per performance ♪<br />
                  sound comes from the venue — see the rider
                </p>
              </div>

              <fieldset>
                <legend className="sr-only">Pick a set and how long it runs</legend>
                <div className="grid gap-14 md:grid-cols-2 md:gap-8">
                  {SETS.map((set) => (
                    <SetCard
                      key={set.id}
                      set={set}
                      value={details.optionId}
                      invalid={Boolean(errors.optionId)}
                      onPick={(id) => update("optionId", id)}
                    />
                  ))}
                </div>
                {errors.optionId && (
                  <p id="bk-set-error" className="mt-6 text-[0.6875rem] uppercase tracking-[0.2em] text-black">
                    ( ! ) {errors.optionId}
                  </p>
                )}
              </fieldset>
            </section>

            {/* 02 — the details */}
            <section aria-labelledby="bk-details-title" className="mt-24 md:mt-32">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
                <div>
                  <p className={cn(LABEL, "mb-3 tracking-[0.5em] text-quiet-ink")}>02 — your night</p>
                  <h2 id="bk-details-title" className="font-display text-5xl uppercase leading-[0.9] md:text-7xl">
                    the <span className="font-accent lowercase italic">details</span>
                  </h2>
                </div>
                <p className="max-w-[17rem] text-right text-[0.5625rem] uppercase leading-loose tracking-[0.25em] text-quiet-ink md:text-[0.6875rem]">
                  everything is needed
                  <br />
                  unless it says optional
                </p>
              </div>

              <div className="grid gap-x-10 gap-y-9 md:grid-cols-2">
                <Field id="bk-date" label="date of the event" error={errors.date}>
                  <input
                    id="bk-date"
                    type="date"
                    min={minDate}
                    value={details.date}
                    onChange={(e) => update("date", e.target.value)}
                    className={inputClass}
                    {...err("date")}
                  />
                </Field>
                <Field id="bk-time" label="start time" optional>
                  <input
                    id="bk-time"
                    type="time"
                    value={details.time}
                    onChange={(e) => update("time", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field id="bk-event" label="the occasion" error={errors.event}>
                  <div className="relative">
                    <select
                      id="bk-event"
                      value={details.event}
                      onChange={(e) => update("event", e.target.value)}
                      className={cn(inputClass, "appearance-none pr-8", !details.event && "text-quiet-ink")}
                      {...err("event")}
                    >
                      <option value="" disabled>
                        choose one
                      </option>
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t} className="text-black">
                          {t}
                        </option>
                      ))}
                    </select>
                    <span aria-hidden className="pointer-events-none absolute bottom-3 right-1 text-sm">
                      ↓
                    </span>
                  </div>
                </Field>
                <Field id="bk-venue" label="venue and city" error={errors.venue}>
                  <input
                    id="bk-venue"
                    type="text"
                    autoComplete="off"
                    placeholder="e.g. the courtyard, gurugram"
                    value={details.venue}
                    onChange={(e) => update("venue", e.target.value)}
                    className={inputClass}
                    {...err("venue")}
                  />
                </Field>
                <Field id="bk-name" label="your name" error={errors.name}>
                  <input
                    id="bk-name"
                    type="text"
                    autoComplete="name"
                    value={details.name}
                    onChange={(e) => update("name", e.target.value)}
                    className={inputClass}
                    {...err("name")}
                  />
                </Field>
                <Field id="bk-phone" label="whatsapp number" error={errors.phone}>
                  <input
                    id="bk-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+91"
                    value={details.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={inputClass}
                    {...err("phone")}
                  />
                </Field>
                <Field id="bk-email" label="email" optional error={errors.email}>
                  <input
                    id="bk-email"
                    type="email"
                    autoComplete="email"
                    value={details.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={inputClass}
                    {...err("email")}
                  />
                </Field>
                <Field id="bk-notes" label="anything we should know" optional>
                  <textarea
                    id="bk-notes"
                    rows={1}
                    placeholder="song requests, timings, the first dance…"
                    value={details.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    className={cn(inputClass, "min-h-[2.75rem] resize-y")}
                  />
                </Field>
              </div>
            </section>

            {/* 03 — the ticket */}
            <Ticket details={details} status={status} payOnline={payOnline} onAct={(v) => void act(v)} />

            <p className="mt-6 text-[0.5625rem] uppercase leading-loose tracking-[0.25em] text-quiet-ink md:text-[0.625rem]">
              not sure which set? ask first —{" "}
              <a
                href={whatsappUrl("Hi Aditya! I have a question about booking a live set.")}
                target="_blank"
                rel="noopener"
                className="-my-2 py-2 text-black underline underline-offset-4"
              >
                whatsapp {SITE.contact.whatsappDisplay}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>{" "}
              or{" "}
              <a href={`mailto:${SITE.contact.email}`} className="-my-2 py-2 text-black underline underline-offset-4">
                {SITE.contact.email}
              </a>
              {payOnline && (
                <>
                  {" "}
                  · if aditya can&rsquo;t take your date, you get a full refund —{" "}
                  <a href="/refunds/" className="-my-2 py-2 text-black underline underline-offset-4">
                    refund policy
                  </a>
                </>
              )}
            </p>
          </form>

          {/* 04 — the rider */}
          <section
            aria-labelledby="bk-rider-title"
            className="mx-auto mt-24 max-w-6xl px-4 md:mt-32 md:px-6"
          >
            <div className="grid gap-12 border-t-2 border-black pt-10 md:grid-cols-3 md:gap-8">
              <div>
                <p className={cn(LABEL, "mb-3 tracking-[0.5em] text-quiet-ink")}>04 — good to know</p>
                <h2 id="bk-rider-title" className="font-display text-5xl uppercase leading-[0.9] md:text-6xl">
                  the <span className="font-accent lowercase italic">rider</span>
                </h2>
                <p className="mt-5 max-w-xs text-sm leading-relaxed text-quiet-ink">
                  What the band needs at the venue. Rates are per performance; we&rsquo;ll confirm the exact
                  setup for your space when you book.
                </p>
              </div>
              <div>
                <h3 className={cn(LABEL, "text-quiet-ink")}>on stage — the band</h3>
                <ul className="mt-4 border-t border-black/15">
                  {SETS.find((s) => s.id === "band")!.lineup.map((who) => (
                    <li key={who} className="border-b border-black/15 py-3 text-sm font-medium">
                      {who}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className={cn(LABEL, "text-quiet-ink")}>provided by the venue</h3>
                <ul className="mt-4 border-t border-black/15">
                  {RIDER.map((item) => (
                    <li key={item} className="border-b border-black/15 py-3 text-sm font-medium">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-50 opacity-[0.06]" />
    </div>
  );
}
