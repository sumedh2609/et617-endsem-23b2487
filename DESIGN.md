# प्रक्षेपण प्रयोगशाळा / Projectile Inquiry Lab — Design Document

**Identity Token: 23B2487 | P5-T10-L5-C2**

| Card part | Meaning in this design |
|---|---|
| **P5** | Inquiry-based virtual laboratory: learners manipulate variables, form hypotheses, run experiments, interpret results and revise hypotheses. |
| **T10** | Projectile motion: how launch angle and launch speed affect horizontal range (Class 11 Physics). |
| **L5** | A learner repeating Class 11 Physics after failing it once, with high anxiety and low self-efficacy. |
| **C2** | The learner's own language: every learner-facing string defaults to simple Marathi (Devanagari), with a `मराठी / English` toggle in the top bar. |

**P5 design challenge:** How does the system support learning from an unsuccessful experiment without simply revealing the correct answer? → See [§4](#4-p5-design-challenge-one-unsuccessful-experiment-and-the-support-that-follows) for a step-by-step walkthrough of one failed experiment (75°) and the support that follows it.

---

## D1. Educational problem and learning outcomes

### The problem
Students meet projectile motion as a block of formulas (`R = u² sin 2θ / g`, `H = u² sin² θ / 2g`, `T = 2u sin θ / g`) and are asked to plug in numbers. Learners who failed the course once often:

- memorise `45°` as a fact without knowing *why* it works, so the fact disappears under exam stress;
- reason from everyday intuition ("higher = farther", "twice as fast = twice as far"), and nobody tests that intuition against evidence;
- treat a wrong answer as proof that they are "bad at physics" rather than as information.

An inquiry lab lets the learner **test their own intuition**, see where it breaks, and rebuild the idea from evidence. The hardest part of the design is the moment an experiment fails: that is where an anxious learner either gives up or learns the most.

All physics uses **g = 10 m/s²** and no air resistance, so the numbers stay friendly (u = 20 m/s at 45° → R = 40 m exactly).

### Measurable learning outcomes

| # | Verb | Outcome | How it is measured in the app |
|---|---|---|---|
| **LO1** | **Predict** | Before launching, the learner commits to a testable hypothesis about which launch angle (at fixed speed) gives the greatest range, and a numeric prediction of the range when speed is doubled. | Hypothesis selection is required before the first launch in Mission 1 (Task 3). Numeric prediction MCQ in Mission 2 (Task 5). The first hypothesis, every revision, and the prediction are stored. |
| **LO2** | **Compare** | The learner compares at least two experimental runs (peak height, time in air, range) and identifies which variable change moved the ball closer to the target, or how many times farther it went. | Experiment log table and ghost trails (Task 3); reasoning MCQ after a failed shot (Task 3C); complementary-angle check (Task 4); 10 m vs 40 m comparison bars (Task 6). Success = selects the evidence-based reason / correct complementary angle within two attempts. |
| **LO3** | **Explain** | The learner writes a one-sentence causal explanation of (a) why a very steep angle travels less far even though it goes higher, and (b) why doubling speed makes the range four times larger (forward speed ×2 **and** time in air ×2). | Reasoning MCQ in the diagnostic card (Task 3C) for (a); free-text explanation scored by the AI Inquiry Coach / offline rubric (Task 7) for (b), with concepts *time*, *forward speed*, *×4 / square*. Success = explanation hits both causal factors, then transfer question (u = 30 m/s → 90 m) answered correctly (Task 8). |

---

## D2. Learner persona

### Aarav Deshmukh (L5)

| | |
|---|---|
| **Age / class** | 17, repeating Class 11 (Science) after failing Physics last year |
| **Place** | Grew up in Nanded; now in Pune for coaching classes and staying with an uncle |
| **Language** | Studied in Marathi medium up to Class 10. Science is now taught in English and he translates every sentence in his head. He reads Marathi comfortably; English physics vocabulary ("projectile", "horizontal component") slows him down and increases anxiety. |
| **Devices & time** | Shared family laptop in the evening (8–10 pm); his own Android phone otherwise. Studies alone, often tired after coaching. |
| **Emotional state** | High physics anxiety, low self-efficacy ("I'm just not a physics person"). Freezes when a screen is full of formulas. A red "WRONG" banner makes him close the tab. He avoids asking questions in class so he doesn't look stupid in front of peers who passed. |
| **Strengths** | Plays cricket and gully football, so he has a strong *physical* intuition for throwing and kicking. He likes games and anything he can try for himself. Patient once he feels safe. |
| **Goal** | Pass Class 11 Physics this time, and stop feeling scared of numericals. |
| **What he needs from the lab** | Marathi first; no marks or penalties; small steps; visible progress; mistakes treated as clues; equations available but hidden until he asks for them. |

### Target misconceptions

**M1: "Steeper is farther."**
Aarav believes a steeper launch angle (70°–75°) always gives the maximum horizontal range, because the ball goes higher and stays in the air longer. He ignores that the forward (horizontal) part of the velocity, `u cos θ`, shrinks as θ grows.
*Evidence in the app:* chooses hypothesis "75° will go farthest", or warm-up option "75°", or launches above 55° first.
*Why it is plausible:* time in air really does increase with angle (T ∝ sin θ). The idea is half right: it attends to time and forgets forward speed.

**M2: "Twice the speed, twice the distance."**
Aarav believes that doubling the launch speed (u → 2u) doubles the range (R → 2R), not quadruples it (R ∝ u²).
*Evidence in the app:* predicts "20 m" in Mission 2, or writes "doubles / दुप्पट" in the explanation without mentioning time or ×4.
*Why it is plausible:* everyday proportional reasoning (twice the money, twice the sweets). He misses that speed acts **twice**: it doubles the forward speed *and* doubles the time in air.

---

## D3. Learning activity plan

**Inquiry cycle used throughout:** अंदाज करा (Predict) → प्रयोग करा (Test) → निरीक्षण करा (Observe) → सुधारणा करा (Revise).

**Formats used:** (F1) interactive simulation experiments, (F2) hypothesis selection & revision, (F3) diagnostic check MCQs, (F4) free-text explanation with AI / rule-based coaching, (F5) self-rating reflection.

| Task | Screen | Format | What the learner does | Model answer |
|---|---|---|---|---|
| **T1** Warm-up check-in | 1 Welcome | F3 + F5 | Rates how they feel about physics today (5 emoji scale). Answers: "Riya kicks a football with the same force at 75° and at 45°. Which goes farther forward?" | 45°. *Not revealed* here; the answer is logged and tested in Mission 1. |
| **T2** Concept sandbox | 2 Sandbox | F1 | Drags angle (15°–85°) and speed (10–30 m/s); watches live vx / vy arrows. Discovery checklist: make vy > vx, make vx > vy, launch once. Optional hidden "math corner". | Steeper angle → vy grows, vx shrinks; more speed → both grow. |
| **T3** Target challenge (Mission 1) | 3 Mission 1 | F2 + F1 + F3 | **A.** Must pick a hypothesis before launching. **B.** Sets angle with u = 20 m/s fixed and launches at a basket at 40 m (ghost trails, distance markers, peak marker, log table). **C.** After a miss: diagnostic card → reasoning MCQ → optional graded hints → must revise or consciously keep the hypothesis before the next launch. | 45° (any angle 41°–49° lands in the basket; 45° gives exactly 40 m). Reason: a steep angle spends most of the speed going up, leaving little forward speed. |
| **T4** Complementary-angle check | 3 Mission 1 (after success) | F3 + F1 | "30° lands at 34.6 m. Which other angle lands at about the same place?" Learner can verify by launching. | 60° (sin 60° = sin 120°: one angle favours forward speed, the other favours time in air). |
| **T5** Speed prediction (Mission 2) | 4 Mission 2 | F3 | At 45°, u = 10 m/s lands at 10 m. Predict the range at u = 20 m/s; the prediction is locked before testing. | 40 m (4×). |
| **T6** Speed experiment & comparison | 4 Mission 2 | F1 | Launches u = 10 and u = 20; sees comparison bars (prediction vs 10 m vs 40 m, split into 10 m blocks) and a data table (vx, time in air, range). | vx: 7.1 → 14.1 (×2), time: 1.41 s → 2.83 s (×2), range: 10 → 40 (×4). |
| **T7** Explain + AI Inquiry Coach | 4 Mission 2 | F4 | Writes a one-sentence explanation (Marathi or English) of why range quadrupled; asks the coach; revises and asks again. | "Doubling the speed doubles the forward speed **and** doubles the time in the air, so the range becomes 2 × 2 = 4 times." |
| **T8** Transfer challenge | 4 Mission 2 | F3 + F1 | "At 45°, speed tripled to 30 m/s: range?" Then verifies with a launch. | 90 m (3² = 9 × 10 m). |
| **T9** Reflection | 5 Reflection | F5 | Sees experiments run, hypotheses revised, hints used, ideas that changed; re-rates confidence; optionally writes one thing learned. | Free (self-efficacy tracking: start vs end rating). |

### Targeted feedback (exact app text)

The app never shows red, never says "wrong", and never gives the final answer before the learner has evidence. Feedback first credits the reasoning, then points the learner back to evidence.

#### T1 — Warm-up (no answer revealed)
| Response | मराठी | English |
|---|---|---|
| 45° (correct) | छान अंदाज नोंदवला! उंची आणि पुढे जाणं यांचा विचार केलात. मोहीम १ मध्ये हा अंदाज प्रयोगाने तपासू. | Nice, your guess is saved! You thought about both height and moving forward. We'll test it with a real experiment in Mission 1. |
| 75° (**M1**) | छान, तुमचा अंदाज नोंदवला! उंच जाणारा चेंडू जास्त वेळ हवेत राहतो — हा चांगला मुद्दा आहे. मोहीम १ मध्ये हाच अंदाज आपण प्रयोगाने तपासू. | Nice, your guess is saved! A ball that goes higher does stay in the air longer, which is a good point. We'll test exactly this idea in Mission 1. |
| Same / Not sure | "माहीत नाही" म्हणणं हे शास्त्रज्ञाचं पहिलं पाऊल आहे! आपण प्रयोगातून शोधू. | Saying "I don't know" is a scientist's first step! We'll find out by experimenting. |

#### T3 — Mission 1 hypotheses and diagnostic card
Hypotheses: **h75** "75° will go farthest because it goes highest" (M1) · **h45** "45° balances height and forward speed" (correct) · **h30** "30° will go farthest because it moves forward fastest" (mirror error).

| Situation | मराठी | English |
|---|---|---|
| Miss, steep angle (> 55°, **M1**) | तुमचा चेंडू खूप उंच गेला, पण पुढे कमी अंतर कापले. काय झाले असेल? | Your ball went very high, yet covered less forward distance. Why? |
| Reason: "most speed went upward" (correct) | अगदी नेमकं निरीक्षण! उंच कोनात पुढचा वेग (vx) लहान होतो. चेंडू हवेत जास्त वेळ राहिला, तरी पुढे हळूहळू सरकला. | Spot on! At a steep angle the forward speed (vx) becomes small. The ball stayed in the air longer but crept forward slowly. |
| Reason: "ball was too heavy" | चांगला विचार! पण प्रत्येक प्रयोगात चेंडू तोच आहे. मग फरक कशामुळे पडला? खालचे वेगाचे बाण पाहा. | Good thinking! But it's the same ball every time. So what made the difference? Look at the speed arrows below. |
| Reason: "air pushed it back" | छान प्रश्न! पण या प्रयोगशाळेत हवेचा अडथळा नाही. मग चेंडू पुढे कमी का गेला? | Good question! But there is no air resistance in this lab. So why did the ball go less far forward? |
| Miss, shallow angle (< 35°) | तुमचा चेंडू वेगाने पुढे गेला, पण लवकर जमिनीवर आला. काय झाले असेल? | Your ball moved forward fast, but landed quickly. What happened? |
| Miss, near (35°–55°) | चेंडू टोपलीच्या खूप जवळ पोहोचला! आता कोन थोडासा बदलायचा की खूप? | So close to the basket! Should you change the angle a little or a lot? |
| Hit, hypothesis h45 | तुमचा अंदाज पुराव्याने खरा ठरला. 🎉 | Your hypothesis was supported by evidence. 🎉 |
| Hit after revising from h75/h30 | तुमच्या प्रयोगांनी पहिल्या अंदाजापेक्षा चांगला कोन शोधला — हाच खरा शोध आहे! | Your experiments found a better angle than your first hypothesis, and that is real discovery! |

#### T4 — Complementary angle check
| Response | मराठी | English |
|---|---|---|
| 60° (correct) | बरोबर! 30° पुढच्या वेगाला जास्त देतो, 60° हवेतल्या वेळेला जास्त देतो — शेवटी अंतर सारखंच. 60° वापरून खात्री करा! | Yes! 30° gives more to forward speed, 60° gives more to time in the air, and the range ends up the same. Launch at 60° to check! |
| 75° (**M1** residue) | नोंदवहीत 75° चं अंतर पाहा, मग 30° च्या अंतराशी तुलना करा. उंच कोनाला किती अंतर मिळालं होतं? | Check the 75° range in your log and compare it with 30°. How far did the steep angle go? |
| 15° | 15° ला चेंडू खूप लवकर खाली येतो. प्रयोग करून पाहा, मग पुन्हा विचार करा. | At 15° the ball comes down very quickly. Try it, then think again. |

#### T5/T6 — Speed prediction and comparison
| Prediction | मराठी | English |
|---|---|---|
| 40 m (correct) | तुमचा अंदाज पुराव्याशी जुळला! आता खरं आव्हान: असं का होतं, ते तुमच्या शब्दांत सांगा. | Your prediction matched the evidence! Now the real challenge: explain *why* in your own words. |
| 20 m (**M2**) | तुमचा अंदाज 20 मी होता — बहुतेक जण असंच म्हणतात, कारण "दुप्पट वेग = दुप्पट अंतर" अगदी स्वाभाविक वाटतं. पण पुरावा पाहा: चेंडू 40 मी गेला — 10 मी चे चार तुकडे! दुप्पट नाही, चौपट. असं का झालं असेल? खालची सारणी पाहा. | You predicted 20 m. Most people do, because "double speed = double distance" feels natural. But look at the evidence: the ball went 40 m, four blocks of 10 m! Not double, four times. Why? Look at the table below. |
| 10 m | कोन तोच ठेवला हे बरोबर, पण वेग बदलला ना? पुरावा पाहा: 40 मी! वेगाचा परिणाम कुठे-कुठे झाला, ते सारणीत शोधा. | You're right that the angle stayed the same, but the speed changed! The evidence says 40 m. Find in the table where the speed made a difference. |
| 30 m | तुम्ही ओळखलंत की अंतर दुप्पटपेक्षा जास्त वाढेल — छान! पुरावा: 40 मी, म्हणजे चार पट. सारणीत कोणत्या दोन गोष्टी बदलल्या ते पाहा. | You sensed the range would grow by more than double. Nice! The evidence: 40 m, four times. Look at which two things changed in the table. |

#### T7 — Explanation coaching (offline rubric; LLM follows the same rules)
| Detected in explanation | मराठी (praise → next question) | English (praise → next question) |
|---|---|---|
| time **and** forward speed (correct) | उत्कृष्ट विचार! पुढचा वेग दुप्पट आणि हवेतला वेळही दुप्पट — 2 × 2 = 4. → वेग तिप्पट केला तर अंतर किती पट होईल? | Excellent reasoning! Forward speed doubled AND time in the air doubled: 2 × 2 = 4. → If the speed were three times bigger, how many times farther would it go? |
| "doubles" only (**M2**) | वेग आणि अंतर यांचा संबंध जोडलात — योग्य जोडी! → तुम्ही "दुप्पट" लिहिलं, पण चेंडू 40 मी गेला. सारणीत दोन वेगवेगळ्या गोष्टी दुप्पट झाल्या आहेत. दोन्ही शोधू शकाल? | You connected speed and range, the right pair to think about. → You wrote "double", but the ball went 40 m. In the table, two different things doubled. Can you find both? |
| only time | छान निरीक्षण — वेगवान चेंडू हवेत जास्त वेळ (2 पट) राहतो. → फक्त वेळच बदलला का? "पुढचा वेग" स्तंभही पाहा. | Great observation: the faster ball stays in the air longer (2×). → Is time the only thing that changed? Check the forward-speed column too. |
| only forward speed | छान निरीक्षण — पुढचा वेग दुप्पट झाला. → चेंडू हवेत किती वेळ राहिला, तेही पाहा. दोन्ही एकत्र केलं तर? | Great observation: the forward speed doubled. → Also check how long the ball stayed in the air. What happens when you combine both? |
| only "4 times" | हो! अंतर चौपट झालं हे तुम्ही ओळखलंत. → आता "का?" — पुढचा वेग आणि हवेतला वेळ, प्रत्येकाचं काय झालं? | Yes! You spotted that the range became four times bigger. → Now the "why": what happened to forward speed and to time in the air? |

#### T8 — Transfer (u = 30 m/s)
| Response | मराठी | English |
|---|---|---|
| 90 m (correct) | वा! 3 × 3 = 9, म्हणून 10 मी × 9 = 90 मी. तुम्ही नियम स्वतः वापरलात! | Wow! 3 × 3 = 9, so 10 m × 9 = 90 m. You used the rule yourself! |
| 30 m (**M2**) | हा "तिप्पट वेग = तिप्पट अंतर" असा विचार आहे. मागच्या प्रयोगात दुप्पट वेगाने किती पट अंतर मिळालं होतं? तोच नमुना इथे लावा. | That's "triple speed = triple distance" thinking. Last time, double speed gave how many times the distance? Apply the same pattern here. |
| 60 m | जवळ आलात! वेग तिप्पट झाला तर पुढचा वेग किती पट आणि हवेतला वेळ किती पट? दोघांचा गुणाकार करा. | Getting close! If speed triples, how many times does the forward speed grow, and the time in the air? Multiply them. |

---

## 4. P5 design challenge: one unsuccessful experiment and the support that follows

**Scenario:** Aarav picks hypothesis **h75**, "75° will go farthest because it goes highest" (M1). The angle slider starts at 70° to invite this. He sets 75° and presses **प्रयोग करा**.

1. **The experiment runs honestly.** The ball rises to **18.7 m**, stays in the air **3.9 s**, and lands at **20.0 m**, 20 m short of the basket. The trail stays on the canvas as a coloured ghost with a flag labelled "75°". A dashed peak marker shows the height.
2. **No verdict banner.** There is no red, no ✗, no "wrong" and no "the answer is 45°". A calm card titled "हा प्रयोग आपल्याला काहीतरी सांगतोय 🔍" (This experiment is telling us something) reassures him: *the ball missed, and that is fine; now let's learn from this evidence.*
3. **Evidence made visible.** Three side-by-side numbers, *peak height 18.7 m · distance 20.0 m · basket 40 m*, with mini bars, so the mismatch between "high" and "far" is visible at a glance.
4. **A question instead of an answer.** "तुमचा चेंडू खूप उंच गेला, पण पुढे कमी अंतर कापले. काय झाले असेल?" He chooses a reason from three plausible options. Each option gets feedback that credits the thinking and points back to the evidence (see the T3 table). The other two options rule out mass and air, so the only remaining variable is how the speed is split.
5. **Graded hints, given only on request** (counted as `hintsUsed`, never penalised):
   - *Hint 1 (evidence):* a vx/vy split bar for *his* angle: "At your angle: forward speed 5.2 m/s, upward speed 19.3 m/s. Out of 20 m/s, how much was left for moving forward?"
   - *Hint 2 (strategy):* "Change the angle by only 5° at a time and check whether the distance grew or shrank. Keep moving in the direction where it grows." This teaches control-of-variables search, not the answer.
6. **Next experiment narrowed, not given:** "Try an angle between 35° and 55° next and record what happens to the distance."
7. **Hypothesis revision gate.** Before the next launch he has to either pick a revised hypothesis or consciously keep his current one ("keep my hypothesis but test another angle"). A change increments `revisions` and shows "अंदाज सुधारला! हा खरा वैज्ञानिक विचार आहे. 🌱". This makes the **Revise** step of the cycle explicit and visible in the reflection.
8. **Success belongs to the learner.** When a later shot lands (e.g. at 45°), the success card says that *his experiments* found a better angle than his first hypothesis. He is then challenged to find which nearby angle goes the absolute farthest, and given the complementary-angle check (T4).

Shots that miss at shallow angles (e.g. 30°, h30) get a mirrored card ("moved forward fast but landed quickly"). Shots that miss near the target get a fine-tuning card.

---

## 5. Design decisions for L5 (anxiety and self-efficacy)

- **Colour language:** teal, sky and amber only; no red anywhere. Misses use the same calm card style as hits.
- **Persistent reassurance badge:** "चुका म्हणजे नवे शोध • Mistakes are discoveries" stays in the top bar.
- **Equations on demand:** the sandbox's "गणित पाहायचं आहे? (ऐच्छिक)" corner is collapsed by default.
- **Free navigation:** every screen is reachable at any time; nothing is locked except launching without a hypothesis (pedagogically necessary).
- **Visible progress:** step navigator, experiment log, reflection dashboard with start vs end confidence.
- **Small, friendly numbers:** g = 10 m/s², u = 10/20/30 m/s, target at 40 m.
- **Phone-friendly:** the canvas scales to width, sliders have large thumbs, layouts stack below 1024 px.
- **Reduced motion:** animations are skipped when `prefers-reduced-motion` is set.

## 6. C2 — Language implementation

- All learner-facing text lives in `src/data/translations.js` under `mr` (default) and `en`, with identical key structures. Components read it through `useLang()`; there are no hard-coded learner strings.
- The toggle in the top bar switches every label, hypothesis, hint, feedback message, SVG canvas label and unit (मी / m, से / s) immediately, and sets `<html lang>`.
- The Marathi is conversational: "पुढचा वेग" (forward speed) instead of "क्षैतिज घटक"; "अंदाज" (guess / hypothesis) instead of "परिकल्पना". Technical symbols (vx, vy, g) are kept as they appear in textbooks.
- The learner can write their explanation in Marathi or English; the offline analyzer matches keywords in both (e.g. *वेळ / time*, *पुढे / forward*, *चौपट / four*), and the LLM is told to reply in the active UI language.
- The footer token `Identity Token: 23B2487 | Card: P5-T10-L5-C2` is kept verbatim in both languages.

## 7. AI Inquiry Coach

- If `VITE_GEMINI_API_KEY` is set, the coach calls Gemini (`VITE_GEMINI_MODEL`, default `gemini-2.5-flash`). Otherwise, if `VITE_OPENAI_API_KEY` is set, it calls OpenAI Chat Completions (`VITE_OPENAI_MODEL`, default `gpt-4o-mini`).
- The system prompt gives the LLM the learner profile, the experiment data and the rules: never say "wrong", never state the full explanation, praise one real strength, ask one guiding question, ≤ 70 words, reply in the active language.
- **Deterministic fallback:** with no key, or on any error or timeout (12 s), a rule-based analyzer (`src/lib/aiCoach.js`) detects the concepts *range ×4*, *time in air*, *forward speed*, *square relation* and the M2 pattern ("doubles" without the other concepts). It then returns the matching praise and next-question pair from the T7 table. The card is always labelled with its source (Gemini / OpenAI / offline analyzer), so the learner is never misled about what produced the feedback.
- *Security note:* `VITE_*` variables are embedded in the client bundle. For a public deployment, keep the offline analyzer or route the call through a server-side proxy.

## 8. Tracking (state saved in `localStorage`)

`confidenceStart`, `confidenceEnd`, `warmup`, `experiments`, `revisions`, `hintsUsed`, Mission 1 `firstHypothesis`, `hypothesis`, `history[]`, `shots[]`, `solved`, `check`, Mission 2 `prediction`, `runs[]`, `explanation`, `coachCalls`, `transfer`, and `learned`. The Reflection screen summarises these. "Start over" (with an in-page confirmation) clears them.

## 9. Architecture

```
src/
  main.jsx, App.jsx, index.css
  data/translations.js          all learner-facing text (mr + en)
  context/LanguageContext.jsx   useLang(): { lang, setLang, t }
  state/useProgress.js          persisted learner progress
  lib/physics.js                g = 10 kinematics, target judging, miss classification
  lib/aiCoach.js                Gemini / OpenAI call + deterministic analyzer
  components/                   TopBar, Footer, StepNav, ProjectileCanvas (SVG),
                                RangeSlider, ChoiceList, VelocitySplit,
                                ComparisonBars, AICoach, AboutPanel
  screens/                      Welcome, Sandbox, MissionAngle, MissionSpeed,
                                Reflection, About
```
