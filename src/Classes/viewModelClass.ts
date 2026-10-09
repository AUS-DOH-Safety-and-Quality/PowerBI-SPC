import { groupCategoryRows, readColourPalette, validateDataView, type ColourPalette, type UpdateOptions } from "powerbi-visuals-core/powerbi";
import type powerbi from "powerbi-visuals-api";
type IVisualHost = powerbi.extensibility.visual.IVisualHost;
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
type ISelectionId = powerbi.visuals.ISelectionId;
import * as limitFunctions from "../Limit Calculations"
import settingsClass from "./settingsClass";
import { type settingsValueType } from "../settings";
import type derivedSettingsClass from "./derivedSettingsClass";
import buildTooltip from "../Functions/buildTooltip";
import { rep, between, calculateTrendLine } from "powerbi-visuals-core/math";
import type { dataObject } from "../Functions/extractInputData";
import extractInputData from "../Functions/extractInputData";
import { isNullOrUndefined, isValidNumber, groupBy, pickRows, checkFlagDirection, type FlagDirection, type OutlierStatus } from "powerbi-visuals-core/data";
import variationIconsToDraw from "../Outlier Flagging/variationIconsToDraw";
import assuranceIconToDraw from "../Outlier Flagging/assuranceIconToDraw";
import validateDataViewColumns from "../Functions/validateDataViewColumns";
import { astronomical, shift, trend, twoInThree } from "powerbi-visuals-core/spc";
import lineKeys, { type LineName } from "../Functions/lineKeys";
import type { NhsIconName } from "../D3 Plotting Functions/NHS Icons";
import { sequence } from "powerbi-visuals-core/math";

import type { ErrorKind } from "powerbi-visuals-core/rendering";

export type viewModelValidationT = {
  status: boolean,
  error?: string,
  warning?: string,
  type?: ErrorKind
}

export type lineData = {
  x: number;
  line_value: number | undefined;
  group: LineName;
  aesthetics: settingsValueType["lines"];
}

export type summaryTableRowData = {
  date: string;
  numerator: number | undefined;
  denominator: number | undefined;
  value: number;
  target: number | undefined;
  alt_target: number | undefined;
  ll99: number | undefined;
  ll95: number | undefined;
  ll68: number | undefined;
  ul68: number | undefined;
  ul95: number | undefined;
  ul99: number | undefined;
  speclimits_lower: number | undefined;
  speclimits_upper: number | undefined;
  trend_line: number | undefined;
  astpoint: FlagDirection;
  trend: FlagDirection;
  shift: FlagDirection;
  two_in_three: FlagDirection;
}

/** Grouped rows hold formatted text; indicator and tooltip columns are named by the report */
export type summaryTableRowDataGrouped = {
  [column: string]: string;
  latest_date: string;
  value: string;
  numerator: string;
  denominator: string;
  target: string;
  alt_target: string;
  ucl99: string;
  ucl95: string;
  ucl68: string;
  lcl68: string;
  lcl95: string;
  lcl99: string;
  variation: NhsIconName;
  assurance: NhsIconName | "none";
}

export type plotData = {
  x: number;
  value: number;
  aesthetics: settingsValueType["scatter"];
  table_row: summaryTableRowData;
  identity: ISelectionId;
  /** Highlighted by selections in other visuals */
  highlighted: boolean;
  tooltip: VisualTooltipDataItem[];
  label: {
    text_value: string | undefined,
    aesthetics: settingsValueType["labels"],
    angle: number | undefined,
    distance: number | undefined
  };
}

export type plotDataGrouped = {
  table_row: summaryTableRowDataGrouped;
  identity: ISelectionId[];
  aesthetics: settingsValueType["summary_table"];
  highlighted: boolean;
}

/** Every series is row-aligned with `keys`; a cell is undefined where the chart or settings define no value */
export type controlLimitsObject = {
  keys: { x: number, id: number, label: string }[];
  values: number[];
  numerators: (number | undefined)[];
  denominators: (number | undefined)[];
  targets: (number | undefined)[];
  ll99: (number | undefined)[];
  ll95: (number | undefined)[];
  ll68: (number | undefined)[];
  ul68: (number | undefined)[];
  ul95: (number | undefined)[];
  ul99: (number | undefined)[];
  count: (number | undefined)[];
  alt_targets: (number | undefined)[];
  speclimits_lower: (number | undefined)[];
  speclimits_upper: (number | undefined)[];
  trend_line: (number | undefined)[];
};

export type LimitSeries = Exclude<keyof controlLimitsObject, "keys" | "values">;
/** Listed exhaustively so merging and sanitising cover every series */
const limitSeries = Object.keys({
  numerators: true,
  denominators: true,
  targets: true,
  ll99: true,
  ll95: true,
  ll68: true,
  ul68: true,
  ul95: true,
  ul99: true,
  count: true,
  alt_targets: true,
  speclimits_lower: true,
  speclimits_upper: true,
  trend_line: true
} satisfies Record<LimitSeries, true>) as LimitSeries[];

/** Calculators return only the series their chart defines */
export type CalculatedLimits = Pick<controlLimitsObject, "keys" | "values"> & Partial<Pick<controlLimitsObject, LimitSeries>>;

export type controlLimitsArgs = {
  keys: { x: number, id: number, label: string }[];
  numerators: number[];
  denominators?: number[];
  xbar_sds?: number[];
  outliers_in_limits?: boolean;
  subset_points: number[];
}

export type outliersObject = {
  astpoint: FlagDirection[];
  trend: FlagDirection[];
  two_in_three: FlagDirection[];
  shift: FlagDirection[];
}

function copyInto<T>(target: T[], source: readonly T[], offset: number): void {
  for (let i = 0; i < source.length; i++) {
    target[offset + i] = source[i];
  }
}

export default class viewModelClass {
  inputData: dataObject[];
  inputSettings: settingsClass;
  controlLimits: controlLimitsObject[];
  outliers: outliersObject[];
  plotPoints: plotData[];
  groupedRows: plotDataGrouped[];
  groupedLines: [LineName, lineData[]][];
  tickLabels: { x: number; label: string; }[];
  splitIndexes: number[];
  groupStartEndIndexes: number[][][];
  firstRun: boolean;
  colourPalette: ColourPalette;
  tableColumns: { name: string; label: string; }[][];
  svgWidth: number;
  svgHeight: number;
  headless: boolean;
  frontend: boolean;

  indicatorVarNames: string[];
  groupNames: string[][];
  identities: ISelectionId[][];

  get showGrouped(): boolean {
    return this.inputData && this.inputData.length > 1;
  }

  constructor() {
    this.inputData = new Array<dataObject>();
    this.inputSettings = new settingsClass();
    this.controlLimits = new Array<controlLimitsObject>();
    this.outliers = new Array<outliersObject>();
    this.plotPoints = [];
    this.groupedRows = [];
    this.groupedLines = [];
    this.firstRun = true
    this.splitIndexes = new Array<number>();
    this.groupStartEndIndexes = new Array<number[][]>();
    this.identities = new Array<ISelectionId[]>();
    this.tableColumns = new Array<{ name: string; label: string; }[]>();
    this.colourPalette = {} as ColourPalette;
    this.headless = false;
    this.frontend = false;
    this.tickLabels = [];
    this.svgWidth = 0;
    this.svgHeight = 0;
    this.indicatorVarNames = [];
    this.groupNames = [];
  }

  update(options: UpdateOptions, host: IVisualHost): viewModelValidationT {
    // Read before any early return so error rendering is themed
    this.colourPalette = readColourPalette(host);
    const checkView = validateDataView(options.dataViews, ["numerators"]);
    if (checkView.status !== "valid") {
      return { status: false, error: checkView.error };
    }
    const view = checkView.view;
    this.svgWidth = options.viewport.width;
    this.svgHeight = options.viewport.height;
    this.headless = options.headless ?? false;
    this.frontend = options.frontend ?? false;

    const indicator_cols = view.categories.indicator ?? [];
    this.indicatorVarNames = new Array<string>(indicator_cols.length);
    for (let i = 0; i < indicator_cols.length; i++) {
      this.indicatorVarNames[i] = indicator_cols[i].source.displayName;
    }

    const res: viewModelValidationT = { status: true };
    const indicatorGroups = groupCategoryRows(indicator_cols, view.rowCount);
    const idx_per_indicator = indicatorGroups.rows;
    this.groupNames = indicatorGroups.names;

    // Data and Style updates both rebuild settings, so theme changes reach the derived values
    const dataChanged = (options.type & (2 | 16)) !== 0 || this.firstRun;
    if (dataChanged) {
      this.inputSettings.update(view.category, idx_per_indicator);
    }
    if (this.inputSettings.validationStatus.status !== 0) {
      res.status = false;
      res.error = this.inputSettings.validationStatus.error;
      res.type = "settings";
      return res;
    }
    const checkDV: string = validateDataViewColumns(this.inputSettings, view.values);
    if (checkDV !== "valid") {
      res.status = false;
      res.error = checkDV;
      return res;
    }

    const inputErrors: string[] = [];

    if (dataChanged) {
      const hasIndicator = indicator_cols.length > 0;
      const split_indexes_str: string = <string>(view.dataView.metadata.objects?.split_indexes_storage?.split_indexes) ?? "[]";
      const split_indexes: number[] = JSON.parse(split_indexes_str);
      this.splitIndexes = hasIndicator ? [] : split_indexes;

      this.inputData = new Array<dataObject>();
      this.groupStartEndIndexes = new Array<number[][]>();
      this.controlLimits = new Array<controlLimitsObject>();
      this.outliers = new Array<outliersObject>();
      this.identities = new Array<ISelectionId[]>();
      this.tableColumns = new Array<{ name: string; label: string; }[]>();

      const messagePositionByRowIndex = this.inputSettings.messagePositionByRowIndex;

      for (let idx = 0; idx < idx_per_indicator.length; idx++) {
        const group_idxs = idx_per_indicator[idx];
        const settings = this.inputSettings.settings[idx];
        const derivedSettings = this.inputSettings.derivedSettings[idx];

        const extraction = extractInputData(
          view,
          settings,
          derivedSettings,
          this.inputSettings.validationStatus.messages,
          group_idxs,
          messagePositionByRowIndex
        );
        if (extraction.status !== "valid") {
          inputErrors.push(extraction.error);
          continue;
        }
        const inpData = extraction.data;
        this.inputData.push(inpData);

        const inputGroupStartEnd: number[][] = this.getGroupingIndexes(inpData, idx === 0 ? this.splitIndexes : undefined);
        const limits: controlLimitsObject = this.calculateLimits(inpData, inputGroupStartEnd, settings);
        const groupStartEnd: number[][] = this.getResultGroupIndexes(limits.keys, inputGroupStartEnd);
        const outliers: outliersObject = this.flagOutliers(limits, groupStartEnd, settings, derivedSettings);
        this.scaleAndTruncateLimits(limits, settings, derivedSettings);

        const keys = inpData.limitInputArgs.keys;
        const identities = new Array<ISelectionId>(keys.length);
        for (let i = 0; i < keys.length; i++) {
          identities[i] = host.createSelectionIdBuilder().withCategory(inpData.categories, keys[i].id).createSelectionId();
        }

        this.groupStartEndIndexes.push(groupStartEnd);
        this.controlLimits.push(limits);
        this.outliers.push(outliers);
        this.identities.push(identities);
      }

      if (inputErrors.length === 0) {
        if (this.showGrouped) {
          this.initialisePlotDataGrouped();
        } else {
          this.initialisePlotData(host);
          this.initialiseGroupedLines();
        }
      }
    }

    if (inputErrors.length > 0) {
      this.inputData = [];
      this.controlLimits = [];
      this.groupStartEndIndexes = [];
      this.outliers = [];
      this.identities = [];
      this.plotPoints = [];
      this.groupedRows = [];
      this.groupedLines = [];
      this.tickLabels = [];
      this.firstRun = true;
      return { status: false, error: inputErrors.join("\n") };
    }
    this.firstRun = false;

    const warnings: string[] = [];
    for (let i = 0; i < this.inputData.length; i++) {
      if (this.inputData[i].warningMessage !== "") {
        warnings.push(this.inputData[i].warningMessage);
      }
    }
    if (warnings.length > 0) {
      res.warning = warnings.join("\n");
    }

    return res;
  }

  getGroupingIndexes(inputData: dataObject, splitIndexes?: number[]): number[][] {
    const candidateIndexes: number[] = (splitIndexes ?? [])
                                          .concat([-1])
                                          .concat(inputData.groupingIndexes)
                                          .concat([inputData.limitInputArgs.keys.length - 1]);
    const allIndexes: number[] = [];
    for (let i = 0; i < candidateIndexes.length; i++) {
      if (candidateIndexes.indexOf(candidateIndexes[i]) === i) {
        allIndexes.push(candidateIndexes[i]);
      }
    }
    allIndexes.sort((a,b) => a - b);

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

  calculateLimits(inputData: dataObject, groupStartEndIndexes: number[][], inputSettings: settingsValueType): controlLimitsObject {
    const limitFunction: (args: controlLimitsArgs) => CalculatedLimits
      = limitFunctions[inputSettings.spc.chart_type];

    const num_points_subset = inputSettings.spc.num_points_subset;
    const subset_points_from = inputSettings.spc.subset_points_from;
    const subset_rebaselines = inputSettings.spc.subset_rebaselines;
    const args = inputData.limitInputArgs;

    // Series a chart does not define are filled blank so every series stays row-aligned across segments
    const controlLimits: controlLimitsObject = {
      keys: [],
      values: [],
      numerators: [],
      denominators: [],
      targets: [],
      ll99: [],
      ll95: [],
      ll68: [],
      ul68: [],
      ul95: [],
      ul99: [],
      count: [],
      alt_targets: [],
      speclimits_lower: [],
      speclimits_upper: [],
      trend_line: []
    };
    for (let g = 0; g < groupStartEndIndexes.length; g++) {
      const start: number = groupStartEndIndexes[g][0];
      const end: number = groupStartEndIndexes[g][1];
      const n: number = end - start;
      const applySubset: boolean = g === 0 || subset_rebaselines;
      const subsetCount: number = applySubset && !isNullOrUndefined(num_points_subset) && between(num_points_subset, 1, n)
        ? num_points_subset : n;
      const subsetStart: number = subset_points_from === "Start" ? 0 : n - subsetCount;
      const group = limitFunction({
        keys: args.keys.slice(start, end),
        numerators: args.numerators.slice(start, end),
        denominators: args.denominators?.slice(start, end),
        xbar_sds: args.xbar_sds?.slice(start, end),
        outliers_in_limits: inputSettings.spc.outliers_in_limits,
        subset_points: sequence(subsetStart, subsetCount, 1)
      });
      group.trend_line = calculateTrendLine(group.values);
      controlLimits.keys = controlLimits.keys.concat(group.keys);
      controlLimits.values = controlLimits.values.concat(group.values);
      for (let s = 0; s < limitSeries.length; s++) {
        const name = limitSeries[s];
        controlLimits[name] = controlLimits[name].concat(group[name] ?? rep(undefined, group.keys.length));
      }
    }

    // Per-row inputs join through each returned key's position (moving ranges drop a key per segment)
    const positions = new Array<number>(controlLimits.keys.length);
    for (let i = 0; i < positions.length; i++) {
      positions[i] = controlLimits.keys[i].x;
    }
    controlLimits.alt_targets = pickRows(inputData.alt_targets, positions);
    controlLimits.speclimits_lower = pickRows(inputData.speclimits_lower, positions);
    controlLimits.speclimits_upper = pickRows(inputData.speclimits_upper, positions);

    for (let s = 0; s < limitSeries.length; s++) {
      const series = controlLimits[limitSeries[s]];
      for (let i = 0; i < series.length; i++) {
        if (!isValidNumber(series[i])) {
          series[i] = undefined;
        }
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
      tableColumnsDef.push({ name: this.indicatorVarNames[i], label: this.indicatorVarNames[i] });
    }
    tableColumnsDef.push({ name: "latest_date", label: "Latest Date" });

    const lineSettings = this.inputSettings.settings[0].lines;
    if (lineSettings.show_main) {
      tableColumnsDef.push({ name: "value", label: "Value" });
    }
    if (this.inputSettings.settings[0].spc.ttip_show_numerator) {
      tableColumnsDef.push({ name: "numerator", label: "Numerator" });
    }
    if (this.inputSettings.settings[0].spc.ttip_show_denominator) {
      tableColumnsDef.push({ name: "denominator", label: "Denominator" });
    }
    if (lineSettings.show_target) {
      tableColumnsDef.push({ name: "target", label: lineSettings.ttip_label_target });
    }
    if (lineSettings.show_alt_target) {
      tableColumnsDef.push({ name: "alt_target", label: lineSettings.ttip_label_alt_target });
    }
    // Upper limits run outermost-first and lower limits innermost-first
    const limitLevels = ["99", "95", "68"] as const;
    for (let l = 0; l < limitLevels.length; l++) {
      const limit = limitLevels[l];
      if (lineSettings[`show_${limit}`]) {
        tableColumnsDef.push({
          name: `ucl${limit}`,
          label: `${lineSettings[`ttip_label_${limit}_prefix_upper`]}${lineSettings[`ttip_label_${limit}`]}`
        })
      }
    }
    for (let l = limitLevels.length - 1; l >= 0; l--) {
      const limit = limitLevels[l];
      if (lineSettings[`show_${limit}`]) {
        tableColumnsDef.push({
          name: `lcl${limit}`,
          label: `${lineSettings[`ttip_label_${limit}_prefix_lower`]}${lineSettings[`ttip_label_${limit}`]}`
        })
      }
    }
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
        tableColumnsDef.push({ name: firstTooltips[i].displayName, label: firstTooltips[i].displayName });
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
      const varIcons = variationIconsToDraw(outliers, this.inputSettings.settings[i]);
      if (varIconFilter !== "all") {
        if (varIconFilter === "improvement" && !(["improvementHigh", "improvementLow"].includes(varIcons[0]))) {
          continue;
        }
        if (varIconFilter === "deterioration" && !(["concernHigh", "concernLow"].includes(varIcons[0]))) {
          continue;
        }
        if (varIconFilter === "neutral" && !(["neutralHigh", "neutralLow"].includes(varIcons[0]))) {
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
        if (assIconFilter === "any" && assIcon === "inconsistent") {
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
      // Indicator columns come first and tooltip columns last, so a shared name resolves as before
      const indicatorColumns: Record<string, string> = {};
      for (let idx = 0; idx < this.indicatorVarNames.length; idx++) {
        indicatorColumns[this.indicatorVarNames[idx]] = this.groupNames[i][idx];
      }
      const tooltipColumns: Record<string, string> = {};
      if (anyTooltips) {
        const rowTooltips = this.inputData[i].tooltips[lastIndex];
        for (let t = 0; t < rowTooltips.length; t++) {
          tooltipColumns[rowTooltips[t].displayName] = rowTooltips[t].value;
        }
      }
      const table_row: summaryTableRowDataGrouped = {
        ...indicatorColumns,
        latest_date: limits.keys[lastIndex].label,
        value: formatValues(limits.values[lastIndex], "value"),
        numerator: formatValues(limits.numerators[lastIndex], "integer"),
        denominator: formatValues(limits.denominators[lastIndex], "integer"),
        target: formatValues(limits.targets[lastIndex], "value"),
        alt_target: formatValues(limits.alt_targets[lastIndex], "value"),
        ucl99: formatValues(limits.ul99[lastIndex], "value"),
        ucl95: formatValues(limits.ul95[lastIndex], "value"),
        ucl68: formatValues(limits.ul68[lastIndex], "value"),
        lcl68: formatValues(limits.ll68[lastIndex], "value"),
        lcl95: formatValues(limits.ll95[lastIndex], "value"),
        lcl99: formatValues(limits.ll99[lastIndex], "value"),
        variation: varIcons[0],
        assurance: assIcon,
        ...tooltipColumns
      };

      this.groupedRows.push({
        table_row,
        identity: this.identities[i],
        aesthetics: this.inputSettings.settings[i].summary_table,
        highlighted: this.inputData[i].anyHighlights
      })
    }
  }

  initialisePlotData(host: IVisualHost): void {
    // Use first (and only) indicator data
    const inputData = this.inputData[0];
    const controlLimits = this.controlLimits[0];
    const outliers = this.outliers[0];
    const settings = this.inputSettings.settings[0];
    const derivedSettings = this.inputSettings.derivedSettings[0];

    this.plotPoints = [];
    this.groupedRows = [];
    this.tickLabels = new Array<{ x: number; label: string; }>();
    this.tableColumns[0] = new Array<{ name: string; label: string; }>();

    this.tableColumns[0].push({ name: "date", label: "Date" });
    this.tableColumns[0].push({ name: "value", label: "Value" });

    if (inputData.limitInputArgs.denominators !== undefined) {
      this.tableColumns[0].push({ name: "numerator", label: "Numerator" });
      this.tableColumns[0].push({ name: "denominator", label: "Denominator" });
    }
    if (settings.lines.show_target) {
      this.tableColumns[0].push({ name: "target", label: "Target" });
    }
    if (settings.lines.show_alt_target) {
      this.tableColumns[0].push({ name: "alt_target", label: "Alt. Target" });
    }
    if (settings.lines.show_specification) {
      this.tableColumns[0].push({ name: "speclimits_lower", label: "Spec. Lower" },
                             { name: "speclimits_upper", label: "Spec. Upper" });
    }
    if (settings.lines.show_trend) {
      this.tableColumns[0].push({ name: "trend_line", label: "Trend Line" });
    }
    if (derivedSettings.chart_type_props.has_control_limits) {
      if (settings.lines.show_99) {
        this.tableColumns[0].push({ name: "ll99", label: "LL 99%" },
                               { name: "ul99", label: "UL 99%" });
      }
      if (settings.lines.show_95) {
        this.tableColumns[0].push({ name: "ll95", label: "LL 95%" }, { name: "ul95", label: "UL 95%" });
      }
      if (settings.lines.show_68) {
        this.tableColumns[0].push({ name: "ll68", label: "LL 68%" }, { name: "ul68", label: "UL 68%" });
      }
    }

    if (settings.outliers.astronomical) {
      this.tableColumns[0].push({ name: "astpoint", label: "Ast. Point" });
    }
    if (settings.outliers.trend) {
      this.tableColumns[0].push({ name: "trend", label: "Trend" });
    }
    if (settings.outliers.shift) {
      this.tableColumns[0].push({ name: "shift", label: "Shift" });
    }

    for (let i: number = 0; i < controlLimits.keys.length; i++) {
      const index: number = controlLimits.keys[i].x;
      const aesthetics: settingsValueType["scatter"] = inputData.scatter_formatting[index];
      if (this.colourPalette.isHighContrast) {
        aesthetics.colour = this.colourPalette.foregroundColour;
      }
      // Later patterns take precedence, so an astronomical point's colour wins
      const flagged: [FlagDirection, "shift_colour" | "trend_colour" | "twointhree_colour" | "ast_colour"][] = [
        [outliers.shift[i], "shift_colour"], [outliers.trend[i], "trend_colour"],
        [outliers.two_in_three[i], "twointhree_colour"], [outliers.astpoint[i], "ast_colour"]
      ];
      for (let j = 0; j < flagged.length; j++) {
        const status = flagged[j][0];
        const prefix = flagged[j][1];
        if (status !== "none") {
          const colour = settings.outliers[`${prefix}_${status}`];
          aesthetics.colour = colour;
          aesthetics.colour_outline = colour;
        }
      }
      const table_row: summaryTableRowData = {
        date: controlLimits.keys[i].label,
        numerator: controlLimits.numerators[i],
        denominator: controlLimits.denominators[i],
        value: controlLimits.values[i],
        target: controlLimits.targets[i],
        alt_target: controlLimits.alt_targets[i],
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
        identity: host.createSelectionIdBuilder()
                      .withCategory(inputData.categories, controlLimits.keys[i].id)
                      .createSelectionId(),
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
      labels.push("targets");
    }
    if (settings.lines.show_alt_target) {
      labels.push("alt_targets");
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

    const formattedLines: lineData[] = new Array<lineData>();
    const nLimits = controlLimits.keys.length;
    const groups = this.groupStartEndIndexes[0];
    const isGroupStart = new Array<boolean>(nLimits).fill(false);
    for (let i = 1; i < groups.length; i++) {
      isGroupStart[groups[i][0]] = true;
    }

    for (let i: number = 0; i < nLimits; i++) {
      const isRebaselinePoint: boolean = isGroupStart[i];
      let isNewAltTarget: boolean = false;
      if (i > 0 && settings.lines.show_alt_target) {
        isNewAltTarget = controlLimits.alt_targets[i] !== controlLimits.alt_targets[i - 1];
      }
      for (let l = 0; l < labels.length; l++) {
        const label = labels[l];
        const join_rebaselines: boolean = settings.lines[`join_rebaselines_${lineKeys[label]}`];
        // By adding an additional null line value at each re-baseline point
        // we avoid rendering a line joining each segment
        if (isRebaselinePoint || isNewAltTarget) {
          const is_alt_target: boolean = label === "alt_targets" && isNewAltTarget;
          const is_rebaseline: boolean = label !== "alt_targets" && isRebaselinePoint;
          formattedLines.push({
            x: controlLimits.keys[i].x,
            line_value: (!join_rebaselines && (is_alt_target || is_rebaseline)) ? undefined : controlLimits[label][i],
            group: label,
            aesthetics: inputData.line_formatting[controlLimits.keys[i].x]
          })
        }

        formattedLines.push({
          x: controlLimits.keys[i].x,
          line_value: controlLimits[label][i],
          group: label,
          aesthetics: inputData.line_formatting[controlLimits.keys[i].x]
        })
      }
    }
    this.groupedLines = groupBy(formattedLines, "group");
  }

  scaleAndTruncateLimits(controlLimits: controlLimitsObject,
                          inputSettings: settingsValueType,
                          derivedSettings: derivedSettingsClass): void {
    const multiplier: number = derivedSettings.multiplier;
    let lines_to_scale: Exclude<keyof controlLimitsObject, "keys">[] = ["values", "targets"];

    if (derivedSettings.chart_type_props.has_control_limits) {
      lines_to_scale = lines_to_scale.concat(["ll99", "ll95", "ll68", "ul68", "ul95", "ul99"]);
    }

    let lines_to_truncate: Exclude<keyof controlLimitsObject, "keys">[] = lines_to_scale;
    if (inputSettings.lines.show_alt_target) {
      lines_to_truncate = lines_to_truncate.concat(["alt_targets"]);
      if (inputSettings.lines.multiplier_alt_target) {
        lines_to_scale = lines_to_scale.concat(["alt_targets"]);
      }
    }
    if (inputSettings.lines.show_specification) {
      lines_to_truncate = lines_to_truncate.concat(["speclimits_lower", "speclimits_upper"]);
      if (inputSettings.lines.multiplier_specification) {
        lines_to_scale = lines_to_scale.concat(["speclimits_lower", "speclimits_upper"]);
      }
    }

    for (let l = 0; l < lines_to_scale.length; l++) {
      const series = controlLimits[lines_to_scale[l]];
      for (let i: number = 0; i < series.length; i++) {
        const value = series[i];
        if (value !== undefined) {
          series[i] = value * multiplier;
        }
      }
    }

    for (let l = 0; l < lines_to_truncate.length; l++) {
      const series = controlLimits[lines_to_truncate[l]];
      for (let i: number = 0; i < series.length; i++) {
        const value = series[i];
        if (value !== undefined) {
          const lower_trunc: number = isValidNumber(inputSettings.spc.ll_truncate)
            ? Math.max(inputSettings.spc.ll_truncate, value)
            : value;
          const upper_trunc: number = isValidNumber(inputSettings.spc.ul_truncate)
            ? Math.min(inputSettings.spc.ul_truncate, lower_trunc)
            : lower_trunc;
          series[i] = upper_trunc;
        }
      }
    }
  }

  flagOutliers(controlLimits: controlLimitsObject, groupStartEndIndexes: number[][],
                inputSettings: settingsValueType, derivedSettings: derivedSettingsClass): outliersObject {
    const process_flag_type = inputSettings.outliers.process_flag_type;
    const improvement_direction = inputSettings.outliers.improvement_direction;
    const trend_n: number = inputSettings.outliers.trend_n;
    const shift_n: number = inputSettings.outliers.shift_n;
    const ast_specification: boolean = inputSettings.outliers.astronomical_limit === "Specification";
    const two_in_three_specification: boolean = inputSettings.outliers.two_in_three_limit === "Specification";
    const outliers: Record<keyof outliersObject, OutlierStatus[]> = {
      astpoint: rep<OutlierStatus>("none", controlLimits.values.length),
      two_in_three: rep<OutlierStatus>("none", controlLimits.values.length),
      trend: rep<OutlierStatus>("none", controlLimits.values.length),
      shift: rep<OutlierStatus>("none", controlLimits.values.length)
    }
    for (let i: number = 0; i < groupStartEndIndexes.length; i++) {
      const start: number = groupStartEndIndexes[i][0];
      const end: number = groupStartEndIndexes[i][1];
      const group_values: number[] = controlLimits.values.slice(start, end);
      const group_targets = controlLimits.targets.slice(start, end);

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
          copyInto(outliers.astpoint, astronomical(group_values, lower_limits, upper_limits), start);
        }
        if (inputSettings.outliers.two_in_three) {
          const highlight_series: boolean = inputSettings.outliers.two_in_three_highlight_series;
          const warnKeys = limitKeys[inputSettings.outliers.two_in_three_limit];
          const lower_warn_limits = controlLimits[warnKeys[0]].slice(start, end);
          const upper_warn_limits = controlLimits[warnKeys[1]].slice(start, end);
          copyInto(outliers.two_in_three, twoInThree(group_values, lower_warn_limits, upper_warn_limits, highlight_series), start);
        }
      }
      if (inputSettings.outliers.trend) {
        copyInto(outliers.trend, trend(group_values, trend_n), start);
      }
      if (inputSettings.outliers.shift) {
        copyInto(outliers.shift, shift(group_values, group_targets, shift_n), start);
      }
    }
    const flagSettings = { process_flag_type, improvement_direction };
    const flag = (raw: readonly OutlierStatus[]): FlagDirection[] => {
      const flagged = new Array<FlagDirection>(raw.length);
      for (let i = 0; i < raw.length; i++) {
        flagged[i] = checkFlagDirection(raw[i], flagSettings);
      }
      return flagged;
    };
    return {
      astpoint: flag(outliers.astpoint),
      two_in_three: flag(outliers.two_in_three),
      trend: flag(outliers.trend),
      shift: flag(outliers.shift)
    };
  }
}
