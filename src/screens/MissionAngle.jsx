import { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import ProjectileCanvas from '../components/ProjectileCanvas';
import RangeSlider from '../components/RangeSlider';
import ChoiceList from '../components/ChoiceList';
import VelocitySplit from '../components/VelocitySplit';
import PhysicsPanel from '../components/PhysicsPanel';
import MissionGuide from '../components/MissionGuide';
import { fmt, judgeShot, M1_SPEED, M1_TARGET, M1_TOLERANCE, SHOT_COLORS } from '../lib/physics';

const HINT_COUNT = 2;
// Choosing a hypothesis sets the slider to the angle it names.
const HYP_ANGLE = { h75: 75, h45: 45, h30: 30 };

export default function MissionAngle({ progress, patch, bump, go }) {
  const { t } = useLang();
  const m = t.mission1;
  const u = t.units;
  const m1 = progress.m1;

  const [angle, setAngle] = useState(70);
  const [flyingId, setFlyingId] = useState(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [reason, setReason] = useState(null);
  const [draftHyp, setDraftHyp] = useState(null);
  const [toast, setToast] = useState(null);

  const last = m1.shots[m1.shots.length - 1];
  const lastRes = last ? judgeShot(last.angle) : null;
  const settled = last && !flyingId;
  const hypLabel = (id) => m.hyps.find((h) => h.id === id)?.label;
  // After a miss, answering the "why?" question is enough: the next launch also saves the revision.
  const canLaunch = !!m1.hypothesis && !flyingId && (!m1.needsRevision || !!reason);

  function chooseFirstHypothesis(id) {
    patch('m1', (s) => ({ ...s, hypothesis: id, firstHypothesis: id }));
    setAngle(HYP_ANGLE[id]);
  }

  function chooseRevision(id) {
    setDraftHyp(id);
    setAngle(HYP_ANGLE[id]);
  }

  function launch() {
    setToast(null);
    if (m1.needsRevision) confirmRevision();
    const id = Date.now();
    const res = judgeShot(angle);
    patch('m1', (s) => ({
      ...s,
      shots: [...s.shots, { id, angle, speed: M1_SPEED, color: SHOT_COLORS[s.shots.length % SHOT_COLORS.length] }],
      // Before the first success, every miss leads to the hypothesis-revision step.
      needsRevision: !s.solved && !res.hit,
      solved: s.solved || res.hit,
    }));
    bump('experiments');
    setFlyingId(id);
    setHintLevel(0);
    setReason(null);
    setDraftHyp(null);
  }

  function nextHint() {
    setHintLevel((h) => h + 1);
    bump('hintsUsed');
  }

  function confirmRevision() {
    const chosen = draftHyp ?? m1.hypothesis;
    const changed = chosen !== m1.hypothesis;
    patch('m1', (s) => ({
      ...s,
      hypothesis: chosen,
      needsRevision: false,
      history: [...s.history, { from: s.hypothesis, to: chosen, afterAngle: last.angle }],
    }));
    if (changed) bump('revisions');
    setToast(changed ? m.revise.revisedToast : m.revise.keptToast);
  }

  const canvasShots = m1.shots.map((s) => ({ ...s, label: `${s.angle}°` }));
  const showMiss = settled && !lastRes.hit && m1.needsRevision;
  const showSuccess = settled && m1.solved;
  const hypOptions = m.hyps.map((h) => ({
    id: h.id,
    label: (
      <>
        <span className="chip mb-1 bg-teal-100 font-bold text-teal-900">🎯 {HYP_ANGLE[h.id]}°</span>
        <span className="block">{h.label}</span>
      </>
    ),
  }));
  const guideStep = !m1.hypothesis ? 0 : m1.solved && !flyingId ? 4 : m1.needsRevision && settled ? 2 : 1;

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold text-teal-900">{m.title}</h2>
          <p className="text-stone-600">{m.sub}</p>
        </div>
        <MissionGuide steps={m.guide} current={guideStep} />
      </header>

      {/* Step A: hypothesis */}
      <section className="card" aria-labelledby="m1-step-a">
        <h3 id="m1-step-a" className="card-title">
          {m.stepA}
        </h3>
        {m1.shots.length === 0 ? (
          <>
            <p className="mb-3 text-sm text-stone-600">{m.stepANote}</p>
            <ChoiceList options={hypOptions} value={m1.hypothesis} onSelect={chooseFirstHypothesis} columns={3} label={m.stepA} />
            {m1.hypothesis && <p className="animate-rise note-good mt-3">👉 {m.hypAngleNote}</p>}
          </>
        ) : (
          <p className="mt-2 rounded-xl bg-teal-50 p-3">
            <span className="font-semibold text-teal-900">{m.currentHyp}: </span>
            {hypLabel(m1.hypothesis)}
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Step B: experiment */}
        <div className="min-w-0 space-y-6">
        <section className="card space-y-4" aria-labelledby="m1-step-b">
          <h3 id="m1-step-b" className="card-title">
            {m.stepB}
          </h3>
          <ProjectileCanvas
            xMax={46}
            yMax={20}
            shots={canvasShots}
            flyingId={flyingId}
            onLanded={() => setFlyingId(null)}
            target={{ x: M1_TARGET, tol: M1_TOLERANCE }}
            cannonAngle={flyingId ? last.angle : angle}
          />
          <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
            <RangeSlider label={t.common.angle} value={angle} min={15} max={85} unit="°" onChange={setAngle} />
            <p className="chip justify-self-start bg-stone-100 text-stone-700">
              {t.common.speed}: {M1_SPEED} {u.mps} ({t.common.locked})
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-primary text-lg" onClick={launch} disabled={!canLaunch}>
              🚀 {flyingId ? t.common.flying : t.common.launch}
            </button>
            {!m1.hypothesis && <p className="text-sm text-stone-600">{m.needHyp}</p>}
            {m1.hypothesis && m1.needsRevision && !reason && !flyingId && <p className="text-sm text-stone-600">{m.needRevision}</p>}
          </div>
          {toast && <p className="animate-rise note-good">{toast}</p>}
          {settled && m1.solved && !lastRes.hit && <p className="note-think">{m.success.afterMiss(fmt(lastRes.short))}</p>}
        </section>

        {settled && (
          <PhysicsPanel
            angle={last.angle}
            speed={M1_SPEED}
            footer={<p className={m1.solved ? 'note-good' : 'note-warm'}>{m1.solved ? t.physics.m1Insight : t.physics.m1Locked}</p>}
          />
        )}
        </div>

        {/* Step C: support after the experiment */}
        <aside className="space-y-4" aria-live="polite">
          {showMiss && (
            <MissCard
              key={last.id}
              shot={last}
              res={lastRes}
              reason={reason}
              setReason={setReason}
              hintLevel={hintLevel}
              nextHint={nextHint}
            />
          )}
          {showMiss && (
            <section className="card animate-rise space-y-3 border-teal-200">
              <h3 className="card-title">{m.revise.title}</h3>
              {reason ? (
                <>
                  <p className="text-stone-700">{m.revise.prompt}</p>
                  <ChoiceList options={hypOptions} value={draftHyp ?? m1.hypothesis} onSelect={chooseRevision} label={m.revise.title} />
                  <p className="text-sm text-stone-600">
                    {t.common.angle}: <span className="font-bold text-teal-800">{angle}°</span>
                  </p>
                  <button type="button" className="btn-primary w-full" onClick={launch} disabled={!canLaunch}>
                    🚀 {(draftHyp ?? m1.hypothesis) !== m1.hypothesis ? m.revise.changeBtn : m.revise.keepBtn}
                  </button>
                </>
              ) : (
                <p className="text-sm text-stone-600">{m.revise.afterReason}</p>
              )}
            </section>
          )}
          {showSuccess && lastRes.hit && (
            <SuccessCard res={lastRes} angle={last.angle} discovered={m1.firstHypothesis !== 'h45' || m1.history.some((h) => h.from !== h.to)} />
          )}
          {m1.solved && !flyingId && <CheckQuestion value={m1.check} onSelect={(id) => patch('m1', { check: id })} />}
          {m1.solved && !flyingId && (
            <button type="button" className="btn-primary w-full" onClick={() => go('mission2')}>
              {m.next} →
            </button>
          )}
        </aside>
      </div>

      <ShotLog shots={m1.shots} flyingId={flyingId} />
    </div>
  );
}

function MissCard({ shot, res, reason, setReason, hintLevel, nextHint }) {
  const { t } = useLang();
  const mm = t.mission1.miss;
  const u = t.units;
  const kind = res.kind;
  const chosen = mm.reasons[kind].find((r) => r.id === reason);
  const stats = [
    { label: mm.statPeak, value: res.H, color: 'bg-amber-500' },
    { label: mm.statRange, value: res.R, color: 'bg-emerald-600' },
    { label: mm.statTarget, value: M1_TARGET, color: 'bg-stone-400' },
  ];

  return (
    <section className="card animate-rise space-y-4 border-sky-200 bg-sky-50/40">
      <div>
        <h3 className="card-title">{mm.title}</h3>
        <p className="mt-1 text-stone-700">{mm.calm}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-2 shadow-sm">
            <div className="flex h-16 items-end justify-center">
              <div className={`w-6 rounded-t ${s.color}`} style={{ height: `${(s.value / M1_TARGET) * 100}%` }} />
            </div>
            <p className="mt-1 text-lg font-bold tabular-nums">
              {fmt(s.value)} {u.m}
            </p>
            <p className="text-xs leading-tight text-stone-600">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 font-semibold text-sky-950">{mm.q[kind]}</p>
        <ChoiceList options={mm.reasons[kind]} value={reason} onSelect={setReason} label={mm.q[kind]} />
        {chosen && <p className={`animate-rise mt-3 ${chosen.good ? 'note-good' : 'note-think'}`}>{mm.reasonFb[chosen.id]}</p>}
      </div>

      <p className="note-warm">💡 {mm.suggest[kind]}</p>

      {hintLevel >= 1 && (
        <div className="animate-rise space-y-2 rounded-xl bg-white p-3">
          <p className="text-sm">{mm.hint1(fmt(res.vx), fmt(res.vy))}</p>
          <VelocitySplit vx={res.vx} vy={res.vy} total={shot.speed} />
        </div>
      )}
      {hintLevel >= 2 && <p className="animate-rise rounded-xl bg-white p-3 text-sm">{mm.hint2}</p>}
      {hintLevel < HINT_COUNT ? (
        <button type="button" className="btn-soft w-full" onClick={nextHint}>
          🔦 {mm.hintBtn} ({hintLevel + 1}/{HINT_COUNT})
        </button>
      ) : (
        <p className="text-sm text-stone-600">{mm.hintNone}</p>
      )}
    </section>
  );
}

function SuccessCard({ res, angle, discovered }) {
  const { t } = useLang();
  const s = t.mission1.success;
  return (
    <section className="card animate-rise space-y-2 border-emerald-200 bg-emerald-50/50">
      <h3 className="text-xl font-bold text-emerald-900">{s.title}</h3>
      <p>{s.body(angle, fmt(res.R))}</p>
      <p className="note-good">{discovered ? s.discovered : s.supported}</p>
      <p className="note-warm">{s.explore}</p>
    </section>
  );
}

function CheckQuestion({ value, onSelect }) {
  const { t } = useLang();
  const c = t.mission1.check;
  return (
    <section className="card animate-rise space-y-3">
      <h3 className="card-title">🧠 {c.title}</h3>
      <p>{c.q}</p>
      <ChoiceList options={c.opts} value={value} onSelect={onSelect} columns={4} label={c.q} />
      {value && <p className={`animate-rise ${value === '60' ? 'note-good' : 'note-think'}`}>{c.fb[value]}</p>}
    </section>
  );
}

function ShotLog({ shots, flyingId }) {
  const { t } = useLang();
  const m = t.mission1;
  const u = t.units;
  return (
    <section className="card" aria-labelledby="m1-log">
      <h3 id="m1-log" className="card-title mb-3">
        📒 {m.logTitle}
      </h3>
      {shots.length === 0 ? (
        <p className="text-stone-600">{m.logEmpty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="border-b border-stone-200 text-sm text-stone-600">
                {m.cols.map((c) => (
                  <th key={c} className="px-2 py-2 font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {shots.map((s, i) => {
                if (s.id === flyingId) return null;
                const r = judgeShot(s.angle);
                return (
                  <tr key={s.id} className="border-b border-stone-100 last:border-0">
                    <td className="px-2 py-2">
                      <span className="inline-block h-3 w-3 rounded-full" style={{ background: s.color }} /> {i + 1}
                    </td>
                    <td className="px-2 py-2 font-semibold">{s.angle}°</td>
                    <td className="px-2 py-2">
                      {fmt(r.H)} {u.m}
                    </td>
                    <td className="px-2 py-2">
                      {fmt(r.T, 2)} {u.s}
                    </td>
                    <td className="px-2 py-2 font-semibold">
                      {fmt(r.R)} {u.m}
                    </td>
                    <td className="px-2 py-2">
                      {r.hit ? <span className="chip bg-emerald-100 text-emerald-900">{m.hit}</span> : <span className="chip bg-sky-100 text-sky-900">{m.short(fmt(r.short))}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
