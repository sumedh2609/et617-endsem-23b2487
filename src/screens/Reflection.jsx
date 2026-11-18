import { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import FeelingScale, { feelingFace } from '../components/FeelingScale';
import AboutPanel from '../components/AboutPanel';
import { PRACTICE } from '../data/practice';
import { isPracticeDone } from './Practice';

export default function Reflection({ progress, patch, reset }) {
  const { t } = useLang();
  const r = t.reflection;
  const { m1, m2 } = progress;
  const [confirming, setConfirming] = useState(false);

  const m2Done = m2.runs.some((x) => x.speed === 10) && m2.runs.some((x) => x.speed === 20) && m2.coachCalls > 0;
  const stats = [
    { label: r.stats.experiments, value: progress.experiments, icon: '🚀' },
    { label: r.stats.revisions, value: progress.revisions, icon: '🔁' },
    { label: r.stats.hints, value: progress.hintsUsed, icon: '🔦' },
    { label: r.stats.missions, value: `${(m1.solved ? 1 : 0) + (m2Done ? 1 : 0)} / 2`, icon: '🏁' },
    { label: r.stats.practice, value: `${PRACTICE.filter((it) => isPracticeDone(it, progress.practice)).length} / ${PRACTICE.length}`, icon: '📚' },
  ];

  const heldM1 = m1.firstHypothesis === 'h75' || progress.warmup === 'steep';
  const ideas = [
    { tag: 'M1', text: !m1.solved ? r.m1Pending : heldM1 ? r.m1Grew : r.m1Steady, done: m1.solved },
    { tag: 'M2', text: !m2Done ? r.m2Pending : m2.prediction === 'r20' ? r.m2Grew : r.m2Steady, done: m2Done },
  ];

  const start = progress.confidenceStart;
  const end = progress.confidenceEnd;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-teal-900">{r.title}</h2>
        <p className="text-stone-600">{r.sub}</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-2xl" aria-hidden="true">
              {s.icon}
            </p>
            <p className="text-3xl font-bold tabular-nums text-teal-800">{s.value}</p>
            <p className="text-sm text-stone-600">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="card space-y-3" aria-labelledby="ideas-title">
        <h3 id="ideas-title" className="card-title">
          🌱 {r.ideasTitle}
        </h3>
        {ideas.map((idea) => (
          <p key={idea.tag} className={idea.done ? 'note-good' : 'note-think'}>
            {idea.text}
          </p>
        ))}
      </section>

      <section className="card space-y-3" aria-labelledby="conf-title">
        <h3 id="conf-title" className="card-title">
          {r.confTitle}
        </h3>
        {start && (
          <p className="text-sm text-stone-600">
            {r.confStart(`${feelingFace(start)} ${t.welcome.feel[start - 1]}`)}
          </p>
        )}
        <FeelingScale value={end} onChange={(v) => patch('confidenceEnd', v)} labels={t.welcome.feel} question={r.confTitle} />
        {end && <p className="animate-rise note-good">{start && end > start ? r.confUp : r.confSame}</p>}

        <label className="block pt-2">
          <span className="font-semibold">{r.learnedLabel}</span>
          <textarea
            value={progress.learned}
            onChange={(e) => patch('learned', e.target.value)}
            rows={2}
            maxLength={300}
            placeholder={r.learnedPlaceholder}
            className="mt-1 w-full rounded-xl border-2 border-stone-200 p-3 focus:border-teal-500 focus:outline-none"
          />
        </label>
      </section>

      <p className="rounded-2xl bg-teal-800 p-5 text-center text-lg font-semibold text-white">{r.closing}</p>

      <AboutPanel />

      <div className="flex flex-wrap items-center justify-end gap-3">
        {confirming ? (
          <>
            <p className="text-stone-700">{r.restartConfirm}</p>
            <button type="button" className="btn-soft" onClick={() => setConfirming(false)}>
              {t.common.cancel}
            </button>
            <button type="button" className="btn-amber" onClick={reset}>
              {r.restartYes}
            </button>
          </>
        ) : (
          <button type="button" className="btn-soft" onClick={() => setConfirming(true)}>
            ↺ {r.restart}
          </button>
        )}
      </div>
    </div>
  );
}
