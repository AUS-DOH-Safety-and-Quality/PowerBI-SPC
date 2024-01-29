import type powerbi from "powerbi-visuals-api";
type IVisualHost = powerbi.extensibility.visual.IVisualHost;
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
type ISelectionId = powerbi.visuals.ISelectionId;
import * as d3 from "../D3 Plotting Functions/D3 Modules";
import * as limitFunctions from "../Limit Calculations"
import { settingsClass, type defaultSettingsType, plotPropertiesClass } from "../Classes";
import { buildTooltip, getAesthetic, checkFlagDirection, truncate, type truncateInputs, multiply, rep, type dataObject, extractInputData } from "../Functions"
import { astronomical, trend, twoInThree, shift } from "../Outlier Flagging"

export type lineData = {
  x: number;
  line_value: number;
  group: string;
}

export type plotData = {
  x: number;
  value: number;
  aesthetics: defaultSettingsType["scatter"];
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
  firstRun: boolean;

  constructor() {
    this.inputData = <dataObject>null;
    this.inputSettings = new settingsClass();
    this.controlLimits = null;
    this.plotPoints = new Array<plotData>();
    this.groupedLines = new Array<[string, lineData[]]>();
    this.plotProperties = new plotPropertiesClass();
    this.firstRun = true
    this.splitIndexes = new Array<number>();
  }

  update(options: VisualUpdateOptions, host: IVisualHost) {
    // Only re-construct data and re-calculate limits if they have changed
    if (options.type === 2 || this.firstRun) {
      const split_indexes: string = <string>(options.dataViews[0]?.metadata?.objects?.split_indexes_storage?.split_indexes) ?? "[]";
      this.splitIndexes = JSON.parse(split_indexes);
      this.inputData = extractInputData(options.dataViews[0].categorical, this.inputSettings.settings);

      this.calculateLimits();
      this.scaleAndTruncateLimits();
      this.flagOutliers();

      // Structure the data and calculated limits to the format needed for plotting
      this.initialisePlotData(host);
      this.initialiseGroupedLines();
    }

    this.plotProperties.update(
      options,
      this.plotPoints,
      this.controlLimits,
      this.inputData,
      this.inputSettings.settings,
      this.inputSettings.derivedSettings
    )
    this.firstRun = false;
  }

  calculateLimits(): void {
    this.inputData.limitInputArgs.outliers_in_limits = this.inputSettings.settings.spc.outliers_in_limits;
    const limitFunction: (args: controlLimitsArgs) => controlLimitsObject
      = limitFunctions[this.inputSettings.settings.spc.chart_type];

    if (this.splitIndexes.length > 0 || this.inputData.groupingIndexes.length > 0) {
      const indexes: number[] = this.splitIndexes
                                  .concat(this.inputData.groupingIndexes)
                                  .concat([this.inputData.limitInputArgs.keys.length - 1])
                                  .filter((d, idx, arr) => arr.indexOf(d) === idx)
                                  .sort((a,b) => a - b);
      const groupedData: dataObject[] = indexes.map((d, idx) => {
        // Force a deep copy
        const data: dataObject = JSON.parse(JSON.stringify(this.inputData));
         if(idx === 0) {
          data.limitInputArgs.denominators = data.limitInputArgs.denominators.slice(0, d + 1)
          data.limitInputArgs.numerators = data.limitInputArgs.numerators.slice(0, d + 1)
          data.limitInputArgs.keys = data.limitInputArgs.keys.slice(0, d + 1)
         } else {
          data.limitInputArgs.denominators = data.limitInputArgs.denominators.slice(indexes[idx - 1] + 1, d + 1)
          data.limitInputArgs.numerators = data.limitInputArgs.numerators.slice(indexes[idx - 1] + 1, d + 1)
          data.limitInputArgs.keys = data.limitInputArgs.keys.slice(indexes[idx - 1] + 1, d + 1)
         }
        return data;
      })

      const calcLimitsGrouped: controlLimitsObject[] = groupedData.map(d => limitFunction(d.limitInputArgs));
      this.controlLimits = calcLimitsGrouped.reduce((all: controlLimitsObject, curr: controlLimitsObject) => {
        const allInner: controlLimitsObject = all;
        Object.entries(all).forEach((entry, idx) => {
          if (this.inputSettings.settings.spc.chart_type !== "run" || !["ll99", "ll95", "ll68", "ul68", "ul95", "ul99"].includes(entry[0])) {
            allInner[entry[0]] = entry[1]?.concat(Object.entries(curr)[idx][1]);
          }
        })
        return allInner;
      })
    } else {
      // Calculate control limits using user-specified type
      this.controlLimits = limitFunction(this.inputData.limitInputArgs);
    }

    this.controlLimits.alt_targets = rep(this.inputSettings.settings.lines.alt_target,
                                          this.inputData.limitInputArgs.keys.length);
  }

  initialisePlotData(host: IVisualHost): void {
    this.plotPoints = new Array<plotData>();
    this.tickLabels = new Array<{ x: number; label: string; }>();

    for (let i: number = 0; i < this.controlLimits.keys.length; i++) {
      const index: number = this.controlLimits.keys[i].x;
      const aesthetics: defaultSettingsType["scatter"] = this.inputData.scatter_formatting[i]
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

      this.plotPoints.push({
        x: index,
        value: this.controlLimits.values[i],
        aesthetics: aesthetics,
        identity: host.createSelectionIdBuilder()
                      .withCategory(this.inputData.categories,
                                    this.inputData.limitInputArgs.keys[i].id)
                      .createSelectionId(),
        highlighted: this.inputData.highlights?.[index] != null,
        tooltip: buildTooltip(i, this.controlLimits, this.outliers, this.inputData, this.inputSettings.settings, this.inputSettings.derivedSettings)
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
    if (this.inputSettings.settings.spc.chart_type !== "run") {
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
      labels.forEach(label => {
        // By adding an additional null line value at each re-baseline point
        // we avoid rendering a line joining each segment
        if (this.splitIndexes.includes(i - 1) || this.inputData.groupingIndexes.includes(i - 1)) {
          formattedLines.push({
            x: this.controlLimits.keys[i].x,
            line_value: null,
            group: label
          })
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

    ["values", "targets", "ll99", "ll95", "ll68", "ul68", "ul95", "ul99"].forEach(limit => {
      this.controlLimits[limit] = multiply(this.controlLimits[limit], multiplier)
    })

    if (this.inputSettings.settings.spc.chart_type === "run") {
      return;
    }

    const limits: truncateInputs = {
      lower: this.inputSettings.settings.spc.ll_truncate,
      upper: this.inputSettings.settings.spc.ul_truncate
    };

    ["ll99", "ll95", "ll68", "ul68", "ul95", "ul99"].forEach(limit => {
      this.controlLimits[limit] = truncate(this.controlLimits[limit], limits);
    });
  }

  flagOutliers() {
    const process_flag_type: string = this.inputSettings.settings.outliers.process_flag_type;
    const improvement_direction: string = this.inputSettings.settings.outliers.improvement_direction;
    this.outliers = {
      astpoint: rep("none", this.inputData.limitInputArgs.keys.length),
      two_in_three: rep("none", this.inputData.limitInputArgs.keys.length),
      trend: rep("none", this.inputData.limitInputArgs.keys.length),
      shift: rep("none", this.inputData.limitInputArgs.keys.length)
    }
    if (this.inputSettings.settings.spc.chart_type !== "run") {
      if (this.inputSettings.settings.outliers.astronomical) {
        this.outliers.astpoint = checkFlagDirection(
          astronomical(this.controlLimits.values, this.controlLimits.ll99, this.controlLimits.ul99),
          { process_flag_type, improvement_direction });
      }
      if (this.inputSettings.settings.outliers.two_in_three) {
        this.outliers.two_in_three = checkFlagDirection(
          twoInThree(this.controlLimits.values, this.controlLimits.ll95, this.controlLimits.ul95, this.inputSettings.settings.outliers.flag_series),
          { process_flag_type, improvement_direction });
      }
    }
    if (this.inputSettings.settings.outliers.trend) {
      this.outliers.trend = checkFlagDirection(
        trend(this.controlLimits.values, this.inputSettings.settings.outliers.trend_n, this.inputSettings.settings.outliers.flag_series),
        { process_flag_type, improvement_direction });
    }
    if (this.inputSettings.settings.outliers.shift) {
      this.outliers.shift = checkFlagDirection(
        shift(this.controlLimits.values, this.controlLimits.targets, this.inputSettings.settings.outliers.shift_n, this.inputSettings.settings.outliers.flag_series),
        { process_flag_type, improvement_direction });
    }
  }
}
