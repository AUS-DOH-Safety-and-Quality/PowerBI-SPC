import type powerbi from "powerbi-visuals-api";
import type { defaultSettingsType } from "../Classes";

export default function validateDataView(inputDV: powerbi.DataView[], inputSettings: defaultSettingsType) {
  if (!(inputDV?.at(0))) {
    throw("No data present");
  }
  if (!(inputDV.at(0)?.categorical?.categories?.at(0)?.values?.length > 0)) {
    throw("Error: No grouping/ID variable passed!");
  }

  const numeratorsPresent: boolean
    = inputDV.at(0).categorical
                   ?.values
                   ?.some(d => d.source?.roles?.numerators);

  if (!numeratorsPresent) {
    throw("Error: No Numerators passed!");
  }
  const chart_type: string = inputSettings.spc.chart_type;
  const denominatorRequired: string[] = ["p", "pp", "u", "up", "xbar", "s"];
  if (denominatorRequired.includes(chart_type)) {
    const denominatorsPresent: boolean
      = inputDV.at(0).categorical
                     ?.values
                     ?.some(d => d.source?.roles?.denominators);

    if (!denominatorsPresent) {
      throw(`Error: Chart type '${chart_type}' requires denominators!`);
    }
  }

  if (chart_type === "xbar") {
    const xbarSDPresent: boolean
      = inputDV.at(0).categorical
                     ?.values
                     ?.some(d => d.source?.roles?.xbar_sds);

    if (!xbarSDPresent) {
      throw(`Error: Chart type '${chart_type}' requires SDs!`);
    }
  }
}
