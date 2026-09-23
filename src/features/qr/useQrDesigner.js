import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { DEFAULT_DESIGN } from "./constants";
import { buildPayload } from "./lib/payload";
import { createMatrix } from "./lib/matrix";
import { buildSvg } from "./lib/svg";
import { runScanChecks } from "./lib/scanCheck";

/** All generator state + derived QR output in one place. */
export function useQrDesigner() {
  const [contentType, setContentType] = useState("url");
  // Fields are kept per type so switching tabs doesn't lose input.
  const [fieldsByType, setFieldsByType] = useState({ url: { url: "https://example.com" } });
  const [design, setDesign] = useState(DEFAULT_DESIGN);

  const fields = fieldsByType[contentType] || {};
  const setField = useCallback(
    (key, value) =>
      setFieldsByType((all) => ({ ...all, [contentType]: { ...all[contentType], [key]: value } })),
    [contentType],
  );
  const update = useCallback((patch) => setDesign((d) => ({ ...d, ...patch })), []);

  const payload = useMemo(() => buildPayload(contentType, fields), [contentType, fields]);
  const ecl = design.ecLevel === "auto" ? (design.logoSrc ? "H" : "M") : design.ecLevel;

  // Defer the heavy work so sliders and color pickers stay responsive.
  const input = useMemo(() => ({ payload, design, ecl }), [payload, design, ecl]);
  const deferred = useDeferredValue(input);

  const result = useMemo(() => {
    const { payload: text, design: opts, ecl: level } = deferred;
    if (!text) return { state: "empty" };
    try {
      const matrix = createMatrix(text, level);
      return {
        state: "ready",
        matrix,
        svg: buildSvg(matrix, opts),
        scan: runScanChecks(matrix, opts, level),
      };
    } catch {
      return { state: "error", level };
    }
  }, [deferred]);

  return {
    contentType, setContentType,
    fields, setField,
    design, update,
    payload, ecl,
    result,
    isStale: deferred !== input,
  };
}
