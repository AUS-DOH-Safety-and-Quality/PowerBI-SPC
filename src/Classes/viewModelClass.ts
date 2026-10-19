import { labelledMessage, rowIdentity, type CategoryGroups, type ValidatedDataView } from "powerbi-visuals-core/powerbi";
import type powerbi from "powerbi-visuals-api";
type IVisualHost = powerbi.extensibility.visual.IVisualHost;
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
type ISelectionId = powerbi.visuals.ISelectionId;
import * as limitFunctions from "../Limit Calculations"
import settingsClass from "./settingsClass";
import type settingsModel from "../settings";
import type { settingsValueType } from "../settings";
import type derivedSettingsClass from "./derivedSettingsClass";
import buildTooltip from "../Functions/buildTooltip";
import { rep, between, clamp, calculateTrendLine } from "powerbi-visuals-core/math";
import type { dataObject } from "../Functions/extractInputData";
import extractInputData from "../Functions/extractInputData";
import {
  isNullOrUndefined, isValidNumber, checkFlagDirection, applyFlagColours, type FlagDirection, type FlagSettings, type OutlierStatus
} from "powerbi-visuals-core/data";
import { limitColumns, limitLineNames, type StandardLineValues } from "powerbi-visuals-core/settings";
import variationIconsToDraw from "../Outlier Flagging/variationIconsToDraw";
import assuranceIconToDraw from "../Outlier Flagging/assuranceIconToDraw";
import validateDataViewColumns from "../Functions/validateDataViewColumns";
import axisRanges from "../Functions/axisRanges";
import { astronomical, shift, trend, twoInThree } from "powerbi-visuals-core/spc";
import lineKeys, { type LineName } from "../Functions/lineKeys";
import type { NhsIconName } from "../D3 Plotting Functions/NHS Icons";
import { sequence } from "powerbi-visuals-core/math";

import { PlotViewModelBase, type AxisBounds, type GroupResults, type ViewModelValidation } from "powerbi-visuals-core/rendering";

export type viewModelValidationT = ViewModelValidation;

export type lineData = {
  readonly x: number;
  readonly line_value: number | undefined;
  readonly group: LineName;
  readonly aesthetics: settingsValueType["lines"];
}

export type summaryTableRowData = StandardLineValues<number | undefined> & {
  readonly date: string;
  readonly numerator: number | undefined;
  readonly denominator: number | undefined;
  readonly value: number;
  readonly speclimits_lower: number | undefined;
  readonly speclimits_upper: number | undefined;
  readonly trend_line: number | undefined;
  readonly astpoint: FlagDirection;
  readonly trend: FlagDirection;
  readonly shift: FlagDirection;
  readonly two_in_three: FlagDirection;
}

/** Grouped rows hold formatted text; indicator and tooltip columns are keyed by position, as report names can clash */
export type summaryTableRowDataGrouped = StandardLineValues<string> & {
  readonly [column: `indicator_${number}` | `tooltip_${number}`]: string;
  readonly latest_date: string;
  readonly value: string;
  readonly numerator: string;
  readonly denominator: string;
  readonly speclimits_lower: string;
  readonly speclimits_upper: string;
  readonly trend_line: string;
  readonly assurance: NhsIconName | "none";
}

export type plotData = {
  readonly x: number;
  readonly value: number;
  readonly aesthetics: settingsValueType["scatter"];
  readonly table_row: summaryTableRowData;
  readonly identity: ISelectionId;
  /** Highlighted by selections in other visuals */
  readonly highlighted: boolean;
  readonly tooltip: VisualTooltipDataItem[];
  readonly label: {
    readonly text_value: string | undefined,
    readonly aesthetics: settingsValueType["labels"],
    angle: number | undefined,
    distance: number | undefined
  };
}

export type plotDataGrouped = {
  readonly table_row: summaryTableRowDataGrouped;
  readonly variation_icons: readonly NhsIconName[];
  readonly identity: readonly ISelectionId[];
  readonly aesthetics: settingsValueType["summary_table"];
  readonly highlighted: boolean;
}

/** Every series is row-aligned with `keys`; a cell is undefined where the chart or settings define no value */
export type controlLimitsObject = StandardLineValues<(number | undefined)[]> & {
  keys: { readonly x: number, readonly id: number, readonly label: string }[];
  values: number[];
  numerators: (number | undefined)[];
  denominators: (number | undefined)[];
  count: (number | undefined)[];
  speclimits_lower: (number | undefined)[];
  speclimits_upper: (number | undefined)[];
  trend_line: (number | undefined)[];
};

export type LimitSeries = Exclude<keyof controlLimitsObject, "keys" | "values">;
/** Listed exhaustively so merging and sanitising cover every series */
const limitSeries = Object.keys({
  numerators: true,
  denominators: true,
  target: true,
  ll99: true,
  ll95: true,
  ll68: true,
  ul68: true,
  ul95: true,
  ul99: true,
  count: true,
  alt_target: true,
  speclimits_lower: true,
  speclimits_upper: true,
  trend_line: true
} satisfies Record<LimitSeries, true>) as readonly LimitSeries[];

/** Calculators return only the series their chart defines, and may pass their inputs through */
export type CalculatedLimits = {
  readonly keys: readonly controlLimitsObject["keys"][number][];
  readonly values: readonly number[];
} & { readonly [K in LimitSeries]?: readonly (number | undefined)[] };

export type controlLimitsArgs = {
  readonly keys: readonly controlLimitsObject["keys"][number][];
  readonly numerators: readonly number[];
  readonly denominators?: readonly number[];
  readonly xbar_sds?: readonly number[];
  readonly outliers_in_limits?: boolean;
  readonly subset_points: readonly number[];
}

/** Charts needing these series are dispatched only once validateDataViewColumns has found them */
export type denominatorLimitsArgs = controlLimitsArgs & { readonly denominators: readonly number[] };
export type xbarLimitsArgs = denominatorLimitsArgs & { readonly xbar_sds: readonly number[] };

export type outliersObject = {
  readonly astpoint: FlagDirection[];
  readonly trend: FlagDirection[];
  readonly two_in_three: FlagDirection[];
  readonly shift: FlagDirection[];
}

/** A segment's raw flags written into the full series as the directions the settings flag */
function copyFlags(target: FlagDirection[], source: readonly OutlierStatus[], offset: number, flagSettings: FlagSettings): void {
  for (let i = 0; i < source.length; i++) {
    target[offset + i] = checkFlagDirection(source[i], flagSettings);
  }
}

/** Only the control limits are truncated */
const truncatedSeries: ReadonlySet<string> = new Set(limitLineNames);

function anyIcon(icons: readonly NhsIconName[], names: readonly NhsIconName[]): boolean {
  for (let i = 0; i < icons.length; i++) {
    if (names.includes(icons[i])) {
      return true;
    }
  }
  return false;
}

/** Columns both tables share, labelled and ordered as in the tooltip: limits top to bottom around the targets */
function lineColumns(settings: settingsValueType, hasDenominators: boolean,
                     hasControlLimits: boolean): { name: string; label: string; }[] {
  const lines = settings.lines;
  const columns = new Array<{ name: string; label: string; }>();
  if (lines.show_main) {
    columns.push({ name: "value", label: "Value" });
  }
  if (hasDenominators && settings.spc.ttip_show_numerator) {
    columns.push({ name: "numerator", label: "Numerator" });
  }
  if (hasDenominators && settings.spc.ttip_show_denominator) {
    columns.push({ name: "denominator", label: "Denominator" });
  }
  if (lines.show_trend) {
    columns.push({ name: "trend_line", label: lines.ttip_label_trend });
  }
  if (lines.show_specification) {
    columns.push({
      name: "speclimits_upper",
      label: `${lines.ttip_label_specification_prefix_upper}${lines.ttip_label_specification}`
    }, {
      name: "speclimits_lower",
      label: `${lines.ttip_label_specification_prefix_lower}${lines.ttip_label_specification}`
    });
  }
  columns.push(...limitColumns(lines, hasControlLimits));
  return columns;
}

export default class viewModelClass extends PlotViewModelBase<typeof settingsModel, derivedSettingsClass, "numerators"> {
  inputData: dataObject[] = [];
  controlLimits: controlLimitsObject[] = [];
  outliers: outliersObject[] = [];
  plotPoints: plotData[] = [];
  groupedRows: plotDataGrouped[] = [];
  groupedLines: [LineName, lineData[]][] = [];
  /** Positions in every grouped line that end a re-baselined period, joined or not */
  periodEnds: number[] = [];
  tickLabels: { x: number; label: string; }[] = [];
  splitIndexes: number[] = [];
  groupStartEndIndexes: number[][][] = [];
  tableColumns: { name: string; label: string; }[][] = [];

  indicatorVarNames: string[] = [];
  groupNames: string[][] = [];
  /** Each group's names joined, leading its messages */
  groupLabels: string[] = [];
  identities: ISelectionId[][] = [];

  get showGrouped(): boolean {
    return this.inputData.length > 1;
  }

  get anyLabels(): boolean {
    return this.inputData[0].anyLabels;
  }

  constructor(host: IVisualHost) {
    super(host, new settingsClass(), ["numerators"]);
  }

  /** The grouped table has no axes */
  protected get hasAxes(): boolean {
    return !this.showGrouped;
  }

  axisRanges(): { x: AxisBounds; y: AxisBounds } {
    return axisRanges(this);
  }

  protected reset(): void {
    this.inputData = [];
    this.controlLimits = [];
    this.groupStartEndIndexes = [];
    this.outliers = [];
    this.identities = [];
    this.plotPoints = [];
    this.groupedRows = [];
    this.groupedLines = [];
    this.tickLabels = [];
  }

  protected updateData(view: ValidatedDataView<"numerators">, indicatorGroups: CategoryGroups, host: IVisualHost): GroupResults {
    const indicator_cols = view.categories.indicator ?? [];
    this.indicatorVarNames = new Array<string>(indicator_cols.length);
    for (let i = 0; i < indicator_cols.length; i++) {
      this.indicatorVarNames[i] = indicator_cols[i].source.displayName;
    }
    const idx_per_indicator = indicatorGroups.rows;
    this.groupNames = indicatorGroups.names;
    this.groupLabels = indicatorGroups.labels;

    const checkDV: string = validateDataViewColumns(this.inputSettings, view.values);
    if (checkDV !== "valid") {
      return { errors: [checkDV], warnings: [] };
    }

    const hasIndicator = indicator_cols.length > 0;
    const split_indexes_str: string = <string>(view.dataView.metadata.objects?.split_indexes_storage?.split_indexes) ?? "[]";
    const split_indexes = JSON.parse(split_indexes_str) as number[];
    this.splitIndexes = hasIndicator ? [] : split_indexes;

    this.inputData = new Array<dataObject>();
    this.groupStartEndIndexes = new Array<number[][]>();
    this.controlLimits = new Array<controlLimitsObject>();
    this.outliers = new Array<outliersObject>();
    this.identities = new Array<ISelectionId[]>();
    this.tableColumns = new Array<{ name: string; label: string; }[]>();

    const errors: string[] = [];
    const warnings: string[] = [];

    for (let idx = 0; idx < idx_per_indicator.length; idx++) {
      const group_idxs = idx_per_indicator[idx];
      const settings = this.inputSettings.settings[idx];
      const derivedSettings = this.inputSettings.derivedSettings[idx];

      const extraction = extractInputData(view, this.inputSettings, group_idxs, idx);
      if (extraction.status !== "valid") {
        errors.push(labelledMessage(this.groupLabels[idx], extraction.error));
        continue;
      }
      const inpData = extraction.data;
      this.inputData.push(inpData);
      if (inpData.warningMessage !== "") {
        warnings.push(labelledMessage(this.groupLabels[idx], inpData.warningMessage));
      }

      const inputGroupStartEnd: number[][] = this.getGroupingIndexes(inpData, idx === 0 ? this.splitIndexes : undefined);
      const limits: controlLimitsObject = this.calculateLimits(inpData, inputGroupStartEnd, settings);
      const groupStartEnd: number[][] = this.getResultGroupIndexes(limits.keys, inputGroupStartEnd);
      // Flags compare display units (as specification limits are entered) against the truncated limits
      this.scaleAndTruncateLimits(limits, settings, derivedSettings);
      const outliers: outliersObject = this.flagOutliers(limits, groupStartEnd, settings, derivedSettings);

      const keys = inpData.limitInputArgs.keys;
      const identities = new Array<ISelectionId>(keys.length);
      for (let i = 0; i < keys.length; i++) {
        identities[i] = rowIdentity(host, inpData.identityColumns, keys[i].id);
      }

      this.groupStartEndIndexes.push(groupStartEnd);
      this.controlLimits.push(limits);
      this.outliers.push(outliers);
      this.identities.push(identities);
    }

    if (errors.length === 0) {
      if (this.showGrouped) {
        this.initialisePlotDataGrouped();
      } else if (this.controlLimits[0].keys.length === 0) {
        errors.push("Moving range charts need at least two observations in the same rebaseline group!");
      } else {
        this.initialisePlotData();
        this.initialiseGroupedLines();
      }
    }
    return { errors, warnings };
  }

  getGroupingIndexes(inputData: dataObject, splitIndexes?: readonly number[]): number[][] {
    const lastIndex = inputData.limitInputArgs.keys.length - 1;
    const segmentEnds = new Set<number>([-1, lastIndex]);
    if (splitIndexes !== undefined) {
      for (let i = 0; i < splitIndexes.length; i++) {
        const index = splitIndexes[i];
        if (index >= 0 && index < lastIndex) {
          segmentEnds.add(index);
        }
      }
    }
    for (let i = 0; i < inputData.groupingIndexes.length; i++) {
      segmentEnds.add(inputData.groupingIndexes[i]);
    }
    const allIndexes: number[] = Array.from(segmentEnds).sort((a, b) => a - b);

    const groupStartEndIndexes = new Array<number[]>();
    for (let i: number = 0; i < allIndexes.length - 1; i++) {
      groupStartEndIndexes.push([allIndexes[i] + 1, allIndexes[i + 1] + 1])
    }
    return groupStartEndIndexes;
  }

  /** Input-position ranges to result-position ranges; a segment can return fewer points (moving ranges) */
  getResultGroupIndexes(keys: readonly controlLimitsObject["keys"][number][], inputGroupStartEnd: readonly (readonly number[])[]): number[][] {
    const result = new Array<number[]>(inputGroupStartEnd.length);
    let position = 0;
    for (let i = 0; i < inputGroupStartEnd.length; i++) {
      const start = position;
      while (position < keys.length && keys[position].x < inputGroupStartEnd[i][1]) {
        position++;
      }
      result[i] = [start, position];
    }
    return result;
  }

  calculateLimits(inputData: dataObject, groupStartEndIndexes: readonly (readonly number[])[], inputSettings: settingsValueType): controlLimitsObject {
    // Validation has found the series each chart's arguments require
    const limitFunction = limitFunctions[inputSettings.spc.chart_type] as (args: controlLimitsArgs) => CalculatedLimits;

    const num_points_subset = inputSettings.spc.num_points_subset;
    const subset_points_from = inputSettings.spc.subset_points_from;
    const subset_rebaselines = inputSettings.spc.subset_rebaselines;
    const args = inputData.limitInputArgs;

    const segments = new Array<CalculatedLimits>(groupStartEndIndexes.length);
    let total: number = 0;
    for (let g = 0; g < groupStartEndIndexes.length; g++) {
      const start: number = groupStartEndIndexes[g][0];
      const end: number = groupStartEndIndexes[g][1];
      const n: number = end - start;
      const applySubset: boolean = g === 0 || subset_rebaselines;
      const subsetCount: number = applySubset && !isNullOrUndefined(num_points_subset) && between(num_points_subset, 1, n)
        ? num_points_subset : n;
      const subsetStart: number = subset_points_from === "Start" ? 0 : n - subsetCount;
      segments[g] = limitFunction({
        keys: args.keys.slice(start, end),
        numerators: args.numerators.slice(start, end),
        denominators: args.denominators?.slice(start, end),
        xbar_sds: args.xbar_sds?.slice(start, end),
        outliers_in_limits: inputSettings.spc.outliers_in_limits,
        subset_points: sequence(subsetStart, subsetCount, 1)
      });
      total += segments[g].keys.length;
    }

    // Series a chart does not define are blank, so every series stays row-aligned across segments
    const controlLimits: controlLimitsObject = {
      keys: new Array<controlLimitsObject["keys"][number]>(total),
      values: new Array<number>(total),
      numerators: new Array<number | undefined>(total),
      denominators: new Array<number | undefined>(total),
      target: new Array<number | undefined>(total),
      ll99: new Array<number | undefined>(total),
      ll95: new Array<number | undefined>(total),
      ll68: new Array<number | undefined>(total),
      ul68: new Array<number | undefined>(total),
      ul95: new Array<number | undefined>(total),
      ul99: new Array<number | undefined>(total),
      count: new Array<number | undefined>(total),
      alt_target: new Array<number | undefined>(total),
      speclimits_lower: new Array<number | undefined>(total),
      speclimits_upper: new Array<number | undefined>(total),
      trend_line: new Array<number | undefined>(total)
    };
    // Per-row inputs join through each returned key's position (moving ranges drop a key per segment)
    const perRow: Partial<Record<LimitSeries, readonly (number | undefined)[]>> = {
      alt_target: inputData.alt_target,
      speclimits_lower: inputData.speclimits_lower,
      speclimits_upper: inputData.speclimits_upper
    };
    let position: number = 0;
    for (let g = 0; g < segments.length; g++) {
      const group = segments[g];
      const trend_line = calculateTrendLine(group.values);
      for (let i = 0; i < group.keys.length; i++) {
        const key = group.keys[i];
        controlLimits.keys[position] = key;
        controlLimits.values[position] = group.values[i];
        for (let s = 0; s < limitSeries.length; s++) {
          const name = limitSeries[s];
          const rows = perRow[name];
          const value = rows !== undefined ? rows[key.x] : name === "trend_line" ? trend_line[i] : group[name]?.[i];
          controlLimits[name][position] = isValidNumber(value) ? value : undefined;
        }
        position++;
      }
    }
    return controlLimits;
  }

  initialisePlotDataGrouped(): void {
    this.plotPoints = [];
    this.groupedRows = [];
    this.tableColumns = new Array<{ name: string; label: string; }[]>();

    const tableColumnsDef = new Array<{ name: string; label: string; }>();
    for (let i = 0; i < this.indicatorVarNames.length; i++) {
      tableColumnsDef.push({ name: `indicator_${i}`, label: this.indicatorVarNames[i] });
    }
    tableColumnsDef.push({ name: "latest_date", label: "Latest Date" });

    let anyDenominators: boolean = false;
    let anyControlLimits: boolean = false;
    for (let i = 0; i < this.inputData.length; i++) {
      anyDenominators = anyDenominators || this.inputData[i].limitInputArgs.denominators !== undefined;
      anyControlLimits = anyControlLimits || this.inputSettings.derivedSettings[i].chart_type_props.has_control_limits;
    }
    tableColumnsDef.push(...lineColumns(this.inputSettings.settings[0], anyDenominators, anyControlLimits));
    const nhsIconSettings: settingsValueType["nhs_icons"] = this.inputSettings.settings[0].nhs_icons;
    if (nhsIconSettings.show_variation_icons) {
      tableColumnsDef.push({ name: "variation", label: "Variation" });
    }
    if (nhsIconSettings.show_assurance_icons) {
      tableColumnsDef.push({ name: "assurance", label: "Assurance" });
    }
    let anyTooltips: boolean = false;
    for (let i = 0; i < this.inputData.length && !anyTooltips; i++) {
      const rowTooltips = this.inputData[i].tooltips;
      for (let j = 0; j < rowTooltips.length && !anyTooltips; j++) {
        anyTooltips = rowTooltips[j].length > 0;
      }
    }

    if (anyTooltips) {
      const firstTooltips = this.inputData[0].tooltips[0];
      for (let i = 0; i < firstTooltips.length; i++) {
        tableColumnsDef.push({ name: `tooltip_${i}`, label: firstTooltips[i].displayName });
      }
    }

    // Set unconditionally (not inside the filtered loop below) since columns don't vary by group
    this.tableColumns[0] = tableColumnsDef;

    for (let i: number = 0; i < this.groupNames.length; i++) {
      const formatValues = this.inputSettings.derivedSettings[i].formatValue;
      const varIconFilter = this.inputSettings.settings[i].summary_table.table_variation_filter;
      const assIconFilter = this.inputSettings.settings[i].summary_table.table_assurance_filter;
      const limits: controlLimitsObject = this.controlLimits[i];
      const outliers: outliersObject = this.outliers[i];
      const lastIndex: number = limits.keys.length - 1;
      const lastKey = limits.keys[lastIndex];
      const varIcons = lastKey === undefined ? [] : variationIconsToDraw(outliers, this.inputSettings.settings[i]);
      if (varIconFilter !== "all") {
        if (varIconFilter === "improvement" && !anyIcon(varIcons, ["improvementHigh", "improvementLow"])) {
          continue;
        }
        if (varIconFilter === "deterioration" && !anyIcon(varIcons, ["concernHigh", "concernLow"])) {
          continue;
        }
        if (varIconFilter === "neutral" && !anyIcon(varIcons, ["neutralHigh", "neutralLow"])) {
          continue;
        }
        if (varIconFilter === "common" && varIcons[0] !== "commonCause") {
          continue;
        }
        if (varIconFilter === "special" && varIcons[0] === "commonCause") {
          continue;
        }
      }
      const assIcon = assuranceIconToDraw(limits, this.inputSettings.settings[i],
                                                      this.inputSettings.derivedSettings[i]);
      if (assIconFilter !== "all") {
        if (assIconFilter === "any" && assIcon !== "consistentPass" && assIcon !== "consistentFail") {
          continue;
        }
        if (assIconFilter === "pass" && assIcon !== "consistentPass") {
          continue;
        }
        if (assIconFilter === "fail" && assIcon !== "consistentFail") {
          continue;
        }
        if (assIconFilter === "inconsistent" && assIcon !== "inconsistent") {
          continue;
        }
      }
      const indicatorColumns: Record<`indicator_${number}`, string> = {};
      for (let idx = 0; idx < this.indicatorVarNames.length; idx++) {
        indicatorColumns[`indicator_${idx}`] = this.groupNames[i][idx];
      }
      const tooltipColumns: Record<`tooltip_${number}`, string> = {};
      if (anyTooltips) {
        // Through the key, as moving ranges drop a row per segment
        const rowTooltips = this.inputData[i].tooltips[lastKey?.x ?? 0];
        for (let t = 0; t < rowTooltips.length; t++) {
          tooltipColumns[`tooltip_${t}`] = lastKey === undefined ? "" : rowTooltips[t].value;
        }
      }
      const table_row: summaryTableRowDataGrouped = {
        ...indicatorColumns,
        latest_date: lastKey?.label ?? "",
        value: formatValues(limits.values[lastIndex], "value"),
        numerator: formatValues(limits.numerators[lastIndex], "integer"),
        denominator: formatValues(limits.denominators[lastIndex], "integer"),
        target: formatValues(limits.target[lastIndex], "value"),
        alt_target: formatValues(limits.alt_target[lastIndex], "value"),
        ul99: formatValues(limits.ul99[lastIndex], "value"),
        ul95: formatValues(limits.ul95[lastIndex], "value"),
        ul68: formatValues(limits.ul68[lastIndex], "value"),
        ll68: formatValues(limits.ll68[lastIndex], "value"),
        ll95: formatValues(limits.ll95[lastIndex], "value"),
        ll99: formatValues(limits.ll99[lastIndex], "value"),
        speclimits_lower: formatValues(limits.speclimits_lower[lastIndex], "value"),
        speclimits_upper: formatValues(limits.speclimits_upper[lastIndex], "value"),
        trend_line: formatValues(limits.trend_line[lastIndex], "value"),
        assurance: assIcon,
        ...tooltipColumns
      };

      this.groupedRows.push({
        table_row,
        variation_icons: varIcons,
        identity: this.identities[i],
        aesthetics: this.inputSettings.settings[i].summary_table,
        highlighted: this.inputData[i].anyHighlights
      })
    }
  }

  initialisePlotData(): void {
    // Use first (and only) indicator data
    const inputData = this.inputData[0];
    const controlLimits = this.controlLimits[0];
    const outliers = this.outliers[0];
    const identities = this.identities[0];
    const settings = this.inputSettings.settings[0];
    const derivedSettings = this.inputSettings.derivedSettings[0];

    this.plotPoints = [];
    this.groupedRows = [];
    this.tickLabels = new Array<{ x: number; label: string; }>();
    this.tableColumns[0] = new Array<{ name: string; label: string; }>();

    this.tableColumns[0].push({ name: "date", label: "Date" });
    this.tableColumns[0].push(...lineColumns(settings, inputData.limitInputArgs.denominators !== undefined,
                                             derivedSettings.chart_type_props.has_control_limits));

    if (settings.outliers.astronomical) {
      this.tableColumns[0].push({ name: "astpoint", label: "Ast. Point" });
    }
    if (settings.outliers.trend) {
      this.tableColumns[0].push({ name: "trend", label: "Trend" });
    }
    if (settings.outliers.shift) {
      this.tableColumns[0].push({ name: "shift", label: "Shift" });
    }
    if (settings.outliers.two_in_three) {
      this.tableColumns[0].push({ name: "two_in_three", label: "Two-in-Three" });
    }

    for (let i: number = 0; i < controlLimits.keys.length; i++) {
      const index: number = controlLimits.keys[i].x;
      // Rows may share the store's default settings, so colour a copy
      const aesthetics = { ...inputData.scatter_formatting[index] };
      if (this.colourPalette.isHighContrast) {
        aesthetics.colour = this.colourPalette.foregroundColour;
      }
      // Later patterns take precedence, so an astronomical point's colour wins
      applyFlagColours(aesthetics, settings.outliers, [
        [outliers.shift[i], "shift_colour"], [outliers.trend[i], "trend_colour"],
        [outliers.two_in_three[i], "twointhree_colour"], [outliers.astpoint[i], "ast_colour"]
      ] as const);
      const table_row: summaryTableRowData = {
        date: controlLimits.keys[i].label,
        numerator: controlLimits.numerators[i],
        denominator: controlLimits.denominators[i],
        value: controlLimits.values[i],
        target: controlLimits.target[i],
        alt_target: controlLimits.alt_target[i],
        ll99: controlLimits.ll99[i],
        ll95: controlLimits.ll95[i],
        ll68: controlLimits.ll68[i],
        ul68: controlLimits.ul68[i],
        ul95: controlLimits.ul95[i],
        ul99: controlLimits.ul99[i],
        speclimits_lower: controlLimits.speclimits_lower[i],
        speclimits_upper: controlLimits.speclimits_upper[i],
        trend_line: controlLimits.trend_line[i],
        astpoint: outliers.astpoint[i],
        trend: outliers.trend[i],
        shift: outliers.shift[i],
        two_in_three: outliers.two_in_three[i]
      }


      this.plotPoints.push({
        x: index,
        value: controlLimits.values[i],
        aesthetics: aesthetics,
        table_row: table_row,
        identity: identities[index],
        highlighted: inputData.highlights[index] !== undefined,
        tooltip: buildTooltip(table_row, inputData.tooltips[index], settings, derivedSettings),
        label: {
          text_value: inputData.labels[index],
          aesthetics: inputData.label_formatting[index],
          angle: undefined,
          distance: undefined
        }
      })
      this.tickLabels.push({x: index, label: controlLimits.keys[i].label});
    }
  }

  initialiseGroupedLines(): void {
    const settings = this.inputSettings.settings[0];
    const derivedSettings = this.inputSettings.derivedSettings[0];
    const controlLimits = this.controlLimits[0];
    const inputData = this.inputData[0];

    const labels: LineName[] = [];
    if (settings.lines.show_main) {
      labels.push("values");
    }
    if (settings.lines.show_target) {
      labels.push("target");
    }
    if (settings.lines.show_alt_target) {
      labels.push("alt_target");
    }
    if (settings.lines.show_specification) {
      labels.push("speclimits_lower", "speclimits_upper");
    }
    if (settings.lines.show_trend) {
      labels.push("trend_line");
    }
    if (derivedSettings.chart_type_props.has_control_limits) {
      if (settings.lines.show_99) {
        labels.push("ll99", "ul99");
      }
      if (settings.lines.show_95) {
        labels.push("ll95", "ul95");
      }
      if (settings.lines.show_68) {
        labels.push("ll68", "ul68");
      }
    }

    const lines = new Array<[LineName, lineData[]]>(labels.length);
    for (let l = 0; l < labels.length; l++) {
      lines[l] = [labels[l], []];
    }
    const nLimits = controlLimits.keys.length;
    const groups = this.groupStartEndIndexes[0];
    const isGroupStart = new Array<boolean>(nLimits).fill(false);
    for (let i = 1; i < groups.length; i++) {
      isGroupStart[groups[i][0]] = true;
    }

    this.periodEnds = [];
    let position: number = 0;
    for (let i: number = 0; i < nLimits; i++) {
      const isRebaselinePoint: boolean = isGroupStart[i];
      let isNewAltTarget: boolean = false;
      if (i > 0 && settings.lines.show_alt_target) {
        isNewAltTarget = controlLimits.alt_target[i] !== controlLimits.alt_target[i - 1];
      }
      if (isRebaselinePoint) {
        this.periodEnds.push(position - 1);
      }
      position += 1 + (isRebaselinePoint ? 1 : 0) + (isNewAltTarget ? 2 : 0);
      const x = controlLimits.keys[i].x;
      const aesthetics = inputData.line_formatting[x];
      for (let l = 0; l < labels.length; l++) {
        const label = labels[l];
        const formattedLines = lines[l][1];
        const join_rebaselines: boolean = settings.lines[`join_rebaselines_${lineKeys[label]}`];
        const value = controlLimits[label][i];
        const is_alt_target: boolean = label === "alt_target";
        // A blank point at a rebaseline breaks the line unless the segments are joined; the alt. target only breaks where it changes
        if (isRebaselinePoint) {
          formattedLines.push({
            x,
            line_value: (!join_rebaselines && !is_alt_target) ? undefined : value,
            group: label,
            aesthetics
          });
        }
        // The old alt. target runs up to the change, so a target that changes every row stays visible
        if (isNewAltTarget) {
          formattedLines.push({
            x,
            line_value: is_alt_target ? controlLimits.alt_target[i - 1] : value,
            group: label,
            aesthetics
          }, {
            x,
            line_value: (is_alt_target && !join_rebaselines) ? undefined : value,
            group: label,
            aesthetics
          });
        }
        formattedLines.push({ x, line_value: value, group: label, aesthetics });
      }
    }
    this.periodEnds.push(position - 1);
    this.groupedLines = lines;
  }

  /** Scales to display units, then truncates the control limits in those units */
  scaleAndTruncateLimits(controlLimits: controlLimitsObject,
                         inputSettings: settingsValueType,
                         derivedSettings: derivedSettingsClass): void {
    const multiplier: number = derivedSettings.multiplier;
    const ll_truncate = inputSettings.spc.ll_truncate;
    const ul_truncate = inputSettings.spc.ul_truncate;
    const lines_to_scale: Exclude<keyof controlLimitsObject, "keys">[] = ["values", "target", "trend_line"];

    if (derivedSettings.chart_type_props.has_control_limits) {
      lines_to_scale.push(...limitLineNames);
    }
    if (inputSettings.lines.show_alt_target && inputSettings.lines.multiplier_alt_target) {
      lines_to_scale.push("alt_target");
    }
    if (inputSettings.lines.show_specification && inputSettings.lines.multiplier_specification) {
      lines_to_scale.push("speclimits_lower", "speclimits_upper");
    }

    for (let l = 0; l < lines_to_scale.length; l++) {
      const name = lines_to_scale[l];
      const series = controlLimits[name];
      const lower = truncatedSeries.has(name) ? ll_truncate : undefined;
      const upper = truncatedSeries.has(name) ? ul_truncate : undefined;
      for (let i: number = 0; i < series.length; i++) {
        const value = series[i];
        if (value !== undefined) {
          series[i] = clamp(value * multiplier, lower, upper);
        }
      }
    }
  }

  flagOutliers(controlLimits: Readonly<controlLimitsObject>, groupStartEndIndexes: readonly (readonly number[])[],
                inputSettings: settingsValueType, derivedSettings: derivedSettingsClass): outliersObject {
    const process_flag_type = inputSettings.outliers.process_flag_type;
    const improvement_direction = inputSettings.outliers.improvement_direction;
    const trend_n: number = inputSettings.outliers.trend_n;
    const shift_n: number = inputSettings.outliers.shift_n;
    const ast_specification: boolean = inputSettings.outliers.astronomical_limit === "Specification";
    const two_in_three_specification: boolean = inputSettings.outliers.two_in_three_limit === "Specification";
    const flagSettings: FlagSettings = { process_flag_type, improvement_direction };
    const outliers: outliersObject = {
      astpoint: rep<FlagDirection>("none", controlLimits.values.length),
      two_in_three: rep<FlagDirection>("none", controlLimits.values.length),
      trend: rep<FlagDirection>("none", controlLimits.values.length),
      shift: rep<FlagDirection>("none", controlLimits.values.length)
    }
    for (let i: number = 0; i < groupStartEndIndexes.length; i++) {
      const start: number = groupStartEndIndexes[i][0];
      const end: number = groupStartEndIndexes[i][1];
      const group_values: number[] = controlLimits.values.slice(start, end);
      const group_targets = controlLimits.target.slice(start, end);

      if (derivedSettings.chart_type_props.has_control_limits || ast_specification || two_in_three_specification) {
        const limitKeys = {
          "1 Sigma": ["ll68", "ul68"],
          "2 Sigma": ["ll95", "ul95"],
          "3 Sigma": ["ll99", "ul99"],
          "Specification": ["speclimits_lower", "speclimits_upper"]
        } as const satisfies Record<string, readonly [LimitSeries, LimitSeries]>;
        if (inputSettings.outliers.astronomical) {
          const astKeys = limitKeys[inputSettings.outliers.astronomical_limit];
          const lower_limits = controlLimits[astKeys[0]].slice(start, end);
          const upper_limits = controlLimits[astKeys[1]].slice(start, end);
          copyFlags(outliers.astpoint, astronomical(group_values, lower_limits, upper_limits), start, flagSettings);
        }
        if (inputSettings.outliers.two_in_three) {
          const highlight_series: boolean = inputSettings.outliers.two_in_three_highlight_series;
          const warnKeys = limitKeys[inputSettings.outliers.two_in_three_limit];
          const lower_warn_limits = controlLimits[warnKeys[0]].slice(start, end);
          const upper_warn_limits = controlLimits[warnKeys[1]].slice(start, end);
          copyFlags(outliers.two_in_three, twoInThree(group_values, lower_warn_limits, upper_warn_limits, highlight_series), start, flagSettings);
        }
      }
      if (inputSettings.outliers.trend) {
        copyFlags(outliers.trend, trend(group_values, trend_n), start, flagSettings);
      }
      if (inputSettings.outliers.shift) {
        copyFlags(outliers.shift, shift(group_values, group_targets, shift_n), start, flagSettings);
      }
    }
    return outliers;
  }
}
