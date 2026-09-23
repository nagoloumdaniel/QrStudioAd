import { buildSvg, logoBox } from "./svg";

const MIME = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

function triggerDownload(href, filename) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Rasterises the code onto a canvas. The logo is drawn directly on the
 * canvas (not through the SVG) because Safari does not reliably paint
 * images nested inside an SVG that is itself drawn as an image.
 */
async function toCanvas(matrix, opts, px, format) {
  const svg = buildSvg(matrix, { ...opts, pixelSize: px }, { includeLogo: false });
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = px;
    const ctx = canvas.getContext("2d");
    if (format === "jpg" && opts.transparent) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, px, px);
    }
    ctx.drawImage(img, 0, 0, px, px);

    const box = logoBox(matrix, opts);
    if (box) {
      const logo = await loadImage(opts.logoSrc);
      const unit = px / (matrix.size + opts.quietZone * 2);
      const x = box.x * unit, side = box.side * unit;
      const scale = Math.min(side / logo.width, side / logo.height);
      const w = logo.width * scale, h = logo.height * scale;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, x, side, side, box.radius * unit);
      ctx.clip();
      ctx.drawImage(logo, x + (side - w) / 2, x + (side - h) / 2, w, h);
      ctx.restore();
    }
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const canvasToBlob = (canvas, type) =>
  new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), type, 0.95),
  );

export async function downloadQr(matrix, opts, { format, size, filename }) {
  const name = `${filename || "qr-code"}.${format}`;
  if (format === "svg") {
    const svg = buildSvg(matrix, { ...opts, pixelSize: size });
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    triggerDownload(url, name);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  const canvas = await toCanvas(matrix, opts, size, format);
  const blob = await canvasToBlob(canvas, MIME[format]);
  const url = URL.createObjectURL(blob);
  triggerDownload(url, name);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const canCopyImage = () =>
  typeof window !== "undefined" && !!navigator.clipboard?.write && typeof window.ClipboardItem !== "undefined";

export async function copyQrImage(matrix, opts, size) {
  const blob = toCanvas(matrix, opts, size, "png").then((c) => canvasToBlob(c, "image/png"));
  await navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]);
}
