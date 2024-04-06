import type powerbi from "powerbi-visuals-api";
type IVisualHost = powerbi.extensibility.visual.IVisualHost;
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
type ISelectionId = powerbi.visuals.ISelectionId;
import * as d3 from "../D3 Plotting Functions/D3 Modules";
import * as limitFunctions from "../Limit Calculations"
import { settingsClass, type defaultSettingsType, plotPropertiesClass } from "../Classes";
import { buildTooltip, getAesthetic, checkFlagDirection, truncate, type truncateInputs, multiply, rep, type dataObject, extractInputData, isNullOrUndefined } from "../Functions"
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
    // Only re-construct data and re-calculate limits if they have changed
    if (options.type === 2 || this.firstRun) {
      const split_indexes: string = <string>(options.dataViews[0]?.metadata?.objects?.split_indexes_storage?.split_indexes) ?? "[]";
      this.splitIndexes = JSON.parse(split_indexes);
      this.inputData = extractInputData(options.dataViews[0].categorical, this.inputSettings);

      if (this.inputData.validationStatus.status === 0) {
        const allIndexes: number[] = this.splitIndexes
                                          .concat([-1])
                                          .concat(this.inputData.groupingIndexes)
                                          .concat([this.inputData.limitInputArgs.keys.length - 1])
                                          .filter((d, idx, arr) => arr.indexOf(d) === idx)
                                          .sort((a,b) => a - b);

        this.groupStartEndIndexes = new Array<number[]>();
        for (let i: number = 0; i < allIndexes.length - 1; i++) {
          this.groupStartEndIndexes.push([allIndexes[i] + 1, allIndexes[i + 1] + 1])
        }

        this.calculateLimits();
        this.scaleAndTruncateLimits();
        this.flagOutliers();

        // Structure the data and calculated limits to the format needed for plotting
        this.initialisePlotData(host);
        this.initialiseGroupedLines();
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

  calculateLimits(): void {
    this.inputData.limitInputArgs.outliers_in_limits = this.inputSettings.settings.spc.outliers_in_limits;
    const limitFunction: (args: controlLimitsArgs) => controlLimitsObject
      = limitFunctions[this.inputSettings.settings.spc.chart_type];

    if (this.groupStartEndIndexes.length > 1) {
      const groupedData: dataObject[] = this.groupStartEndIndexes.map((indexes) => {
        // Force a deep copy
        const data: dataObject = JSON.parse(JSON.stringify(this.inputData));
        data.limitInputArgs.denominators = data.limitInputArgs.denominators.slice(indexes[0], indexes[1])
        data.limitInputArgs.numerators = data.limitInputArgs.numerators.slice(indexes[0], indexes[1])
        data.limitInputArgs.keys = data.limitInputArgs.keys.slice(indexes[0], indexes[1])
        return data;
      })

      const calcLimitsGrouped: controlLimitsObject[] = groupedData.map(d => limitFunction(d.limitInputArgs));
      this.controlLimits = calcLimitsGrouped.reduce((all: controlLimitsObject, curr: controlLimitsObject) => {
        const allInner: controlLimitsObject = all;
        Object.entries(all).forEach((entry, idx) => {
          allInner[entry[0]] = entry[1]?.concat(Object.entries(curr)[idx][1]);
        })
        return allInner;
      })
    } else {
      // Calculate control limits using user-specified type
      this.controlLimits = limitFunction(this.inputData.limitInputArgs);
    }

    this.controlLimits.alt_targets = this.inputData.alt_targets;
    this.controlLimits.speclimits_lower = this.inputData.speclimits_lower;
    this.controlLimits.speclimits_upper = this.inputData.speclimits_upper;
  }

  initialisePlotData(host: IVisualHost): void {
    this.plotPoints = new Array<plotData>();
    this.tickLabels = new Array<{ x: number; label: string; }>();

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
        speclimits_upper: this.controlLimits?.speclimits_upper?.[i]
      }

      this.plotPoints.push({
        x: index,
        value: this.controlLimits.values[i],
        aesthetics: aesthetics,
        table_row: table_row,
        identity: host.createSelectionIdBuilder()
                      .withCategory(this.inputData.categories,
                                    this.inputData.limitInputArgs.keys[i].id)
                      .createSelectionId(),
        highlighted: !isNullOrUndefined(this.inputData.highlights?.[index]),
        tooltip: buildTooltip(i, this.controlLimits, this.outliers, this.inputData,
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

  scaleAndTruncateLimits(): void {
    // Scale limits using provided multiplier
    const multiplier: number = this.inputSettings.derivedSettings.multiplier;
    let lines_to_scale: string[] = ["values", "targets"];

    if (this.inputSettings.derivedSettings.chart_type_props.has_control_limits) {
      lines_to_scale = lines_to_scale.concat(["ll99", "ll95", "ll68", "ul68", "ul95", "ul99"]);
    }

    let lines_to_truncate: string[] = lines_to_scale;
    if (this.inputSettings.settings.lines.show_alt_target) {
      lines_to_truncate = lines_to_truncate.concat(["alt_targets"]);
      if (this.inputSettings.settings.lines.multiplier_alt_target) {
        lines_to_scale = lines_to_scale.concat(["alt_targets"]);
      }
    }
    if (this.inputSettings.settings.lines.show_specification) {
      lines_to_truncate = lines_to_truncate.concat(["speclimits_lower", "speclimits_upper"]);
      if (this.inputSettings.settings.lines.multiplier_specification) {
        lines_to_scale = lines_to_scale.concat(["speclimits_lower", "speclimits_upper"]);
      }
    }

    lines_to_scale.forEach(limit => {
      this.controlLimits[limit] = multiply(this.controlLimits[limit], multiplier)
    })

    const limits: truncateInputs = {
      lower: this.inputSettings.settings.spc.ll_truncate,
      upper: this.inputSettings.settings.spc.ul_truncate
    };

    lines_to_truncate.forEach(limit => {
      this.controlLimits[limit] = truncate(this.controlLimits[limit], limits)
    })
  }

  flagOutliers() {
    const process_flag_type: string = this.inputSettings.settings.outliers.process_flag_type;
    const improvement_direction: string = this.inputSettings.settings.outliers.improvement_direction;
    const trend_n: number = this.inputSettings.settings.outliers.trend_n;
    const shift_n: number = this.inputSettings.settings.outliers.shift_n;
    const ast_specification: boolean = this.inputSettings.settings.outliers.astronomical_limit === "Specification";
    const two_in_three_specification: boolean = this.inputSettings.settings.outliers.two_in_three_limit === "Specification";
    this.outliers = {
      astpoint: rep("none", this.inputData.limitInputArgs.keys.length),
      two_in_three: rep("none", this.inputData.limitInputArgs.keys.length),
      trend: rep("none", this.inputData.limitInputArgs.keys.length),
      shift: rep("none", this.inputData.limitInputArgs.keys.length)
    }
    for (let i: number = 0; i < this.groupStartEndIndexes.length; i++) {
      const start: number = this.groupStartEndIndexes[i][0];
      const end: number = this.groupStartEndIndexes[i][1];
      const group_values: number[] = this.controlLimits.values.slice(start, end);
      const group_targets: number[] = this.controlLimits.targets.slice(start, end);

      if (this.inputSettings.derivedSettings.chart_type_props.has_control_limits || ast_specification || two_in_three_specification) {
        const limit_map: Record<string, string> = {
          "1 Sigma": "68",
          "2 Sigma": "95",
          "3 Sigma": "99",
          "Specification": "",
        };
        if (this.inputSettings.settings.outliers.astronomical) {
          const ast_limit: string = limit_map[this.inputSettings.settings.outliers.astronomical_limit];
          const ll_prefix: string = ast_specification ? "speclimits_lower" : "ll";
          const ul_prefix: string = ast_specification ? "speclimits_upper" : "ul";
          const lower_limits: number[] = this.controlLimits?.[`${ll_prefix}${ast_limit}`]?.slice(start, end);
          const upper_limits: number[] = this.controlLimits?.[`${ul_prefix}${ast_limit}`]?.slice(start, end);
          astronomical(group_values, lower_limits, upper_limits)
            .forEach((flag, idx) => this.outliers.astpoint[start + idx] = flag)
        }
        if (this.inputSettings.settings.outliers.two_in_three) {
          const highlight_series: boolean = this.inputSettings.settings.outliers.two_in_three_highlight_series;
          const two_in_three_limit: string = limit_map[this.inputSettings.settings.outliers.two_in_three_limit];
          const ll_prefix: string = two_in_three_specification ? "speclimits_lower" : "ll";
          const ul_prefix: string = two_in_three_specification ? "speclimits_upper" : "ul";
          const lower_warn_limits: number[] = this.controlLimits?.[`${ll_prefix}${two_in_three_limit}`]?.slice(start, end);
          const upper_warn_limits: number[] = this.controlLimits?.[`${ul_prefix}${two_in_three_limit}`]?.slice(start, end);
          twoInThree(group_values, lower_warn_limits, upper_warn_limits, highlight_series)
            .forEach((flag, idx) => this.outliers.two_in_three[start + idx] = flag)
        }
      }
      if (this.inputSettings.settings.outliers.trend) {
        trend(group_values, trend_n)
          .forEach((flag, idx) => this.outliers.trend[start + idx] = flag)
      }
      if (this.inputSettings.settings.outliers.shift) {
        shift(group_values, group_targets, shift_n)
          .forEach((flag, idx) => this.outliers.shift[start + idx] = flag)
      }
    }
    Object.keys(this.outliers).forEach(key => {
      this.outliers[key] = checkFlagDirection(this.outliers[key],
                                              { process_flag_type, improvement_direction });
    })
  }
}
