import type powerbi from "powerbi-visuals-api";
import {
  formatPrimitiveValue, readNumbers, readSettingsRows, readRowAnnotations, rowWarnings, type RowAnnotations, type ValidatedDataView
} from "powerbi-visuals-core/powerbi";
import { keptPositions, keptValues, type InputDataResult, type ValidRows } from "powerbi-visuals-core/data";
import extractKeys from "./extractKeys";
import validateInputData from "./validateInputData";
import settingsModel, { defaultSettings, type settingsValueType } from "../settings";
import { orderedPairError } from "powerbi-visuals-core/settings";
import type { controlLimitsArgs } from "../Classes/viewModelClass";
import type derivedSettingsClass from "../Classes/derivedSettingsClass";

export type dataObject = RowAnnotations<settingsValueType["scatter"], settingsValueType["labels"]> & {
  limitInputArgs: Omit<controlLimitsArgs, "subset_points">;
  spcSettings: settingsValueType["spc"];
  /** Key and indicator columns, which together identify a row */
  identityColumns: powerbi.DataViewCategoryColumn[];
  groupingIndexes: number[];
  line_formatting: settingsValueType["lines"][];
  warningMessage: string;
  /** Row-aligned with the limit inputs; blank where the line is hidden or its setting is unset */
  alt_target: (number | undefined)[];
  speclimits_lower: (number | undefined)[];
  speclimits_upper: (number | undefined)[];
  validationStatus: ValidRows;
};

export default function extractInputData(view: ValidatedDataView<"numerators">,
                                          inputSettings: settingsValueType,
                                          derivedSettings: derivedSettingsClass,
                                          validationMessages: string[][],
                                          idxs: number[],
                                          messagePositionByRowIndex: Map<number, number>): InputDataResult<dataObject> {
  const categories = view.category;
  const denominatorColumn = view.values.denominators?.[0];
  const sdColumn = view.values.xbar_sds?.[0];
  const chart = derivedSettings.chart_type_props;
  const useDenominators = chart.needs_denominator || (chart.denominator_optional && denominatorColumn !== undefined);
  const keys = extractKeys(view.categories.key, inputSettings, idxs);
  const numerators = readNumbers(view.values.numerators[0], idxs);
  const denominators = useDenominators && denominatorColumn !== undefined ? readNumbers(denominatorColumn, idxs) : undefined;
  const xbar_sds = chart.needs_sd && sdColumn !== undefined ? readNumbers(sdColumn, idxs) : undefined;
  const validation = validateInputData(keys, numerators, denominators, xbar_sds, chart);
  if (validation.status !== 0) {
    return { status: "invalid", error: validation.error };
  }

  const kept = keptPositions(validation.messages);
  const groupings = view.values.groupings?.[0];
  const lines = readSettingsRows(settingsModel.lines, "lines", defaultSettings.lines, categories, idxs).values;
  const spcSettings = readSettingsRows(settingsModel.spc, "spc", defaultSettings.spc, categories, [idxs[0]]).values[0];
  const keptKeys = keptValues(keys, kept);
  const limitInputArgs: dataObject["limitInputArgs"] = {
    keys: new Array<controlLimitsArgs["keys"][number]>(kept.length),
    numerators: keptValues(numerators, kept),
    denominators: denominators === undefined ? undefined : keptValues(denominators, kept),
    xbar_sds: xbar_sds === undefined ? undefined : keptValues(xbar_sds, kept),
    outliers_in_limits: spcSettings.outliers_in_limits
  };
  const showAltTarget = inputSettings.lines.show_alt_target;
  const showSpecification = inputSettings.lines.show_specification;
  const line_formatting = new Array<settingsValueType["lines"]>(kept.length);
  const alt_target = new Array<number | undefined>(kept.length);
  const speclimits_lower = new Array<number | undefined>(kept.length);
  const speclimits_upper = new Array<number | undefined>(kept.length);
  const groupingIndexes: number[] = [];
  let currentGrouping: string | undefined;
  for (let x = 0; x < kept.length; x++) {
    const i = kept[x];
    const row = idxs[i];
    limitInputArgs.keys[x] = { x, id: row, label: chart.x_axis_use_date ? keptKeys[x] : String(x) };
    const specificationError = orderedPairError("specification_lower", lines[i].specification_lower,
                                                "specification_upper", lines[i].specification_upper);
    if (specificationError !== undefined) {
      return { status: "invalid", error: specificationError };
    }
    line_formatting[x] = lines[i];
    alt_target[x] = showAltTarget ? lines[i].alt_target : undefined;
    speclimits_lower[x] = showSpecification ? lines[i].specification_lower : undefined;
    speclimits_upper[x] = showSpecification ? lines[i].specification_upper : undefined;
    if (groupings !== undefined) {
      const grouping = formatPrimitiveValue(groupings.values[row]);
      if (x > 0 && grouping !== currentGrouping) {
        groupingIndexes.push(x - 1);
      }
      currentGrouping = grouping;
    }
  }
  const groupName = view.category.source.displayName;
  const removalMessages = rowWarnings(groupName, idxs, keys, validation.messages, {
    messages: validationMessages,
    messagePositionByRowIndex
  });
  if (inputSettings.nhs_icons.show_assurance_icons) {
    if (showAltTarget && alt_target.length > 0 && alt_target[alt_target.length - 1] === undefined) {
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
      identityColumns: [...view.categories.key, ...(view.categories.indicator ?? [])],
      groupingIndexes,
      line_formatting,
      alt_target,
      speclimits_lower,
      speclimits_upper,
      warningMessage: removalMessages.join("\n"),
      validationStatus: validation
    }
  };
}
