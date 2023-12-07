import type powerbi from "powerbi-visuals-api";
import { validationErrorClass, type defaultSettingsType } from "../Classes";

export default function validateDataView(inputDV: powerbi.DataView[], inputSettings: defaultSettingsType) {
  if (!(inputDV?.[0])) {
    throw(new validationErrorClass("No data present"));
  }
  if (!(inputDV[0]?.categorical?.categories?.[0]?.values?.length > 0)) {
    throw(new validationErrorClass("No grouping/ID variable passed!"));
  }

  const numeratorsPresent: boolean
    = inputDV[0].categorical
                   ?.values
                   ?.some(d => d.source?.roles?.numerators);

  if (!numeratorsPresent) {
    throw(new validationErrorClass("No Numerators passed!"));
  }
  const chart_type: string = inputSettings.spc.chart_type;
  const denominatorRequired: string[] = ["p", "pp", "u", "up", "xbar", "s"];
  if (denominatorRequired.includes(chart_type)) {
    const denominatorsPresent: boolean
      = inputDV[0].categorical
                     ?.values
                     ?.some(d => d.source?.roles?.denominators);

    if (!denominatorsPresent) {
      throw(new validationErrorClass(`Chart type '${chart_type}' requires denominators!`));
    }
  }

  if (chart_type === "xbar") {
    const xbarSDPresent: boolean
      = inputDV[0].categorical
                     ?.values
                     ?.some(d => d.source?.roles?.xbar_sds);

    if (!xbarSDPresent) {
      throw(new validationErrorClass(`Chart type '${chart_type}' requires SDs!`));
    }
  }
}
