import type powerbi from "powerbi-visuals-api";
import {
  formatPrimitiveValue, readSettingsRows, readRowAnnotations, rowWarnings, type RowAnnotations, type ValidatedDataView
} from "powerbi-visuals-core/powerbi";
import extractKeys from "./extractKeys";
import validateInputData, { type ValidationT } from "./validateInputData";
import settingsModel, { defaultSettings, type settingsValueType } from "../settings";
import type { controlLimitsArgs } from "../Classes/viewModelClass";
import type derivedSettingsClass from "../Classes/derivedSettingsClass";

export type dataObject = RowAnnotations<settingsValueType["scatter"], settingsValueType["labels"]> & {
  limitInputArgs: Omit<controlLimitsArgs, "subset_points">;
  spcSettings: settingsValueType["spc"];
  categories: powerbi.DataViewCategoryColumn;
  groupingIndexes: number[];
  line_formatting: settingsValueType["lines"][];
  warningMessage: string;
  /** Row-aligned with the limit inputs; blank where the line is hidden or its setting is unset */
  alt_targets: (number | undefined)[];
  speclimits_lower: (number | undefined)[];
  speclimits_upper: (number | undefined)[];
  validationStatus: Extract<ValidationT, { status: 0 }>;
};

export type InputDataResult = { status: "valid"; data: dataObject } | { status: "invalid"; error: string };

export default function extractInputData(view: ValidatedDataView<"numerators">,
                                          inputSettings: settingsValueType,
                                          derivedSettings: derivedSettingsClass,
                                          validationMessages: string[][],
                                          idxs: number[],
                                          messagePositionByRowIndex: Map<number, number>): InputDataResult {
  const categories = view.category;
  const numeratorColumn = view.values.numerators[0];
  const denominatorColumn = view.values.denominators?.[0];
  const sdColumn = view.values.xbar_sds?.[0];
  const chart = derivedSettings.chart_type_props;
  const useDenominators = chart.needs_denominator || (chart.denominator_optional && denominatorColumn !== undefined);
  const keys = extractKeys(view.categories.key, inputSettings, idxs);
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
  if (validation.status !== 0) {
    return { status: "invalid", error: validation.error };
  }

  const groupings = view.values.groupings?.[0];
  const lines = readSettingsRows(settingsModel.lines, "lines", defaultSettings.lines, categories, idxs).values;
  const spcSettings = readSettingsRows(settingsModel.spc, "spc", defaultSettings.spc, categories, [idxs[0]]).values[0];
  const limitInputArgs: dataObject["limitInputArgs"] = {
    keys: [],
    numerators: [],
    denominators: useDenominators ? [] : undefined,
    xbar_sds: chart.needs_sd ? [] : undefined,
    outliers_in_limits: spcSettings.outliers_in_limits
  };
  const showAltTarget = inputSettings.lines.show_alt_target;
  const showSpecification = inputSettings.lines.show_specification;
  const line_formatting: settingsValueType["lines"][] = [];
  const alt_targets: (number | undefined)[] = [];
  const speclimits_lower: (number | undefined)[] = [];
  const speclimits_upper: (number | undefined)[] = [];
  const groupingIndexes: number[] = [];
  const kept: number[] = [];
  let currentGrouping: string | undefined;
  for (let i = 0; i < idxs.length; i++) {
    if (validation.messages[i] !== "") {
      continue;
    }
    const row = idxs[i];
    const key = keys[i];
    const numerator = numerators[i];
    const denominator = denominators?.[i];
    const sd = xbar_sds?.[i];
    if (key === undefined || numerator === undefined) {
      throw new Error("Validated row contains a missing required value.");
    }
    if (limitInputArgs.denominators !== undefined) {
      if (denominator === undefined) {
        throw new Error("Validated row contains a missing denominator.");
      }
      limitInputArgs.denominators.push(denominator);
    }
    if (limitInputArgs.xbar_sds !== undefined) {
      if (sd === undefined) {
        throw new Error("Validated row contains a missing SD.");
      }
      limitInputArgs.xbar_sds.push(sd);
    }
    const x = limitInputArgs.keys.length;
    limitInputArgs.keys.push({ x, id: row, label: chart.x_axis_use_date ? key : String(x) });
    limitInputArgs.numerators.push(numerator);
    line_formatting.push(lines[i]);
    alt_targets.push(showAltTarget ? lines[i].alt_target : undefined);
    speclimits_lower.push(showSpecification ? lines[i].specification_lower : undefined);
    speclimits_upper.push(showSpecification ? lines[i].specification_upper : undefined);
    if (groupings !== undefined) {
      const grouping = formatPrimitiveValue(groupings.values[row]);
      if (x > 0 && grouping !== currentGrouping) {
        groupingIndexes.push(x - 1);
      }
      currentGrouping = grouping;
    }
    kept.push(i);
  }
  const groupName = categories.source.displayName;
  const removalMessages = rowWarnings(groupName, idxs, keys, validation.messages, {
    messages: validationMessages,
    messagePositionByRowIndex
  });
  if (inputSettings.nhs_icons.show_assurance_icons) {
    if (showAltTarget && alt_targets.length > 0 && alt_targets[alt_targets.length - 1] === undefined) {
      removalMessages.push("NHS Assurance icon requires a valid alt. target at last observation.");
    }
    if (!chart.has_control_limits) {
      removalMessages.push("NHS Assurance icon requires chart with control limits.");
    }
  }
  const annotations = readRowAnnotations({
    categorical: view.categorical,
    values: view.values,
    categories,
    cards: { scatter: settingsModel.scatter, labels: settingsModel.labels },
    defaults: { scatter: defaultSettings.scatter, labels: defaultSettings.labels }
  }, idxs, kept);
  return {
    status: "valid",
    data: {
      ...annotations,
      limitInputArgs,
      spcSettings,
      categories,
      groupingIndexes,
      line_formatting,
      alt_targets,
      speclimits_lower,
      speclimits_upper,
      warningMessage: removalMessages.join("\n"),
      validationStatus: validation
    }
  };
}
