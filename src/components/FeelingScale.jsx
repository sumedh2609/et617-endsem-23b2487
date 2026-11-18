const FACES = ['😟', '😕', '😐', '🙂', '😄'];

export const feelingFace = (v) => FACES[v - 1];

export default function FeelingScale({ value, onChange, labels, question }) {
  return (
    <div role="radiogroup" aria-label={question} className="grid grid-cols-5 gap-2">
      {FACES.map((face, i) => {
        const v = i + 1;
        const selected = value === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(v)}
            className={`flex flex-col items-center gap-1 rounded-xl border-2 px-1 py-2 text-center transition ${
              selected ? 'border-teal-600 bg-teal-50' : 'border-stone-200 bg-white hover:border-teal-300'
            }`}
          >
            <span className="text-2xl sm:text-3xl" aria-hidden="true">
              {face}
            </span>
            <span className="text-xs leading-tight text-stone-600 sm:text-sm">{labels[i]}</span>
          </button>
        );
      })}
    </div>
  );
}
