import { useEffect, useId, useState } from "react";

export function Section({ title, description, children, aside }) {
  return (
    <section className="border-t border-line py-5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-[13px] leading-snug text-muted">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, hint, id, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-medium text-muted">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-subtle">{hint}</p>}
    </div>
  );
}

export function TextInput({ label, hint, value, onChange, multiline, ...rest }) {
  const id = useId();
  const Tag = multiline ? "textarea" : "input";
  return (
    <Field label={label} hint={hint} id={id}>
      <Tag
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`input ${multiline ? "min-h-[88px] resize-y leading-relaxed" : ""}`}
        rows={multiline ? 3 : undefined}
        {...rest}
      />
    </Field>
  );
}

export function SelectInput({ label, value, onChange, options }) {
  const id = useId();
  return (
    <Field label={label} id={id}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="input cursor-pointer">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Slider({ label, value, onChange, min, max, step = 1, unit = "" }) {
  const id = useId();
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-muted">
          {label}
        </label>
        <output htmlFor={id} className="text-[13px] font-semibold text-ink">
          {value}
          {unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="h-5 w-full cursor-pointer"
      />
    </div>
  );
}

const HEX = /^#[0-9a-f]{6}$/i;

export function ColorInput({ label, pickerLabel, value, onChange, disabled }) {
  const id = useId();
  // Local draft so partially typed hex values don't break rendering.
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const commit = (v) => {
    const next = v.startsWith("#") ? v : `#${v}`;
    setDraft(next);
    if (HEX.test(next)) onChange(next.toLowerCase());
  };

  return (
    <Field label={label} id={id}>
      <div className={`flex items-center gap-2 rounded-lg border border-line bg-surface p-1.5 pr-2 transition-colors focus-within:border-ink ${disabled ? "opacity-50" : ""}`}>
        <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md border border-line" style={{ background: value }}>
          <input
            type="color"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            aria-label={pickerLabel || label}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </span>
        <input
          id={id}
          value={draft}
          disabled={disabled}
          maxLength={7}
          spellCheck={false}
          onChange={(e) => commit(e.target.value.trim())}
          onBlur={() => setDraft(value)}
          className="w-full min-w-0 bg-transparent text-sm uppercase text-ink focus:outline-none"
        />
      </div>
    </Field>
  );
}

export function Switch({ label, description, checked, onChange }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition-colors ${checked ? "bg-ink" : "bg-line"}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition-transform ${checked ? "translate-x-4" : ""}`}
        />
      </button>
    </div>
  );
}

export function Segmented({ label, hideLabel, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      {label && !hideLabel && <p className="text-[13px] font-medium text-muted">{label}</p>}
      <div role="radiogroup" aria-label={label} className="flex rounded-lg border border-line bg-surface-2 p-0.5">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`flex-1 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors ${
                active ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
