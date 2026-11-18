import { useLang } from '../context/LanguageContext';
import { IDENTITY_TOKEN } from '../data/translations';

export default function Footer({ onAbout, active }) {
  const { t } = useLang();
  return (
    <footer className="border-t border-stone-200 bg-white" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm sm:px-6">
        <p className="font-mono font-semibold tracking-tight text-stone-700">{IDENTITY_TOKEN}</p>
        <button
          type="button"
          onClick={onAbout}
          aria-current={active ? 'page' : undefined}
          className={`rounded-lg px-3 py-1.5 font-semibold underline-offset-4 hover:underline ${active ? 'bg-teal-50 text-teal-800' : 'text-teal-700'}`}
        >
          ℹ️ {t.footer.about}
        </button>
      </div>
    </footer>
  );
}
