import { useId, useRef } from "react";

/** Accessible tab bar (arrow keys move between tabs). */
export function SettingsTabs({ tabs, label, active, onChange, children }) {
  const baseId = useId();
  const refs = useRef([]);

  const onKeyDown = (e, i) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div className="rounded-2xl border border-line bg-surface">
      <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-line p-1.5">
        {tabs.map(({ id, label, icon: Icon }, i) => {
          const selected = id === active;
          return (
            <button
              key={id}
              ref={(el) => (refs.current[i] = el)}
              id={`${baseId}-tab-${id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                selected ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4 max-[400px]:hidden" strokeWidth={1.8} aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${active}`} className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}
