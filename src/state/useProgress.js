import { useCallback, useEffect, useState } from 'react';

const KEY = 'projectile-lab-23b2487-v1';

export const initialProgress = {
  screen: 'welcome',
  confidenceStart: null,
  confidenceEnd: null,
  warmup: null,
  experiments: 0,
  revisions: 0,
  hintsUsed: 0,
  sandbox: { launches: 0, tasks: [false, false, false] },
  m1: { firstHypothesis: null, hypothesis: null, history: [], shots: [], needsRevision: false, solved: false, check: null },
  m2: { prediction: null, locked: false, runs: [], explanation: '', coachCalls: 0, coach: null, transfer: null },
  practice: { answers: {}, shots: {} },
  learned: '',
};

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (!saved) return initialProgress;
    return {
      ...initialProgress,
      ...saved,
      sandbox: { ...initialProgress.sandbox, ...saved.sandbox },
      m1: { ...initialProgress.m1, ...saved.m1 },
      m2: { ...initialProgress.m2, ...saved.m2 },
      practice: { ...initialProgress.practice, ...saved.practice },
    };
  } catch {
    return initialProgress;
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch {
      /* storage unavailable: progress lives for this session only */
    }
  }, [progress]);

  // patch('m1', { solved: true }) merges objects; patch('m1', fn) receives the previous value.
  const patch = useCallback((key, value) => {
    setProgress((p) => {
      const prev = p[key];
      const next =
        typeof value === 'function'
          ? value(prev)
          : prev && typeof prev === 'object' && !Array.isArray(prev)
            ? { ...prev, ...value }
            : value;
      return { ...p, [key]: next };
    });
  }, []);

  const bump = useCallback((key, by = 1) => setProgress((p) => ({ ...p, [key]: (p[key] || 0) + by })), []);

  const reset = useCallback(() => setProgress(initialProgress), []);

  return { progress, patch, bump, reset };
}
