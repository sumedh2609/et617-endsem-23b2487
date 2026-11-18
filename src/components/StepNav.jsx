import { useLang } from '../context/LanguageContext';

export default function StepNav({ current, done, onGo }) {
  const { t } = useLang();
  return (
    <nav aria-label={t.nav.label} className="border-b border-stone-200 bg-paper">
      <ol className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {t.nav.steps.map((label, i) => {
          const isCurrent = i === current;
          return (
            <li key={label} className="shrink-0">
              <button
                type="button"
                onClick={() => onGo(i)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  isCurrent ? 'bg-teal-700 text-white' : 'text-stone-600 hover:bg-white'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    isCurrent ? 'bg-white text-teal-800' : done[i] ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {done[i] && !isCurrent ? '✓' : i + 1}
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
