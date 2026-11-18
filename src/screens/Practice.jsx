import { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import ProjectileCanvas from '../components/ProjectileCanvas';
import RangeSlider from '../components/RangeSlider';
import ChoiceList from '../components/ChoiceList';
import PhysicsPanel from '../components/PhysicsPanel';
import { PRACTICE, PRACTICE_TOLERANCE } from '../data/practice';
import { flight, fmt, SHOT_COLORS } from '../lib/physics';

const hits = (item, shot) => Math.abs(flight(shot.angle, item.speed).R - item.target) <= PRACTICE_TOLERANCE;

export function isPracticeDone(item, practice) {
  if (item.type === 'predict') return practice.answers[item.id] != null;
  return (practice.shots[item.id] || []).some((s) => hits(item, s));
}

function canvasSize(item) {
  if (item.type === 'target') {
    const maxR = (item.speed * item.speed) / 10;
    return { xMax: Math.ceil((maxR * 1.1) / 5) * 5, yMax: Math.ceil(maxR / 2) + 1 };
  }
  const f = flight(item.angle, item.speed);
  const far = Math.max(f.R, ...item.options);
  return { xMax: Math.ceil((far * 1.15) / 5) * 5, yMax: Math.max(4, Math.ceil(f.H * 1.3) + 1) };
}

export default function Practice({ progress, patch, bump, go }) {
  const { t } = useLang();
  const p = t.practice;
  const pr = progress.practice;

  const firstOpen = PRACTICE.findIndex((it) => !isPracticeDone(it, pr));
  const [index, setIndex] = useState(firstOpen === -1 ? 0 : firstOpen);
  const [angle, setAngle] = useState(30);
  const [flyingId, setFlyingId] = useState(null);

  const item = PRACTICE[index];
  const text = p.items[item.id];
  const shots = pr.shots[item.id] || [];
  const last = shots[shots.length - 1];
  const settled = last && !flyingId;
  const doneCount = PRACTICE.filter((it) => isPracticeDone(it, pr)).length;

  function open(i) {
    setIndex(i);
    setFlyingId(null);
    setAngle(30);
  }

  function launch(a) {
    const id = Date.now();
    patch('practice', (s) => {
      const list = s.shots[item.id] || [];
      return { ...s, shots: { ...s.shots, [item.id]: [...list, { id, angle: a, color: SHOT_COLORS[list.length % SHOT_COLORS.length] }] } };
    });
    bump('experiments');
    setFlyingId(id);
  }

  // Predict items: choosing an answer locks it and launches the ball straight away.
  function answer(optionId) {
    if (pr.answers[item.id] != null) return;
    patch('practice', (s) => ({ ...s, answers: { ...s.answers, [item.id]: Number(optionId) } }));
    launch(item.angle);
  }

  const { xMax, yMax } = canvasSize(item);
  const canvasShots = shots.map((s) => ({ ...s, speed: item.speed, label: `${s.angle}°` }));

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-teal-900">{p.title}</h2>
        <p className="text-stone-600">{p.sub}</p>
        <p className="note-think mt-3">{p.why}</p>
      </header>

      <nav aria-label={p.listLabel} className="overflow-x-auto">
        <ol className="flex gap-2 pb-1">
          {PRACTICE.map((it, i) => {
            const done = isPracticeDone(it, pr);
            const active = i === index;
            return (
              <li key={it.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => open(i)}
                  aria-current={active ? 'step' : undefined}
                  className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-left text-sm font-semibold transition ${
                    active ? 'border-teal-600 bg-teal-50 text-teal-900' : done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${done ? 'bg-emerald-600 text-white' : 'bg-stone-200'}`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <span>
                    {p.items[it.id].title}
                    <span className="block text-xs font-normal">{it.type === 'predict' ? p.typePredict : p.typeTarget}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-1 text-sm text-stone-600">{p.progress(doneCount, PRACTICE.length)}</p>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          <section className="card space-y-4">
            <div>
              <span className="chip bg-amber-100 text-amber-900">{item.type === 'predict' ? p.typePredict : p.typeTarget}</span>
              <h3 className="mt-2 text-xl font-bold">{text.title}</h3>
              <p className="mt-1">{text.context}</p>
            </div>
            <ProjectileCanvas
              key={item.id}
              xMax={xMax}
              yMax={yMax}
              shots={canvasShots}
              flyingId={flyingId}
              onLanded={() => setFlyingId(null)}
              target={item.type === 'target' ? { x: item.target, tol: PRACTICE_TOLERANCE } : null}
              cannonAngle={item.type === 'predict' ? item.angle : flyingId ? last.angle : angle}
            />
            {item.type === 'target' ? (
              <TargetControls item={item} angle={angle} setAngle={setAngle} onLaunch={() => launch(angle)} flying={!!flyingId} />
            ) : (
              <p className="chip bg-stone-100 text-stone-700">{p.given(item.angle, item.speed)}</p>
            )}
          </section>

          {settled && <PhysicsPanel angle={last.angle} speed={item.speed} />}
        </div>

        <aside className="space-y-4" aria-live="polite">
          {item.type === 'predict' ? (
            <PredictCard item={item} text={text} chosen={pr.answers[item.id]} onAnswer={answer} settled={settled} />
          ) : (
            <TargetFeedback item={item} shots={shots} settled={settled} last={last} />
          )}

          {isPracticeDone(item, pr) && !flyingId && (
            <div className="flex flex-col gap-2">
              {doneCount === PRACTICE.length && <p className="note-good">{p.allDone}</p>}
              {index < PRACTICE.length - 1 ? (
                <button type="button" className="btn-primary w-full" onClick={() => open(index + 1)}>
                  {p.next} →
                </button>
              ) : (
                <button type="button" className="btn-primary w-full" onClick={() => go('reflection')}>
                  {p.finish} →
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function PredictCard({ item, text, chosen, onAnswer, settled }) {
  const { t } = useLang();
  const p = t.practice;
  const options = item.options.map((v, i) => ({ id: String(i), label: `${fmt(v)} ${t.units.m}` }));
  const answered = chosen != null;
  return (
    <section className="card space-y-3">
      <p className="font-semibold">{text.q}</p>
      {!answered && <p className="text-sm text-stone-600">{p.pickToLaunch}</p>}
      <ChoiceList options={options} value={answered ? String(chosen) : null} onSelect={onAnswer} disabled={answered} columns={3} label={text.q} />
      {answered && settled && (
        <div className="animate-rise space-y-2">
          <p className="font-semibold">{p.actual(fmt(flight(item.angle, item.speed).R))}</p>
          <p className={chosen === item.answer ? 'note-good' : 'note-think'}>{text.fb[chosen]}</p>
        </div>
      )}
    </section>
  );
}

function TargetControls({ item, angle, setAngle, onLaunch, flying }) {
  const { t } = useLang();
  return (
    <div className="space-y-3">
      <p className="note-warm">{t.practice.targetTask(item.target, item.speed)}</p>
      <RangeSlider label={t.common.angle} value={angle} min={10} max={85} unit="°" onChange={setAngle} />
      <button type="button" className="btn-primary text-lg" onClick={onLaunch} disabled={flying}>
        🚀 {flying ? t.common.flying : t.common.launch}
      </button>
    </div>
  );
}

function TargetFeedback({ item, shots, settled, last }) {
  const { t } = useLang();
  const p = t.practice;
  if (!settled) return null;
  const hitShots = shots.filter((s) => hits(item, s));
  const twoSides = hitShots.some((s) => s.angle < 45) && hitShots.some((s) => s.angle > 45);
  const lastHit = hits(item, last);
  const diff = flight(last.angle, item.speed).R - item.target;

  return (
    <section className="card animate-rise space-y-3">
      {lastHit ? (
        <p className="note-good font-semibold">{p.hit(last.angle)}</p>
      ) : (
        <>
          <p className="note-think">{diff > 0 ? p.over(fmt(diff)) : p.short(fmt(-diff))}</p>
          <p className="text-sm text-stone-700">💡 {p.targetHint}</p>
        </>
      )}
      {hitShots.length > 0 && <p className={twoSides ? 'note-good' : 'note-warm'}>{twoSides ? p.twoAngles : p.findSecond}</p>}
    </section>
  );
}
