import { useLang } from '../context/LanguageContext';
import { fmt } from '../lib/physics';

// Shows how the launch speed is shared between forward (vx) and upward (vy) motion.
export default function VelocitySplit({ vx, vy, total }) {
  const { t } = useLang();
  const rows = [
    { label: t.sandbox.vx, value: vx, color: 'bg-emerald-600' },
    { label: t.sandbox.vy, value: vy, color: 'bg-amber-500' },
  ];
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex justify-between text-sm font-semibold">
            <span>{r.label}</span>
            <span className="tabular-nums">
              {fmt(r.value)} {t.units.mps}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-stone-200">
            <div className={`h-full rounded-full ${r.color} transition-all`} style={{ width: `${(r.value / total) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
