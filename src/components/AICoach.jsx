import { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { getCoachFeedback } from '../lib/aiCoach';

const SOURCE_STYLE = {
  gemini: 'bg-indigo-100 text-indigo-900',
  openai: 'bg-indigo-100 text-indigo-900',
  offline: 'bg-stone-200 text-stone-800',
  fallback: 'bg-amber-100 text-amber-900',
};

export default function AICoach({ value, onChange, result, onResult, prediction }) {
  const { t, lang } = useLang();
  const c = t.coach;
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try {
      onResult(await getCoachFeedback({ text: value, lang, prediction }));
    } finally {
      setLoading(false);
    }
  }

  const msg = result ? c.msg[result.analysis.level] : null;

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        maxLength={400}
        placeholder={t.mission2.explainPlaceholder}
        aria-label={t.mission2.explainPrompt}
        className="w-full rounded-xl border-2 border-stone-200 p-3 focus:border-teal-500 focus:outline-none"
      />
      <button type="button" className="btn-primary" onClick={ask} disabled={loading}>
        <span aria-hidden="true">🤖</span> {loading ? c.thinking : result ? c.askAgain : c.ask}
      </button>

      {result && !loading && (
        <div className="animate-rise rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4" aria-live="polite">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-indigo-900">{c.title}</h4>
            <span className={`chip text-xs ${SOURCE_STYLE[result.source]}`}>{c.source[result.source]}</span>
          </div>

          {result.text ? (
            <p className="whitespace-pre-line text-ink">{result.text}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-ink">{msg.praise}</p>
              <p className="note-think">
                <span className="font-semibold">{c.thinkNext}: </span>
                {msg.next}
              </p>
            </div>
          )}

          <div className="mt-3">
            <p className="mb-1 text-sm font-semibold text-stone-600">{c.found}</p>
            <ul className="grid gap-1 sm:grid-cols-2">
              {Object.entries(c.concepts).map(([key, label]) => {
                const on = result.analysis.concepts[key];
                return (
                  <li key={key} className={`flex items-center gap-2 text-sm ${on ? 'text-emerald-800' : 'text-stone-500'}`}>
                    <span aria-hidden="true">{on ? '✅' : '◻️'}</span>
                    {label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
