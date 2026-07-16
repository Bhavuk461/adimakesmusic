export default function Footer() {
  return (
    <footer id="contact" className="border-t-4 border-black bg-black text-white">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-6 md:py-24">
        <p className="font-display text-4xl uppercase leading-[0.95] md:text-6xl">
          say hi —
          <br />
          <span className="text-outline">make some noise</span>
        </p>

        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 text-[10px] uppercase tracking-[0.35em] text-neutral-400 md:mt-12 md:text-xs">
          <a href="#" className="transition-colors hover:text-white">
            instagram ↗
          </a>
          <a href="#" className="transition-colors hover:text-white">
            spotify ↗
          </a>
          <a href="#" className="transition-colors hover:text-white">
            youtube ↗
          </a>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-[9px] uppercase tracking-[0.3em] text-neutral-600 md:text-[10px]">
          <span>© mmxxvi aditya chauhan</span>
          <span>black &amp; white by design — colour by the music</span>
        </div>
      </div>
    </footer>
  );
}
