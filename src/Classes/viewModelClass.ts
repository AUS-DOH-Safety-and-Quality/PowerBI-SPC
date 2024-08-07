import type powerbi from "powerbi-visuals-api";
type IVisualHost = powerbi.extensibility.visual.IVisualHost;
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
type ISelectionId = powerbi.visuals.ISelectionId;
import * as d3 from "../D3 Plotting Functions/D3 Modules";
import * as limitFunctions from "../Limit Calculations"
import { settingsClass, type defaultSettingsType, plotPropertiesClass, type derivedSettingsClass } from "../Classes";
import { buildTooltip, getAesthetic, checkFlagDirection, truncate, type truncateInputs, multiply, rep, type dataObject, extractInputData, isNullOrUndefined, variationIconsToDraw, assuranceIconToDraw } from "../Functions"
import { astronomical, trend, twoInThree, shift } from "../Outlier Flagging"

export type lineData = {
  x: number;
  line_value: number;
  group: string;
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
  astpoint: string;
  trend: string;
  shift: string;
  two_in_three: string;
}

export type summaryTableRowDataGrouped = {
  indicator: string;
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
}

export type plotDataGrouped = {
  table_row: summaryTableRowDataGrouped;
  identity: ISelectionId;
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
};

export type controlLimitsArgs = {
  keys: { x: number, id: number, label: string }[];
  numerators: number[];
  denominators?: number[];
  outliers_in_limits?: boolean;
  xbar_sds?: number[];
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
  inputData: dataObject;
  inputSettings: settingsClass;
  controlLimits: controlLimitsObject;
  outliers: outliersObject;
  plotPoints: plotData[];
  groupedLines: [string, lineData[]][];
  tickLabels: { x: number; label: string; }[];
  plotProperties: plotPropertiesClass;
  splitIndexes: number[];
  groupStartEndIndexes: number[][];
  firstRun: boolean;
  colourPalette: colourPaletteType;
  tableColumns: { name: string; label: string; }[];
  svgWidth: number;
  svgHeight: number;

  showGrouped: boolean;
  groupNames: string[];
  inputDataGrouped: dataObject[];
  controlLimitsGrouped: controlLimitsObject[];
  outliersGrouped: outliersObject[];
  groupStartEndIndexesGrouped: number[][][];
  tableColumnsGrouped: { name: string; label: string; }[];
  plotPointsGrouped: plotDataGrouped[];
  identitiesGrouped: ISelectionId[];

  constructor() {
    this.inputData = <dataObject>null;
    this.inputSettings = new settingsClass();
    this.controlLimits = null;
    this.plotPoints = new Array<plotData>();
    this.groupedLines = new Array<[string, lineData[]]>();
    this.plotProperties = new plotPropertiesClass();
    this.firstRun = true
    this.splitIndexes = new Array<number>();
    this.colourPalette = null;
  }

  update(options: VisualUpdateOptions, host: IVisualHost) {
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

    // Only re-construct data and re-calculate limits if they have changed
    if (options.type === 2 || this.firstRun) {
      if (options.dataViews[0].categorical.values?.source?.roles?.indicator) {
        this.showGrouped = true;
        this.groupNames = new Array<string>();
        this.inputDataGrouped = new Array<dataObject>();
        this.groupStartEndIndexesGrouped = new Array<number[][]>();
        this.controlLimitsGrouped = new Array<controlLimitsObject>();
        this.outliersGrouped = new Array<outliersObject>();
        this.identitiesGrouped = new Array<ISelectionId>();

        options.dataViews[0].categorical.values.grouped().forEach((d, idx) => {
          (<powerbi.DataViewCategorical>d).categories = options.dataViews[0].categorical.categories;
          const first_idx: number = d.values[0].values.findIndex(d_in => !isNullOrUndefined(d_in));
          const last_idx: number = d.values[0].values.map(d_in => !isNullOrUndefined(d_in)).lastIndexOf(true);
          const inpData: dataObject = extractInputData(<powerbi.DataViewCategorical>d,
                                                        this.inputSettings.settingsGrouped[idx],
                                                        this.inputSettings.derivedSettingsGrouped[idx],
                                                        this.inputSettings.validationStatus.messages,
                                                        first_idx, last_idx);
          const invalidData: boolean = inpData.validationStatus.status !== 0;
          const groupStartEndIndexes: number[][] = invalidData ? new Array<number[]>() : this.getGroupingIndexes(inpData);
          const limits: controlLimitsObject = invalidData ? null : this.calculateLimits(inpData, groupStartEndIndexes, this.inputSettings.settingsGrouped[idx]);
          const outliers: outliersObject = invalidData ? null : this.flagOutliers(limits, groupStartEndIndexes,
                                                                                  this.inputSettings.settingsGrouped[idx],
                                                                                  this.inputSettings.derivedSettingsGrouped[idx]);

          if (!invalidData) {
            this.scaleAndTruncateLimits(limits, this.inputSettings.settingsGrouped[idx],
                                        this.inputSettings.derivedSettingsGrouped[idx]);
          }
          this.identitiesGrouped.push(host.createSelectionIdBuilder().withSeries(options.dataViews[0].categorical.values, d).createSelectionId());
          this.groupNames.push(<string>d.name);
          this.inputDataGrouped.push(inpData);
          this.groupStartEndIndexesGrouped.push(groupStartEndIndexes);
          this.controlLimitsGrouped.push(limits);
          this.outliersGrouped.push(outliers);
        })
        this.initialisePlotDataGrouped();
      } else {
        this.showGrouped = false;
        this.groupNames = null;
        this.inputDataGrouped = null;
        this.groupStartEndIndexesGrouped = null;
        this.controlLimitsGrouped = null;
        const split_indexes_str: string = <string>(options.dataViews[0]?.metadata?.objects?.split_indexes_storage?.split_indexes) ?? "[]";
        const split_indexes: number[] = JSON.parse(split_indexes_str);
        this.splitIndexes = split_indexes;
        this.inputData = extractInputData(options.dataViews[0].categorical,
                                          this.inputSettings.settings,
                                          this.inputSettings.derivedSettings,
                                          this.inputSettings.validationStatus.messages,
                                          0, options.dataViews[0].categorical.values[0].values.length - 1);

        if (this.inputData.validationStatus.status === 0) {
          this.groupStartEndIndexes = this.getGroupingIndexes(this.inputData, this.splitIndexes);
          this.controlLimits = this.calculateLimits(this.inputData, this.groupStartEndIndexes, this.inputSettings.settings);
          this.scaleAndTruncateLimits(this.controlLimits, this.inputSettings.settings,
                                      this.inputSettings.derivedSettings);
          this.outliers = this.flagOutliers(this.controlLimits, this.groupStartEndIndexes,
                                            this.inputSettings.settings,
                                            this.inputSettings.derivedSettings);

          // Structure the data and calculated limits to the format needed for plotting
          this.initialisePlotData(host);
          this.initialiseGroupedLines();
        }
      }
    }
    this.plotProperties.update(
      options,
      this.plotPoints,
      this.controlLimits,
      this.inputData,
      this.inputSettings.settings,
      this.inputSettings.derivedSettings,
      this.colourPalette
    )
    this.firstRun = false;
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
        const data: dataObject = JSON.parse(JSON.stringify(inputData));
        data.limitInputArgs.denominators = data.limitInputArgs.denominators.slice(indexes[0], indexes[1])
        data.limitInputArgs.numerators = data.limitInputArgs.numerators.slice(indexes[0], indexes[1])
        data.limitInputArgs.keys = data.limitInputArgs.keys.slice(indexes[0], indexes[1])
        return data;
      })

      const calcLimitsGrouped: controlLimitsObject[] = groupedData.map(d => limitFunction(d.limitInputArgs));
      controlLimits = calcLimitsGrouped.reduce((all: controlLimitsObject, curr: controlLimitsObject) => {
        const allInner: controlLimitsObject = all;
        Object.entries(all).forEach((entry, idx) => {
          allInner[entry[0]] = entry[1]?.concat(Object.entries(curr)[idx][1]);
        })
        return allInner;
      })
    } else {
      // Calculate control limits using user-specified type
      controlLimits = limitFunction(inputData.limitInputArgs);
    }

    controlLimits.alt_targets = inputData.alt_targets;
    controlLimits.speclimits_lower = inputData.speclimits_lower;
    controlLimits.speclimits_upper = inputData.speclimits_upper;
    return controlLimits;
  }

  initialisePlotDataGrouped(/*host: IVisualHost*/): void {
    this.plotPointsGrouped = new Array<plotDataGrouped>();
    this.tableColumnsGrouped = [
      { name: "indicator", label: "Indicator" },
      { name: "latest_date", label: "Latest Date" }
    ];
    const lineSettings = this.inputSettings.settings.lines;
    if (lineSettings.show_main) {
      this.tableColumnsGrouped.push({ name: "value", label: "Value" });
    }
    if (lineSettings.show_target) {
      this.tableColumnsGrouped.push({ name: "target", label: lineSettings.ttip_label_target });
    }
    if (lineSettings.show_alt_target) {
      this.tableColumnsGrouped.push({ name: "alt_target", label: lineSettings.ttip_label_alt_target });
    }
    ["99", "95", "68"].forEach(limit => {
      if (lineSettings[`show_${limit}`]) {
        this.tableColumnsGrouped.push({
          name: `ucl${limit}`,
          label: `Upper ${lineSettings[`ttip_label_${limit}`]}`
        })
      }
    });
    ["68", "95", "99"].forEach(limit => {
      if (lineSettings[`show_${limit}`]) {
        this.tableColumnsGrouped.push({
          name: `lcl${limit}`,
          label: `Lower ${lineSettings[`ttip_label_${limit}`]}`
        })
      }
    })
    const nhsIconSettings: defaultSettingsType["nhs_icons"] = this.inputSettings.settings.nhs_icons;
    if (nhsIconSettings.show_variation_icons) {
      this.tableColumnsGrouped.push({ name: "variation", label: "Variation" });
    }
    if (nhsIconSettings.show_assurance_icons) {
      this.tableColumnsGrouped.push({ name: "assurance", label: "Assurance" });
    }
    for (let i: number = 0; i < this.groupNames.length; i++) {
      const limits: controlLimitsObject = this.controlLimitsGrouped[i];
      const outliers: outliersObject = this.outliersGrouped[i];
      const lastIndex: number = limits.keys.length - 1;
      const varIcons: string[] = variationIconsToDraw(outliers, this.inputSettings.settingsGrouped[i]);
      const assIcon: string = assuranceIconToDraw(limits, this.inputSettings.settingsGrouped[i],
                                                      this.inputSettings.derivedSettingsGrouped[i]);

      const table_row: summaryTableRowDataGrouped = {
        indicator: this.groupNames[i],
        latest_date: limits.keys[lastIndex].label,
        value: limits.values[lastIndex],
        target: limits.targets[lastIndex],
        alt_target: limits.alt_targets[lastIndex],
        ucl99: limits.ul99[lastIndex],
        ucl95: limits.ul95[lastIndex],
        ucl68: limits.ul68[lastIndex],
        lcl68: limits.ll68[lastIndex],
        lcl95: limits.ll95[lastIndex],
        lcl99: limits.ll99[lastIndex],
        variation: varIcons[0],
        assurance: assIcon
      }

      this.plotPointsGrouped.push({
        table_row: table_row,
        identity: this.identitiesGrouped[i],
        aesthetics: this.inputSettings.settingsGrouped[i].summary_table,
        highlighted: this.inputDataGrouped[i].anyHighlights
      })
    }
  }

  initialisePlotData(host: IVisualHost): void {
    this.plotPoints = new Array<plotData>();
    this.tickLabels = new Array<{ x: number; label: string; }>();

    this.tableColumns = new Array<{ name: string; label: string; }>();
    this.tableColumns.push({ name: "date", label: "Date" });
    this.tableColumns.push({ name: "value", label: "Value" });
    if (!isNullOrUndefined(this.controlLimits.numerators)) {
      this.tableColumns.push({ name: "numerator", label: "Numerator" });
    }
    if (!isNullOrUndefined(this.controlLimits.denominators)) {
      this.tableColumns.push({ name: "denominator", label: "Denominator" });
    }
    if (this.inputSettings.settings.lines.show_target) {
      this.tableColumns.push({ name: "target", label: "Target" });
    }
    if (this.inputSettings.settings.lines.show_alt_target) {
      this.tableColumns.push({ name: "alt_target", label: "Alt. Target" });
    }
    if (this.inputSettings.settings.lines.show_specification) {
      this.tableColumns.push({ name: "speclimits_lower", label: "Spec. Lower" },
                             { name: "speclimits_upper", label: "Spec. Upper" });
    }
    if (this.inputSettings.derivedSettings.chart_type_props.has_control_limits) {
      if (this.inputSettings.settings.lines.show_99) {
        this.tableColumns.push({ name: "ll99", label: "LL 99%" },
                               { name: "ul99", label: "UL 99%" });
      }
      if (this.inputSettings.settings.lines.show_95) {
        this.tableColumns.push({ name: "ll95", label: "LL 95%" }, { name: "ul95", label: "UL 95%" });
      }
      if (this.inputSettings.settings.lines.show_68) {
        this.tableColumns.push({ name: "ll68", label: "LL 68%" }, { name: "ul68", label: "UL 68%" });
      }
    }

    if (this.inputSettings.settings.outliers.astronomical) {
      this.tableColumns.push({ name: "astpoint", label: "Ast. Point" });
    }
    if (this.inputSettings.settings.outliers.trend) {
      this.tableColumns.push({ name: "trend", label: "Trend" });
    }
    if (this.inputSettings.settings.outliers.shift) {
      this.tableColumns.push({ name: "shift", label: "Shift" });
    }

    for (let i: number = 0; i < this.controlLimits.keys.length; i++) {
      const index: number = this.controlLimits.keys[i].x;
      const aesthetics: defaultSettingsType["scatter"] = this.inputData.scatter_formatting[i];
      if (this.colourPalette.isHighContrast) {
        aesthetics.colour = this.colourPalette.foregroundColour;
      }
      if (this.outliers.shift[i] !== "none") {
        aesthetics.colour = getAesthetic(this.outliers.shift[i], "outliers",
                                  "shift_colour", this.inputSettings.settings) as string;
      }
      if (this.outliers.trend[i] !== "none") {
        aesthetics.colour = getAesthetic(this.outliers.trend[i], "outliers",
                                  "trend_colour", this.inputSettings.settings) as string;
      }
      if (this.outliers.two_in_three[i] !== "none") {
        aesthetics.colour = getAesthetic(this.outliers.two_in_three[i], "outliers",
                                  "twointhree_colour", this.inputSettings.settings) as string;
      }
      if (this.outliers.astpoint[i] !== "none") {
        aesthetics.colour = getAesthetic(this.outliers.astpoint[i], "outliers",
                                  "ast_colour", this.inputSettings.settings) as string;
      }
      const table_row: summaryTableRowData = {
        date: this.controlLimits.keys[i].label,
        numerator: this.controlLimits.numerators?.[i],
        denominator: this.controlLimits.denominators?.[i],
        value: this.controlLimits.values[i],
        target: this.controlLimits.targets[i],
        alt_target: this.controlLimits.alt_targets[i],
        ll99: this.controlLimits?.ll99?.[i],
        ll95: this.controlLimits?.ll95?.[i],
        ll68: this.controlLimits?.ll68?.[i],
        ul68: this.controlLimits?.ul68?.[i],
        ul95: this.controlLimits?.ul95?.[i],
        ul99: this.controlLimits?.ul99?.[i],
        speclimits_lower: this.controlLimits?.speclimits_lower?.[i],
        speclimits_upper: this.controlLimits?.speclimits_upper?.[i],
        astpoint: this.outliers.astpoint[i],
        trend: this.outliers.trend[i],
        shift: this.outliers.shift[i],
        two_in_three: this.outliers.two_in_three[i]
      }

      this.plotPoints.push({
        x: index,
        value: this.controlLimits.values[i],
        aesthetics: aesthetics,
        table_row: table_row,
        identity: host.createSelectionIdBuilder()
                      .withCategory(this.inputData.categories, this.inputData.limitInputArgs.keys[i].id)
                      .createSelectionId(),
        highlighted: !isNullOrUndefined(this.inputData.highlights?.[index]),
        tooltip: buildTooltip(table_row, this.inputData?.tooltips?.[index],
                              this.inputSettings.settings, this.inputSettings.derivedSettings)
      })
      this.tickLabels.push({x: index, label: this.controlLimits.keys[i].label});
    }
  }

  initialiseGroupedLines(): void {
    const labels: string[] = new Array<string>();
    if (this.inputSettings.settings.lines.show_main) {
      labels.push("values");
    }
    if (this.inputSettings.settings.lines.show_target) {
      labels.push("targets");
    }
    if (this.inputSettings.settings.lines.show_alt_target) {
      labels.push("alt_targets");
    }
    if (this.inputSettings.settings.lines.show_specification) {
      labels.push("speclimits_lower", "speclimits_upper");
    }
    if (this.inputSettings.derivedSettings.chart_type_props.has_control_limits) {
      if (this.inputSettings.settings.lines.show_99) {
        labels.push("ll99", "ul99");
      }
      if (this.inputSettings.settings.lines.show_95) {
        labels.push("ll95", "ul95");
      }
      if (this.inputSettings.settings.lines.show_68) {
        labels.push("ll68", "ul68");
      }
    }

    const formattedLines: lineData[] = new Array<lineData>();
    const nLimits = this.controlLimits.keys.length;

    for (let i: number = 0; i < nLimits; i++) {
      const isRebaselinePoint: boolean = this.splitIndexes.includes(i - 1) || this.inputData.groupingIndexes.includes(i - 1);
      let isNewAltTarget: boolean = false;
      if (i > 0 && this.inputSettings.settings.lines.show_alt_target) {
        isNewAltTarget = this.controlLimits.alt_targets[i] !== this.controlLimits.alt_targets[i - 1];
      }
      labels.forEach(label => {
        // By adding an additional null line value at each re-baseline point
        // we avoid rendering a line joining each segment
        if (isRebaselinePoint || (label === "alt_targets" && isNewAltTarget)) {
          formattedLines.push({
            x: this.controlLimits.keys[i].x,
            line_value: null,
            group: label
          })

          // Only align alt target with previous target if it is not a re-baseline point
          if (!isRebaselinePoint && (label === "alt_targets" && isNewAltTarget)) {
            formattedLines.push({
              x: this.controlLimits.keys[i].x - 1,
              line_value: this.controlLimits[label]?.[i],
              group: label
            })
          }
        }

        formattedLines.push({
          x: this.controlLimits.keys[i].x,
          line_value: this.controlLimits[label]?.[i],
          group: label
        })
      })
    }
    this.groupedLines = d3.groups(formattedLines, d => d.group);
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
