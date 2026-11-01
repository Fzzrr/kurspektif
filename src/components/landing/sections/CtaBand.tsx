import { display } from "../type";

// Penutup: kalimat yang bagian kosongnya adalah form. Email dibawa ke halaman
// daftar (/register?email=…) sebagai isian awal; validasi tetap di sana.
export default function CtaBand() {
  return (
    <section id="daftar" data-field className="bg-ink px-5 py-28 text-paper sm:px-10 sm:py-40">
      <form action="/register" method="get">
        <h2 className={display}>
          <label htmlFor="daftar-email">Kirim kurs ke</label>
        </h2>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="daftar-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="emailmu"
            className={`${display} min-w-0 flex-1 bg-paper/5 px-[0.12em] normal-case outline-none placeholder:text-paper/35 focus-visible:bg-paper/10`}
          />
          <button type="submit" className={`${display} bg-paper px-[0.18em] text-ink hover:bg-surface`}>
            Daftar
          </button>
        </div>
        <p className="mt-6 max-w-[60ch] text-[17px] text-paper/70">
          Gratis. Setelah daftar, pilih pasangan untuk Pantauan, pasang batas alert, dan ringkasan datang tiap Senin pagi.
        </p>
      </form>
    </section>
  );
}
