import type { RoleColumns } from "powerbi-visuals-core/powerbi";
import type powerbi from "powerbi-visuals-api";
import settingsClass from "../Classes/settingsClass";

/** Chart-type requirements only; the presence of data, keys and numerators is checked by Core first */
export default function validateDataViewColumns(inputSettingsClass: settingsClass, valueColumns: RoleColumns<powerbi.DataViewValueColumn>): string {
  let needs_denominator: boolean = false;
  let needs_sd: boolean = false;
  let chart_type: string = inputSettingsClass.settings[0].spc.chart_type;

  if (inputSettingsClass.derivedSettings.length > 0) {
    for (let i = 0; i < inputSettingsClass.derivedSettings.length; i++) {
      const d = inputSettingsClass.derivedSettings[i];
      if (d.chart_type_props.needs_denominator) {
        chart_type = d.chart_type_props.name;
        needs_denominator = true;
      }
      if (d.chart_type_props.needs_sd) {
        chart_type = d.chart_type_props.name;
        needs_sd = true;
      }
    }
  } else {
    chart_type = inputSettingsClass.settings[0].spc.chart_type;
    needs_denominator = inputSettingsClass.derivedSettings[0].chart_type_props.needs_denominator;
    needs_sd = inputSettingsClass.derivedSettings[0].chart_type_props.needs_sd;
  }

  if (needs_denominator) {
    if (valueColumns.denominators === undefined) {
      return `Chart type '${chart_type}' requires denominators!`;
    }
  }

  if (needs_sd) {
    if (valueColumns.xbar_sds === undefined) {
      return `Chart type '${chart_type}' requires SDs!`;
    }
  }

  return "valid";
}
