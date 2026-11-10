import MotionToggle from "@/components/motion-toggle";
import { cn } from "@/lib/utils";

// invisible until reached with the keyboard, then a white pill top-left
const reveal = cn(
  "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]",
  "focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-black",
  "focus:text-xs focus:font-bold focus:uppercase focus:tracking-[0.3em]",
);

/**
 * The first two stops for keyboard and screen-reader users: jump past the
 * header, or pause the looping animations before meeting them. Sighted mouse
 * users never see either; the motion switch is also in the footer.
 */
export default function SkipLinks({ to }: { to: string }) {
  return (
    <>
      <a href={to} className={reveal}>
        skip to content
      </a>
      <MotionToggle className={reveal} />
    </>
  );
}
