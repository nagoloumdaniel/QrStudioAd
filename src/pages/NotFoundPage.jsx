import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "../components/layout/Header";
import { useTheme } from "../theme/ThemeProvider";
import { useI18n } from "../i18n/I18nProvider";

export default function NotFoundPage() {
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <Header />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md">
          <p className="text-[clamp(5rem,22vw,9rem)] font-bold leading-none tracking-tighter text-ink">404</p>
          <h1 className="mt-4 text-xl font-semibold text-ink">{t("notFound.title")}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{t("notFound.body")}</p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
            {t("notFound.back")}
          </Link>
        </div>
      </main>
    </div>
  );
}
