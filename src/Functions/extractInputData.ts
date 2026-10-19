import { extractRows, formatPrimitiveValue, readNumbers, type InputRows, type ValidatedDataView } from "powerbi-visuals-core/powerbi";
import { keptValue, type InputDataResult } from "powerbi-visuals-core/data";
import extractKeys from "./extractKeys";
import validateInputData from "./validateInputData";
import type { settingsValueType } from "../settings";
import { orderedPairError } from "powerbi-visuals-core/settings";
import type { controlLimitsArgs } from "../Classes/viewModelClass";
import type settingsClass from "../Classes/settingsClass";

export type dataObject = InputRows<settingsValueType["scatter"], settingsValueType["labels"]> & {
  readonly limitInputArgs: Omit<controlLimitsArgs, "subset_points">;
  readonly groupingIndexes: number[];
  readonly line_formatting: settingsValueType["lines"][];
  /** Row-aligned with the limit inputs; blank where the line is hidden or its setting is unset */
  readonly alt_target: (number | undefined)[];
  readonly speclimits_lower: (number | undefined)[];
  readonly speclimits_upper: (number | undefined)[];
};

/** The group's rows, read against the settings store's values and row settings for that group */
export default function extractInputData(view: ValidatedDataView<"numerators">, inputSettingsClass: settingsClass,
                                          idxs: readonly number[], group = 0): InputDataResult<dataObject> {
  const inputSettings = inputSettingsClass.settings[group];
  const derivedSettings = inputSettingsClass.derivedSettings[group];
  const rowSettings = inputSettingsClass.rowSettings[group];
  const denominatorColumn = view.values.denominators?.[0];
  const sdColumn = view.values.xbar_sds?.[0];
  const chart = derivedSettings.chart_type_props;
  const useDenominators = chart.needs_denominator || (chart.denominator_optional && denominatorColumn !== undefined);
  const keys = extractKeys(view.categories.key, inputSettings, idxs);
  const numerators = readNumbers(view.values.numerators[0], idxs);
  const denominators = useDenominators && denominatorColumn !== undefined ? readNumbers(denominatorColumn, idxs) : undefined;
  const xbar_sds = chart.needs_sd && sdColumn !== undefined ? readNumbers(sdColumn, idxs) : undefined;
  const extracted = extractRows(view, idxs, {
    keys,
    validation: validateInputData(keys, numerators, denominators, xbar_sds, chart),
    rowSettings,
    settings: { messages: inputSettingsClass.validationStatus.messages, messagePositionByRowIndex: inputSettingsClass.messagePositionByRowIndex }
  });
  if (extracted.status === "invalid") {
    return extracted;
  }
  const { kept, warnings, ...rows } = extracted.data;
  if (chart.name === "mr" && kept.length < 2) {
    return { status: "invalid", error: "Moving range charts need at least two valid observations!" };
  }

  const groupings = view.values.groupings?.[0];
  const limitKeys = new Array<controlLimitsArgs["keys"][number]>(kept.length);
  const keptNumerators = new Array<number>(kept.length);
  const keptDenominators = denominators === undefined ? undefined : new Array<number>(kept.length);
  const keptSds = xbar_sds === undefined ? undefined : new Array<number>(kept.length);
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
    const lines = rowSettings[i].lines;
    limitKeys[x] = { x, id: row, label: chart.x_axis_use_date ? keptValue(keys, i) : String(x) };
    keptNumerators[x] = keptValue(numerators, i);
    if (keptDenominators !== undefined) {
      keptDenominators[x] = keptValue(denominators, i);
    }
    if (keptSds !== undefined) {
      keptSds[x] = keptValue(xbar_sds, i);
    }
    const specificationError = showSpecification
      ? orderedPairError("specification_lower", lines.specification_lower, "specification_upper", lines.specification_upper)
      : undefined;
    if (specificationError !== undefined) {
      return { status: "invalid", error: specificationError };
    }
    line_formatting[x] = lines;
    alt_target[x] = showAltTarget ? lines.alt_target : undefined;
    speclimits_lower[x] = showSpecification ? lines.specification_lower : undefined;
    speclimits_upper[x] = showSpecification ? lines.specification_upper : undefined;
    if (groupings !== undefined) {
      const grouping = formatPrimitiveValue(groupings.values[row]);
      if (x > 0 && grouping !== currentGrouping) {
        groupingIndexes.push(x - 1);
      }
      currentGrouping = grouping;
    }
  }
  if (inputSettings.nhs_icons.show_assurance_icons) {
    if (showAltTarget && alt_target.length > 0 && alt_target[alt_target.length - 1] === undefined) {
      warnings.push("NHS Assurance icon requires a valid alt. target at last observation.");
    }
    if (!chart.has_control_limits) {
      warnings.push("NHS Assurance icon requires chart with control limits.");
    }
  }
  return {
    status: "valid",
    data: {
      ...rows,
      limitInputArgs: {
        keys: limitKeys,
        numerators: keptNumerators,
        denominators: keptDenominators,
        xbar_sds: keptSds,
        outliers_in_limits: inputSettings.spc.outliers_in_limits
      },
      groupingIndexes,
      line_formatting,
      alt_target,
      speclimits_lower,
      speclimits_upper,
      warningMessage: warnings.join("\n")
    }
  };
}
