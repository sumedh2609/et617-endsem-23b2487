import { useLang } from '../context/LanguageContext';
import AboutPanel from '../components/AboutPanel';

export default function About({ onBack }) {
  const { t } = useLang();
  return (
    <div className="space-y-6">
      <AboutPanel />
      <button type="button" className="btn-primary" onClick={onBack}>
        ← {t.about.back}
      </button>
    </div>
  );
}
