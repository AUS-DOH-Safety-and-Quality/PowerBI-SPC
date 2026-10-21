import { indicatorFields, limitValue, type FrontendChart } from "powerbi-visuals-core/frontends";
import { formatPrimitiveValue } from "powerbi-visuals-core/powerbi";
import { Visual } from "./visual";
import settingsModel, { type settingsValueType } from "./settings";
import type viewModelClass from "./Classes/viewModelClass";
import type { controlLimitsObject, outliersObject } from "./Classes/viewModelClass";

type LimitCell = string | number | null;
type LimitRow = Record<string, LimitCell>;

const limitColumns = [
  "date", "numerator", "denominator", "value", "target", "alt_target", "ll99", "ll95", "ll68", "ul68", "ul95", "ul99",
  "speclimits_lower", "speclimits_upper", "trend_line", "astpoint", "trend", "shift", "two_in_three"
] as const;

/** The outlier setting that enables each flag column */
const flagSettings: Readonly<Partial<Record<string, "astronomical" | "trend" | "shift" | "two_in_three">>> = {
  astpoint: "astronomical",
  trend: "trend",
  shift: "shift",
  two_in_three: "two_in_three"
};

function hasValues(column: readonly (LimitCell | undefined)[]): boolean {
  for (let i = 0; i < column.length; i++) {
    if (limitValue(column[i]) !== null) {
      return true;
    }
  }
  return false;
}

/** Columns without values, and flags that are not enabled, are left out */
function appendLimitRows(rows: LimitRow[], rowIds: number[], limits: controlLimitsObject, outliers: outliersObject,
                         outlierSettings: settingsValueType["outliers"], indicators: LimitRow): void {
  const dates = new Array<string>(limits.keys.length);
  for (let i = 0; i < dates.length; i++) {
    dates[i] = limits.keys[i].label.trim();
  }
  const columns: Readonly<Record<(typeof limitColumns)[number], readonly (LimitCell | undefined)[]>> = {
    date: dates,
    numerator: limits.numerators,
    denominator: limits.denominators,
    value: limits.values,
    target: limits.target,
    alt_target: limits.alt_target,
    ll99: limits.ll99,
    ll95: limits.ll95,
    ll68: limits.ll68,
    ul68: limits.ul68,
    ul95: limits.ul95,
    ul99: limits.ul99,
    speclimits_lower: limits.speclimits_lower,
    speclimits_upper: limits.speclimits_upper,
    trend_line: limits.trend_line,
    astpoint: outliers.astpoint,
    trend: outliers.trend,
    shift: outliers.shift,
    two_in_three: outliers.two_in_three
  };
  const names: (typeof limitColumns)[number][] = [];
  for (let i = 0; i < limitColumns.length; i++) {
    const flagSetting = flagSettings[limitColumns[i]];
    if ((flagSetting === undefined || outlierSettings[flagSetting]) && hasValues(columns[limitColumns[i]])) {
      names.push(limitColumns[i]);
    }
  }
  for (let i = 0; i < dates.length; i++) {
    const row: LimitRow = { ...indicators };
    for (let j = 0; j < names.length; j++) {
      row[names[j]] = limitValue(columns[names[j]][i]);
    }
    rows.push(row);
    rowIds.push(limits.keys[i].id);
  }
}

function chartLimits(viewModel: viewModelClass): { limits: LimitRow[]; rowIds: number[] } {
  const result: LimitRow[] = [];
  const rowIds: number[] = [];
  for (let i = 0; i < viewModel.controlLimits.length; i++) {
    const limits = viewModel.controlLimits[i];
    if (limits.keys.length === 0) {
      continue;
    }
    const indicators: LimitRow = {};
    const columns = viewModel.inputData[i].identityColumns;
    for (let j = 0; j < columns.length; j++) {
      const column = columns[j];
      if (column.source.roles?.indicator) {
        indicators[column.source.displayName] = limitValue(formatPrimitiveValue(column.values[limits.keys[0].id]));
      }
    }
    appendLimitRows(result, rowIds, limits, viewModel.outliers[i], viewModel.inputSettings.settings[i].outliers,
                    indicatorFields(indicators, limitColumns));
  }
  return { limits: result, rowIds };
}

export const frontend: FrontendChart<Visual> = {
  Visual,
  settingsModel,
  limitColumns,
  limits: visual => chartLimits(visual.viewModel)
};
