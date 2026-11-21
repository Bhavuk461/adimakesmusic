import type { ReactNode } from "react";
import Footer from "@/components/footer";
import SiteNav from "@/components/site-nav";
import SkipLinks from "@/components/skip-links";
import { SITE, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export type PolicyId = "terms" | "privacy" | "refunds" | "shipping";

/** Bump when any policy text changes. */
const UPDATED = "21 november 2026";

const LABEL = "text-[0.625rem] uppercase tracking-[0.4em] md:text-[0.6875rem]";

const link = "underline underline-offset-4 hover:no-underline";

function Contact() {
  return (
    <p>
      WhatsApp{" "}
      <a href={whatsappUrl("Hi! ")} target="_blank" rel="noopener" className={link}>
        {SITE.contact.whatsappDisplay}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>{" "}
      or email{" "}
      <a href={`mailto:${SITE.contact.email}`} className={link}>
        {SITE.contact.email}
      </a>
      .
    </p>
  );
}

type Policy = {
  /** Short name, for the list of policies. */
  label: string;
  title: string;
  intro: string;
  sections: { heading: string; body: ReactNode }[];
};

export const POLICIES: Record<PolicyId, Policy> = {
  terms: {
    label: "terms & conditions",
    title: "Terms & conditions",
    intro:
      "These terms apply when you book Aditya Chowhan — solo or with his band — on adimakesmusic.in. By booking, you agree to them.",
    sections: [
      {
        heading: "Booking",
        body: (
          <p>
            Choose a set and its length on the <a href="/book/" className={link}>booking page</a>, add your
            event details and pay online. Your booking is confirmed the moment the payment goes through: the
            page confirms it, and Razorpay emails a receipt if you gave an email address. Each date takes one
            booking, so a date that&rsquo;s already taken can&rsquo;t be booked again. If we ever can&rsquo;t
            perform on your date, you get a full refund.
          </p>
        ),
      },
      {
        heading: "Prices and payment",
        body: (
          <p>
            Prices are listed in Indian rupees on the booking page and are per performance, for the length
            of set you choose; the full amount is paid when you book. We&rsquo;ll call you before the event to
            settle the set list, timings on the day and the setup. Online payments are processed by
            Razorpay; we never see or store your card, UPI or bank details.
          </p>
        ),
      },
      {
        heading: "What the venue provides",
        body: (
          <p>
            For band performances, the venue provides the sound setup in our rider: mics and stands, a
            mixer, amplifiers, XLR cables, DI boxes, stage monitors, a PA system and a sound engineer.
            We&rsquo;ll confirm what your space needs before the event.
          </p>
        ),
      },
      {
        heading: "On the day",
        body: (
          <p>
            Please share the schedule, a contact person at the venue and any timing changes as early as you
            can. The set runs for the length you booked.
          </p>
        ),
      },
      {
        heading: "Safety",
        body: (
          <p>
            The performers may pause or end a performance if their safety, or the safety of your guests, is
            at risk.
          </p>
        ),
      },
      {
        heading: "Cancellations",
        body: (
          <p>
            Cancellations and refunds are covered by our{" "}
            <a href="/refunds/" className={link}>
              cancellation &amp; refund policy
            </a>
            .
          </p>
        ),
      },
      {
        heading: "Liability",
        body: (
          <p>
            We aren&rsquo;t responsible for losses caused by events outside our control, and our total
            liability for any booking is limited to the amount paid for it.
          </p>
        ),
      },
      {
        heading: "Changes and law",
        body: (
          <p>
            We may update these terms; the version published when you booked applies to your booking. These
            terms are governed by the laws of India.
          </p>
        ),
      },
    ],
  },

  privacy: {
    label: "privacy policy",
    title: "Privacy policy",
    intro: "We collect only what we need to book and play your event — and nothing for advertising.",
    sections: [
      {
        heading: "What we collect",
        body: (
          <p>
            When you book: your name, your phone or WhatsApp number, your email if you give it, and your
            event details — date, start time, venue, the occasion and anything you tell us. They&rsquo;re
            stored with your payment at Razorpay, our payment processor.
          </p>
        ),
      },
      {
        heading: "Payments",
        body: (
          <p>
            Online payments are handled by Razorpay. We receive confirmation of the payment — amount,
            payment ID and method — but never your card, UPI or bank details. Razorpay&rsquo;s{" "}
            <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener" className={link}>
              privacy policy
              <span className="sr-only"> (opens in a new tab)</span>
            </a>{" "}
            applies to its checkout.
          </p>
        ),
      },
      {
        heading: "How we use it",
        body: (
          <p>
            To reply to you, confirm and plan your booking, perform at your event, and keep the records we
            need for accounts and tax.
          </p>
        ),
      },
      {
        heading: "Who sees it",
        body: (
          <p>
            Aditya and his team, through a private, password-protected bookings page; the musicians playing
            your event; and, where the setup needs it, your venue. If you message us, that goes through
            WhatsApp or Gmail. We don&rsquo;t sell or rent your information.
          </p>
        ),
      },
      {
        heading: "On this website",
        body: (
          <p>
            The site uses no cookies, analytics or trackers. It remembers two small things, in your own
            browser: whether you&rsquo;ve paused the animations, and &mdash; only until you close the tab
            &mdash; that you&rsquo;ve already seen the intro, so it doesn&rsquo;t play again. Our host, GitHub Pages, keeps standard server logs,
            and Razorpay&rsquo;s checkout may set its own cookies when you pay.
          </p>
        ),
      },
      {
        heading: "How long we keep it",
        body: (
          <p>
            For as long as your booking needs, and afterwards only as long as the law requires for our
            accounts.
          </p>
        ),
      },
      {
        heading: "Your choices",
        body: <p>Ask us at any time to see, correct or delete what we hold about you.</p>,
      },
    ],
  },

  refunds: {
    label: "cancellation & refunds",
    title: "Cancellation & refunds",
    intro: "Plans change. Here's what happens to the money if they do.",
    sections: [
      {
        heading: "If we can't take your date",
        body: (
          <p>
            Booked dates can&rsquo;t be booked twice, but if two payments ever land on the same date, the
            later one gets a full refund.
          </p>
        ),
      },
      {
        heading: "If we cancel",
        body: <p>If we have to cancel a confirmed booking, you get a full refund.</p>,
      },
      {
        heading: "If you cancel",
        body: (
          <ul className="space-y-2">
            <li>30 days or more before the event — a full refund.</li>
            <li>7 to 29 days before — a 50% refund.</li>
            <li>Less than 7 days before — no refund.</li>
          </ul>
        ),
      },
      {
        heading: "How refunds work",
        body: (
          <p>
            Message us on WhatsApp or by email with your payment ID. Refunds go back to the original payment
            method within 5–7 working days; your bank may take a few more days to show it.
          </p>
        ),
      },
    ],
  },

  shipping: {
    label: "shipping & delivery",
    title: "Shipping & delivery",
    intro: "Nothing is shipped — what you book is a live performance.",
    sections: [
      {
        heading: "What we deliver",
        body: (
          <p>
            A live music performance by Aditya Chowhan, solo or with his band, at the venue, on the date and
            for the length of set confirmed for your booking.
          </p>
        ),
      },
      {
        heading: "Where",
        body: <p>Across Delhi NCR. For events further away, ask us first.</p>,
      },
      {
        heading: "Confirmation",
        body: (
          <p>
            Your booking is confirmed on screen as soon as you pay, with a payment ID you can keep; Razorpay
            emails the receipt if you gave an email address. We call you before the event to plan the music.
          </p>
        ),
      },
    ],
  },
};

const ORDER: PolicyId[] = ["terms", "privacy", "refunds", "shipping"];

export default function PolicyPage({ id }: { id: PolicyId }) {
  const policy = POLICIES[id];

  return (
    <div className="relative min-h-svh overflow-x-clip bg-[#f5f4f3] font-grotesk text-black">
      <SkipLinks to="#policy" />

      <header className="bg-black text-white">
        <SiteNav page="other" />
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-8 md:px-6 md:pb-20 md:pt-12">
          <p className={cn(LABEL, "tracking-[0.5em] text-quiet")}>( the fine print ) — updated {UPDATED}</p>
          <h1 className="mt-5 font-display text-[clamp(3.25rem,10vw,7.5rem)] uppercase leading-[0.86]">
            {policy.title}
          </h1>
        </div>
      </header>

      <main id="policy" tabIndex={-1} className="mx-auto max-w-6xl px-5 py-16 focus:outline-none md:px-6 md:py-24">
        <div className="grid gap-12 md:grid-cols-[13rem_1fr] md:gap-16">
          <nav aria-label="The fine print" className="md:sticky md:top-10 md:self-start">
            <ul className="border-t border-black/15">
              {ORDER.map((p) => (
                <li key={p} className="border-b border-black/15">
                  <a
                    href={`/${p}/`}
                    aria-current={p === id ? "page" : undefined}
                    className={cn(
                      LABEL,
                      "block py-3.5 transition-colors",
                      p === id ? "font-semibold text-black" : "text-quiet-ink hover:text-black",
                    )}
                  >
                    {p === id && <span aria-hidden>→ </span>}
                    {POLICIES[p].label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <article className="max-w-2xl">
            <p className="text-lg leading-relaxed md:text-xl">{policy.intro}</p>

            {policy.sections.map((s, i) => (
              <section key={s.heading} className="mt-12 border-t border-black/15 pt-6">
                <h2 className="flex items-baseline gap-4 font-display text-2xl uppercase leading-none md:text-3xl">
                  <span aria-hidden className={cn(LABEL, "font-grotesk text-quiet-ink")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.heading}
                </h2>
                <div className="mt-4 text-[0.9375rem] leading-relaxed">{s.body}</div>
              </section>
            ))}

            <section className="mt-12 border-t border-black/15 pt-6">
              <h2 className="flex items-baseline gap-4 font-display text-2xl uppercase leading-none md:text-3xl">
                <span aria-hidden className={cn(LABEL, "font-grotesk text-quiet-ink")}>
                  {String(policy.sections.length + 1).padStart(2, "0")}
                </span>
                Contact
              </h2>
              <div className="mt-4 text-[0.9375rem] leading-relaxed">
                <Contact />
              </div>
            </section>
          </article>
        </div>
      </main>

      <Footer />
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-50 opacity-[0.06]" />
    </div>
  );
}
