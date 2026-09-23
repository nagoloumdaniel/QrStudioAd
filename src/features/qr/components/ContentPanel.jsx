import { useState } from "react";
import { LocateFixed } from "lucide-react";
import { CONTENT_TYPES } from "../constants";
import { SelectInput, Switch, TextInput } from "../../../components/ui/controls";
import { useI18n } from "../../../i18n/I18nProvider";

function TypePicker({ value, onChange }) {
  const { t } = useI18n();
  return (
    <div role="radiogroup" aria-label={t("types.label")} className="grid grid-cols-3 gap-1.5 min-[360px]:grid-cols-4 sm:grid-cols-5">
      {CONTENT_TYPES.map(({ id, icon: Icon }) => {
        const active = id === value;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={`flex min-w-0 flex-col items-center gap-1.5 rounded-lg border px-1 py-2.5 text-[11px] font-medium sm:text-xs transition-colors ${
              active
                ? "border-ink bg-ink text-bg"
                : "border-line bg-surface text-muted hover:border-subtle hover:text-ink"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
            <span className="w-full truncate text-center">{t(`types.${id}`)}</span>
          </button>
        );
      })}
    </div>
  );
}

function LocationButton({ onLocate }) {
  const { t } = useI18n();
  const [state, setState] = useState("idle");
  if (!("geolocation" in navigator)) return null;
  const locate = () => {
    setState("busy");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        onLocate(p.coords.latitude.toFixed(6), p.coords.longitude.toFixed(6));
        setState("idle");
      },
      () => setState("denied"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={locate}
        disabled={state === "busy"}
        className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-subtle disabled:opacity-60"
      >
        <LocateFixed className="h-4 w-4" strokeWidth={1.8} aria-hidden />
        {state === "busy" ? t("fields.locating") : t("fields.locate")}
      </button>
      {state === "denied" && <p className="text-xs text-danger">{t("fields.locateDenied")}</p>}
    </div>
  );
}

function Fields({ type, fields, set }) {
  const { t: tr } = useI18n();
  const t = (key, labelKey, props = {}) => (
    <TextInput key={key} label={tr(`fields.${labelKey}`)} value={fields[key]} onChange={(v) => set(key, v)} {...props} />
  );

  switch (type) {
    case "url":
      return t("url", "url", { type: "url", inputMode: "url", placeholder: "example.com", hint: tr("fields.urlHint") });
    case "text":
      return t("text", "text", { multiline: true, placeholder: tr("fields.textPh") });
    case "wifi":
      return (
        <>
          {t("ssid", "ssid", { placeholder: tr("fields.ssidPh"), autoComplete: "off" })}
          {fields.wifiSec !== "nopass" && t("password", "password", { autoComplete: "off", spellCheck: false })}
          <SelectInput
            label={tr("fields.security")}
            value={fields.wifiSec || "WPA"}
            onChange={(v) => set("wifiSec", v)}
            options={[
              { value: "WPA", label: "WPA / WPA2 / WPA3" },
              { value: "WEP", label: "WEP" },
              { value: "nopass", label: tr("fields.secNone") },
            ]}
          />
          <Switch label={tr("fields.hidden")} description={tr("fields.hiddenDesc")} checked={!!fields.hidden} onChange={(v) => set("hidden", v)} />
        </>
      );
    case "vcard":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {t("name", "name", { placeholder: "Jeanne Dupont", autoComplete: "name" })}
          {t("phone", "phone", { type: "tel", placeholder: "+33 6 12 34 56 78" })}
          {t("email", "email", { type: "email", placeholder: "jeanne@studio.fr" })}
          {t("org", "org")}
          {t("title", "jobTitle")}
          {t("website", "website", { type: "url", inputMode: "url" })}
        </div>
      );
    case "email":
      return (
        <>
          {t("email", "sendTo", { type: "email", placeholder: "hello@studio.fr" })}
          {t("subject", "subject")}
          {t("body", "message", { multiline: true })}
        </>
      );
    case "phone":
      return t("phone", "phoneNumber", { type: "tel", placeholder: "+33 6 12 34 56 78", hint: tr("fields.phoneHint") });
    case "sms":
      return (
        <>
          {t("phone", "phoneNumber", { type: "tel", placeholder: "+33 6 12 34 56 78" })}
          {t("message", "message", { multiline: true })}
        </>
      );
    case "event":
      return (
        <>
          {t("eventTitle", "eventName", { placeholder: tr("fields.eventPh") })}
          <div className="grid gap-4 sm:grid-cols-2">
            {t("dtstart", "starts", { type: "datetime-local" })}
            {t("dtend", "ends", { type: "datetime-local" })}
          </div>
          {t("location", "place")}
        </>
      );
    case "geo":
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {t("lat", "lat", { inputMode: "decimal", placeholder: "48.8566" })}
            {t("lng", "lng", { inputMode: "decimal", placeholder: "2.3522" })}
          </div>
          <LocationButton onLocate={(lat, lng) => { set("lat", lat); set("lng", lng); }} />
        </>
      );
    case "crypto":
      return (
        <>
          <SelectInput
            label={tr("fields.currency")}
            value={fields.cryptoType || "bitcoin"}
            onChange={(v) => set("cryptoType", v)}
            options={["bitcoin", "ethereum", "litecoin", "monero", "solana"].map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))}
          />
          {t("walletAddress", "wallet", { spellCheck: false, autoComplete: "off" })}
          {t("amount", "amount", { inputMode: "decimal", placeholder: "0.001" })}
        </>
      );
    default:
      return null;
  }
}

export function ContentPanel({ type, onTypeChange, fields, setField }) {
  return (
    <div className="space-y-5">
      <TypePicker value={type} onChange={onTypeChange} />
      <div className="space-y-4">
        <Fields type={type} fields={fields} set={setField} />
      </div>
    </div>
  );
}
