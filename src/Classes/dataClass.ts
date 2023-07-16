import powerbi from "powerbi-visuals-api"
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import PrimitiveValue = powerbi.PrimitiveValue;
import DataViewCategorical = powerbi.DataViewCategorical;
import extractDataColumn from "../Functions/extractDataColumn"
import settingsClass from "./settingsClass"
import checkValidInput from "../Functions/checkValidInput"
import extractValues from "../Functions/extractValues"
import extractConditionalFormatting from "../Functions/extractConditionalFormatting"
import { defaultSettingsType } from "./defaultSettings";

class dataClass {
  keys: { x: number, id: number, label: string }[];
  numerators: number[];
  denominators: number[];
  xbar_sds: number[];
  highlights: PrimitiveValue[];
  anyHighlights: boolean;
  percentLabels: boolean;
  categories: DataViewCategoryColumn;
  scatter_formatting: defaultSettingsType["scatter"][];

  constructor(inputView: DataViewCategorical, inputSettings: settingsClass) {
    const numerators: number[] = extractDataColumn<number[]>(inputView, "numerators");
    const denominators: number[] = extractDataColumn<number[]>(inputView, "denominators");
    const xbar_sds: number[] = extractDataColumn<number[]>(inputView, "xbar_sds");
    const keys: string[] =  extractDataColumn<string[]>(inputView, "key", inputSettings);
    const scatter_cond = extractConditionalFormatting<defaultSettingsType["scatter"]>(inputView, "scatter", inputSettings)

    const valid_ids: number[] = new Array<number>();
    const valid_keys: { x: number, id: number, label: string }[] = new Array<{ x: number, id: number, label: string }>();

    for (let i: number = 0; i < numerators.length; i++) {
      if (checkValidInput(numerators[i],
                          denominators ? denominators[i] : null,
                          xbar_sds ? xbar_sds[i] : null, inputSettings.spc.chart_type)) {
        valid_ids.push(i);
        valid_keys.push({ x: null, id: i, label: keys[i] })
      }
    }

    valid_keys.forEach((d, idx) => { d.x = idx });

    let percent_labels: boolean;
    if (inputSettings.spc.perc_labels === "Automatic") {
      percent_labels = ["p", "pp"].includes(inputSettings.spc.chart_type) && (inputSettings.spc.multiplier === 1 || inputSettings.spc.multiplier === 100);
    } else {
      percent_labels = inputSettings.spc.perc_labels === "Yes";
    }

    this.keys = valid_keys;
    this.numerators = extractValues(numerators, valid_ids);
    this.denominators = extractValues(denominators, valid_ids);
    this.xbar_sds = extractValues(xbar_sds, valid_ids);
    this.highlights = inputView.values[0].highlights ? extractValues(inputView.values[0].highlights, valid_ids) : inputView.values[0].highlights;
    this.anyHighlights = this.highlights ? true : false
    this.categories = inputView.categories[0];
    this.percentLabels = percent_labels;
    this.scatter_formatting = extractValues(scatter_cond, valid_ids)
  }
}

export default dataClass;
