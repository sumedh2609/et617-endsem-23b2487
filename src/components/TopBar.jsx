import { useLang } from '../context/LanguageContext';
import { LANGS } from '../data/translations';

export default function TopBar() {
  const { t, lang, setLang } = useLang();
  return (
    <header className="sticky z-30 border-b border-stone-200 bg-white/95 backdrop-blur" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <img src="/favicon.svg" alt="" className="h-9 w-9 shrink-0" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-teal-800 sm:text-xl">{t.header.title}</h1>
            <p className="hidden text-sm text-stone-500 sm:block">{t.header.subtitle}</p>
          </div>
        </div>

        <span className="chip order-3 bg-amber-100 text-amber-900 sm:order-none">
          <span aria-hidden="true">🌱</span> {t.header.badge}
        </span>

        <div role="group" aria-label={t.header.toggleLabel} className="ml-auto flex rounded-xl border border-stone-300 bg-stone-100 p-1">
          {LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              lang={l.id}
              aria-pressed={lang === l.id}
              onClick={() => setLang(l.id)}
              className={`rounded-lg px-3 py-1 text-sm font-semibold transition ${
                lang === l.id ? 'bg-teal-700 text-white shadow' : 'text-stone-600 hover:text-ink'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
