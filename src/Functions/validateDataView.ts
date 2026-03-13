import type powerbi from "powerbi-visuals-api";
import settingsClass from "../Classes/settingsClass";
import isNullOrUndefined from "./isNullOrUndefined";

export default function validateDataView(inputDV: powerbi.DataView[], inputSettingsClass: settingsClass): string {
  // Show blank error messages for empty data or categories as settings are
  // bound to the input categories, and so cannot disable error messages
  if (isNullOrUndefined(inputDV?.[0]) || (inputDV?.[0]?.categorical?.categories?.[0]?.identity?.length === 0)) {
    return ""; //"No data present!";
  }
  if (isNullOrUndefined(inputDV[0]?.categorical?.categories) || !inputDV[0]?.categorical?.categories.some(d => d.source?.roles?.key)) {
    return ""; //"No grouping/ID variable passed!";
  }

  const numeratorsPresent: boolean
    = inputDV[0].categorical
                   ?.values
                   ?.some(d => d.source?.roles?.numerators);

  if (!numeratorsPresent) {
    return "No Numerators passed!";
  }

  let needs_denominator = false;
  let needs_sd = false;
  let denom_chart_type = "";
  let sd_chart_type = "";

  if (inputSettingsClass?.derivedSettings?.length > 0) {
    for (const d of inputSettingsClass.derivedSettings) {
      if (d.chart_type_props.needs_denominator) {
        denom_chart_type = denom_chart_type || d.chart_type_props.name;
        needs_denominator = true;
      }
      if (d.chart_type_props.needs_sd) {
        sd_chart_type = sd_chart_type || d.chart_type_props.name;
        needs_sd = true;
      }
    }
  }

  if (needs_denominator) {
    const denominatorsPresent: boolean
      = inputDV[0].categorical
                     ?.values
                     ?.some(d => d.source?.roles?.denominators);

    if (!denominatorsPresent) {
      return `Chart type '${denom_chart_type}' requires denominators!`;
    }
  }

  if (needs_sd) {
    const xbarSDPresent: boolean
      = inputDV[0].categorical
                     ?.values
                     ?.some(d => d.source?.roles?.xbar_sds);

    if (!xbarSDPresent) {
      return `Chart type '${sd_chart_type}' requires SDs!`;
    }
  }

  return "valid";
}
