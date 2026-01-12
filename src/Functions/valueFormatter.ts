import type { defaultSettingsType } from "../Classes/settingsClass";
import type derivedSettingsClass from "../Classes/derivedSettingsClass";
import isNullOrUndefined from "./isNullOrUndefined";

const formatValues = function<T>(value: T, name: string,
                                        inputSettings: defaultSettingsType,
                                        derivedSettings: derivedSettingsClass): string {
  const suffix: string = derivedSettings.percentLabels ? "%" : "";
  const sig_figs: number = inputSettings.spc.sig_figs;
  if (isNullOrUndefined(value)) {
    return "";
  }
  switch (name) {
    case "date":
      return value as string;
    case "integer": {
      return (value as number).toFixed(derivedSettings.chart_type_props.integer_num_den ? 0 : sig_figs);
    }
    default:
      return (value as number).toFixed(sig_figs) + suffix;
  }
}

export default function valueFormatter(inputSettings: defaultSettingsType, derivedSettings: derivedSettingsClass) {
  const formatValuesImpl = function<T>(value: T, name: string): string {
    return formatValues(value, name, inputSettings, derivedSettings);
  }
  return formatValuesImpl;
}
