import { useLang } from '../context/LanguageContext';
import ChoiceList from '../components/ChoiceList';
import FeelingScale from '../components/FeelingScale';

const CYCLE_ICONS = ['🤔', '🚀', '👀', '🔁'];

export default function Welcome({ progress, patch, go }) {
  const { t } = useLang();
  const w = t.welcome;

  return (
    <div className="space-y-6">
      <section className="card bg-gradient-to-br from-teal-50 to-white">
        <h2 className="text-2xl font-bold text-teal-900 sm:text-3xl">{w.hello}</h2>
        <p className="mt-3 max-w-3xl text-lg">{w.intro1}</p>
        <p className="mt-2 max-w-3xl text-lg text-stone-700">{w.intro2}</p>
      </section>

      <section className="card" aria-labelledby="cycle-title">
        <h3 id="cycle-title" className="card-title">
          {w.cycleTitle}
        </h3>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {w.cycle.map((step, i) => (
            <li key={step.title} className="relative rounded-xl border border-teal-100 bg-teal-50/60 p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">{i + 1}</span>
                <span className="text-2xl" aria-hidden="true">
                  {CYCLE_ICONS[i]}
                </span>
              </div>
              <p className="mt-2 text-lg font-bold text-teal-900">{step.title}</p>
              <p className="text-stone-700">{step.text}</p>
              {i < 3 && (
                <span aria-hidden="true" className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-xl text-teal-400 lg:block">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-stone-600">{w.cycleNote}</p>
      </section>

      <section className="card space-y-5" aria-labelledby="checkin-title">
        <div>
          <h3 id="checkin-title" className="card-title">
            {w.checkinTitle}
          </h3>
          <p className="text-sm text-stone-500">{w.checkinNote}</p>
        </div>

        <div>
          <p className="mb-2 font-semibold">{w.feelQ}</p>
          <FeelingScale value={progress.confidenceStart} onChange={(v) => patch('confidenceStart', v)} labels={w.feel} question={w.feelQ} />
        </div>

        <div>
          <p className="mb-2 font-semibold">{w.warmQ}</p>
          <ChoiceList options={w.warmOpts} value={progress.warmup} onSelect={(id) => patch('warmup', id)} columns={2} label={w.warmQ} />
          {progress.warmup && (
            <div className="animate-rise mt-3 space-y-2">
              <p className="note-good">{w.warmFb[progress.warmup]}</p>
              <p className="text-sm text-stone-500">{w.warmNote}</p>
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-end">
        <button type="button" className="btn-primary text-lg" onClick={() => go('sandbox')}>
          {w.start} →
        </button>
      </div>
    </div>
  );
}
