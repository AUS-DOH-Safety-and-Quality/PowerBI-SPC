import type powerbi from "powerbi-visuals-api"
type DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
type PrimitiveValue = powerbi.PrimitiveValue;
type DataViewCategorical = powerbi.DataViewCategorical;
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import { extractDataColumn, extractValues, extractConditionalFormatting, validateInputData } from "../Functions"
import { type defaultSettingsType, type controlLimitsArgs } from "../Classes";

export type dataObject = {
  limitInputArgs: controlLimitsArgs;
  highlights: PrimitiveValue[];
  anyHighlights: boolean;
  percentLabels: boolean;
  categories: DataViewCategoryColumn;
  scatter_formatting: defaultSettingsType["scatter"][];
  tooltips: VisualTooltipDataItem[][];
}

export default function extractInputData(inputView: DataViewCategorical, inputSettings: defaultSettingsType): dataObject {
  const numerators: number[] = extractDataColumn<number[]>(inputView, "numerators", inputSettings);
  const denominators: number[] = extractDataColumn<number[]>(inputView, "denominators", inputSettings);
  const xbar_sds: number[] = extractDataColumn<number[]>(inputView, "xbar_sds", inputSettings);
  const keys: string[] = extractDataColumn<string[]>(inputView, "key", inputSettings);
  const scatter_cond = extractConditionalFormatting(inputView, "scatter", inputSettings) as defaultSettingsType["scatter"][];
  const tooltips = extractDataColumn<VisualTooltipDataItem[][]>(inputView, "tooltips", inputSettings);
  const highlights: powerbi.PrimitiveValue[] = inputView.values[0].highlights;

  const validInputs: boolean[] = validateInputData(keys, numerators, denominators, xbar_sds, inputSettings.spc.chart_type);

  const valid_ids: number[] = new Array<number>();
  const valid_keys: { x: number, id: number, label: string }[] = new Array<{ x: number, id: number, label: string }>();

  let valid_x: number = 0;
  for (let i: number = 0; i < numerators.length; i++) {
    if (validInputs[i]) {
      valid_ids.push(i);
      valid_keys.push({ x: valid_x, id: i, label: keys[i] })
      valid_x += 1;
    }
  }

  let percent_labels: boolean;
  if (inputSettings.spc.perc_labels === "Automatic") {
    percent_labels = ["p", "pp"].includes(inputSettings.spc.chart_type) && (inputSettings.spc.multiplier === 1 || inputSettings.spc.multiplier === 100);
  } else {
    percent_labels = inputSettings.spc.perc_labels === "Yes";
  }

  return {
    limitInputArgs: {
      keys: valid_keys,
      numerators: extractValues(numerators, valid_ids),
      denominators: extractValues(denominators, valid_ids),
      xbar_sds: extractValues(xbar_sds, valid_ids),
      outliers_in_limits: false,
    },
    tooltips: extractValues(tooltips, valid_ids),
    highlights: extractValues(highlights, valid_ids),
    anyHighlights: highlights != null,
    categories: inputView.categories[0],
    percentLabels: percent_labels,
    scatter_formatting: extractValues(scatter_cond, valid_ids),
  }
}
