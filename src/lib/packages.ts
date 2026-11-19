/**
 * What clients can book, and what it costs.
 *
 * This is the one place prices live: the booking page renders from it and the
 * payment worker (worker/) charges from it — the browser only ever sends the
 * option id, never an amount. Change a price here and both follow.
 *
 * Plain TypeScript with no imports, because the worker bundles it too.
 */

export type SetId = "solo" | "band";

export type SetOption = {
  id: string;
  hours: number;
  /** Whole rupees, as charged. */
  price: number;
};

export type BookableSet = {
  id: SetId;
  name: string;
  /** "Side A" / "Side B" — the booking page presents the sets as records. */
  side: "a" | "b";
  /** Who is on stage, as it reads on the sleeve. */
  lineup: string[];
  options: SetOption[];
};

export const SETS: BookableSet[] = [
  {
    id: "solo",
    name: "Solo",
    side: "a",
    lineup: ["Aditya Chowhan — vocals & guitar"],
    options: [
      { id: "solo-1h", hours: 1, price: 6000 },
      { id: "solo-2h", hours: 2, price: 7200 },
    ],
  },
  {
    id: "band",
    name: "The Band",
    side: "b",
    lineup: [
      "Aditya Chowhan — vocals & rhythm guitar",
      "Female vocals",
      "Guitar — acoustic & electric",
      "Bass",
      "Percussion",
    ],
    options: [
      { id: "band-1h", hours: 1, price: 24000 },
      { id: "band-2h", hours: 2, price: 30000 },
      { id: "band-3h", hours: 3, price: 36000 },
    ],
  },
];

export const EVENT_TYPES = [
  "Wedding, sangeet or mehendi",
  "Engagement or reception",
  "Birthday or anniversary",
  "House party",
  "Corporate event",
  "Café, restaurant or bar",
  "College fest",
  "Something else",
] as const;

export function findOption(id: string) {
  for (const set of SETS) {
    const option = set.options.find((o) => o.id === id);
    if (option) return { set, option };
  }
  return undefined;
}

export const hoursLabel = (hours: number) => (hours === 1 ? "1 hour" : `${hours} hours`);

/** "Solo — 2 hours" */
export const optionLabel = (set: BookableSet, option: SetOption) =>
  `${set.name} — ${hoursLabel(option.hours)}`;

/**
 * Indian grouping — ₹6,000 · ₹30,000 · ₹1,20,000 — done by hand so the
 * prerendered HTML and the browser can never disagree about it.
 */
export function rupees(amount: number): string {
  const digits = String(Math.round(amount));
  if (digits.length <= 3) return `₹${digits}`;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `₹${rest},${last3}`;
}

/** The lowest price of a set, for "from ₹6,000". */
export const fromPrice = (set: BookableSet) => Math.min(...set.options.map((o) => o.price));
