import { useRef } from 'react';
import { useLang } from './context/LanguageContext';
import { useProgress } from './state/useProgress';
import TopBar from './components/TopBar';
import StepNav from './components/StepNav';
import Footer from './components/Footer';
import Welcome from './screens/Welcome';
import Sandbox from './screens/Sandbox';
import MissionAngle from './screens/MissionAngle';
import MissionSpeed from './screens/MissionSpeed';
import Practice, { isPracticeDone } from './screens/Practice';
import Reflection from './screens/Reflection';
import { PRACTICE } from './data/practice';
import About from './screens/About';

const ORDER = ['welcome', 'sandbox', 'mission1', 'mission2', 'practice', 'reflection'];

export default function App() {
  const { t } = useLang();
  const { progress, patch, bump, reset } = useProgress();
  const lastLabScreen = useRef('welcome');

  const screen = progress.screen === 'about' || ORDER.includes(progress.screen) ? progress.screen : 'welcome';
  const index = ORDER.indexOf(screen);
  if (index >= 0) lastLabScreen.current = screen;

  const go = (next) => {
    patch('screen', next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const m2Done = [10, 20].every((u) => progress.m2.runs.some((r) => r.speed === u)) && progress.m2.coachCalls > 0;
  const done = [
    progress.confidenceStart !== null && progress.warmup !== null,
    progress.sandbox.tasks.every(Boolean),
    progress.m1.solved,
    m2Done,
    PRACTICE.every((it) => isPracticeDone(it, progress.practice)),
    progress.confidenceEnd !== null,
  ];

  const props = { progress, patch, bump, go };
  const view = {
    welcome: <Welcome {...props} />,
    sandbox: <Sandbox {...props} />,
    mission1: <MissionAngle {...props} />,
    mission2: <MissionSpeed {...props} />,
    practice: <Practice {...props} />,
    reflection: <Reflection {...props} reset={reset} />,
    about: <About onBack={() => go(lastLabScreen.current)} />,
  }[screen];

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <StepNav current={index} done={done} onGo={(i) => go(ORDER[i])} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <div key={screen} className="animate-rise">
          {view}
        </div>
        {index >= 0 && (
          <div className="mt-8 flex justify-between border-t border-stone-200 pt-4">
            <button type="button" className="btn-soft" onClick={() => go(ORDER[index - 1])} disabled={index === 0}>
              ← {t.nav.back}
            </button>
            <button type="button" className="btn-soft" onClick={() => go(ORDER[index + 1])} disabled={index === ORDER.length - 1}>
              {t.nav.next} →
            </button>
          </div>
        )}
      </main>
      <Footer onAbout={() => go('about')} active={screen === 'about'} />
    </div>
  );
}
