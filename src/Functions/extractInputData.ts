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
  categories: DataViewCategoryColumn;
  groupings: string[];
  groupingIndexes: number[];
  scatter_formatting: defaultSettingsType["scatter"][];
  tooltips: VisualTooltipDataItem[][];
  warningMessage: string;
}

export default function extractInputData(inputView: DataViewCategorical, inputSettings: defaultSettingsType): dataObject {
  const numerators: number[] = extractDataColumn<number[]>(inputView, "numerators", inputSettings);
  const denominators: number[] = extractDataColumn<number[]>(inputView, "denominators", inputSettings);
  const xbar_sds: number[] = extractDataColumn<number[]>(inputView, "xbar_sds", inputSettings);
  const keys: string[] = extractDataColumn<string[]>(inputView, "key", inputSettings);
  const scatter_cond = extractConditionalFormatting(inputView, "scatter", inputSettings) as defaultSettingsType["scatter"][];
  const tooltips = extractDataColumn<VisualTooltipDataItem[][]>(inputView, "tooltips", inputSettings);
  const groupings: string[] = extractDataColumn<string[]>(inputView, "groupings", inputSettings);
  const highlights: powerbi.PrimitiveValue[] = inputView.values[0].highlights;

  const inputValidStatus: string[] = validateInputData(keys, numerators, denominators, xbar_sds, groupings, inputSettings.spc.chart_type);

  const valid_ids: number[] = new Array<number>();
  const valid_keys: { x: number, id: number, label: string }[] = new Array<{ x: number, id: number, label: string }>();
  const removalMessages: string[] = new Array<string>();
  const groupVarName: string = inputView.categories[0].source.displayName;
  let valid_x: number = 0;
  for (let i: number = 0; i < numerators.length; i++) {
    if (inputValidStatus[i] === "") {
      valid_ids.push(i);
      valid_keys.push({ x: valid_x, id: i, label: keys[i] })
      valid_x += 1;
    } else {
      removalMessages.push(`${groupVarName} ${keys[i]} removed due to: ${inputValidStatus[i]}.`)
    }
  }
  
  const valid_groupings: string[] = extractValues(groupings, valid_ids);
  const groupingIndexes: number[] = new Array<number>();
  let current_grouping: string = valid_groupings[0];
  valid_groupings.forEach((d, idx) => {
    if (d !== current_grouping) {
      groupingIndexes.push(idx - 1);
      current_grouping = d;
    }
  })
  
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
    groupings: valid_groupings,
    groupingIndexes: groupingIndexes,
    scatter_formatting: extractValues(scatter_cond, valid_ids),
    warningMessage: removalMessages.length >0 ? removalMessages.join("\n") : ""
  }
}
