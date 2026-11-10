/**
 * Facts about the site and the artist, in one place. Anything left empty is
 * simply not rendered — no placeholder links, no buttons that go nowhere.
 *
 * The <head> of each HTML entry repeats a few of these for crawlers that never
 * run the script (titles, descriptions, structured data); keep them in step.
 */
export const SITE = {
  url: "https://adimakesmusic.in",
  artist: "Aditya Chowhan",
  brand: "adimakesmusic",

  /** Public profiles: footer links here, `sameAs` in the structured data. */
  socials: [] as { label: string; href: string }[],

  booking: {
    /** The Book button and the /book/ page appear once this is true. */
    enabled: false,
  },
};
