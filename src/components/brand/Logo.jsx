/** QR Studio mark. Uses currentColor so it follows the active theme. */
export function LogoMark({ className = "h-7 w-7", title }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <rect x="2.9" y="2.9" width="7.2" height="7.2" rx="2.2" />
      <rect x="13.9" y="2.9" width="7.2" height="7.2" rx="2.2" />
      <rect x="2.9" y="13.9" width="7.2" height="7.2" rx="2.2" />
      <path d="M12 3.1v2.6M12 8.6v.01M3.1 12h1.4M7.4 12h2.8M13.9 13.6V12h7.2M15.6 16.2h.01M18.4 16.2h2.7v1.9M13.9 21.1h7.2" />
      <g fill="currentColor" stroke="none">
        <rect x="5.4" y="5.4" width="2.2" height="2.2" rx=".6" />
        <rect x="16.4" y="5.4" width="2.2" height="2.2" rx=".6" />
        <rect x="5.4" y="16.4" width="2.2" height="2.2" rx=".6" />
      </g>
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5 text-ink">
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight">QR Studio</span>
    </span>
  );
}
