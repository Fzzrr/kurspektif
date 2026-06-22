async function getRate() {
  const res = await fetch(
    "https://api.frankfurter.dev/v1/latest?base=USD&symbols=IDR",
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();
  return data.rates.IDR;
}

export default async function Dashboard() {
  const rate = await getRate();

  return (
    <main className="p-8">
      <p className="text-sm text-gray-500">Kurs saat ini</p>
      <h1 className="text-4xl font-bold">
        {rate.toLocaleString("id-ID")}
      </h1>
      <p className="text-sm text-gray-500">1 USD → IDR</p>
    </main>
  );
}