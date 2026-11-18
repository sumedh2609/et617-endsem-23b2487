// AI Inquiry Coach: Gemini or OpenAI when a key is configured, otherwise a
// deterministic rubric. Any API failure falls back to the rubric.

const env = import.meta.env;
const TIMEOUT_MS = 12000;

const KEYWORDS = {
  quadruple: ['four', 'quadrupl', '4 times', '4x', '4 पट', 'x4', '×4', 'चौपट', 'चार पट', 'चारपट', '४'],
  square: ['square', 'u²', 'u^2', 'squared', '2x2', '2 x 2', '2*2', '2 × 2', '2×2', '2²', 'वर्ग', 'दोन गुणिले दोन', '२×२'],
  time: [/\btime\b(?!s)/, 'longer in', 'in the air', 'in air', 'stays', 'stay', 'वेळ', 'हवेत', 'सेकंद', 'जास्त काळ'],
  forward: ['forward', 'horizontal', 'vx', 'v_x', 'sideways', 'पुढचा', 'पुढे', 'आडवा', 'क्षैतिज'],
  double: ['double', 'twice', '2 times', 'two times', 'दुप्पट', 'दोन पट', 'दोनपट'],
  unsure: ["don't know", 'dont know', 'not sure', 'no idea', 'माहीत नाही', 'माहित नाही', 'कळत नाही', 'समजत नाही'],
};

const has = (text, list) => list.some((k) => (k instanceof RegExp ? k.test(text) : text.includes(k)));

export function analyzeExplanation(raw) {
  const text = (raw || '').toLowerCase().trim();
  const concepts = {
    quadruple: has(text, KEYWORDS.quadruple),
    square: has(text, KEYWORDS.square),
    time: has(text, KEYWORDS.time),
    forward: has(text, KEYWORDS.forward),
  };
  const saysDouble = has(text, KEYWORDS.double);

  let level;
  if (text.length < 6) level = 'empty';
  else if (has(text, KEYWORDS.unsure) && !concepts.time && !concepts.forward) level = 'unsure';
  else if (concepts.time && concepts.forward) level = 'strong';
  else if (concepts.square) level = 'square';
  else if (concepts.time) level = 'partialTime';
  else if (concepts.forward) level = 'partialForward';
  else if (concepts.quadruple) level = 'whatOnly';
  else if (saysDouble) level = 'm2';
  else level = 'start';

  return { concepts, level, misconception: level === 'm2' ? 'M2' : null };
}

function systemPrompt(lang) {
  const language = lang === 'mr' ? 'simple, warm, conversational Marathi (Devanagari script)' : 'simple, warm English';
  return [
    'You are a gentle inquiry coach in a Class 11 physics virtual lab.',
    'The learner is repeating Class 11 after failing once, is anxious, and has low self-efficacy. Their first language is Marathi.',
    'Experiment data (launch angle 45°, g = 10 m/s², no air resistance):',
    'u = 10 m/s: forward speed vx = 7.07 m/s, time in air = 1.41 s, range = 10 m.',
    'u = 20 m/s: forward speed vx = 14.14 m/s, time in air = 2.83 s, range = 40 m.',
    'The learner explains in one sentence why the range became 4 times bigger when speed doubled.',
    'Rules: never say "wrong" or "incorrect"; do NOT state the full explanation yourself;',
    'first praise one specific true idea in their sentence; then ask exactly ONE guiding question that points to the data table',
    '(forward speed doubled AND time in air doubled, so 2 × 2 = 4). If they say the range "doubles", gently point to the 40 m evidence.',
    'If their explanation is already complete, congratulate them and ask a transfer question about tripling the speed.',
    `Reply only in ${language}, at most 70 words, plain text, no markdown, no formulas beyond 2 × 2.`,
  ].join(' ');
}

function userPrompt(text, prediction) {
  return `Learner's earlier prediction for u = 20 m/s: ${prediction || 'none'}.\nLearner's explanation: """${text}"""`;
}

async function fetchJson(url, options) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function callGemini(key, text, lang, prediction) {
  const model = env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
  const data = await fetchJson(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt(lang) }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt(text, prediction) }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
      }),
    },
  );
  const out = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();
  if (!out) throw new Error('Empty Gemini response');
  return out;
}

async function callOpenAI(key, text, lang, prediction) {
  const data = await fetchJson('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 300,
      messages: [
        { role: 'system', content: systemPrompt(lang) },
        { role: 'user', content: userPrompt(text, prediction) },
      ],
    }),
  });
  const out = data?.choices?.[0]?.message?.content?.trim();
  if (!out) throw new Error('Empty OpenAI response');
  return out;
}

export const coachMode = () =>
  env.VITE_GEMINI_API_KEY ? 'gemini' : env.VITE_OPENAI_API_KEY ? 'openai' : 'offline';

/**
 * Returns { source: 'gemini' | 'openai' | 'offline' | 'fallback', text?: string, analysis }.
 * `analysis` (offline rubric) is always present so the concept checklist can be shown.
 */
export async function getCoachFeedback({ text, lang, prediction }) {
  const analysis = analyzeExplanation(text);
  const mode = coachMode();
  if (mode === 'offline' || analysis.level === 'empty') return { source: 'offline', analysis };
  try {
    const reply =
      mode === 'gemini'
        ? await callGemini(env.VITE_GEMINI_API_KEY, text, lang, prediction)
        : await callOpenAI(env.VITE_OPENAI_API_KEY, text, lang, prediction);
    return { source: mode, text: reply, analysis };
  } catch {
    return { source: 'fallback', analysis };
  }
}
