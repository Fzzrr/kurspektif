import Reveal from "../motion/Reveal";
import FeatureSwiper from "../rate/FeatureSwiper";
import SectionHeading from "../ui/SectionHeading";

export default function Features() {
  return (
    <section id="fitur" className="mx-auto max-w-6xl px-6 py-16">
      <Reveal>
        <SectionHeading
          eyebrow="Fitur"
          title="Konteks yang tidak diberikan konverter lain"
        />
      </Reveal>

      <Reveal delay={80} className="mt-10">
        <FeatureSwiper />
      </Reveal>
    </section>
  );
}
