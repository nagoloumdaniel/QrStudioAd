import { useMemo } from "react";
import { COLOR_PRESETS, EYE_STYLES, MODULE_SHAPES } from "../constants";
import { buildSvg } from "../lib/svg";
import { ColorInput, Section, Segmented, Switch } from "../../../components/ui/controls";
import { useI18n } from "../../../i18n/I18nProvider";

// Tiny fake matrices used to draw the style thumbnails with the real renderer.
const SAMPLE = [
  [1, 1, 0, 1, 1],
  [1, 0, 1, 1, 0],
  [0, 1, 1, 1, 0],
  [1, 1, 0, 0, 1],
  [1, 0, 1, 1, 1],
];
const moduleSample = { size: 5, isDark: (r, c) => SAMPLE[r][c] === 1, finders: [], alignments: [] };
const eyeSample = { size: 7, isDark: () => false, finders: [[0, 0]], alignments: [] };

function thumb(matrix, patch) {
  return buildSvg(matrix, {
    moduleShape: "square", eyeStyle: "square", fgColor: "currentColor", eyeColor: "currentColor",
    transparent: true, quietZone: 0, cornerRadius: 0, ...patch,
  });
}

function StyleOption({ label, svg, active, onClick }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-lg border px-2 py-3 text-xs font-medium transition-colors ${
        active ? "border-ink text-ink ring-1 ring-ink" : "border-line text-muted hover:border-subtle hover:text-ink"
      }`}
    >
      <span className="h-7 w-7 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} aria-hidden />
      {label}
    </button>
  );
}

export function StylePanel({ design, update }) {
  const { t } = useI18n();
  const shapeThumbs = useMemo(() => MODULE_SHAPES.map((id) => thumb(moduleSample, { moduleShape: id })), []);
  const eyeThumbs = useMemo(() => EYE_STYLES.map((id) => thumb(eyeSample, { eyeStyle: id })), []);

  return (
    <div>
      <Section title={t("style.shape")} description={t("style.shapeDesc")}>
        <div role="radiogroup" aria-label={t("style.shape")} className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {MODULE_SHAPES.map((id, i) => (
            <StyleOption key={id} label={t(`shapes.${id}`)} svg={shapeThumbs[i]} active={design.moduleShape === id} onClick={() => update({ moduleShape: id })} />
          ))}
        </div>
      </Section>

      <Section title={t("style.eyes")} description={t("style.eyesDesc")}>
        <div role="radiogroup" aria-label={t("style.eyes")} className="grid grid-cols-3 gap-2">
          {EYE_STYLES.map((id, i) => (
            <StyleOption key={id} label={t(`shapes.${id}`)} svg={eyeThumbs[i]} active={design.eyeStyle === id} onClick={() => update({ eyeStyle: id })} />
          ))}
        </div>
      </Section>

      <Section title={t("style.colors")} description={t("style.colorsDesc")}>
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={t("style.presets")}>
          {COLOR_PRESETS.map((p) => {
            const active = !design.gradient && design.fgColor === p.fg && design.eyeColor === p.eye && design.bgColor === p.bg;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => update({ fgColor: p.fg, eyeColor: p.eye, bgColor: p.bg, gradient: false })}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs font-medium transition-colors ${
                  active ? "border-ink text-ink" : "border-line text-muted hover:border-subtle hover:text-ink"
                }`}
              >
                <span className="grid h-5 w-5 place-items-center rounded-full border border-line" style={{ background: p.bg }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.fg }} />
                </span>
                {t(`presets.${p.name}`)}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <ColorInput label={t("style.code")} pickerLabel={t("style.picker", { label: t("style.code") })} value={design.fgColor} onChange={(v) => update({ fgColor: v })} disabled={design.gradient} />
          <ColorInput label={t("style.eyeColor")} pickerLabel={t("style.picker", { label: t("style.eyeColor") })} value={design.eyeColor} onChange={(v) => update({ eyeColor: v })} />
          <ColorInput label={t("style.background")} pickerLabel={t("style.picker", { label: t("style.background") })} value={design.bgColor} onChange={(v) => update({ bgColor: v })} disabled={design.transparent} />
        </div>

        <div className="mt-5 space-y-4">
          <Switch label={t("style.transparent")} description={t("style.transparentDesc")} checked={design.transparent} onChange={(v) => update({ transparent: v })} />
          <Switch label={t("style.gradient")} checked={design.gradient} onChange={(v) => update({ gradient: v })} />
          {design.gradient && (
            <div className="space-y-3 rounded-lg bg-surface-2 p-3">
              <Segmented
                label={t("style.direction")}
                value={design.gradientType}
                onChange={(v) => update({ gradientType: v })}
                options={[{ value: "linear", label: t("style.linear") }, { value: "radial", label: t("style.radial") }]}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <ColorInput label={t("style.start")} pickerLabel={t("style.picker", { label: t("style.start") })} value={design.gradientFrom} onChange={(v) => update({ gradientFrom: v })} />
                <ColorInput label={t("style.end")} pickerLabel={t("style.picker", { label: t("style.end") })} value={design.gradientTo} onChange={(v) => update({ gradientTo: v })} />
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
