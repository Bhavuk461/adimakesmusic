import Divider from "@/components/divider";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import SoundSection from "@/components/sound-section";

export default function App() {
  return (
    <main id="top" className="relative min-h-svh overflow-x-clip bg-black font-grotesk">
      <Hero />
      <Divider />
      <SoundSection />
      <Footer />
      {/* film grain over everything, both halves */}
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-50 opacity-[0.06]" />
    </main>
  );
}
