import { useLang } from '../context/LanguageContext';

export default function AboutPanel() {
  const { t } = useLang();
  const a = t.about;
  return (
    <section className="card space-y-5" aria-labelledby="about-title">
      <div>
        <h2 id="about-title" className="text-xl font-bold">
          {a.title}
        </h2>
        <p className="mt-2 text-sm text-stone-600">{a.tokenLabel}</p>
        <p className="mt-1 inline-block rounded-xl bg-teal-800 px-4 py-2 font-mono text-lg font-bold tracking-wide text-white">
          23B2487 | P5-T10-L5-C2
        </p>
      </div>

      <div>
        <h3 className="card-title mb-2">{a.cardTitle}</h3>
        <dl className="grid gap-2 sm:grid-cols-2">
          {a.rows.map((r) => (
            <div key={r.code} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
              <dt className="flex items-center gap-2 font-semibold">
                <span className="chip bg-teal-100 font-mono text-teal-900">{r.code}</span>
                {r.name}
              </dt>
              <dd className="mt-1 text-sm text-stone-700">{r.text}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <h3 className="card-title mb-2">{a.pedTitle}</h3>
        <ul className="list-disc space-y-1 pl-5 text-stone-700">
          {a.ped.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
