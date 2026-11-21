import { useState } from "react";
import { START_HOURS, START_MINUTES, clockHour, isSmallHours } from "@/lib/booking";
import { cn } from "@/lib/utils";

const LABEL = "text-[0.625rem] uppercase tracking-[0.4em] md:text-[0.6875rem]";
const SUBLABEL = "text-[0.5625rem] uppercase tracking-[0.35em] text-quiet-ink md:text-[0.625rem]";

/** A pad lights up (inverts to black) when its radio is picked — like the set rows above it. */
const pad = cn(
  "group/pad relative flex cursor-pointer select-none items-center justify-center rounded-xl border border-black/15 bg-white/60 transition-colors",
  "hover:border-black/60",
  "has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white",
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-black",
);

/**
 * The start time, picked from pads instead of the browser's own time input
 * (a "--:-- --" field with a pop-up clock that reads differently everywhere).
 * Any time of day: one tap for the hour — all 24, in rows for the morning,
 * afternoon, evening and late night, each pad marked am, pm or noon — and one
 * for the minutes, in fives. The big readout is the clock.
 *
 * Underneath it's two plain radio groups, so the arrow keys, screen readers
 * and the form's error handling all work as they would for any input.
 */
export default function StartTime({
  value,
  onChange,
  error,
}: {
  /** hh:mm, 24-hour — or "" until an hour is picked */
  value: string;
  onChange: (time: string) => void;
  error?: string;
}) {
  // the minutes can be chosen before the hour, so they're kept here until then
  const [spareMinutes, setSpareMinutes] = useState<string>(START_MINUTES[0]);
  const hour = /^\d{2}:\d{2}$/.test(value) ? Number(value.slice(0, 2)) : null;
  const minutes = hour === null ? spareMinutes : value.slice(3);
  const hh = (h: number) => String(h).padStart(2, "0");

  const pickHour = (h: number) => onChange(`${hh(h)}:${minutes}`);
  const pickMinutes = (m: string) => {
    setSpareMinutes(m);
    if (hour !== null) onChange(`${hh(hour)}:${m}`);
  };

  const smallHours = isSmallHours(value);
  const describedBy = [error && "bk-time-error", smallHours && "bk-time-note"].filter(Boolean).join(" ") || undefined;
  const shown = hour === null ? null : clockHour(hour);
  // the 12 pad says noon; 12:30 on the clock is pm
  if (shown && shown.half === "noon" && minutes !== "00") shown.half = "pm";

  return (
    <fieldset className="min-w-0">
      <legend className={cn(LABEL, "float-left text-quiet-ink")}>start time</legend>

      {/* the clock — says back what's been picked; the radios already say it to screen readers */}
      <p aria-hidden className="float-right -mt-2 flex items-baseline gap-2 leading-none">
        <span className={cn("font-display text-4xl tabular-nums md:text-5xl", !shown && "text-quiet-ink")}>
          {shown ? shown.hour : "--"}
          <span className={cn(shown && "animate-pulse")}>:</span>
          {minutes}
        </span>
        <span className={cn("text-[0.625rem] font-bold uppercase tracking-[0.3em] md:text-[0.6875rem]", !shown && "text-quiet-ink")}>
          {shown ? shown.half : "pm"}
        </span>
      </p>

      <div className="clear-both space-y-3 pt-6 md:space-y-4">
        {START_HOURS.map(({ part, hours }) => (
          <div key={part}>
            <p aria-hidden className={cn(SUBLABEL, "mb-1.5 md:mb-2")}>
              {part}
            </p>
            <div className="grid grid-cols-6 gap-1.5 md:gap-2">
              {hours.map((h) => {
                const c = clockHour(h);
                return (
                  <label key={h} className={cn(pad, "h-12 flex-col")}>
                    <input
                      type="radio"
                      name="bk-hour"
                      value={h}
                      checked={hour === h}
                      onChange={() => pickHour(h)}
                      aria-describedby={describedBy}
                      className="sr-only"
                    />
                    <span className="font-display text-xl leading-none">{c.hour}</span>{" "}
                    <span className="mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-quiet-ink group-has-[:checked]/pad:text-white/80 md:text-[0.5625rem]">
                      {c.half}
                    </span>
                    {h === 0 && <span className="sr-only">, midnight</span>}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <fieldset className="min-w-0 pt-1">
          <legend className={cn(SUBLABEL, "float-left mb-1.5 md:mb-2")}>minutes</legend>
          <div className="clear-both grid grid-cols-6 gap-1.5 md:gap-2">
            {START_MINUTES.map((m) => (
              <label key={m} className={cn(pad, "h-10")}>
                <input
                  type="radio"
                  name="bk-minutes"
                  value={m}
                  checked={minutes === m}
                  onChange={() => pickMinutes(m)}
                  className="sr-only"
                />
                <span aria-hidden className="font-display text-base leading-none text-quiet-ink group-has-[:checked]/pad:text-white/70 md:text-lg">
                  :
                </span>
                <span className="font-display text-base leading-none md:text-lg">{m}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* after midnight the calendar has moved on — a Saturday-night party at
          1 am is on Sunday's date */}
      {smallHours && (
        <p id="bk-time-note" className="mt-3 text-[0.625rem] uppercase leading-relaxed tracking-[0.2em] text-quiet-ink">
          past midnight — pick the date the clock will show then (saturday night at 1 am is sunday).
        </p>
      )}

      {error && (
        <p id="bk-time-error" className="mt-3 text-[0.6875rem] uppercase tracking-[0.2em] text-black">
          ( ! ) {error}
        </p>
      )}
    </fieldset>
  );
}
