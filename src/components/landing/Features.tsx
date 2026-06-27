import Reveal from "./Reveal";
import FeatureSwiper from "./FeatureSwiper";

export default function Features() {
  return (
    <section id="fitur" className="mx-auto max-w-6xl px-6 py-16">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          Fitur
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight">
          Konteks yang tidak diberikan konverter lain
        </h2>
      </Reveal>

      <Reveal delay={80} className="mt-10">
        <FeatureSwiper />
      </Reveal>
    </section>
  );
}
