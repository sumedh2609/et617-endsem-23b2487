import { useEffect, useId, useRef, useState } from 'react';
import { flight, positionAt, samplePath, fmt } from '../lib/physics';
import { useLang } from '../context/LanguageContext';

const W = 800;
const PAD = { l: 48, r: 24, t: 28, b: 44 };
const ARROW_PX_PER_MPS = 5;
const VX_COLOR = '#059669';
const VY_COLOR = '#d97706';

/**
 * Uniform-scale SVG launcher. `shots` = [{ id, angle, speed, color, label }].
 * The shot whose id equals `flyingId` is animated; `onLanded(id)` fires when it lands.
 * All other shots are drawn as faded ghost trails with landing flags.
 */
export default function ProjectileCanvas({
  xMax,
  yMax,
  shots = [],
  flyingId = null,
  onLanded,
  target = null,
  cannonAngle = 45,
  preview = null,
  vectors = null,
}) {
  const { t } = useLang();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const unit = t.units.m;

  const plotW = W - PAD.l - PAD.r;
  const s = plotW / xMax;
  const plotH = yMax * s;
  const H = Math.round(plotH + PAD.t + PAD.b);
  const X = (m) => PAD.l + m * s;
  const Y = (m) => PAD.t + plotH - m * s;
  const pts = (list) => list.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');

  const [progress, setProgress] = useState(1);
  const landedRef = useRef(onLanded);
  landedRef.current = onLanded;
  const flyingShot = shots.find((sh) => sh.id === flyingId) || null;

  useEffect(() => {
    if (!flyingShot) return undefined;
    const { T } = flight(flyingShot.angle, flyingShot.speed);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = reduce ? 0 : Math.max(900, (T * 1000) / 1.3);
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = duration ? Math.min(1, (now - start) / duration) : 1;
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else landedRef.current?.(flyingShot.id);
    };
    setProgress(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // Restart only when a new shot is launched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyingId]);

  const xStep = xMax <= 50 ? 5 : 10;
  const yStep = yMax <= 25 ? 5 : 10;
  const xTicks = Array.from({ length: Math.floor(xMax / xStep) + 1 }, (_, i) => i * xStep);
  const yTicks = Array.from({ length: Math.floor(yMax / yStep) }, (_, i) => (i + 1) * yStep);

  const ghosts = shots.filter((sh) => sh.id !== flyingId);
  const latest = ghosts[ghosts.length - 1];
  const latestF = latest ? flight(latest.angle, latest.speed) : null;

  const ox = X(0);
  const oy = Y(0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full select-none rounded-xl" role="img" aria-label={t.canvas.aria}>
      <defs>
        <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
        {[
          ['vx', VX_COLOR],
          ['vy', VY_COLOR],
          ['v', '#334155'],
        ].map(([name, color]) => (
          <marker key={name} id={`ah${uid}${name}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={color} />
          </marker>
        ))}
      </defs>

      <rect x="0" y="0" width={W} height={H} fill={`url(#sky${uid})`} />

      {yTicks.map((m) => (
        <g key={`y${m}`}>
          <line x1={ox} x2={X(xMax)} y1={Y(m)} y2={Y(m)} stroke="#cbd5e1" strokeDasharray="2 6" />
          <text x={ox - 8} y={Y(m) + 5} textAnchor="end" fontSize="14" fill="#64748b">
            {m}
          </text>
        </g>
      ))}

      <rect x="0" y={oy} width={W} height={H - oy} fill="#ecfccb" />
      <line x1="0" x2={W} y1={oy} y2={oy} stroke="#65a30d" strokeWidth="3" />
      {xTicks.map((m) => (
        <g key={`x${m}`}>
          <line x1={X(m)} x2={X(m)} y1={oy} y2={oy + 7} stroke="#4d7c0f" strokeWidth="2" />
          <text x={X(m)} y={oy + 26} textAnchor="middle" fontSize="15" fill="#3f6212" fontWeight="600">
            {m === xTicks[xTicks.length - 1] ? `${m} ${unit}` : m}
          </text>
        </g>
      ))}

      {target && (
        <g>
          <rect x={X(target.x - target.tol)} y={PAD.t} width={Math.max(4, 2 * target.tol * s)} height={oy - PAD.t} fill="#fde68a" opacity="0.35" />
          <polygon
            points={`${X(target.x) - 18},${oy - 22} ${X(target.x) + 18},${oy - 22} ${X(target.x) + 12},${oy} ${X(target.x) - 12},${oy}`}
            fill="#b45309"
            stroke="#78350f"
            strokeWidth="2"
          />
          <line x1={X(target.x) - 16} x2={X(target.x) + 16} y1={oy - 15} y2={oy - 15} stroke="#fcd34d" strokeWidth="2" />
          <line x1={X(target.x) - 14} x2={X(target.x) + 14} y1={oy - 8} y2={oy - 8} stroke="#fcd34d" strokeWidth="2" />
          <text x={X(target.x)} y={oy - 30} textAnchor="middle" fontSize="15" fontWeight="700" fill="#78350f">
            {`${t.canvas.basket} ${target.x} ${unit}`}
          </text>
        </g>
      )}

      {preview && !flyingShot && (
        <polyline points={pts(samplePath(preview.angle, preview.speed))} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 7" />
      )}

      {ghosts.map((sh, i) => {
        const f = flight(sh.angle, sh.speed);
        const isLatest = sh === latest;
        const fx = X(f.R);
        const lift = (i % 3) * 16;
        return (
          <g key={sh.id} opacity={isLatest ? 1 : 0.45}>
            <polyline points={pts(samplePath(sh.angle, sh.speed))} fill="none" stroke={sh.color} strokeWidth={isLatest ? 3.5 : 2.5} strokeDasharray={isLatest ? undefined : '6 5'} />
            <line x1={fx} x2={fx} y1={oy} y2={oy - 34 - lift} stroke="#334155" strokeWidth="2" />
            <polygon points={`${fx},${oy - 34 - lift} ${fx + 18},${oy - 28 - lift} ${fx},${oy - 22 - lift}`} fill={sh.color} />
            <text x={fx + 4} y={oy - 40 - lift} fontSize="14" fontWeight="700" fill={sh.color}>
              {sh.label}
            </text>
          </g>
        );
      })}

      {latestF && !flyingShot && (
        <g className="animate-rise">
          <line x1={X(latestF.R / 2)} x2={X(latestF.R / 2)} y1={Y(latestF.H)} y2={oy} stroke={latest.color} strokeDasharray="3 5" strokeWidth="2" />
          <circle cx={X(latestF.R / 2)} cy={Y(latestF.H)} r="5" fill={latest.color} />
          <text x={X(latestF.R / 2) + 9} y={Math.max(PAD.t - 6, Y(latestF.H)) + 18} fontSize="15" fontWeight="600" fill="#1e293b">
            {`${t.canvas.peak} ${fmt(latestF.H)} ${unit}`}
          </text>
          <text x={X(latestF.R)} y={oy + 40} textAnchor="middle" fontSize="15" fontWeight="700" fill={latest.color}>
            {`${fmt(latestF.R)} ${unit}`}
          </text>
        </g>
      )}

      {flyingShot && <FlyingBall shot={flyingShot} progress={progress} X={X} Y={Y} pts={pts} />}

      <g transform={`translate(${ox} ${oy}) rotate(${-cannonAngle})`}>
        <rect x="-4" y="-8" width="44" height="16" rx="5" fill="#334155" />
        <rect x="34" y="-9" width="8" height="18" rx="2" fill="#1e293b" />
      </g>
      <circle cx={ox} cy={oy} r="12" fill="#475569" stroke="#1e293b" strokeWidth="2" />

      {vectors && <VelocityArrows vectors={vectors} ox={ox} oy={oy} uid={uid} />}
    </svg>
  );
}

function FlyingBall({ shot, progress, X, Y, pts }) {
  const { T } = flight(shot.angle, shot.speed);
  const pos = positionAt(shot.angle, shot.speed, T * progress);
  return (
    <g>
      <polyline points={pts(samplePath(shot.angle, shot.speed, progress))} fill="none" stroke={shot.color} strokeWidth="3.5" />
      <circle cx={X(pos.x)} cy={Y(pos.y)} r="9" fill="#ffffff" stroke={shot.color} strokeWidth="3" />
    </g>
  );
}

function VelocityArrows({ vectors, ox, oy, uid }) {
  const { vx, vy } = vectors;
  const ex = ox + vx * ARROW_PX_PER_MPS;
  const ey = oy - vy * ARROW_PX_PER_MPS;
  return (
    <g>
      <line x1={ex} x2={ex} y1={oy} y2={ey} stroke="#94a3b8" strokeDasharray="3 4" />
      <line x1={ox} x2={ex} y1={ey} y2={ey} stroke="#94a3b8" strokeDasharray="3 4" />
      <line x1={ox} y1={oy - 2} x2={ex} y2={oy - 2} stroke={VX_COLOR} strokeWidth="5" markerEnd={`url(#ah${uid}vx)`} />
      <line x1={ox} y1={oy} x2={ox} y2={ey} stroke={VY_COLOR} strokeWidth="5" markerEnd={`url(#ah${uid}vy)`} />
      <line x1={ox} y1={oy} x2={ex} y2={ey} stroke="#334155" strokeWidth="3" markerEnd={`url(#ah${uid}v)`} />
      <text x={(ox + ex) / 2} y={oy - 10} textAnchor="middle" fontSize="15" fontWeight="700" fill={VX_COLOR}>
        v<tspan baselineShift="sub" fontSize="11">x</tspan> {fmt(vx)}
      </text>
      <text x={ox + 10} y={(oy + ey) / 2} fontSize="15" fontWeight="700" fill={VY_COLOR}>
        v<tspan baselineShift="sub" fontSize="11">y</tspan> {fmt(vy)}
      </text>
    </g>
  );
}
