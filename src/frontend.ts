import { limitValue, type FrontendChart } from "powerbi-visuals-core/frontends";
import { Visual } from "./visual";
import settingsModel, { type settingsValueType } from "./settings";
import type viewModelClass from "./Classes/viewModelClass";
import type { controlLimitsObject, outliersObject } from "./Classes/viewModelClass";

type LimitCell = string | number | null;
type LimitRow = Record<string, LimitCell>;
/** Grouped charts nest their rows by each indicator's group name */
type LimitGroups = { [group: string]: LimitGroups | LimitRow[] };

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
function limitRows(limits: controlLimitsObject, outliers: outliersObject, outlierSettings: settingsValueType["outliers"]): LimitRow[] {
  const dates = new Array<string>(limits.keys.length);
  for (let i = 0; i < dates.length; i++) {
    dates[i] = limits.keys[i].label.trim();
  }
  const columns: Readonly<Record<string, readonly (LimitCell | undefined)[]>> = {
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
  const columnNames = Object.keys(columns);
  const names: string[] = [];
  for (let i = 0; i < columnNames.length; i++) {
    const flagSetting = flagSettings[columnNames[i]];
    if ((flagSetting === undefined || outlierSettings[flagSetting]) && hasValues(columns[columnNames[i]])) {
      names.push(columnNames[i]);
    }
  }
  const rows = new Array<LimitRow>(dates.length);
  for (let i = 0; i < rows.length; i++) {
    const row: LimitRow = {};
    for (let j = 0; j < names.length; j++) {
      row[names[j]] = limitValue(columns[names[j]][i]);
    }
    rows[i] = row;
  }
  return rows;
}

function groupLimits(viewModel: viewModelClass, index: number): LimitRow[] {
  return limitRows(viewModel.controlLimits[index], viewModel.outliers[index], viewModel.inputSettings.settings[index].outliers);
}

function chartLimits(viewModel: viewModelClass): LimitRow[] | LimitGroups {
  if (viewModel.indicatorVarNames.length === 0) {
    return groupLimits(viewModel, 0);
  }
  const result: LimitGroups = {};
  for (let i = 0; i < viewModel.controlLimits.length; i++) {
    const groups = viewModel.groupNames[i];
    let branch = result;
    for (let j = 0; j < groups.length; j++) {
      const name = groups[j] === "" ? "<blank>" : groups[j];
      if (j === groups.length - 1) {
        branch[name] = groupLimits(viewModel, i);
      } else {
        const existing = branch[name];
        const next: LimitGroups = existing !== undefined && !Array.isArray(existing) ? existing : {};
        branch[name] = next;
        branch = next;
      }
    }
  }
  return result;
}

export const frontend: FrontendChart<Visual> = {
  Visual,
  settingsModel,
  limits: visual => ({ limits: chartLimits(visual.viewModel), indicatorNames: visual.viewModel.indicatorVarNames }),
  // The grouped summary table is HTML, outside the SVG
  staticError: visual => visual.viewModel.showGrouped
    ? "Static plots are not available for SPC charts with multiple indicator groups."
    : undefined
};
