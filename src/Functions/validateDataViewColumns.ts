import type { RoleColumns } from "powerbi-visuals-core/powerbi";
import type powerbi from "powerbi-visuals-api";
import settingsClass from "../Classes/settingsClass";

/** Chart-type requirements only; the presence of data, keys and numerators is checked by Core first */
export default function validateDataViewColumns(inputSettingsClass: settingsClass, valueColumns: RoleColumns<powerbi.DataViewValueColumn>): string {
  for (let i = 0; i < inputSettingsClass.derivedSettings.length; i++) {
    const props = inputSettingsClass.derivedSettings[i].chart_type_props;
    if (props.needs_denominator && valueColumns.denominators === undefined) {
      return `Chart type '${props.name}' requires denominators!`;
    }
    if (props.needs_sd && valueColumns.xbar_sds === undefined) {
      return `Chart type '${props.name}' requires SDs!`;
    }
  }
  return "valid";
}
