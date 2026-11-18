// Option cards that behave like a radio group. No option is ever styled as "wrong".
export default function ChoiceList({ options, value, onSelect, disabled = false, columns = 1, label }) {
  const grid = columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-3' : columns === 4 ? 'grid-cols-2 sm:grid-cols-4' : '';
  return (
    <div role="radiogroup" aria-label={label} className={`grid gap-2 ${grid}`}>
      {options.map((o) => {
        const selected = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onSelect(o.id)}
            className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition disabled:cursor-default ${
              selected ? 'border-teal-600 bg-teal-50' : 'border-stone-200 bg-white hover:border-teal-300'
            } ${disabled && !selected ? 'opacity-60' : ''}`}
          >
            <span
              aria-hidden="true"
              className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                selected ? 'border-teal-600 bg-teal-600' : 'border-stone-300'
              }`}
            >
              {selected && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>
            <span className="leading-snug">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
