import { useMotionPaused } from "@/lib/motion";

/**
 * Pauses the animations that loop on their own (marquee, vinyl, equalizer) and
 * resumes them. The label names the action, so it never needs a pressed state.
 */
export default function MotionToggle({ className }: { className?: string }) {
  const [paused, toggle] = useMotionPaused();
  return (
    <button type="button" onClick={toggle} className={className}>
      {paused ? "resume motion" : "pause motion"}
    </button>
  );
}
