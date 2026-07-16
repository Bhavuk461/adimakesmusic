import ExpandCards from "@/components/ui/expand-cards";

export default function SoundSection() {
  return (
    <section id="sound" className="relative bg-[#f5f4f3] pb-24 pt-28 text-black md:pb-32 md:pt-36">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-16">
          <div>
            <p className="mb-3 text-[0.625rem] uppercase tracking-[0.5em] text-neutral-500 md:text-[0.6875rem]">
              01 — the shelf
            </p>
            <h2 className="font-display text-5xl uppercase leading-[0.9] md:text-7xl">
              the <span className="font-accent lowercase italic">sound</span>
            </h2>
          </div>
          <p className="max-w-[16rem] text-right text-[0.5625rem] uppercase leading-loose tracking-[0.25em] text-neutral-500 md:text-[0.6875rem]">
            hover the first card ♪<br />
            the rest are still in the studio
          </p>
        </div>

        <ExpandCards />

        <p className="mt-10 text-center text-[0.5625rem] uppercase tracking-[0.4em] text-neutral-400 md:text-[0.625rem]">
          ( this is where the colour lives )
        </p>
      </div>
    </section>
  );
}
