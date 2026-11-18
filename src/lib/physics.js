// Ideal projectile kinematics with g = 10 m/s² and no air resistance.
export const G = 10;

const toRad = (deg) => (deg * Math.PI) / 180;

export function flight(angleDeg, speed) {
  const th = toRad(angleDeg);
  const vx = speed * Math.cos(th);
  const vy = speed * Math.sin(th);
  const T = (2 * vy) / G;
  return { vx, vy, T, R: vx * T, H: (vy * vy) / (2 * G) };
}

export function positionAt(angleDeg, speed, t) {
  const { vx, vy } = flight(angleDeg, speed);
  return { x: vx * t, y: Math.max(0, vy * t - 0.5 * G * t * t) };
}

export function samplePath(angleDeg, speed, fraction = 1, steps = 60) {
  const { T } = flight(angleDeg, speed);
  const end = T * fraction;
  const n = Math.max(2, Math.round(steps * fraction));
  return Array.from({ length: n + 1 }, (_, i) => positionAt(angleDeg, speed, (end * i) / n));
}

// Rounds for display and drops a trailing ".0".
export const fmt = (n, digits = 1) => String(Number(n.toFixed(digits)));

// Mission 1: speed is fixed, basket at 40 m.
export const M1_SPEED = 20;
export const M1_TARGET = 40;
export const M1_TOLERANCE = 0.6;

export function judgeShot(angleDeg, speed = M1_SPEED, target = M1_TARGET, tol = M1_TOLERANCE) {
  const f = flight(angleDeg, speed);
  const hit = Math.abs(f.R - target) <= tol;
  let kind = 'hit';
  if (!hit) kind = angleDeg > 55 ? 'steep' : angleDeg < 35 ? 'flat' : 'near';
  return { ...f, hit, kind, short: target - f.R };
}

export const SHOT_COLORS = ['#0f766e', '#6366f1', '#d97706', '#0284c7', '#a21caf', '#65a30d', '#475569'];
