import { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import ProjectileCanvas from '../components/ProjectileCanvas';
import RangeSlider from '../components/RangeSlider';
import VelocitySplit from '../components/VelocitySplit';
import { flight, fmt, SHOT_COLORS } from '../lib/physics';

const MAX_GHOSTS = 5;

export default function Sandbox({ progress, patch, bump, go }) {
  const { t } = useLang();
  const sb = t.sandbox;
  const [angle, setAngle] = useState(60);
  const [speed, setSpeed] = useState(20);
  const [shots, setShots] = useState([]);
  const [flyingId, setFlyingId] = useState(null);
  const [showMath, setShowMath] = useState(false);

  const f = flight(angle, speed);
  const tasks = progress.sandbox.tasks;

  function markTasks(a, u, launched = false) {
    const g = flight(a, u);
    const next = [tasks[0] || g.vy > g.vx + 0.5, tasks[1] || g.vx > g.vy + 0.5, tasks[2] || launched];
    if (next.some((v, i) => v !== tasks[i])) patch('sandbox', { tasks: next });
  }

  const onAngle = (a) => {
    setAngle(a);
    markTasks(a, speed);
  };
  const onSpeed = (u) => {
    setSpeed(u);
    markTasks(angle, u);
  };

  function launch() {
    const id = Date.now();
    setShots((prev) => [...prev, { id, angle, speed, color: SHOT_COLORS[(prev.length + 1) % SHOT_COLORS.length] }].slice(-MAX_GHOSTS));
    setFlyingId(id);
    bump('experiments');
    patch('sandbox', (s) => ({ ...s, launches: s.launches + 1 }));
    markTasks(angle, speed, true);
  }

  const lastShot = shots[shots.length - 1];
  const lastF = lastShot && !flyingId ? flight(lastShot.angle, lastShot.speed) : null;
  const explain = angle < 35 ? sb.explainLow : angle <= 55 ? sb.explainMid : sb.explainHigh;
  const canvasShots = shots.map((s) => ({ ...s, label: `${s.angle}° · ${s.speed} ${t.units.mps}` }));

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-teal-900">{sb.title}</h2>
        <p className="text-stone-600">{sb.sub}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="card space-y-4">
          <ProjectileCanvas
            xMax={92}
            yMax={46}
            shots={canvasShots}
            flyingId={flyingId}
            onLanded={() => setFlyingId(null)}
            cannonAngle={angle}
            preview={{ angle, speed }}
            vectors={{ vx: f.vx, vy: f.vy }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <RangeSlider label={t.common.angle} value={angle} min={15} max={85} unit="°" onChange={onAngle} />
            <RangeSlider label={t.common.speed} value={speed} min={10} max={30} unit={` ${t.units.mps}`} onChange={onSpeed} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-primary" onClick={launch} disabled={!!flyingId}>
              🚀 {flyingId ? t.common.flying : t.common.launch}
            </button>
            {lastF && (
              <p className="animate-rise note-good flex-1" aria-live="polite">
                {sb.result(fmt(lastF.R), fmt(lastF.H), fmt(lastF.T))}
              </p>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="card space-y-3">
            <VelocitySplit vx={f.vx} vy={f.vy} total={speed} />
            <p className="note-think">{explain}</p>
            <p className="text-sm text-stone-600">{sb.speedNote(speed)}</p>
          </section>

          <section className="card">
            <h3 className="card-title">{sb.tasksTitle}</h3>
            <ul className="mt-2 space-y-2">
              {sb.tasks.map((task, i) => (
                <li key={task} className={`flex items-start gap-2 ${tasks[i] ? 'text-emerald-800' : 'text-stone-700'}`}>
                  <span aria-hidden="true">{tasks[i] ? '✅' : '◻️'}</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
            {tasks.every(Boolean) && <p className="animate-rise note-good mt-3">{sb.tasksDone}</p>}
          </section>

          <section className="card">
            <button type="button" className="font-semibold text-teal-700 underline-offset-4 hover:underline" aria-expanded={showMath} onClick={() => setShowMath((v) => !v)}>
              {showMath ? sb.mathHide : sb.mathShow}
            </button>
            {showMath && (
              <div className="animate-rise mt-3 space-y-1">
                {sb.mathLines.map((line) => (
                  <p key={line} className="font-mono text-sm">
                    {line}
                  </p>
                ))}
                <p className="pt-2 text-sm text-stone-600">{sb.gNote}</p>
              </div>
            )}
          </section>
        </aside>
      </div>

      <div className="flex justify-end">
        <button type="button" className="btn-primary" onClick={() => go('mission1')}>
          {sb.next} →
        </button>
      </div>
    </div>
  );
}
