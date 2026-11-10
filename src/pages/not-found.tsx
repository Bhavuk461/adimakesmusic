import SiteNav from "@/components/site-nav";

/** Served by GitHub Pages (as /404.html) for any address that doesn't exist. */
export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-svh flex-col bg-black font-grotesk text-white">
      <header>
        <SiteNav page="other" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-24 pt-10 text-center">
        <p className="mb-6 text-[0.625rem] uppercase tracking-[0.55em] text-quiet md:mb-8 md:text-xs">
          ( 404 ) — off the record
        </p>

        <h1 className="relative font-display uppercase leading-[0.84]">
          <span className="block text-[clamp(4.4rem,17vw,15rem)] tracking-[0.01em]">Wrong</span>{" "}
          <span className="text-outline block text-[clamp(4.4rem,17vw,15rem)] tracking-[0.01em]">
            Track
          </span>
        </h1>

        <p className="mt-9 max-w-md text-[0.625rem] font-medium uppercase leading-loose tracking-[0.28em] text-neutral-400 md:mt-11 md:text-xs">
          this page isn&rsquo;t on the record.
        </p>

        <a
          href="/"
          className="mt-10 rounded-full border border-white/70 px-6 py-3 text-[0.625rem] uppercase tracking-[0.3em] transition-colors hover:bg-white hover:text-black md:text-xs"
        >
          back to the sound <span aria-hidden>→</span>
        </a>
      </main>

      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-50 opacity-[0.06]" />
    </div>
  );
}
