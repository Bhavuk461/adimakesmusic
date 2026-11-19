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
  city: "Delhi NCR",

  contact: {
    /** Digits only, country code first — the form wa.me links expect. */
    whatsapp: "919958177449",
    /** With non-breaking spaces, so the number never splits across two lines. */
    whatsappDisplay: "+91 99581 77449",
    email: "adityachowhanmusic@gmail.com",
  },

  /** Public profiles: footer links here, `sameAs` in the structured data. */
  socials: [
    { label: "instagram", href: "https://www.instagram.com/adimakesmusic/" },
    { label: "youtube", href: "https://www.youtube.com/@adityachowhan" },
  ],

  booking: {
    /** Shows the Book button in the nav and footer, linking to /book/. */
    enabled: true,
  },

  payments: {
    /**
     * Where the payment worker (worker/) is deployed. While this is empty the
     * booking page sends requests over WhatsApp and email instead of taking
     * payment. Set at build time with VITE_PAYMENTS_ENDPOINT (see .env.production).
     */
    endpoint: (import.meta.env.VITE_PAYMENTS_ENDPOINT ?? "").replace(/\/+$/, ""),
  },
};

/** wa.me link that opens a chat with `text` already typed out. */
export const whatsappUrl = (text: string) =>
  `https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(text)}`;

/** mailto: link with the subject and body filled in. */
export const mailtoUrl = (subject: string, body: string) =>
  `mailto:${SITE.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
