import { useLang } from '../context/LanguageContext';
import { fmt } from '../lib/physics';

/**
 * rows = [{ label, value, color, dashed?, blocks? }]. `blocks` splits a bar into
 * equal segments (e.g. 10 m) so the learner can count "how many times".
 */
export default function ComparisonBars({ rows, max }) {
  const { t } = useLang();
  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const pct = Math.min(100, (r.value / max) * 100);
        const segments = r.blocks ? Math.round(r.value / r.blocks) : 0;
        return (
          <div key={r.label} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 sm:grid-cols-[8rem_1fr]">
            <span className="text-sm font-semibold text-stone-700">{r.label}</span>
            <div className="relative h-9 rounded-lg bg-stone-100">
              <div
                className={`absolute inset-y-0 left-0 flex overflow-hidden rounded-lg ${r.dashed ? 'border-2 border-dashed bg-transparent' : ''}`}
                style={{ width: `${pct}%`, borderColor: r.dashed ? r.color : undefined, background: r.dashed ? undefined : r.color }}
              >
                {segments > 1 &&
                  Array.from({ length: segments }, (_, i) => (
                    <span key={i} className="flex flex-1 items-center justify-center border-r-2 border-white/80 text-xs font-bold text-white last:border-r-0">
                      {i + 1}
                    </span>
                  ))}
              </div>
              <span className="absolute inset-y-0 flex items-center pl-2 text-sm font-bold tabular-nums text-ink" style={{ left: `${pct}%` }}>
                {fmt(r.value)} {t.units.m}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
