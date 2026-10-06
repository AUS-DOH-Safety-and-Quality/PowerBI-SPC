import type powerbi from "powerbi-visuals-api";
import { formatPrimitiveValue, readSettingsRows, type RoleColumns } from "powerbi-visuals-core/powerbi";
import extractKeys from "./extractKeys";
import validateInputData, { type ValidationT } from "./validateInputData";
import settingsModel, { defaultSettings, type settingsValueType } from "../settings";
import type { controlLimitsArgs } from "../Classes/viewModelClass";
import type derivedSettingsClass from "../Classes/derivedSettingsClass";

type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
export type InputColumns = {
  categories: RoleColumns<powerbi.DataViewCategoryColumn>;
  values: RoleColumns<powerbi.DataViewValueColumn>;
};

export type dataObject = {
  limitInputArgs: Omit<controlLimitsArgs, "subset_points">;
  spcSettings: settingsValueType["spc"];
  highlights: (Exclude<powerbi.PrimitiveValue, null> | undefined)[] | undefined;
  anyHighlights: boolean;
  categories: powerbi.DataViewCategoryColumn;
  groupings: (string | undefined)[] | undefined;
  groupingIndexes: number[] | undefined;
  scatter_formatting: settingsValueType["scatter"][];
  line_formatting: settingsValueType["lines"][];
  label_formatting: settingsValueType["labels"][];
  tooltips: VisualTooltipDataItem[][] | undefined;
  labels: (string | undefined)[] | undefined;
  anyLabels: boolean;
  warningMessage: string;
  alt_targets: (number | undefined)[] | undefined;
  speclimits_lower: (number | undefined)[] | undefined;
  speclimits_upper: (number | undefined)[] | undefined;
  validationStatus: Extract<ValidationT, { status: 0 }>;
};

export type InputDataResult = { status: "valid"; data: dataObject } | { status: "invalid"; error: string };

export default function extractInputData(inputView: powerbi.DataViewCategorical,
                                          columns: InputColumns,
                                          inputSettings: settingsValueType,
                                          derivedSettings: derivedSettingsClass,
                                          validationMessages: string[][],
                                          idxs: number[],
                                          messagePositionByRowIndex: Map<number, number>): InputDataResult {
  const categories = inputView.categories?.[0];
  const keyColumns = columns.categories.key;
  const numeratorColumn = columns.values.numerators?.[0];
  if (keyColumns === undefined || categories === undefined) return { status: "invalid", error: "No grouping/ID variable passed!" };
  if (numeratorColumn === undefined) return { status: "invalid", error: "No Numerators passed!" };
  const denominatorColumn = columns.values.denominators?.[0];
  const sdColumn = columns.values.xbar_sds?.[0];
  const chart = derivedSettings.chart_type_props;
  const useDenominators = chart.needs_denominator || (chart.denominator_optional && denominatorColumn !== undefined);
  const keys = extractKeys(keyColumns, inputSettings, idxs);
  const numerators = new Array<number | undefined>(idxs.length);
  const denominators = useDenominators ? new Array<number | undefined>(idxs.length) : undefined;
  const xbar_sds = chart.needs_sd ? new Array<number | undefined>(idxs.length) : undefined;
  for (let i = 0; i < idxs.length; i++) {
    const row = idxs[i];
    const numerator = numeratorColumn.values[row];
    numerators[i] = numerator == null ? undefined : Number(numerator);
    if (denominators !== undefined) {
      const denominator = denominatorColumn?.values[row];
      denominators[i] = denominator == null ? undefined : Number(denominator);
    }
    if (xbar_sds !== undefined) {
      const sd = sdColumn?.values[row];
      xbar_sds[i] = sd == null ? undefined : Number(sd);
    }
  }
  const validation = validateInputData(keys, numerators, denominators, xbar_sds, chart);
  if (validation.status !== 0) return { status: "invalid", error: validation.error };

  const labels = columns.values.labels?.[0];
  const groupings = columns.values.groupings?.[0];
  const tooltips = columns.values.tooltips;
  const highlights = inputView.values?.[0]?.highlights;
  const scatter = readSettingsRows(settingsModel.scatter, "scatter", defaultSettings.scatter, categories, idxs).values;
  const lines = readSettingsRows(settingsModel.lines, "lines", defaultSettings.lines, categories, idxs).values;
  const labelSettings = readSettingsRows(settingsModel.labels, "labels", defaultSettings.labels, categories, idxs).values;
  const spcSettings = readSettingsRows(settingsModel.spc, "spc", defaultSettings.spc, categories, [idxs[0]]).values[0];
  const result: dataObject = {
    limitInputArgs: { keys: [], numerators: [], denominators: useDenominators ? [] : undefined,
      xbar_sds: chart.needs_sd ? [] : undefined, outliers_in_limits: spcSettings.outliers_in_limits },
    spcSettings, categories, anyHighlights: false, anyLabels: false, warningMessage: "", validationStatus: validation,
    highlights: highlights === undefined ? undefined : [],
    labels: labels === undefined ? undefined : [], tooltips: tooltips === undefined ? undefined : [],
    groupings: groupings === undefined ? undefined : [], groupingIndexes: groupings === undefined ? undefined : [],
    scatter_formatting: [], line_formatting: [], label_formatting: [],
    alt_targets: inputSettings.lines.show_alt_target ? [] : undefined,
    speclimits_lower: inputSettings.lines.show_specification ? [] : undefined,
    speclimits_upper: inputSettings.lines.show_specification ? [] : undefined
  };
  const removalMessages: string[] = [];
  const groupName = categories.source.displayName;
  let currentGrouping: string | undefined;
  for (let i = 0; i < idxs.length; i++) {
    const row = idxs[i];
    const key = keys[i];
    if (validation.messages[i] !== "") {
      removalMessages.push(`${groupName} ${key} removed due to: ${validation.messages[i]}.`);
      continue;
    }
    const numerator = numerators[i];
    const denominator = denominators?.[i];
    const sd = xbar_sds?.[i];
    if (key === undefined || numerator === undefined) throw new Error("Validated row contains a missing required value.");
    if (result.limitInputArgs.denominators !== undefined) {
      if (denominator === undefined) throw new Error("Validated row contains a missing denominator.");
      result.limitInputArgs.denominators.push(denominator);
    }
    if (result.limitInputArgs.xbar_sds !== undefined) {
      if (sd === undefined) throw new Error("Validated row contains a missing SD.");
      result.limitInputArgs.xbar_sds.push(sd);
    }
    const x = result.limitInputArgs.keys.length;
    result.limitInputArgs.keys.push({ x, id: row, label: chart.x_axis_use_date ? key : String(x) });
    result.limitInputArgs.numerators.push(numerator);
    result.scatter_formatting.push(scatter[i]);
    result.line_formatting.push(lines[i]);
    result.label_formatting.push(labelSettings[i]);
    result.alt_targets?.push(lines[i].alt_target);
    result.speclimits_lower?.push(lines[i].specification_lower);
    result.speclimits_upper?.push(lines[i].specification_upper);
    const label = formatPrimitiveValue(labels?.values[row]);
    result.labels?.push(label);
    result.anyLabels ||= label !== undefined && label !== "";
    const highlight = highlights?.[row] ?? undefined;
    result.highlights?.push(highlight);
    result.anyHighlights ||= highlight !== undefined;
    const grouping = formatPrimitiveValue(groupings?.values[row]);
    result.groupings?.push(grouping);
    if (x > 0 && grouping !== currentGrouping) result.groupingIndexes?.push(x - 1);
    currentGrouping = grouping;
    if (tooltips !== undefined) {
      const rowTooltips: VisualTooltipDataItem[] = [];
      for (let j = 0; j < tooltips.length; j++) {
        rowTooltips.push({ displayName: tooltips[j].source.displayName, value: formatPrimitiveValue(tooltips[j].values[row]) ?? "" });
      }
      result.tooltips?.push(rowTooltips);
    }
    const messagePosition = messagePositionByRowIndex.get(row);
    if (messagePosition === undefined) throw new Error("Missing settings message position for a validated row.");
    const messages = validationMessages[messagePosition];
    for (let j = 0; j < messages.length; j++) {
      removalMessages.push(`Conditional formatting for ${groupName} ${key} ignored due to: ${messages[j]}.`);
    }
  }
  if (inputSettings.nhs_icons.show_assurance_icons) {
    const targets = result.alt_targets;
    if (targets !== undefined && targets.length > 0 && targets[targets.length - 1] === undefined) {
      removalMessages.push("NHS Assurance icon requires a valid alt. target at last observation.");
    }
    if (!chart.has_control_limits) removalMessages.push("NHS Assurance icon requires chart with control limits.");
  }
  result.warningMessage = removalMessages.join("\n");
  return { status: "valid", data: result };
}
