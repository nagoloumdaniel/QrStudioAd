// Renders a QR matrix to an SVG string. The same SVG is used for the
// live preview, the SVG download and (rasterised) PNG/JPG/WebP exports.
// All geometry is expressed in module units; the viewBox scales it.

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const safeColor = (c, fallback) => (HEX.test(c) || c === "currentColor" ? c : fallback);
const n = (v) => +v.toFixed(3);

// Rounded rectangle with an independent radius per corner [tl, tr, br, bl].
function rectPath(x, y, w, h, [tl, tr, br, bl]) {
  return (
    `M${n(x + tl)} ${n(y)}H${n(x + w - tr)}` +
    (tr ? `A${n(tr)} ${n(tr)} 0 0 1 ${n(x + w)} ${n(y + tr)}` : "") +
    `V${n(y + h - br)}` +
    (br ? `A${n(br)} ${n(br)} 0 0 1 ${n(x + w - br)} ${n(y + h)}` : "") +
    `H${n(x + bl)}` +
    (bl ? `A${n(bl)} ${n(bl)} 0 0 1 ${n(x)} ${n(y + h - bl)}` : "") +
    `V${n(y + tl)}` +
    (tl ? `A${n(tl)} ${n(tl)} 0 0 1 ${n(x + tl)} ${n(y)}` : "") +
    "Z"
  );
}

// Path for one data module at (x, y). `nb` reports dark neighbours.
function modulePath(shape, x, y, nb) {
  switch (shape) {
    case "dots": {
      const r = 0.45;
      return `M${n(x + 0.5 - r)} ${n(y + 0.5)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
    }
    case "rounded":
      return rectPath(x, y, 1, 1, [0.3, 0.3, 0.3, 0.3]);
    case "leaf":
      return rectPath(x, y, 1, 1, [0.5, 0, 0.5, 0]);
    case "fluid": {
      // Round only the corners that are not touching another dark module.
      const r = 0.5;
      return rectPath(x, y, 1, 1, [
        !nb.up && !nb.left ? r : 0,
        !nb.up && !nb.right ? r : 0,
        !nb.down && !nb.right ? r : 0,
        !nb.down && !nb.left ? r : 0,
      ]);
    }
    default:
      return `M${x} ${y}h1v1h-1Z`;
  }
}

// Finder (7×7) or alignment (5×5) pattern: ring + centre.
function eyePath(style, x, y, size) {
  const k = size / 7;
  const radii = (r) => {
    if (style === "rounded") return [r, r, r, r];
    if (style === "leaf") return [r, 0, r, 0];
    return [0, 0, 0, 0];
  };
  const inner = size === 7 ? 3 : 1;
  const innerOff = (size - inner) / 2;
  const ring =
    rectPath(x, y, size, size, radii(2.2 * k)) +
    rectPath(x + 1, y + 1, size - 2, size - 2, radii(1.4 * k));
  const centre = rectPath(x + innerOff, y + innerOff, inner, inner, radii(size === 7 ? 1 : 0.3));
  return { ring, centre };
}

/** Geometry of the centre logo, in module units (shared with the rasteriser). */
export function logoBox(matrix, opts) {
  if (!opts.logoSrc) return null;
  const total = matrix.size + opts.quietZone * 2;
  const side = matrix.size * (opts.logoSize / 100);
  const pad = Math.max(0.6, side * 0.06);
  const x = (total - side) / 2;
  return { x, y: x, side, pad, radius: (side / 2) * (opts.logoRadius / 100) };
}

export function buildSvg(matrix, opts, { includeLogo = true } = {}) {
  const { size, isDark, finders, alignments } = matrix;
  const q = opts.quietZone;
  const total = size + q * 2;

  const fg = safeColor(opts.fgColor, "#000000");
  const eye = safeColor(opts.eyeColor, fg);
  const bg = safeColor(opts.bgColor, "#ffffff");

  // Cells drawn by eye patterns, excluded from the data layer.
  const skip = new Uint8Array(size * size);
  const mark = (r0, c0, s) => {
    for (let r = r0; r < r0 + s; r++) for (let c = c0; c < c0 + s; c++) skip[r * size + c] = 1;
  };
  finders.forEach(([r, c]) => mark(r, c, 7));
  alignments.forEach(([r, c]) => mark(r - 2, c - 2, 5));

  // Clear the modules under the logo so it sits on a clean plate.
  const logo = logoBox(matrix, opts);
  if (logo) {
    const from = Math.floor(logo.x - logo.pad - q);
    const to = Math.ceil(logo.x + logo.side + logo.pad - q);
    for (let r = Math.max(0, from); r < Math.min(size, to); r++)
      for (let c = Math.max(0, from); c < Math.min(size, to); c++) skip[r * size + c] = 1;
  }

  const dark = (r, c) => r >= 0 && c >= 0 && r < size && c < size && isDark(r, c) && !skip[r * size + c];

  let data = "";
  if (opts.moduleShape === "square") {
    // Merge horizontal runs to avoid hairline seams between squares.
    for (let r = 0; r < size; r++) {
      let c = 0;
      while (c < size) {
        if (!dark(r, c)) { c++; continue; }
        const start = c;
        while (c < size && dark(r, c)) c++;
        data += `M${start + q} ${r + q}h${c - start}v1h${start - c}Z`;
      }
    }
  } else {
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (dark(r, c))
          data += modulePath(opts.moduleShape, c + q, r + q, {
            up: dark(r - 1, c), down: dark(r + 1, c), left: dark(r, c - 1), right: dark(r, c + 1),
          });
  }

  let rings = "", centres = "";
  finders.forEach(([r, c]) => {
    const e = eyePath(opts.eyeStyle, c + q, r + q, 7);
    rings += e.ring; centres += e.centre;
  });
  alignments.forEach(([r, c]) => {
    const e = eyePath(opts.eyeStyle, c - 2 + q, r - 2 + q, 5);
    rings += e.ring; centres += e.centre;
  });

  let defs = "", dataFill = fg;
  if (opts.gradient) {
    const g1 = safeColor(opts.gradientFrom, fg), g2 = safeColor(opts.gradientTo, fg);
    const stops = `<stop offset="0" stop-color="${g1}"/><stop offset="1" stop-color="${g2}"/>`;
    defs +=
      opts.gradientType === "radial"
        ? `<radialGradient id="qr-grad" gradientUnits="userSpaceOnUse" cx="${total / 2}" cy="${total / 2}" r="${n(size * 0.72)}">${stops}</radialGradient>`
        : `<linearGradient id="qr-grad" gradientUnits="userSpaceOnUse" x1="${q}" y1="${q}" x2="${q + size}" y2="${q + size}">${stops}</linearGradient>`;
    dataFill = "url(#qr-grad)";
  }

  let logoMarkup = "";
  if (logo && includeLogo) {
    defs += `<clipPath id="qr-logo-clip"><rect x="${n(logo.x)}" y="${n(logo.y)}" width="${n(logo.side)}" height="${n(logo.side)}" rx="${n(logo.radius)}"/></clipPath>`;
    const href = String(opts.logoSrc).replace(/"/g, "%22");
    logoMarkup = `<image href="${href}" x="${n(logo.x)}" y="${n(logo.y)}" width="${n(logo.side)}" height="${n(logo.side)}" preserveAspectRatio="xMidYMid meet" clip-path="url(#qr-logo-clip)"/>`;
  }

  const rx = n((total * opts.cornerRadius) / 100);
  const background = opts.transparent ? "" : `<rect width="${total}" height="${total}" rx="${rx}" fill="${bg}"/>`;
  const px = opts.pixelSize ? ` width="${opts.pixelSize}" height="${opts.pixelSize}"` : "";

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}"${px} shape-rendering="${opts.moduleShape === "square" && opts.eyeStyle === "square" ? "crispEdges" : "geometricPrecision"}">` +
    (defs ? `<defs>${defs}</defs>` : "") +
    background +
    `<path d="${data}" fill="${dataFill}"/>` +
    `<path d="${rings}" fill="${eye}" fill-rule="evenodd"/>` +
    `<path d="${centres}" fill="${eye}"/>` +
    logoMarkup +
    `</svg>`
  );
}
