import { EC_LEVELS, EXPORT_SIZES } from "../constants";
import { Section, Segmented, Slider, TextInput } from "../../../components/ui/controls";
import { useI18n } from "../../../i18n/I18nProvider";

export function OutputPanel({ design, update, ecl, exportOpts, setExportOpts }) {
  const { t } = useI18n();
  return (
    <div>
      <Section title={t("output.ec")} description={t("output.ecDesc")}>
        <Segmented
          label={t("output.ec")}
          hideLabel
          value={design.ecLevel}
          onChange={(v) => update({ ecLevel: v })}
          options={EC_LEVELS.map((l) => ({ value: l, label: l === "auto" ? t("output.auto") : l }))}
        />
        <p className="mt-2 text-xs text-subtle">
          {design.ecLevel === "auto" && t("output.using", { level: ecl })}
          {t(`ec.${ecl}`)}
        </p>
      </Section>

      <Section title={t("output.frame")}>
        <div className="space-y-5">
          <Slider label={t("output.margin")} value={design.quietZone} onChange={(v) => update({ quietZone: v })} min={1} max={8} unit={t("output.modules")} />
          <Slider label={t("output.corners")} value={design.cornerRadius} onChange={(v) => update({ cornerRadius: v })} min={0} max={20} unit="%" />
        </div>
      </Section>

      <Section title={t("output.file")}>
        <div className="space-y-4">
          <Segmented
            label={t("output.imageSize")}
            value={exportOpts.size}
            onChange={(v) => setExportOpts((o) => ({ ...o, size: v }))}
            options={EXPORT_SIZES.map((s) => ({ value: s, label: `${s}px` }))}
          />
          <TextInput
            label={t("output.filename")}
            value={exportOpts.filename}
            onChange={(v) => setExportOpts((o) => ({ ...o, filename: v.replace(/[\\/:*?"<>|]/g, "") }))}
            placeholder="qr-code"
            spellCheck={false}
          />
        </div>
      </Section>
    </div>
  );
}
