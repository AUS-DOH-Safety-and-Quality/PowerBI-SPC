import type powerbi from "powerbi-visuals-api";
import { settingsClass } from "../Classes";

export default function validateDataView(inputDV: powerbi.DataView[], inputSettingsClass: settingsClass): string {
  if (!(inputDV?.[0])) {
    return "No data present";
  }
  if (!(inputDV[0]?.categorical?.categories) || !(inputDV[0]?.categorical?.categories.some(d => d.source?.roles?.key))) {
    return "No grouping/ID variable passed!";
  }

  const numeratorsPresent: boolean
    = inputDV[0].categorical
                   ?.values
                   ?.some(d => d.source?.roles?.numerators);

  if (!numeratorsPresent) {
    return "No Numerators passed!";
  }

  let needs_denominator: boolean;
  let needs_sd: boolean;
  let chart_type: string;

  if (inputSettingsClass?.derivedSettingsGrouped) {
    inputSettingsClass?.derivedSettingsGrouped.forEach((d) => {
      if (d.chart_type_props.needs_denominator) {
        chart_type = d.chart_type_props.name;
        needs_denominator = true;
      }
      if (d.chart_type_props.needs_sd) {
        chart_type = d.chart_type_props.name;
        needs_sd = true;
      }
    });
  } else {
    chart_type = inputSettingsClass.settings.spc.chart_type;
    needs_denominator = inputSettingsClass.derivedSettings.chart_type_props.needs_denominator;
    needs_sd = inputSettingsClass.derivedSettings.chart_type_props.needs_sd;
  }

  if (needs_denominator) {
    const denominatorsPresent: boolean
      = inputDV[0].categorical
                     ?.values
                     ?.some(d => d.source?.roles?.denominators);

    if (!denominatorsPresent) {
      return `Chart type '${chart_type}' requires denominators!`;
    }
  }

  if (needs_sd) {
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
