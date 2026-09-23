import { useRef, useState } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import { Section, Slider } from "../../../components/ui/controls";
import { useI18n } from "../../../i18n/I18nProvider";

const MAX_BYTES = 2 * 1024 * 1024;

export function LogoPanel({ design, update, ecl }) {
  const { t } = useI18n();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const readFile = (file) => {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("errType");
    if (file.size > MAX_BYTES) return setError("errSize");
    const reader = new FileReader();
    reader.onload = (e) => update({ logoSrc: e.target.result, logoName: file.name });
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <Section
        title={t("logo.title")}
        description={design.ecLevel === "auto" ? t("logo.autoDesc") : t("logo.fixedDesc", { level: ecl })}
      >
        {design.logoSrc ? (
          <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3">
            <img src={design.logoSrc} alt="" className="checker h-12 w-12 shrink-0 rounded-md border border-line object-contain" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{design.logoName || t("logo.fallbackName")}</p>
              <button type="button" onClick={() => inputRef.current?.click()} className="text-[13px] text-muted underline-offset-2 hover:text-ink hover:underline">
                {t("logo.replace")}
              </button>
            </div>
            <button
              type="button"
              onClick={() => update({ logoSrc: null, logoName: "" })}
              aria-label={t("logo.remove")}
              title={t("logo.remove")}
              className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-danger"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); readFile(e.dataTransfer.files[0]); }}
            className={`flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors ${
              dragging ? "border-ink bg-surface-2" : "border-line hover:border-subtle hover:bg-surface-2"
            }`}
          >
            <ImageUp className="h-6 w-6 text-muted" strokeWidth={1.6} aria-hidden />
            <span className="text-sm font-medium text-ink">{t("logo.add")}</span>
            <span className="text-xs text-muted">{t("logo.addHint")}</span>
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => { readFile(e.target.files[0]); e.target.value = ""; }} />
        {error && <p role="alert" className="mt-2 text-xs text-danger">{t(`logo.${error}`)}</p>}
      </Section>

      {design.logoSrc && (
        <Section title={t("logo.fit")}>
          <div className="space-y-5">
            <Slider label={t("logo.size")} value={design.logoSize} onChange={(v) => update({ logoSize: v })} min={10} max={30} unit="%" />
            <Slider label={t("logo.radius")} value={design.logoRadius} onChange={(v) => update({ logoRadius: v })} min={0} max={100} unit="%" />
          </div>
        </Section>
      )}
    </div>
  );
}
