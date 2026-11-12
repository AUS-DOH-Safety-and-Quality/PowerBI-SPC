import { at } from "powerbi-visuals-core/util";
import { extractRows, formatPrimitiveValue, readNumbers, type InputRows, type ValidatedDataView } from "powerbi-visuals-core/powerbi";
import { isValidNumber, keptValue, type InputDataResult } from "powerbi-visuals-core/data";
import { sequence } from "powerbi-visuals-core/math";
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
  /** Set when no limits can be calculated: the group's last row, as its summary table row shows it */
  readonly rejected: {
    readonly error: string;
    readonly date: string;
    readonly numerator: number | undefined;
    readonly denominator: number | undefined;
  } | undefined;
};

/** The group's rows, read against the settings store's values and row settings for that group */
export default function extractInputData(view: ValidatedDataView<"numerators">, inputSettingsClass: settingsClass,
                                          idxs: readonly number[], group = 0): InputDataResult<dataObject> {
  const { settings: inputSettings, derivedSettings } = inputSettingsClass.group(group);
  const rowSettings = at(inputSettingsClass.rowSettings, group);
  const denominatorColumn = view.values.denominators?.[0];
  const sdColumn = view.values.xbar_sds?.[0];
  const chart = derivedSettings.chart_type_props;
  const keys = extractKeys(view.categories.key, inputSettings, idxs);
  const numerators = readNumbers(at(view.values.numerators, 0), idxs);
  const groupDenominators = (chart.needs_denominator || chart.denominator_optional) && denominatorColumn !== undefined
    ? readNumbers(denominatorColumn, idxs) : undefined;
  let anyDenominator = false;
  for (let i = 0; !anyDenominator && groupDenominators !== undefined && i < groupDenominators.length; i++) {
    anyDenominator = groupDenominators[i] !== undefined;
  }
  // Optional denominators are per group, so an indicator without any plots its numerators
  const denominators = chart.needs_denominator || anyDenominator ? groupDenominators : undefined;
  const xbar_sds = chart.needs_sd && sdColumn !== undefined ? readNumbers(sdColumn, idxs) : undefined;
  const validation = validateInputData(keys, numerators, denominators, xbar_sds, chart);
  const extracted = extractRows(view, idxs, {
    keys,
    // A rejected group keeps every row's annotations, for its summary table row
    validation: validation.status === 0 ? validation : { status: 0, messages: validation.messages, kept: sequence(0, idxs.length, 1) },
    rowSettings,
    settings: { messages: inputSettingsClass.validationStatus.messages, messagePositionByRowIndex: inputSettingsClass.messagePositionByRowIndex }
  });
  if (extracted.status === "invalid") {
    return extracted;
  }
  const { kept: validRows, warnings, ...rows } = extracted.data;
  let rejection: string | undefined;
  if (validation.status !== 0) {
    rejection = validation.error;
  } else if (chart.name === "mr" && validRows.length < 2) {
    rejection = "Moving range charts need at least two valid observations!";
  }
  const kept: readonly number[] = rejection === undefined ? validRows : [];
  const last = idxs.length - 1;
  const lastNumerator = numerators[last];
  const lastDenominator = denominators?.[last];

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
    const i = at(kept, x);
    const row = at(idxs, i);
    const lines = at(rowSettings, i).lines;
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
      rejected: rejection === undefined ? undefined : {
        error: rejection,
        date: chart.x_axis_use_date ? keys[last] ?? "" : String(last),
        numerator: isValidNumber(lastNumerator) ? lastNumerator : undefined,
        denominator: isValidNumber(lastDenominator) ? lastDenominator : undefined
      },
      warningMessage: warnings.join("\n")
    }
  };
}
