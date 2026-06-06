import type powerbi from "powerbi-visuals-api"
type DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
type PrimitiveValue = powerbi.PrimitiveValue;
type DataViewCategorical = powerbi.DataViewCategorical;
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import extractDataColumn from "../Functions/extractDataColumn";
import extractValues from "../Functions/extractValues";
import extractConditionalFormatting from "../Functions/extractConditionalFormatting";
import validateInputData from "../Functions/validateInputData";
import isNullOrUndefined from "../Functions/isNullOrUndefined";
import seq from "../Functions/seq";
import between from "../Functions/between";
import type { settingsValueType } from "../settings";
import type { controlLimitsArgs } from "../Classes/viewModelClass";
import type derivedSettingsClass from "../Classes/derivedSettingsClass";
import type { ValidationT } from "./validateInputData";

export interface dataObject {
  limitInputArgs: controlLimitsArgs;
  spcSettings: settingsValueType["spc"];
  highlights?: PrimitiveValue[];
  anyHighlights: boolean;
  categories: DataViewCategoryColumn;
  groupings?: string[];
  groupingIndexes?: number[];
  scatter_formatting: settingsValueType["scatter"][];
  line_formatting: settingsValueType["lines"][];
  label_formatting: settingsValueType["labels"][];
  tooltips?: VisualTooltipDataItem[][];
  labels?: string[];
  anyLabels: boolean;
  warningMessage: string;
  alt_targets?: number[];
  speclimits_lower?: number[];
  speclimits_upper?: number[];
  validationStatus: ValidationT;
}

function invalidInputData(inputValidStatus: ValidationT): dataObject {
  return {
    limitInputArgs: {} as controlLimitsArgs,
    spcSettings: {} as settingsValueType["spc"],
    highlights: [],
    anyHighlights: false,
    categories: {} as DataViewCategoryColumn,
    groupings: [],
    groupingIndexes: [],
    scatter_formatting: [],
    line_formatting: [],
    label_formatting: [],
    tooltips: [],
    labels: [],
    anyLabels: false,
    warningMessage: inputValidStatus.error!,
    alt_targets: [],
    speclimits_lower: [],
    speclimits_upper: [],
    validationStatus: inputValidStatus
  }
}

export default function extractInputData(inputView: DataViewCategorical,
                                          inputSettings: settingsValueType,
                                          derivedSettings: derivedSettingsClass,
                                          validationMessages: string[][],
                                          idxs: number[]): dataObject {
  const numerators: (number | undefined)[] = extractDataColumn<number[]>(inputView, "numerators", inputSettings, idxs) as (number | undefined)[];
  const denominators: (number | undefined)[] | undefined = extractDataColumn<number[]>(inputView, "denominators", inputSettings, idxs);
  const xbar_sds: (number | undefined)[] | undefined = extractDataColumn<number[]>(inputView, "xbar_sds", inputSettings, idxs);
  const keys: (string | undefined)[] = extractDataColumn<string[]>(inputView, "key", inputSettings, idxs) as (string | undefined)[];
  const tooltips = extractDataColumn<VisualTooltipDataItem[][]>(inputView, "tooltips", inputSettings, idxs);
  const groupings: (string | undefined)[] | undefined = extractDataColumn<string[]>(inputView, "groupings", inputSettings, idxs);
  const labels: (string | undefined)[] | undefined = extractDataColumn<string[]>(inputView, "labels", inputSettings, idxs);
  const highlights: (powerbi.PrimitiveValue | undefined)[] | undefined = isNullOrUndefined(inputView?.values?.[0]?.highlights) ? undefined : idxs.map(d => inputView?.values?.[0]?.highlights?.[d]);

  const scatter_cond = extractConditionalFormatting<settingsValueType["scatter"]>(inputView, "scatter", inputSettings, idxs)?.values as settingsValueType["scatter"][];
  const lines_cond = extractConditionalFormatting<settingsValueType["lines"]>(inputView, "lines", inputSettings, idxs)?.values as settingsValueType["lines"][];
  const labels_cond = extractConditionalFormatting<settingsValueType["labels"]>(inputView, "labels", inputSettings, idxs)?.values as settingsValueType["labels"][];

  const alt_targets: (number | undefined)[] | undefined = inputSettings.lines.show_alt_target ? lines_cond.map(d => d.alt_target) : undefined;
  const speclimits_lower: (number | undefined)[] | undefined = inputSettings.lines.show_specification ? lines_cond.map(d => d.specification_lower) : undefined;
  const speclimits_upper: (number | undefined)[] | undefined = inputSettings.lines.show_specification ? lines_cond.map(d => d.specification_upper) : undefined;

  const spcSettings: settingsValueType["spc"][] = extractConditionalFormatting<settingsValueType["spc"]>(inputView, "spc", inputSettings, idxs)?.values as settingsValueType["spc"][];
  const inputValidStatus: ValidationT = validateInputData(keys, numerators, denominators, xbar_sds, derivedSettings.chart_type_props, idxs);
  if (inputValidStatus.status !== 0) {
    return invalidInputData(inputValidStatus);
  }

  const valid_ids: number[] = new Array<number>();
  const valid_keys: { x: number, id: number, label: string }[] = new Array<{ x: number, id: number, label: string }>();
  const removalMessages: string[] = new Array<string>();
  const groupVarName: string = inputView.categories![0].source.displayName;
  const settingsMessages = validationMessages;
  let valid_x = 0;
  const x_axis_use_date: boolean = derivedSettings.chart_type_props.x_axis_use_date;
  idxs.forEach((i, idx) => {
    if (inputValidStatus.messages[idx] === "") {
      valid_ids.push(idx);
      valid_keys.push({ x: valid_x, id: i, label: x_axis_use_date ? keys![idx] as string : valid_x.toString() });
      valid_x += 1;

      if (settingsMessages[i].length > 0) {
        settingsMessages[i].forEach(setting_removal_message => {
          removalMessages.push(
            `Conditional formatting for ${groupVarName} ${keys![idx]} ignored due to: ${setting_removal_message}.`
          )}
        );
      }
    } else {
      removalMessages.push(`${groupVarName} ${keys![idx]} removed due to: ${inputValidStatus.messages[idx]}.`)
    }
  })

  let groupingIndexes: number[] | undefined = undefined;
  const valid_groupings: string[] | undefined = isNullOrUndefined(groupings) ? undefined : extractValues(groupings, valid_ids) as string[];
  if (!isNullOrUndefined(valid_groupings)) {
    let current_grouping: string = valid_groupings[0];
    groupingIndexes = new Array<number>();
    valid_groupings.forEach((d, idx) => {
      if (d !== current_grouping) {
        groupingIndexes!.push(idx - 1);
        current_grouping = d;
      }
    })
  }

  const valid_alt_targets: number[] | undefined = isNullOrUndefined(alt_targets) ? undefined : extractValues(alt_targets, valid_ids);
  if (inputSettings.nhs_icons.show_assurance_icons) {
    const alt_targets_length: number = valid_alt_targets?.length ?? 0;
    if (alt_targets_length > 0) {
      const last_target: number | undefined = valid_alt_targets?.[alt_targets_length - 1];
      if (isNullOrUndefined(last_target)) {
        removalMessages.push("NHS Assurance icon requires a valid alt. target at last observation.")
      }
    }

    if (!derivedSettings.chart_type_props.has_control_limits) {
      removalMessages.push("NHS Assurance icon requires chart with control limits.")
    }
  }

  const curr_highlights = isNullOrUndefined(highlights) ? undefined : extractValues(highlights, valid_ids);
  const num_points_subset: number | undefined = spcSettings[0].num_points_subset;
  let subset_points: number[];
  if (isNullOrUndefined(num_points_subset) || !between(num_points_subset, 1, valid_ids.length)) {
    subset_points = seq(0, valid_ids.length - 1);
  } else {
    if (spcSettings[0].subset_points_from === "Start") {
      subset_points = seq(0, spcSettings[0].num_points_subset! - 1);
    } else {
      subset_points = seq(valid_ids.length - spcSettings[0].num_points_subset!, valid_ids.length - 1);
    }
  }
  const valid_labels: string[] | undefined = isNullOrUndefined(labels) ? undefined : extractValues(labels, valid_ids) as string[];
  return {
    limitInputArgs: {
      keys: valid_keys,
      numerators: extractValues(numerators, valid_ids) as number[],
      denominators: isNullOrUndefined(denominators) ? undefined : extractValues(denominators, valid_ids),
      xbar_sds: isNullOrUndefined(xbar_sds) ? undefined : extractValues(xbar_sds, valid_ids),
      outliers_in_limits: spcSettings[0].outliers_in_limits,
      subset_points: subset_points
    },
    spcSettings: spcSettings[0],
    tooltips: isNullOrUndefined(tooltips) ? undefined : extractValues(tooltips, valid_ids),
    labels: valid_labels,
    anyLabels: !isNullOrUndefined(valid_labels) && valid_labels.filter(d => !isNullOrUndefined(d) && d !== "").length > 0,
    highlights: curr_highlights,
    anyHighlights: !isNullOrUndefined(curr_highlights) && curr_highlights.filter(d => !isNullOrUndefined(d)).length > 0,
    categories: inputView.categories![0],
    groupings: valid_groupings,
    groupingIndexes: groupingIndexes,
    scatter_formatting: extractValues(scatter_cond, valid_ids),
    line_formatting: extractValues(lines_cond, valid_ids),
    label_formatting: extractValues(labels_cond, valid_ids),
    warningMessage: removalMessages.length > 0 ? removalMessages.join("\n") : "",
    alt_targets: valid_alt_targets,
    speclimits_lower: isNullOrUndefined(speclimits_lower) ? speclimits_lower : extractValues(speclimits_lower, valid_ids),
    speclimits_upper: isNullOrUndefined(speclimits_upper) ? speclimits_upper : extractValues(speclimits_upper, valid_ids),
    validationStatus: inputValidStatus
  }
}
