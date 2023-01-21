import powerbi from "powerbi-visuals-api"
import settingsObject from "./settingsObject"
import checkValidInput from "../Functions/checkValidInput"
import extractValues from "../Functions/extractValues"
import plotKey from "./plotKey"
import stringToDMY from "../Functions/stringToDMY"
import dateFormat from "./dateFormat"

class dataObject {
  keys: plotKey[];
  numerators: number[];
  denominators: number[];
  xbar_sds: number[];
  chart_type: string;
  multiplier: number;
  process_flag_type: string;
  improvement_direction: string;
  flag_direction: string;
  highlights: powerbi.PrimitiveValue[];
  anyHighlights: boolean;
  percentLabels: boolean;
  categories: powerbi.DataViewCategoryColumn;
  limit_truncs: {lower?: number, upper?: number};

  constructor(inputView: powerbi.DataViewCategorical, inputSettings: settingsObject) {
    let numerators_raw: powerbi.DataViewValueColumn = inputView.values.filter(d => d.source.roles.numerators)[0];
    let denominators_raw: powerbi.DataViewValueColumn = inputView.values.filter(d => d.source.roles.denominators)[0];
    let xbar_sds_raw: powerbi.DataViewValueColumn = inputView.values.filter(d => d.source.roles.xbar_sds)[0];
    let keys_raw: powerbi.DataViewValueColumn = inputView.categories.filter(d => d.source.roles.key)[0];
    let chart_type_raw: powerbi.DataViewValueColumn = inputView.values.filter(d => d.source.roles.chart_type)[0];
    let multiplier_raw: powerbi.DataViewValueColumn = inputView.values.filter(d => d.source.roles.chart_multiplier)[0];
    let process_flag_type_raw: powerbi.DataViewValueColumn = inputView.values.filter(d => d.source.roles.process_flag_type)[0];
    let improvement_direction_raw: powerbi.DataViewValueColumn = inputView.values.filter(d => d.source.roles.improvement_direction)[0];

    let numerators: number[] = <number[]>numerators_raw.values;
    let denominators: number[] = denominators_raw ? <number[]>denominators_raw.values : null;
    let xbar_sds: number[] = xbar_sds_raw ? <number[]>xbar_sds_raw.values : null;
    let date_format: dateFormat = JSON.parse(inputSettings.x_axis.xlimit_date_format.value);
    let keys: string[] = keys_raw.source.type.dateTime ? stringToDMY(<string[]>keys_raw.values, date_format) : <string[]>(keys_raw.values);
    let chart_type: string = chart_type_raw ? <string>chart_type_raw.values[0] : inputSettings.spc.chart_type.value;
    let multiplier: number = multiplier_raw ? <number>multiplier_raw.values[0] : inputSettings.spc.multiplier.value;

    let process_flag_type: string = process_flag_type_raw ? <string>process_flag_type_raw.values[0] : inputSettings.outliers.process_flag_type.value;
    let improvement_direction: string = improvement_direction_raw ? <string>improvement_direction_raw.values[0] : inputSettings.outliers.improvement_direction.value;

    let improveFlagDirectionMap: { [key: string] : string } = {
      "increase" : "upper",
      "decrease" : "lower"
    }
    let deteriorateFlagDirectionMap: { [key: string] : string } = {
      "increase" : "lower",
      "decrease" : "upper"
    }

    let flag_direction: string;
    if (process_flag_type === "both") {
      flag_direction = process_flag_type;
    } else if (process_flag_type === "improvement") {
      flag_direction = improveFlagDirectionMap[improvement_direction];
    } else if (process_flag_type === "deterioration") {
      flag_direction = deteriorateFlagDirectionMap[improvement_direction];
    }

    let valid_ids: number[] = new Array<number>();
    let valid_keys: plotKey[] = new Array<plotKey>();

    for (let i: number = 0; i < numerators.length; i++) {
      if (checkValidInput(numerators[i],
                          denominators ? denominators[i] : null,
                          xbar_sds ? xbar_sds[i] : null, chart_type)) {
        valid_ids.push(i);
        valid_keys.push({ x: null, id: i, label: keys[i] })
      }
    }

    valid_keys.forEach((d, idx) => { d.x = idx });

    this.keys = valid_keys;
    this.numerators = extractValues(numerators, valid_ids);
    this.denominators = extractValues(denominators, valid_ids);
    this.xbar_sds = extractValues(xbar_sds, valid_ids);
    this.chart_type = chart_type;
    this.multiplier = multiplier;
    this.process_flag_type = process_flag_type.toLowerCase();
    this.improvement_direction = improvement_direction.toLowerCase();
    this.flag_direction = flag_direction.toLowerCase();
    this.highlights = numerators_raw.highlights ? extractValues(numerators_raw.highlights, valid_ids) : numerators_raw.highlights;
    this.anyHighlights = this.highlights ? true : false
    this.categories = inputView.categories[0];
    this.percentLabels = ["p", "pp"].includes(chart_type) && (multiplier === 1 || multiplier === 100);
    this.limit_truncs = {
      lower: inputSettings.spc.ll_truncate.value,
      upper: inputSettings.spc.ul_truncate.value
    }
  }
}

export default dataObject;
