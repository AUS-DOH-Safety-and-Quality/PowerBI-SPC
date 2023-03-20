import powerbi from "powerbi-visuals-api"
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import PrimitiveValue = powerbi.PrimitiveValue;
import DataViewCategorical = powerbi.DataViewCategorical;
import extractDataColumn from "../Functions/extractDataColumn"
import settingsObject from "./settingsObject"
import checkValidInput from "../Functions/checkValidInput"
import extractValues from "../Functions/extractValues"
import plotKey from "./plotKey"
import rep from "../Functions/rep"

class dataObject {
  keys: plotKey[];
  numerators: number[];
  denominators: number[];
  xbar_sds: number[];
  chart_type: string;
  multiplier: number;
  process_flag_type: string;
  improvement_direction: string;
  highlights: PrimitiveValue[];
  anyHighlights: boolean;
  percentLabels: boolean;
  categories: DataViewCategoryColumn;
  limit_truncs: {lower?: number, upper?: number};
  alt_target: number[];

  constructor(inputView: DataViewCategorical, inputSettings: settingsObject) {
    let numerators: number[] = extractDataColumn<number[]>(inputView, "numerators");
    let denominators: number[] = extractDataColumn<number[]>(inputView, "denominators");
    let xbar_sds: number[] = extractDataColumn<number[]>(inputView, "xbar_sds");
    let keys: string[] =  extractDataColumn<string[]>(inputView, "key", inputSettings);

    let chart_type: string = extractDataColumn<string>(inputView, "chart_type", inputSettings);
    let multiplier: number = extractDataColumn<number>(inputView, "multiplier", inputSettings);
    let process_flag_type: string = extractDataColumn<string>(inputView, "process_flag_type", inputSettings);
    let improvement_direction: string = extractDataColumn<string>(inputView, "improvement_direction", inputSettings);
    let alt_target_vec_tmp: number[] = extractDataColumn<number[]>(inputView, "alt_target", inputSettings);
    let alt_target_vec: number[] = (alt_target_vec_tmp.length === 1)
                                    ? rep(alt_target_vec_tmp[0], numerators.length)
                                    : alt_target_vec_tmp;

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
    this.alt_target = extractValues(alt_target_vec, valid_ids);
    this.chart_type = chart_type;
    this.process_flag_type = process_flag_type.toLowerCase();
    this.improvement_direction = improvement_direction.toLowerCase();
    this.highlights = inputView.values[0].highlights ? extractValues(inputView.values[0].highlights, valid_ids) : inputView.values[0].highlights;
    this.anyHighlights = this.highlights ? true : false
    this.categories = inputView.categories[0];
    this.percentLabels = ["p", "pp"].includes(chart_type) && (multiplier === 1 || multiplier === 100);
    this.multiplier = this.percentLabels ? 1 : multiplier;
    this.limit_truncs = {
      lower: inputSettings.spc.ll_truncate.value,
      upper: inputSettings.spc.ul_truncate.value
    }
  }
}

export default dataObject;
