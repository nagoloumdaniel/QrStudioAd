// Heuristics that flag designs phone cameras struggle to read.
// Each check carries an i18n key (scan.<key>.label / .detail) and its params.

const EC_RECOVERY = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 };

function luminance(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((x) => x + x).join("");
  const ch = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

export function runScanChecks(matrix, opts, ecl) {
  const bg = opts.transparent ? "#ffffff" : opts.bgColor;
  const inks = [opts.eyeColor, ...(opts.gradient ? [opts.gradientFrom, opts.gradientTo] : [opts.fgColor])];
  const minContrast = Math.min(...inks.map((c) => contrast(c, bg)));
  const inverted = inks.some((c) => luminance(c) > luminance(bg));
  const ratio = minContrast.toFixed(1);

  const checks = [];

  checks.push(
    minContrast < 2.5
      ? { key: "contrastFail", status: "fail", params: { ratio } }
      : minContrast < 4
        ? { key: "contrastWarn", status: "warn", params: { ratio } }
        : { key: "contrastOk", status: "ok", params: { ratio } },
  );

  if (inverted) checks.push({ key: "inverted", status: "warn" });

  if (opts.logoSrc) {
    const covered = ((matrix.size * (opts.logoSize / 100) + 2) ** 2) / matrix.size ** 2;
    const budget = EC_RECOVERY[ecl];
    const params = { level: ecl };
    checks.push(
      covered > budget * 0.8
        ? { key: "logoFail", status: "fail", params }
        : covered > budget * 0.55
          ? { key: "logoWarn", status: "warn", params }
          : { key: "logoOk", status: "ok", params },
    );
  }

  if (opts.quietZone < 4) checks.push({ key: "margin", status: "warn" });
  if (matrix.version >= 15) checks.push({ key: "density", status: "warn" });

  const rank = { ok: 0, warn: 1, fail: 2 };
  const status = checks.reduce((w, c) => (rank[c.status] > rank[w] ? c.status : w), "ok");
  return { status, checks };
}
