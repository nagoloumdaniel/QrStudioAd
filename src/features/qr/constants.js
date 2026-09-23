import { Bitcoin, CalendarDays, Contact, Link2, Mail, MapPin, MessageSquareText, Phone, Type, Wifi } from "lucide-react";

// Labels live in src/i18n (types.*, shapes.*, presets.*, ec.*).

export const CONTENT_TYPES = [
  { id: "url", icon: Link2 },
  { id: "text", icon: Type },
  { id: "wifi", icon: Wifi },
  { id: "vcard", icon: Contact },
  { id: "email", icon: Mail },
  { id: "phone", icon: Phone },
  { id: "sms", icon: MessageSquareText },
  { id: "event", icon: CalendarDays },
  { id: "geo", icon: MapPin },
  { id: "crypto", icon: Bitcoin },
];

export const MODULE_SHAPES = ["square", "rounded", "fluid", "dots", "leaf"];

export const EYE_STYLES = ["square", "rounded", "leaf"];

export const COLOR_PRESETS = [
  { name: "Ink", fg: "#111111", eye: "#111111", bg: "#ffffff" },
  { name: "Navy", fg: "#1b2a4a", eye: "#0f172a", bg: "#ffffff" },
  { name: "Forest", fg: "#1f4d3a", eye: "#143326", bg: "#f4f8f5" },
  { name: "Plum", fg: "#4a1f45", eye: "#2e1030", bg: "#fbf6fa" },
  { name: "Rust", fg: "#8a3413", eye: "#5c200a", bg: "#fff8f3" },
];

export const EC_LEVELS = ["auto", "L", "M", "Q", "H"];

export const EXPORT_SIZES = [512, 1024, 2048, 4096];

export const DEFAULT_DESIGN = {
  moduleShape: "square",
  eyeStyle: "square",
  fgColor: "#111111",
  eyeColor: "#111111",
  bgColor: "#ffffff",
  transparent: false,
  gradient: false,
  gradientType: "linear",
  gradientFrom: "#1b2a4a",
  gradientTo: "#1f4d3a",
  logoSrc: null,
  logoName: "",
  logoSize: 20,
  logoRadius: 20,
  quietZone: 4,
  cornerRadius: 0,
  ecLevel: "auto",
};
