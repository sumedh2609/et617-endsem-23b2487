import { useRef, useState } from 'react';
import { useLang } from '../context/LanguageContext';
import ProjectileCanvas from '../components/ProjectileCanvas';
import ChoiceList from '../components/ChoiceList';
import ComparisonBars from '../components/ComparisonBars';
import AICoach from '../components/AICoach';
import PhysicsPanel from '../components/PhysicsPanel';
import MissionGuide from '../components/MissionGuide';
import { flight, fmt } from '../lib/physics';

const ANGLE = 45;
const RUN_COLORS = { 10: '#6366f1', 20: '#0f766e', 30: '#d97706' };
const PREDICTED_RANGE = { r20: 20, r40: 40, r10: 10, r30: 30 };

export default function MissionSpeed({ progress, patch, bump, go }) {
  const { t } = useLang();
  const m = t.mission2;
  const u = t.units;
  const m2 = progress.m2;

  const [choice, setChoice] = useState(m2.prediction);
  const [flyingId, setFlyingId] = useState(null);
  const [viewSpeed, setViewSpeed] = useState(20);
  const canvasRef = useRef(null);
  const queue = useRef([]);

  const hasRun = (speed) => m2.runs.some((r) => r.speed === speed);
  const flyingSpeed = m2.runs.find((r) => r.id === flyingId)?.speed;
  const compareReady = hasRun(10) && hasRun(20) && flyingSpeed !== 10 && flyingSpeed !== 20;
  const big = hasRun(30);
  const show30 = big && flyingSpeed !== 30;

  // The first launch also saves the prediction, so no separate "save" click is needed.
  function run(speed) {
    const id = Date.now() + speed;
    patch('m2', (s) => ({
      ...s,
      prediction: s.locked ? s.prediction : choice,
      locked: true,
      runs: [...s.runs.filter((r) => r.speed !== speed), { id, speed, angle: ANGLE, color: RUN_COLORS[speed] }].sort((a, b) => a.speed - b.speed),
    }));
    bump('experiments');
    setFlyingId(id);
    if (speed === 30) canvasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function runBoth() {
    queue.current = [20];
    run(10);
  }

  function landed() {
    const next = queue.current.shift();
    if (next) run(next);
    else setFlyingId(null);
  }

  const canvasShots = m2.runs.map((r) => ({ ...r, label: `${r.speed} ${u.mps}` }));
  const predictedLabel = m.opts.find((o) => o.id === m2.prediction)?.label;
  const canRun = (m2.locked || !!choice) && !flyingId;
  const guideStep = !m2.locked && !choice ? 0 : !compareReady ? 1 : m2.coachCalls === 0 ? 2 : !m2.transfer ? 3 : 4;
  const viewable = m2.runs.filter((r) => r.id !== flyingId);
  const inspect = viewable.find((r) => r.speed === viewSpeed) || viewable[viewable.length - 1];

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold text-teal-900">{m.title}</h2>
          <p className="text-stone-600">{m.sub}</p>
        </div>
        <MissionGuide steps={m.guide} current={guideStep} />
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Step 1: prediction */}
        <section className="card space-y-3" aria-labelledby="m2-step1">
          <h3 id="m2-step1" className="card-title">
            {m.step1}
          </h3>
          <p className="note-think">📌 {m.known}</p>
          <p className="font-semibold">{m.predictQ}</p>
          <ChoiceList options={m.opts} value={m2.locked ? m2.prediction : choice} onSelect={setChoice} disabled={m2.locked} label={m.predictQ} />
          <p className={m2.locked ? 'note-good' : 'text-sm text-stone-600'}>{m2.locked ? m.lockedNote : m.predictNote}</p>
        </section>

        {/* Step 2: experiments */}
        <section ref={canvasRef} className="card space-y-3" aria-labelledby="m2-step2">
          <h3 id="m2-step2" className="card-title">
            {m.step2}
          </h3>
          <ProjectileCanvas
            xMax={big ? 95 : 45}
            yMax={big ? 25 : 12}
            shots={canvasShots}
            flyingId={flyingId}
            onLanded={landed}
            cannonAngle={ANGLE}
          />
          <p className="chip bg-stone-100 text-stone-700">
            {t.common.angle}: {ANGLE}° ({t.common.locked})
          </p>
          {hasRun(10) && hasRun(20) ? (
            <div className="flex flex-wrap gap-2">
              {[10, 20].map((speed) => (
                <button key={speed} type="button" className="btn-soft" onClick={() => run(speed)} disabled={!canRun}>
                  🔁 {m.rerun(speed)}
                </button>
              ))}
            </div>
          ) : (
            <button type="button" className="btn-primary w-full text-lg" onClick={runBoth} disabled={!canRun}>
              🚀 {flyingId ? t.common.flying : m.runBoth}
            </button>
          )}
          {!m2.locked && !choice && <p className="text-sm text-stone-600">{m.needLock}</p>}
        </section>
      </div>

      {compareReady && (
        <section className="card animate-rise space-y-4" aria-labelledby="m2-compare">
          <h3 id="m2-compare" className="card-title">
            📊 {m.compareTitle}
          </h3>
          <ComparisonBars
            max={show30 ? 100 : 48}
            rows={[
              { label: m.barPred, value: PREDICTED_RANGE[m2.prediction], color: '#94a3b8', dashed: true },
              { label: m.barRun(10), value: 10, color: RUN_COLORS[10] },
              { label: m.barRun(20), value: 40, color: RUN_COLORS[20], blocks: 10 },
              ...(show30 ? [{ label: m.barRun(30), value: 90, color: RUN_COLORS[30], blocks: 10 }] : []),
            ]}
          />
          <p className="text-sm text-stone-600">{m.blocksNote}</p>
          <p className={m2.prediction === 'r40' ? 'note-good' : 'note-think'}>
            <span className="font-semibold">{predictedLabel}. </span>
            {m.fb[m2.prediction]}
          </p>

          <div>
            <h4 className="mb-2 font-semibold">{m.dataTitle}</h4>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left tabular-nums">
                <thead>
                  <tr className="border-b border-stone-200 text-sm text-stone-600">
                    {m.dataCols.map((c) => (
                      <th key={c} className="px-2 py-2 font-semibold">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {m2.runs.map((r) => {
                    const f = flight(ANGLE, r.speed);
                    return (
                      <tr key={r.speed} className="border-b border-stone-100 last:border-0">
                        <td className="px-2 py-2 font-semibold" style={{ color: r.color }}>
                          {r.speed} {u.mps}
                        </td>
                        <td className="px-2 py-2">
                          {fmt(f.vx, 2)} {u.mps}
                        </td>
                        <td className="px-2 py-2">
                          {fmt(f.T, 2)} {u.s}
                        </td>
                        <td className="px-2 py-2 font-semibold">
                          {fmt(f.R)} {u.m}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="note-warm mt-3">🔎 {m.dataPrompt}</p>
          </div>
        </section>
      )}

      {compareReady && inspect && (
        <PhysicsPanel
          angle={ANGLE}
          speed={inspect.speed}
          choices={viewable.map((r) => ({ id: r.speed, label: `${r.speed} ${u.mps}` }))}
          chosen={inspect.speed}
          onChoose={setViewSpeed}
          footer={<p className={m2.coachCalls > 0 ? 'note-good' : 'note-warm'}>{m2.coachCalls > 0 ? t.physics.m2Rule : t.physics.m2Locked}</p>}
        />
      )}

      {compareReady && (
        <section className="card animate-rise space-y-3" aria-labelledby="m2-step3">
          <h3 id="m2-step3" className="card-title">
            ✍️ {m.step3}
          </h3>
          <p>{m.explainPrompt}</p>
          <AICoach
            value={m2.explanation}
            onChange={(text) => patch('m2', { explanation: text })}
            result={m2.coach}
            prediction={PREDICTED_RANGE[m2.prediction] ? `${PREDICTED_RANGE[m2.prediction]} m` : null}
            onResult={(r) => patch('m2', (s) => ({ ...s, coach: r, coachCalls: s.coachCalls + 1 }))}
          />
        </section>
      )}

      {compareReady && m2.coachCalls > 0 && (
        <section className="card animate-rise space-y-3" aria-labelledby="m2-transfer">
          <h3 id="m2-transfer" className="card-title">
            ⭐ {m.transferTitle}
          </h3>
          <p>{m.transferQ}</p>
          <ChoiceList options={m.transferOpts} value={m2.transfer} onSelect={(id) => patch('m2', { transfer: id })} columns={3} label={m.transferQ} />
          {m2.transfer && <p className={`animate-rise ${m2.transfer === 't90' ? 'note-good' : 'note-think'}`}>{m.transferFb[m2.transfer]}</p>}
          {m2.transfer && (
            <button type="button" className="btn-amber" onClick={() => run(30)} disabled={!!flyingId}>
              🚀 {m.verify30}
            </button>
          )}
        </section>
      )}

      {compareReady && m2.coachCalls > 0 && (
        <div className="flex justify-end">
          <button type="button" className="btn-primary" onClick={() => go('practice')}>
            {m.next} →
          </button>
        </div>
      )}
    </div>
  );
}
