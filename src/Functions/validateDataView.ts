import type powerbi from "powerbi-visuals-api";
import { settingsClass } from "../Classes";

export default function validateDataView(inputDV: powerbi.DataView[], inputSettingsClass: settingsClass): string {
  if (!(inputDV?.[0])) {
    return "No data present";
  }
  if (!(inputDV[0]?.categorical?.categories)) {
    return "No grouping/ID variable passed!";
  }

  const numeratorsPresent: boolean
    = inputDV[0].categorical
                   ?.values
                   ?.some(d => d.source?.roles?.numerators);

  if (!numeratorsPresent) {
    return "No Numerators passed!";
  }
  const chart_type: string = inputSettingsClass.settings.spc.chart_type;
  if (inputSettingsClass.derivedSettings.chart_type_props.needs_denominator) {
    const denominatorsPresent: boolean
      = inputDV[0].categorical
                     ?.values
                     ?.some(d => d.source?.roles?.denominators);

    if (!denominatorsPresent) {
      return `Chart type '${chart_type}' requires denominators!`;
    }
  }

  if (inputSettingsClass.derivedSettings.chart_type_props.needs_sd) {
    const xbarSDPresent: boolean
      = inputDV[0].categorical
                     ?.values
                     ?.some(d => d.source?.roles?.xbar_sds);

    if (!xbarSDPresent) {
      return `Chart type '${chart_type}' requires SDs!`;
    }
  }

  return "valid";
}
