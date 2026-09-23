import { useState } from "react";
import { AlertTriangle, Check, CircleAlert, Copy, Download, ScanLine, ShieldCheck } from "lucide-react";
import { canCopyImage, copyQrImage, downloadQr } from "../lib/export";
import { useI18n } from "../../../i18n/I18nProvider";

const STATUS = {
  ok: { icon: ShieldCheck, tone: "text-accent", ring: "border-accent/30 bg-accent/10" },
  warn: { icon: AlertTriangle, tone: "text-warn", ring: "border-warn/30 bg-warn/10" },
  fail: { icon: CircleAlert, tone: "text-danger", ring: "border-danger/30 bg-danger/10" },
};

function ScanReport({ scan }) {
  const { t } = useI18n();
  const s = STATUS[scan.status];
  const issues = scan.checks.filter((c) => c.status !== "ok");
  const Icon = s.icon;
  return (
    <div className={`rounded-xl border p-3 ${s.ring}`} aria-live="polite">
      <p className={`flex items-center gap-2 text-sm font-semibold ${s.tone}`}>
        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
        {t(`status.${scan.status}`)}
      </p>
      {issues.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {issues.map((c) => (
            <li key={c.key} className="text-[13px] leading-snug">
              <span className="font-medium text-ink">{t(`scan.${c.key}.label`)}.</span>{" "}
              <span className="text-muted">{t(`scan.${c.key}.detail`, c.params)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-[13px] text-muted">{scan.checks.map((c) => t(`scan.${c.key}.label`)).join(". ")}.</p>
      )}
    </div>
  );
}

function ExportActions({ matrix, design, exportOpts }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const run = async (key, fn) => {
    setBusy(key);
    setError("");
    try {
      await fn();
    } catch {
      setError(key === "copy" ? "copyError" : "exportError");
    } finally {
      setBusy(null);
    }
  };

  const download = (format) =>
    run(format, () => downloadQr(matrix, design, { format, size: exportOpts.size, filename: exportOpts.filename }));

  const copy = () =>
    run("copy", async () => {
      await copyQrImage(matrix, design, exportOpts.size);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });

  const secondary = "rounded-lg border border-line bg-surface px-2 py-2 text-[13px] font-medium text-ink transition-colors hover:border-subtle disabled:opacity-50";

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => download("png")}
        disabled={!!busy}
        className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-ink px-4 py-2.5 text-[13px] font-semibold min-[400px]:text-sm text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Download className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        {busy === "png" ? t("preview.preparing") : t("preview.download", { size: exportOpts.size })}
      </button>
      <div className="grid grid-cols-4 gap-2">
        {["svg", "jpg", "webp"].map((f) => (
          <button key={f} type="button" onClick={() => download(f)} disabled={!!busy} className={secondary}>
            {f.toUpperCase()}
          </button>
        ))}
        {canCopyImage() && (
          <button type="button" onClick={copy} disabled={!!busy} className={`${secondary} inline-flex items-center justify-center gap-1.5`} aria-label={t("preview.copyLabel")} title={t("preview.copyLabel")}>
            {copied ? <Check className="h-3.5 w-3.5 text-accent max-[400px]:hidden" strokeWidth={2.2} aria-hidden /> : <Copy className="h-3.5 w-3.5 max-[400px]:hidden" strokeWidth={1.8} aria-hidden />}
            {copied ? t("preview.copied") : t("preview.copy")}
          </button>
        )}
      </div>
      {error && <p role="alert" className="text-xs text-danger">{t(`preview.${error}`)}</p>}
    </div>
  );
}

export function QrPreview({ result, design, ecl, exportOpts, isStale }) {
  const { t } = useI18n();
  const ready = result.state === "ready";

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="crop-marks mx-auto max-w-[320px] p-3 lg:max-w-none">
        <div className={`aspect-square overflow-hidden rounded-sm ${ready && design.transparent ? "checker" : ""}`}>
          {ready && (
            <div
              role="img"
              aria-label={t("preview.alt")}
              className={`h-full w-full transition-opacity duration-150 [&>svg]:h-full [&>svg]:w-full ${isStale ? "opacity-70" : ""}`}
              dangerouslySetInnerHTML={{ __html: result.svg }}
            />
          )}
          {result.state === "empty" && (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-surface-2 p-6 text-center">
              <ScanLine className="h-8 w-8 text-subtle" strokeWidth={1.5} aria-hidden />
              <p className="text-sm text-muted">{t("preview.empty")}</p>
            </div>
          )}
          {result.state === "error" && (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-danger/5 p-6 text-center">
              <CircleAlert className="h-8 w-8 text-danger" strokeWidth={1.5} aria-hidden />
              <p className="text-sm text-ink">{t("preview.tooLong", { level: result.level })}</p>
            </div>
          )}
        </div>
      </div>

      {ready && (
        <div className="mt-4 space-y-4">
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              ["version", result.matrix.version],
              ["grid", `${result.matrix.size}×${result.matrix.size}`],
              ["correction", ecl],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-surface-2 px-2 py-1.5">
                <dt className="text-[11px] text-subtle">{t(`preview.${k}`)}</dt>
                <dd className="text-sm font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <ScanReport scan={result.scan} />
          <ExportActions matrix={result.matrix} design={design} exportOpts={exportOpts} />
        </div>
      )}
    </div>
  );
}
