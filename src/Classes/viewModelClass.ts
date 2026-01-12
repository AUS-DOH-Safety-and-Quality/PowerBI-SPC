import type powerbi from "powerbi-visuals-api";
type IVisualHost = powerbi.extensibility.visual.IVisualHost;
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
type ISelectionId = powerbi.visuals.ISelectionId;
import * as limitFunctions from "../Limit Calculations"
import { settingsClass, type defaultSettingsType, type derivedSettingsClass } from "../Classes";
import { buildTooltip, getAesthetic, checkFlagDirection, truncate, type truncateInputs, multiply, rep, type dataObject, extractInputData, isNullOrUndefined, variationIconsToDraw, assuranceIconToDraw, validateDataView, valueFormatter, calculateTrendLine, groupBy } from "../Functions"
import { astronomical, trend, twoInThree, shift } from "../Outlier Flagging"
import { lineNameMap } from "../Functions/getAesthetic";

export type viewModelValidationT = {
  status: boolean,
  error?: string,
  warning?: string,
  type?: string
}

export type lineData = {
  x: number;
  line_value: number;
  group: string;
  aesthetics: defaultSettingsType["lines"];
}

export type summaryTableRowData = {
  date: string;
  numerator: number;
  denominator: number;
  value: number;
  target: number;
  alt_target: number;
  ll99: number;
  ll95: number;
  ll68: number;
  ul68: number;
  ul95: number;
  ul99: number;
  speclimits_lower: number;
  speclimits_upper: number;
  trend_line: number;
  astpoint: string;
  trend: string;
  shift: string;
  two_in_three: string;
}

export type summaryTableRowDataGrouped = {
  [key: string]: any;

  latest_date: string;
  value: number;
  target: number;
  alt_target: number;
  ucl99: number;
  ucl95: number;
  ucl68: number;
  lcl68: number;
  lcl95: number;
  lcl99: number;
  variation: string;
  assurance: string;
}

export type plotData = {
  x: number;
  value: number;
  aesthetics: defaultSettingsType["scatter"];
  table_row: summaryTableRowData;
  // ISelectionId allows the visual to report the selection choice to PowerBI
  identity: ISelectionId;
  // Flag for whether dot should be highlighted by selections in other charts
  highlighted: boolean;
  // Tooltip data to print
  tooltip: VisualTooltipDataItem[];
  label: {
    text_value: string,
    aesthetics: defaultSettingsType["labels"],
    angle: number,
    distance: number,
    line_offset: number,
    marker_offset: number
  };
}

export type plotDataGrouped = {
  table_row: summaryTableRowDataGrouped;
  identity: ISelectionId[];
  aesthetics: defaultSettingsType["summary_table"];
  highlighted: boolean;
}

export type controlLimitsObject = {
  keys: { x: number, id: number, label: string }[];
  values: number[];
  numerators?: number[];
  denominators?: number[];
  targets: number[];
  ll99?: number[];
  ll95?: number[];
  ll68?: number[];
  ul68?: number[];
  ul95?: number[];
  ul99?: number[];
  count?: number[];
  alt_targets?: number[];
  speclimits_lower?: number[];
  speclimits_upper?: number[];
  trend_line?: number[];
};

export type controlLimitsArgs = {
  keys: { x: number, id: number, label: string }[];
  numerators: number[];
  denominators?: number[];
  xbar_sds?: number[];
  outliers_in_limits?: boolean;
  subset_points?: number[];
}

export type outliersObject = {
  astpoint: string[];
  trend: string[];
  two_in_three: string[];
  shift: string[];
}

export type colourPaletteType = {
  isHighContrast: boolean,
  foregroundColour: string,
  backgroundColour: string,
  foregroundSelectedColour: string,
  hyperlinkColour: string
};

export default class viewModelClass {
  inputData: dataObject[];
  inputSettings: settingsClass;
  controlLimits: controlLimitsObject[];
  outliers: outliersObject[];
  plotPoints: (plotData[] | plotDataGrouped[])[];
  groupedLines: [string, lineData[]][];
  tickLabels: { x: number; label: string; }[];
  splitIndexes: number[];
  groupStartEndIndexes: number[][][];
  firstRun: boolean;
  colourPalette: colourPaletteType;
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
    this.plotPoints = new Array<plotData[] | plotDataGrouped[]>();
    this.groupedLines = new Array<[string, lineData[]]>();
    this.firstRun = true
    this.splitIndexes = new Array<number>();
    this.groupStartEndIndexes = new Array<number[][]>();
    this.identities = new Array<ISelectionId[]>();
    this.tableColumns = new Array<{ name: string; label: string; }[]>();
    this.colourPalette = null;
    this.headless = false;
    this.frontend = false;
  }

  update(options: VisualUpdateOptions, host: IVisualHost): viewModelValidationT {
    if (isNullOrUndefined(this.colourPalette)) {
      this.colourPalette = {
        isHighContrast: host.colorPalette.isHighContrast,
        foregroundColour: host.colorPalette.foreground.value,
        backgroundColour: host.colorPalette.background.value,
        foregroundSelectedColour: host.colorPalette.foregroundSelected.value,
        hyperlinkColour: host.colorPalette.hyperlink.value
      }
    }

    this.svgWidth = options.viewport.width;
    this.svgHeight = options.viewport.height;
    this.headless = options?.["headless"] ?? false;
    this.frontend = options?.["frontend"] ?? false;

    const indicator_cols: powerbi.DataViewCategoryColumn[] = options.dataViews[0]?.categorical?.categories?.filter(d => d.source.roles.indicator);
    this.indicatorVarNames = indicator_cols?.map(d => d.source.displayName) ?? [];

    const n_indicators: number = indicator_cols?.length;
    const n_values: number = options.dataViews[0]?.categorical?.categories?.[0]?.values?.length ?? 1;
    const res: viewModelValidationT = { status: true };
    const idx_per_indicator = new Array<number[]>();
    idx_per_indicator.push([0]);
    this.groupNames = new Array<string[]>();
    this.groupNames.push(indicator_cols?.map(d => <string>d.values[0]) ?? []);
    let curr_grp: number = 0;

    for (let i = 1; i < n_values; i++) {
      let same_indicator: boolean = true;
      for (let j = 0; j < n_indicators; j++) {
        same_indicator = same_indicator && (indicator_cols?.[j].values[i] === indicator_cols?.[j].values[i-1]);
      }

      if (same_indicator) {
        idx_per_indicator[curr_grp].push(i);
      } else {
        idx_per_indicator.push([i]);
        this.groupNames.push(indicator_cols?.map(d => <string>d.values[i]) ?? []);
        curr_grp += 1;
      }
    }

    if (options.type === 2 || this.firstRun) {
      this.inputSettings.update(options.dataViews[0], idx_per_indicator);
    }
    if (this.inputSettings.validationStatus.error !== "") {
      res.status = false;
      res.error = this.inputSettings.validationStatus.error;
      res.type = "settings";
      return res;
    }
    const checkDV: string = validateDataView(options.dataViews, this.inputSettings);
    if (checkDV !== "valid") {
      res.status = false;
      res.error = checkDV;
      return res;
    }

    // Only re-construct data and re-calculate limits if they have changed
    if (options.type === 2 || this.firstRun) {
      // Handle split indexes (only for first indicator in single mode)
      const hasIndicator: boolean = options.dataViews[0].categorical.categories.some(d => d.source.roles.indicator);
      const split_indexes_str: string = <string>(options.dataViews[0]?.metadata?.objects?.split_indexes_storage?.split_indexes) ?? "[]";
      const split_indexes: number[] = JSON.parse(split_indexes_str);
      this.splitIndexes = hasIndicator ? [] : split_indexes;

      // Initialize arrays
      this.inputData = new Array<dataObject>();
      this.groupStartEndIndexes = new Array<number[][]>();
      this.controlLimits = new Array<controlLimitsObject>();
      this.outliers = new Array<outliersObject>();
      this.identities = new Array<ISelectionId[]>();
      this.tableColumns = new Array<{ name: string; label: string; }[]>();

      // Loop through each indicator group
      idx_per_indicator.forEach((group_idxs, idx) => {
        // Determine which settings to use
        const settings = this.inputSettings.settings[idx];
        const derivedSettings = this.inputSettings.derivedSettings[idx];

        // Extract data for this indicator
        const inpData: dataObject = extractInputData(
          options.dataViews[0].categorical,
          settings,
          derivedSettings,
          this.inputSettings.validationStatus.messages,
          group_idxs
        );

        const invalidData: boolean = inpData.validationStatus.status !== 0;

        // Calculate grouping indexes (only first indicator can have splits)
        const groupStartEnd: number[][] = invalidData
          ? new Array<number[]>()
          : this.getGroupingIndexes(inpData, idx === 0 ? this.splitIndexes : undefined);

        // Calculate control limits
        const limits: controlLimitsObject = invalidData
          ? null
          : this.calculateLimits(inpData, groupStartEnd, settings);

        // Flag outliers
        const outliers: outliersObject = invalidData
          ? null
          : this.flagOutliers(limits, groupStartEnd, settings, derivedSettings);

        // Scale and truncate limits
        if (!invalidData) {
          this.scaleAndTruncateLimits(limits, settings, derivedSettings);
        }

        // Create selection identities
        const identities = group_idxs.map(i => {
          return host.createSelectionIdBuilder()
            .withCategory(options.dataViews[0].categorical.categories[0], i)
            .createSelectionId();
        });

        // Push to arrays
        this.inputData.push(inpData);
        this.groupStartEndIndexes.push(groupStartEnd);
        this.controlLimits.push(limits);
        this.outliers.push(outliers);
        this.identities.push(identities);
      });

      // Initialize plot data based on mode
      if (this.showGrouped) {
        this.initialisePlotDataGrouped();
      } else {
        this.initialisePlotData(host);
        this.initialiseGroupedLines();
      }
    }

    this.firstRun = false;

    // Validation (unified for all indicators)
    if (this.inputData.some(d => d.validationStatus.status !== 0)) {
      res.status = false;
      res.error = this.inputData
        .filter(d => d.validationStatus.status !== 0)
        .map(d => d.validationStatus.error)
        .join("\n");
      return res;
    }

    if (this.inputData.some(d => d.warningMessage !== "")) {
      res.warning = this.inputData
        .filter(d => d.warningMessage !== "")
        .map(d => d.warningMessage)
        .join("\n");
    }

    return res;
  }

  getGroupingIndexes(inputData: dataObject, splitIndexes?: number[]): number[][] {
    const allIndexes: number[] = (splitIndexes ?? [])
                                    .concat([-1])
                                    .concat(inputData.groupingIndexes)
                                    .concat([inputData.limitInputArgs.keys.length - 1])
                                    .filter((d, idx, arr) => arr.indexOf(d) === idx)
                                    .sort((a,b) => a - b);

    const groupStartEndIndexes = new Array<number[]>();
    for (let i: number = 0; i < allIndexes.length - 1; i++) {
      groupStartEndIndexes.push([allIndexes[i] + 1, allIndexes[i + 1] + 1])
    }
    return groupStartEndIndexes;
  }

  calculateLimits(inputData: dataObject, groupStartEndIndexes: number[][], inputSettings: defaultSettingsType): controlLimitsObject {
    const limitFunction: (args: controlLimitsArgs) => controlLimitsObject
      = limitFunctions[inputSettings.spc.chart_type];

    inputData.limitInputArgs.outliers_in_limits = inputSettings.spc.outliers_in_limits;
    let controlLimits: controlLimitsObject;
    if (groupStartEndIndexes.length > 1) {
      const groupedData: dataObject[] = groupStartEndIndexes.map((indexes) => {
        // Force a deep copy
        let data: dataObject = JSON.parse(JSON.stringify(inputData));
        Object.keys(data.limitInputArgs).forEach(key => {
          if (Array.isArray(data.limitInputArgs[key])) {
            data.limitInputArgs[key] = data.limitInputArgs[key].slice(indexes[0], indexes[1]);
            // Special case for subset points - need to re-index so that
            //   the indexes are relative to the new subset
            if (key === "subset_points") {
              data.limitInputArgs[key] = data.limitInputArgs[key].map((d: number) => d - indexes[0]);
            }
          }
        });
        return data;
      })

      const calcLimitsGrouped: controlLimitsObject[] = groupedData.map(d => {
        const currLimits = limitFunction(d.limitInputArgs);
        currLimits.trend_line = calculateTrendLine(currLimits.values);
        return currLimits;
      });

      controlLimits = calcLimitsGrouped.reduce((all: controlLimitsObject, curr: controlLimitsObject) => {
        const allInner: controlLimitsObject = all;
        Object.entries(all).forEach((entry, idx) => {
          const newValues = Object.entries(curr)[idx][1];
          allInner[entry[0]] = entry[1]?.concat(newValues);
        })
        return allInner;
      })
    } else {
      // Calculate control limits using user-specified type
      controlLimits = limitFunction(inputData.limitInputArgs);
      controlLimits.trend_line = calculateTrendLine(controlLimits.values);
    }

    controlLimits.alt_targets = inputData.alt_targets;
    controlLimits.speclimits_lower = inputData.speclimits_lower;
    controlLimits.speclimits_upper = inputData.speclimits_upper;

    for (const key of Object.keys(controlLimits)) {
      if (key === "keys") {
        continue;
      }
      controlLimits[key] = controlLimits[key]?.map(d => isNaN(d) ? null : d);
    }

    return controlLimits;
  }

  initialisePlotDataGrouped(): void {
    this.plotPoints = new Array<plotDataGrouped[]>();
    this.tableColumns = new Array<{ name: string; label: string; }[]>();

    // Build table column definitions
    const tableColumnsDef = new Array<{ name: string; label: string; }>();
    this.indicatorVarNames.forEach(indicator_name => {
      tableColumnsDef.push({ name: indicator_name, label: indicator_name });
    })
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
    ["99", "95", "68"].forEach(limit => {
      if (lineSettings[`show_${limit}`]) {
        tableColumnsDef.push({
          name: `ucl${limit}`,
          label: `${lineSettings[`ttip_label_${limit}_prefix_upper`]}${lineSettings[`ttip_label_${limit}`]}`
        })
      }
    });
    ["68", "95", "99"].forEach(limit => {
      if (lineSettings[`show_${limit}`]) {
        tableColumnsDef.push({
          name: `lcl${limit}`,
          label: `${lineSettings[`ttip_label_${limit}_prefix_lower`]}${lineSettings[`ttip_label_${limit}`]}`
        })
      }
    })
    const nhsIconSettings: defaultSettingsType["nhs_icons"] = this.inputSettings.settings[0].nhs_icons;
    if (nhsIconSettings.show_variation_icons) {
      tableColumnsDef.push({ name: "variation", label: "Variation" });
    }
    if (nhsIconSettings.show_assurance_icons) {
      tableColumnsDef.push({ name: "assurance", label: "Assurance" });
    }
    const anyTooltips: boolean = this.inputData.some(d => d?.tooltips?.some(t => t.length > 0));

    if (anyTooltips) {
      this.inputData?.[0].tooltips?.[0].forEach(tooltip => {
        tableColumnsDef.push({ name: tooltip.displayName, label: tooltip.displayName });
      })
    }

    // Process each indicator group
    for (let i: number = 0; i < this.groupNames.length; i++) {
      // Skip if no data for this group
      if (isNullOrUndefined(this.inputData[i]?.categories)) {
        continue;
      }
      const formatValues = valueFormatter(this.inputSettings.settings[i], this.inputSettings.derivedSettings[i]);
      const varIconFilter: string = this.inputSettings.settings[i].summary_table.table_variation_filter;
      const assIconFilter: string = this.inputSettings.settings[i].summary_table.table_assurance_filter;
      const limits: controlLimitsObject = this.controlLimits[i];
      if (!limits) {
        continue;
      }
      const outliers: outliersObject = this.outliers[i];
      const lastIndex: number = limits.keys.length - 1;
      const varIcons: string[] = variationIconsToDraw(outliers, this.inputSettings.settings[i]);
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
      const assIcon: string = assuranceIconToDraw(limits, this.inputSettings.settings[i],
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
      const table_row_entries: [string, string | number][] = new Array<[string, string | number]>();
      this.indicatorVarNames.forEach((indicator_name, idx) => {
        table_row_entries.push([indicator_name, this.groupNames[i][idx]]);
      })
      table_row_entries.push(["latest_date", limits.keys?.[lastIndex].label]);
      table_row_entries.push(["value", formatValues(limits.values?.[lastIndex], "value")]);
      table_row_entries.push(["numerator", formatValues(limits.numerators?.[lastIndex], "integer")]);
      table_row_entries.push(["denominator", formatValues(limits.denominators?.[lastIndex], "integer")]);
      table_row_entries.push(["target", formatValues(limits.targets?.[lastIndex], "value")]);
      table_row_entries.push(["alt_target", formatValues(limits.alt_targets?.[lastIndex], "value")]);
      table_row_entries.push(["ucl99", formatValues(limits.ul99?.[lastIndex], "value")]);
      table_row_entries.push(["ucl95", formatValues(limits.ul95?.[lastIndex], "value")]);
      table_row_entries.push(["ucl68", formatValues(limits.ul68?.[lastIndex], "value")]);
      table_row_entries.push(["lcl68", formatValues(limits.ll68?.[lastIndex], "value")]);
      table_row_entries.push(["lcl95", formatValues(limits.ll95?.[lastIndex], "value")]);
      table_row_entries.push(["lcl99", formatValues(limits.ll99?.[lastIndex], "value")]);
      table_row_entries.push(["variation", varIcons[0]]);
      table_row_entries.push(["assurance", assIcon]);

      if (anyTooltips) {
        this.inputData[i].tooltips[lastIndex].forEach(tooltip => {
          table_row_entries.push([tooltip.displayName, tooltip.value]);
        })
      }

      if (!this.plotPoints[i]) {
        this.plotPoints[i] = [];
      }

      (this.plotPoints[i] as plotDataGrouped[]).push({
        table_row: Object.fromEntries(table_row_entries) as summaryTableRowDataGrouped,
        identity: this.identities[i],
        aesthetics: this.inputSettings.settings[i].summary_table,
        highlighted: this.inputData[i].anyHighlights
      })

      this.tableColumns[i] = tableColumnsDef;
    }
  }

  initialisePlotData(host: IVisualHost): void {
    // Use first (and only) indicator data
    const inputData = this.inputData[0];
    const controlLimits = this.controlLimits[0];
    const outliers = this.outliers[0];
    const settings = this.inputSettings.settings[0];
    const derivedSettings = this.inputSettings.derivedSettings[0];

    this.plotPoints[0] = new Array<plotData>();
    this.tickLabels = new Array<{ x: number; label: string; }>();
    this.tableColumns[0] = new Array<{ name: string; label: string; }>();

    this.tableColumns[0].push({ name: "date", label: "Date" });
    this.tableColumns[0].push({ name: "value", label: "Value" });

    if (!controlLimits) {
      return;
    }

    if (!isNullOrUndefined(controlLimits.numerators)) {
      this.tableColumns[0].push({ name: "numerator", label: "Numerator" });
    }
    if (!isNullOrUndefined(controlLimits.denominators)) {
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
      const aesthetics: defaultSettingsType["scatter"] = inputData.scatter_formatting[i];
      if (this.colourPalette.isHighContrast) {
        aesthetics.colour = this.colourPalette.foregroundColour;
      }
      if (outliers.shift[i] !== "none") {
        aesthetics.colour = getAesthetic(outliers.shift[i], "outliers",
                                  "shift_colour", settings) as string;
        aesthetics.colour_outline = getAesthetic(outliers.shift[i], "outliers",
                                  "shift_colour", settings) as string;
      }
      if (outliers.trend[i] !== "none") {
        aesthetics.colour = getAesthetic(outliers.trend[i], "outliers",
                                  "trend_colour", settings) as string;
        aesthetics.colour_outline = getAesthetic(outliers.trend[i], "outliers",
                                  "trend_colour", settings) as string;
      }
      if (outliers.two_in_three[i] !== "none") {
        aesthetics.colour = getAesthetic(outliers.two_in_three[i], "outliers",
                                  "twointhree_colour", settings) as string;
        aesthetics.colour_outline = getAesthetic(outliers.two_in_three[i], "outliers",
                                  "twointhree_colour", settings) as string;
      }
      if (outliers.astpoint[i] !== "none") {
        aesthetics.colour = getAesthetic(outliers.astpoint[i], "outliers",
                                  "ast_colour", settings) as string;
        aesthetics.colour_outline = getAesthetic(outliers.astpoint[i], "outliers",
                                  "ast_colour", settings) as string;
      }
      const table_row: summaryTableRowData = {
        date: controlLimits.keys[i].label,
        numerator: controlLimits.numerators?.[i],
        denominator: controlLimits.denominators?.[i],
        value: controlLimits.values[i],
        target: controlLimits.targets[i],
        alt_target: controlLimits.alt_targets[i],
        ll99: controlLimits?.ll99?.[i],
        ll95: controlLimits?.ll95?.[i],
        ll68: controlLimits?.ll68?.[i],
        ul68: controlLimits?.ul68?.[i],
        ul95: controlLimits?.ul95?.[i],
        ul99: controlLimits?.ul99?.[i],
        speclimits_lower: controlLimits?.speclimits_lower?.[i],
        speclimits_upper: controlLimits?.speclimits_upper?.[i],
        trend_line: controlLimits?.trend_line?.[i],
        astpoint: outliers.astpoint[i],
        trend: outliers.trend[i],
        shift: outliers.shift[i],
        two_in_three: outliers.two_in_three[i]
      }


      this.plotPoints[0].push({
        x: index,
        value: controlLimits.values[i],
        aesthetics: aesthetics,
        table_row: table_row,
        identity: host.createSelectionIdBuilder()
                      .withCategory(inputData.categories, inputData.limitInputArgs.keys[i].id)
                      .createSelectionId(),
        highlighted: !isNullOrUndefined(inputData.highlights?.[index]),
        tooltip: buildTooltip(table_row, inputData?.tooltips?.[index],
                              settings, derivedSettings),
        label: {
          text_value: inputData.labels?.[index],
          aesthetics: inputData.label_formatting[index],
          angle: null,
          distance: null,
          line_offset: null,
          marker_offset: null
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

    const labels: string[] = new Array<string>();
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

    if (!controlLimits) {
      return;
    }

    const nLimits = controlLimits.keys.length;

    for (let i: number = 0; i < nLimits; i++) {
      const isRebaselinePoint: boolean = this.splitIndexes.includes(i - 1) || inputData.groupingIndexes.includes(i - 1);
      let isNewAltTarget: boolean = false;
      if (i > 0 && settings.lines.show_alt_target) {
        isNewAltTarget = controlLimits.alt_targets[i] !== controlLimits.alt_targets[i - 1];
      }
      labels.forEach(label => {
        const join_rebaselines: boolean = settings.lines[`join_rebaselines_${lineNameMap[label]}`];
        // By adding an additional null line value at each re-baseline point
        // we avoid rendering a line joining each segment
        if (isRebaselinePoint || isNewAltTarget) {
          const is_alt_target: boolean = label === "alt_targets" && isNewAltTarget;
          const is_rebaseline: boolean = label !== "alt_targets" && isRebaselinePoint;
          formattedLines.push({
            x: controlLimits.keys[i].x,
            line_value: (!join_rebaselines && (is_alt_target || is_rebaseline)) ? null : controlLimits[label]?.[i],
            group: label,
            aesthetics: inputData.line_formatting[i]
          })
        }

        formattedLines.push({
          x: controlLimits.keys[i].x,
          line_value: controlLimits[label]?.[i],
          group: label,
          aesthetics: inputData.line_formatting[i]
        })
      })
    }
    this.groupedLines = groupBy(formattedLines, "group");
  }

  scaleAndTruncateLimits(controlLimits: controlLimitsObject,
                          inputSettings: defaultSettingsType,
                          derivedSettings: derivedSettingsClass): void {
    // Scale limits using provided multiplier
    const multiplier: number = derivedSettings.multiplier;
    let lines_to_scale: string[] = ["values", "targets"];

    if (derivedSettings.chart_type_props.has_control_limits) {
      lines_to_scale = lines_to_scale.concat(["ll99", "ll95", "ll68", "ul68", "ul95", "ul99"]);
    }

    let lines_to_truncate: string[] = lines_to_scale;
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

    const limits: truncateInputs = {
      lower: inputSettings.spc.ll_truncate,
      upper: inputSettings.spc.ul_truncate
    };

    lines_to_scale.forEach(limit => {
      controlLimits[limit] = multiply(controlLimits[limit], multiplier)
    })

    lines_to_truncate.forEach(limit => {
      controlLimits[limit] = truncate(controlLimits[limit], limits)
    })
  }

  flagOutliers(controlLimits: controlLimitsObject, groupStartEndIndexes: number[][],
                inputSettings: defaultSettingsType, derivedSettings: derivedSettingsClass): outliersObject {
    const process_flag_type: string = inputSettings.outliers.process_flag_type;
    const improvement_direction: string = inputSettings.outliers.improvement_direction;
    const trend_n: number = inputSettings.outliers.trend_n;
    const shift_n: number = inputSettings.outliers.shift_n;
    const ast_specification: boolean = inputSettings.outliers.astronomical_limit === "Specification";
    const two_in_three_specification: boolean = inputSettings.outliers.two_in_three_limit === "Specification";
    const outliers = {
      astpoint: rep("none", controlLimits.values.length),
      two_in_three: rep("none", controlLimits.values.length),
      trend: rep("none", controlLimits.values.length),
      shift: rep("none", controlLimits.values.length)
    }
    for (let i: number = 0; i < groupStartEndIndexes.length; i++) {
      const start: number = groupStartEndIndexes[i][0];
      const end: number = groupStartEndIndexes[i][1];
      const group_values: number[] = controlLimits.values.slice(start, end);
      const group_targets: number[] = controlLimits.targets.slice(start, end);

      if (derivedSettings.chart_type_props.has_control_limits || ast_specification || two_in_three_specification) {
        const limit_map: Record<string, string> = {
          "1 Sigma": "68",
          "2 Sigma": "95",
          "3 Sigma": "99",
          "Specification": "",
        };
        if (inputSettings.outliers.astronomical) {
          const ast_limit: string = limit_map[inputSettings.outliers.astronomical_limit];
          const ll_prefix: string = ast_specification ? "speclimits_lower" : "ll";
          const ul_prefix: string = ast_specification ? "speclimits_upper" : "ul";
          const lower_limits: number[] = controlLimits?.[`${ll_prefix}${ast_limit}`]?.slice(start, end);
          const upper_limits: number[] = controlLimits?.[`${ul_prefix}${ast_limit}`]?.slice(start, end);
          astronomical(group_values, lower_limits, upper_limits)
            .forEach((flag, idx) => outliers.astpoint[start + idx] = flag)
        }
        if (inputSettings.outliers.two_in_three) {
          const highlight_series: boolean = inputSettings.outliers.two_in_three_highlight_series;
          const two_in_three_limit: string = limit_map[inputSettings.outliers.two_in_three_limit];
          const ll_prefix: string = two_in_three_specification ? "speclimits_lower" : "ll";
          const ul_prefix: string = two_in_three_specification ? "speclimits_upper" : "ul";
          const lower_warn_limits: number[] = controlLimits?.[`${ll_prefix}${two_in_three_limit}`]?.slice(start, end);
          const upper_warn_limits: number[] = controlLimits?.[`${ul_prefix}${two_in_three_limit}`]?.slice(start, end);
          twoInThree(group_values, lower_warn_limits, upper_warn_limits, highlight_series)
            .forEach((flag, idx) => outliers.two_in_three[start + idx] = flag)
        }
      }
      if (inputSettings.outliers.trend) {
        trend(group_values, trend_n)
          .forEach((flag, idx) => outliers.trend[start + idx] = flag)
      }
      if (inputSettings.outliers.shift) {
        shift(group_values, group_targets, shift_n)
          .forEach((flag, idx) => outliers.shift[start + idx] = flag)
      }
    }
    Object.keys(outliers).forEach(key => {
      outliers[key] = checkFlagDirection(outliers[key],
                                              { process_flag_type, improvement_direction });
    })
    return outliers;
  }
}
