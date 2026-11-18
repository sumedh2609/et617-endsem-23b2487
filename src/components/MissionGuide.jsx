// "What to do now" strip for first-time users. `current` = index of the active step;
// current === steps.length means every step is done.
export default function MissionGuide({ steps, current }) {
  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={label}
            aria-current={active ? 'step' : undefined}
            className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
              active ? 'border-teal-600 bg-teal-50 text-teal-900' : done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-white text-stone-500'
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                active ? 'bg-teal-700 text-white' : done ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {done ? '✓' : i + 1}
            </span>
            <span className="leading-tight">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
