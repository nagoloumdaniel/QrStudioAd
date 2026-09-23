// Builds the text encoded in the QR code for each content type.
// Formats follow what phone camera apps (iOS, Google Lens, ZXing) recognise.

// Escape characters reserved by the MECARD-style WIFI: syntax.
const escapeWifi = (s = "") => String(s).replace(/([\\;,:"])/g, "\\$1");
// Escape characters reserved by vCard / iCalendar text values.
const escapeText = (s = "") => String(s).replace(/([\\;,])/g, "\\$1").replace(/\r?\n/g, "\\n");
const cleanPhone = (p = "") => p.replace(/[^\d+]/g, "");
const trim = (s) => (s || "").trim();

export function normalizeUrl(raw) {
  const v = trim(raw);
  if (!v) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return v;
  return `https://${v}`;
}

// "2026-05-01T10:30" -> "20260501T103000"
function toICalDate(v) {
  if (!v) return "";
  const [d, t = "00:00"] = v.split("T");
  return `${d.replace(/-/g, "")}T${t.replace(/:/g, "").padEnd(6, "0").slice(0, 6)}`;
}

function buildEmail(f) {
  const to = trim(f.email);
  if (!to) return "";
  const params = [];
  if (trim(f.subject)) params.push(`subject=${encodeURIComponent(f.subject)}`);
  if (trim(f.body)) params.push(`body=${encodeURIComponent(f.body)}`);
  return `mailto:${to}${params.length ? `?${params.join("&")}` : ""}`;
}

function buildWifi(f) {
  const ssid = f.ssid || "";
  if (!ssid) return "";
  const sec = f.wifiSec || "WPA";
  let out = `WIFI:T:${sec};S:${escapeWifi(ssid)};`;
  if (sec !== "nopass") out += `P:${escapeWifi(f.password)};`;
  if (f.hidden) out += "H:true;";
  return `${out};`;
}

function buildVCard(f) {
  const name = trim(f.name);
  if (!name && !trim(f.phone) && !trim(f.email)) return "";
  const parts = name.split(/\s+/);
  const last = parts.length > 1 ? parts.pop() : "";
  const first = parts.join(" ");
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${escapeText(last)};${escapeText(first)};;;`, `FN:${escapeText(name)}`];
  if (trim(f.org)) lines.push(`ORG:${escapeText(f.org)}`);
  if (trim(f.title)) lines.push(`TITLE:${escapeText(f.title)}`);
  if (trim(f.phone)) lines.push(`TEL;TYPE=CELL:${cleanPhone(f.phone)}`);
  if (trim(f.email)) lines.push(`EMAIL:${trim(f.email)}`);
  if (trim(f.website)) lines.push(`URL:${normalizeUrl(f.website)}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function buildEvent(f) {
  if (!trim(f.eventTitle) || !f.dtstart) return "";
  const lines = ["BEGIN:VEVENT", `SUMMARY:${escapeText(f.eventTitle)}`, `DTSTART:${toICalDate(f.dtstart)}`];
  if (f.dtend) lines.push(`DTEND:${toICalDate(f.dtend)}`);
  if (trim(f.location)) lines.push(`LOCATION:${escapeText(f.location)}`);
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

function buildGeo(f) {
  const lat = parseFloat(f.lat), lng = parseFloat(f.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return "";
  return `geo:${lat},${lng}`;
}

function buildCrypto(f) {
  const addr = trim(f.walletAddress);
  if (!addr) return "";
  const scheme = f.cryptoType || "bitcoin";
  const amount = trim(f.amount);
  return `${scheme}:${addr}${amount ? `?amount=${encodeURIComponent(amount)}` : ""}`;
}

export function buildPayload(type, f = {}) {
  switch (type) {
    case "url":    return normalizeUrl(f.url);
    case "text":   return f.text || "";
    case "email":  return buildEmail(f);
    case "phone":  return trim(f.phone) ? `tel:${cleanPhone(f.phone)}` : "";
    case "sms":    return trim(f.phone) ? `SMSTO:${cleanPhone(f.phone)}:${f.message || ""}` : "";
    case "wifi":   return buildWifi(f);
    case "vcard":  return buildVCard(f);
    case "event":  return buildEvent(f);
    case "geo":    return buildGeo(f);
    case "crypto": return buildCrypto(f);
    default:       return "";
  }
}
