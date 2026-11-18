// Practice examples (text lives in translations.practice.items[id]).
// predict: choose the range for a given angle and speed; the ball launches to check.
// target:  speed is fixed; find an angle that lands the ball at `target` metres.
export const PRACTICE = [
  { id: 'p1', type: 'predict', angle: 30, speed: 20, options: [20, 34.6, 40], answer: 1 },
  { id: 'p2', type: 'predict', angle: 60, speed: 20, options: [20, 34.6, 45], answer: 1 },
  { id: 'p3', type: 'target', speed: 20, target: 20 },
  { id: 'p4', type: 'predict', angle: 45, speed: 15, options: [15, 22.5, 30], answer: 1 },
  { id: 'p5', type: 'predict', angle: 60, speed: 30, options: [26, 52, 77.9], answer: 2 },
  { id: 'p6', type: 'target', speed: 25, target: 50 },
];

export const PRACTICE_TOLERANCE = 0.8;
