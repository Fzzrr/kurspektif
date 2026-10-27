import Image from 'next/image';

// Panel kanan halaman masuk/daftar: bidang terang seperti separuh bawah hero
// landing — judul poster, tiga hal yang didapat, dan satu foto arsip.
const features = [
  'Kurs harian 165 mata uang, pasangan apa pun.',
  'Penjelasan sisi mana yang menggerakkan kurs minggu ini.',
  'Email saat kurs mencapai targetmu, dan ringkasan tiap Senin.',
];

export default function AuthSidePanel() {
  return (
    <div className="hidden flex-col justify-between gap-10 bg-ink p-10 text-paper lg:flex lg:w-[46%] xl:p-14">
      <div>
        <h2 className="text-[clamp(40px,3.9vw,72px)] font-black uppercase leading-[0.86] tracking-[-0.035em]">
          <span className="block">Kurs dunia</span>
          <span className="block">dan alasannya</span>
        </h2>
        <ul className="mt-8 space-y-2 text-[17px] leading-snug">
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>

      <figure>
        <Image
          src="/arsip/wisselbank-dam.jpg"
          alt="Ukiran Lapangan Dam di Amsterdam yang ramai."
          width={1920}
          height={1384}
          sizes="40vw"
          className="archive-photo max-h-[36vh] w-full object-cover"
        />
        <figcaption className="mt-3 text-[13px] text-paper/70">
          Lapangan Dam, Amsterdam, tempat Wisselbank beroperasi.{' '}
          <a href="https://commons.wikimedia.org/w/index.php?curid=85275523" className="underline underline-offset-2">
            Cetakan Rijksmuseum
          </a>
          , CC0.
        </figcaption>
      </figure>
    </div>
  );
}
