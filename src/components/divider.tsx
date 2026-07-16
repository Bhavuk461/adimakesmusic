import { cn } from "@/lib/utils";

const WORDS = [
  "the sound",
  "aditya chauhan",
  "play it loud",
  "adimakesmusic",
  "vol. 01",
  "listen",
];

function Spark() {
  return (
    <svg viewBox="0 0 100 100" className="h-4 w-4 shrink-0 md:h-5 md:w-5" aria-hidden>
      {[0, 45, 90, 135].map((angle) => (
        <line
          key={angle}
          x1="50"
          y1="8"
          x2="50"
          y2="92"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
    </svg>
  );
}

function Strip({
  className,
  reverse = false,
  slow = false,
}: {
  className?: string;
  reverse?: boolean;
  slow?: boolean;
}) {
  const half = (
    <div className="flex shrink-0 items-center font-display text-xl uppercase leading-none tracking-wide md:text-3xl">
      {Array.from({ length: 3 }).flatMap((_, repeat) =>
        WORDS.map((word, i) => (
          <span key={`${repeat}-${i}`} className="flex items-center gap-5 pr-5 md:gap-9 md:pr-9">
            <span className="whitespace-nowrap">{word}</span>
            <Spark />
          </span>
        )),
      )}
    </div>
  );

  return (
    <div className={cn("-ml-[5vw] w-[110vw] overflow-hidden py-2.5 md:py-3.5", className)}>
      <div
        className={cn(
          "flex w-max",
          slow ? "animate-marquee-slow" : "animate-marquee",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {half}
        <div aria-hidden className="contents">
          {half}
        </div>
      </div>
    </div>
  );
}

/**
 * The seam between the black half and the white half:
 * two marquee tapes crossing at opposing angles.
 */
export default function Divider() {
  return (
    <div aria-hidden className="relative z-20 -my-8 select-none md:-my-10">
      <div className="-rotate-[2.2deg]">
        <Strip className="border-y-[3px] border-black bg-white text-black" />
      </div>
      <div className="-mt-4 rotate-[1.6deg] md:-mt-6">
        <Strip
          className="border-y border-white/25 bg-black text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
          reverse
          slow
        />
      </div>
    </div>
  );
}
