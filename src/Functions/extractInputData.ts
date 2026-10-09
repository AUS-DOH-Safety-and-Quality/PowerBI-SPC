import type powerbi from "powerbi-visuals-api";
import {
  formatPrimitiveValue, readSettingsRows, readRowAnnotations, rowWarnings, type RoleColumns, type RowAnnotations
} from "powerbi-visuals-core/powerbi";
import extractKeys from "./extractKeys";
import validateInputData, { type ValidationT } from "./validateInputData";
import settingsModel, { defaultSettings, type settingsValueType } from "../settings";
import type { controlLimitsArgs } from "../Classes/viewModelClass";
import type derivedSettingsClass from "../Classes/derivedSettingsClass";

export type InputColumns = {
  categories: RoleColumns<powerbi.DataViewCategoryColumn>;
  values: RoleColumns<powerbi.DataViewValueColumn>;
};

export type dataObject = RowAnnotations<settingsValueType["scatter"], settingsValueType["labels"]> & {
  limitInputArgs: Omit<controlLimitsArgs, "subset_points">;
  spcSettings: settingsValueType["spc"];
  categories: powerbi.DataViewCategoryColumn;
  groupings: (string | undefined)[] | undefined;
  groupingIndexes: number[] | undefined;
  line_formatting: settingsValueType["lines"][];
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
  if (numeratorColumn === undefined) return { status: "invalid", error: "No numerators passed!" };
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

  const groupings = columns.values.groupings?.[0];
  const lines = readSettingsRows(settingsModel.lines, "lines", defaultSettings.lines, categories, idxs).values;
  const spcSettings = readSettingsRows(settingsModel.spc, "spc", defaultSettings.spc, categories, [idxs[0]]).values[0];
  const limitInputArgs: dataObject["limitInputArgs"] = {
    keys: [], numerators: [], denominators: useDenominators ? [] : undefined,
    xbar_sds: chart.needs_sd ? [] : undefined, outliers_in_limits: spcSettings.outliers_in_limits
  };
  const line_formatting: settingsValueType["lines"][] = [];
  const alt_targets: (number | undefined)[] | undefined = inputSettings.lines.show_alt_target ? [] : undefined;
  const speclimits_lower: (number | undefined)[] | undefined = inputSettings.lines.show_specification ? [] : undefined;
  const speclimits_upper: (number | undefined)[] | undefined = inputSettings.lines.show_specification ? [] : undefined;
  const groupingValues: (string | undefined)[] | undefined = groupings === undefined ? undefined : [];
  const groupingIndexes: number[] | undefined = groupings === undefined ? undefined : [];
  const kept: number[] = [];
  let currentGrouping: string | undefined;
  for (let i = 0; i < idxs.length; i++) {
    if (validation.messages[i] !== "") continue;
    const row = idxs[i];
    const key = keys[i];
    const numerator = numerators[i];
    const denominator = denominators?.[i];
    const sd = xbar_sds?.[i];
    if (key === undefined || numerator === undefined) throw new Error("Validated row contains a missing required value.");
    if (limitInputArgs.denominators !== undefined) {
      if (denominator === undefined) throw new Error("Validated row contains a missing denominator.");
      limitInputArgs.denominators.push(denominator);
    }
    if (limitInputArgs.xbar_sds !== undefined) {
      if (sd === undefined) throw new Error("Validated row contains a missing SD.");
      limitInputArgs.xbar_sds.push(sd);
    }
    const x = limitInputArgs.keys.length;
    limitInputArgs.keys.push({ x, id: row, label: chart.x_axis_use_date ? key : String(x) });
    limitInputArgs.numerators.push(numerator);
    line_formatting.push(lines[i]);
    alt_targets?.push(lines[i].alt_target);
    speclimits_lower?.push(lines[i].specification_lower);
    speclimits_upper?.push(lines[i].specification_upper);
    const grouping = formatPrimitiveValue(groupings?.values[row]);
    groupingValues?.push(grouping);
    if (x > 0 && grouping !== currentGrouping) groupingIndexes?.push(x - 1);
    currentGrouping = grouping;
    kept.push(i);
  }
  const groupName = categories.source.displayName;
  const removalMessages = rowWarnings(groupName, idxs, keys, validation.messages, { messages: validationMessages, messagePositionByRowIndex });
  if (inputSettings.nhs_icons.show_assurance_icons) {
    if (alt_targets !== undefined && alt_targets.length > 0 && alt_targets[alt_targets.length - 1] === undefined) {
      removalMessages.push("NHS Assurance icon requires a valid alt. target at last observation.");
    }
    if (!chart.has_control_limits) removalMessages.push("NHS Assurance icon requires chart with control limits.");
  }
  const annotations = readRowAnnotations({
    categorical: inputView, values: columns.values, categories,
    cards: { scatter: settingsModel.scatter, labels: settingsModel.labels },
    defaults: { scatter: defaultSettings.scatter, labels: defaultSettings.labels }
  }, idxs, kept);
  return { status: "valid", data: {
    ...annotations, limitInputArgs, spcSettings, categories, groupings: groupingValues, groupingIndexes, line_formatting,
    alt_targets, speclimits_lower, speclimits_upper, warningMessage: removalMessages.join("\n"), validationStatus: validation
  } };
}
