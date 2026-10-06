import type { settingsValueType } from "../settings";
import type derivedSettingsClass from "../Classes/derivedSettingsClass";
import { formatNumber } from "powerbi-visuals-core/data";

export default function valueFormatter(settings: settingsValueType, derivedSettings: derivedSettingsClass) {
  const decimalPlaces = settings.spc.sig_figs;
  const integerPlaces = (derivedSettings.chart_type_props.integer_num_den ? 0 : decimalPlaces);
  const suffix = derivedSettings.percentLabels ? "%" : "";
  return (value: number | undefined, name: "integer" | "value"): string =>
    formatNumber(value, name === "integer" ? integerPlaces : decimalPlaces, name === "integer" ? "" : suffix) ?? "";
}
