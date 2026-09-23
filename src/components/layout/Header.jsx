import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Logo } from "../brand/Logo";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n/I18nProvider";

const iconButton =
  "h-9 rounded-lg border border-line bg-surface text-muted transition-colors hover:border-subtle hover:text-ink";

function LanguageToggle() {
  const { lang, toggleLang, t } = useI18n();
  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={t("header.language")}
      title={t("header.language")}
      className={`${iconButton} inline-flex items-center gap-1 px-2.5 text-[13px] font-semibold`}
    >
      <span className={lang === "fr" ? "text-ink" : "text-subtle"}>FR</span>
      <span className="text-line" aria-hidden>/</span>
      <span className={lang === "en" ? "text-ink" : "text-subtle"}>EN</span>
    </button>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const label = t("header.theme", { mode: t(theme === "dark" ? "header.light" : "header.dark") });
  const Icon = theme === "dark" ? Sun : Moon;
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label} className={`${iconButton} grid w-9 place-items-center`}>
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
    </button>
  );
}

export function Header() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-14 max-w-page items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label={t("header.home")} className="rounded-md">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
