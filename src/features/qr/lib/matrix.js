import QRCode from "qrcode";

// Alignment pattern centre coordinates (ISO/IEC 18004, Annex E).
function alignmentPositions(version) {
  if (version === 1) return [];
  const count = Math.floor(version / 7) + 2;
  const size = version * 4 + 17;
  const step = size === 145 ? 26 : Math.ceil((size - 13) / (2 * count - 2)) * 2;
  const pos = [size - 7];
  for (let i = 1; i < count - 1; i++) pos.push(pos[i - 1] - step);
  pos.push(6);
  return pos.reverse();
}

/**
 * Encodes `text` with a battle-tested encoder (qrcode) and returns
 * the module grid plus the positions of the structural patterns so
 * the renderer can style them separately.
 */
export function createMatrix(text, errorCorrectionLevel) {
  const qr = QRCode.create(text, { errorCorrectionLevel });
  const { size, data } = qr.modules;

  const finders = [
    [0, 0],
    [0, size - 7],
    [size - 7, 0],
  ];

  const alignments = [];
  const ap = alignmentPositions(qr.version);
  for (const r of ap) {
    for (const c of ap) {
      const onFinder = (r < 9 && c < 9) || (r < 9 && c > size - 10) || (r > size - 10 && c < 9);
      if (!onFinder) alignments.push([r, c]);
    }
  }

  return {
    size,
    version: qr.version,
    isDark: (r, c) => data[r * size + c] === 1,
    finders,
    alignments,
  };
}
