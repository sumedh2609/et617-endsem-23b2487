import { useLang } from '../context/LanguageContext';
import { flight, fmt, G } from '../lib/physics';

/**
 * Step-by-step working of one launch: each formula, the learner's numbers
 * substituted in, and the result. `footer` holds a locked/unlocked insight line.
 * `choices` + `onChoose` (optional) let the learner pick which run to inspect.
 */
export default function PhysicsPanel({ angle, speed, footer, choices, chosen, onChoose }) {
  const { t } = useLang();
  const p = t.physics;
  const u = t.units;
  const f = flight(angle, speed);
  const rad = (angle * Math.PI) / 180;
  const n2 = (x) => fmt(x, 2);

  const rows = [
    { key: 'forward', bar: 'bg-emerald-500', formula: 'vx = u × cos θ', work: `${speed} × cos ${angle}° = ${speed} × ${n2(Math.cos(rad))}`, result: `${n2(f.vx)} ${u.mps}` },
    { key: 'upward', bar: 'bg-amber-500', formula: 'vy = u × sin θ', work: `${speed} × sin ${angle}° = ${speed} × ${n2(Math.sin(rad))}`, result: `${n2(f.vy)} ${u.mps}` },
    { key: 'time', bar: 'bg-sky-500', formula: 'T = 2 × vy ÷ g', work: `2 × ${n2(f.vy)} ÷ ${G}`, result: `${n2(f.T)} ${u.s}` },
    { key: 'height', bar: 'bg-orange-400', formula: 'H = vy² ÷ (2 × g)', work: `${n2(f.vy)}² ÷ ${2 * G}`, result: `${fmt(f.H)} ${u.m}` },
    { key: 'range', bar: 'bg-teal-600', formula: 'R = vx × T', work: `${n2(f.vx)} × ${n2(f.T)}`, result: `${fmt(f.R)} ${u.m}` },
    {
      key: 'shortcut',
      bar: 'bg-indigo-500',
      formula: 'R = u² × sin 2θ ÷ g',
      work: `${speed * speed} × sin ${2 * angle}° ÷ ${G} = ${speed * speed} × ${n2(Math.sin(2 * rad))} ÷ ${G}`,
      result: `${fmt(f.R)} ${u.m}`,
    },
  ];

  return (
    <section className="card space-y-4" aria-labelledby="physics-title">
      <div>
        <h3 id="physics-title" className="card-title">
          📐 {p.title}
        </h3>
        <p className="text-sm text-stone-600">{p.sub(angle, speed)}</p>
      </div>

      {choices && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-stone-600">{p.choose}</span>
          {choices.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onChoose(c.id)}
              aria-pressed={chosen === c.id}
              className={`chip border ${chosen === c.id ? 'border-teal-600 bg-teal-700 text-white' : 'border-stone-300 bg-white text-stone-700'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <ol className="space-y-2">
        {rows.map((r, i) => (
          <li key={r.key} className={`flex gap-3 rounded-xl bg-stone-50 p-3 ${r.key === 'shortcut' ? 'ring-1 ring-indigo-200' : ''}`}>
            <span className={`w-1.5 shrink-0 rounded-full ${r.bar}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {i + 1}. {p.labels[r.key]}
                <span className="ml-2 text-sm font-normal text-stone-500">{p.meaning[r.key]}</span>
              </p>
              <p className="mt-1 break-words font-mono text-sm">
                <span className="text-stone-700">{r.formula}</span>
                <span className="text-stone-500"> = {r.work} </span>
                <span className="whitespace-nowrap font-bold text-ink">= {r.result}</span>
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-xs text-stone-500">{p.symbols}</p>
      {footer}
    </section>
  );
}
