import { useState } from "react";
import { ImagePlus, Palette, PenLine, SlidersHorizontal } from "lucide-react";
import { Header } from "../components/layout/Header";
import { useI18n } from "../i18n/I18nProvider";
import { useQrDesigner } from "../features/qr/useQrDesigner";
import { SettingsTabs } from "../features/qr/components/SettingsTabs";
import { ContentPanel } from "../features/qr/components/ContentPanel";
import { StylePanel } from "../features/qr/components/StylePanel";
import { LogoPanel } from "../features/qr/components/LogoPanel";
import { OutputPanel } from "../features/qr/components/OutputPanel";
import { QrPreview } from "../features/qr/components/QrPreview";

const TABS = [
  { id: "content", icon: PenLine },
  { id: "style", icon: Palette },
  { id: "logo", icon: ImagePlus },
  { id: "output", icon: SlidersHorizontal },
];

export default function GeneratorPage() {
  const { t } = useI18n();
  const qr = useQrDesigner();
  const [tab, setTab] = useState("content");
  const [exportOpts, setExportOpts] = useState({ size: 1024, filename: "qr-code" });
  const tabs = TABS.map((tb) => ({ ...tb, label: t(`tabs.${tb.id}`) }));

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-page flex-1 px-4 pb-16 sm:px-6">
        <div className="max-w-xl py-8 sm:py-10">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink sm:text-4xl">{t("hero.title")}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{t("hero.lead")}</p>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
          <aside aria-label={t("preview.region")} className="lg:sticky lg:top-20 lg:order-2">
            <QrPreview result={qr.result} design={qr.design} ecl={qr.ecl} exportOpts={exportOpts} isStale={qr.isStale} />
          </aside>

          <div className="min-w-0 lg:order-1">
            <SettingsTabs tabs={tabs} label={t("tabs.label")} active={tab} onChange={setTab}>
              {tab === "content" && (
                <ContentPanel type={qr.contentType} onTypeChange={qr.setContentType} fields={qr.fields} setField={qr.setField} />
              )}
              {tab === "style" && <StylePanel design={qr.design} update={qr.update} />}
              {tab === "logo" && <LogoPanel design={qr.design} update={qr.update} ecl={qr.ecl} />}
              {tab === "output" && (
                <OutputPanel design={qr.design} update={qr.update} ecl={qr.ecl} exportOpts={exportOpts} setExportOpts={setExportOpts} />
              )}
            </SettingsTabs>
          </div>
        </div>
      </main>

      <footer className="border-t border-line">
        <p className="mx-auto max-w-page px-4 py-6 text-xs text-subtle sm:px-6">{t("footer")}</p>
      </footer>
    </div>
  );
}
