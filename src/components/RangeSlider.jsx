import { useId } from 'react';

export default function RangeSlider({ label, value, min, max, step = 1, unit, onChange, disabled = false, note }) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="font-semibold text-stone-700">
          {label}
          {note && <span className="ml-2 text-sm font-normal text-stone-500">({note})</span>}
        </label>
        <span className="text-2xl font-bold tabular-nums text-teal-800">
          {value}
          <span className="ml-1 text-base font-semibold text-stone-500">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-xs text-stone-500">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}
