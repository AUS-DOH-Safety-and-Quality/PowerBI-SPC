import powerbi from "powerbi-visuals-api"
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import PrimitiveValue = powerbi.PrimitiveValue;
import DataViewCategorical = powerbi.DataViewCategorical;
import extractDataColumn from "../Functions/extractDataColumn"
import settingsObject from "./settingsObject"
import checkValidInput from "../Functions/checkValidInput"
import extractValues from "../Functions/extractValues"
import plotKey from "./plotKey"
import extractConditionalFormatting from "../Functions/extractConditionalFormatting"
import { SettingsBaseTypedT, scatterSettings } from "../Classes/settingsGroups";

class dataObject {
  keys: plotKey[];
  numerators: number[];
  denominators: number[];
  xbar_sds: number[];
  highlights: PrimitiveValue[];
  anyHighlights: boolean;
  percentLabels: boolean;
  categories: DataViewCategoryColumn;
  scatter_formatting: SettingsBaseTypedT<scatterSettings>[];

  constructor(inputView: DataViewCategorical, inputSettings: settingsObject) {
    let numerators: number[] = extractDataColumn<number[]>(inputView, "numerators");
    let denominators: number[] = extractDataColumn<number[]>(inputView, "denominators");
    let xbar_sds: number[] = extractDataColumn<number[]>(inputView, "xbar_sds");
    let keys: string[] =  extractDataColumn<string[]>(inputView, "key", inputSettings);
    let scatter_cond = extractConditionalFormatting<SettingsBaseTypedT<scatterSettings>>(inputView, "scatter", inputSettings)

    let valid_ids: number[] = new Array<number>();
    let valid_keys: plotKey[] = new Array<plotKey>();

    for (let i: number = 0; i < numerators.length; i++) {
      if (checkValidInput(numerators[i],
                          denominators ? denominators[i] : null,
                          xbar_sds ? xbar_sds[i] : null, inputSettings.spc.chart_type.value)) {
        valid_ids.push(i);
        valid_keys.push({ x: null, id: i, label: keys[i] })
      }
    }

    valid_keys.forEach((d, idx) => { d.x = idx });

    let percent_labels: boolean;
    if (inputSettings.spc.perc_labels.value === "Automatic") {
      percent_labels = ["p", "pp"].includes(inputSettings.spc.chart_type.value) && (inputSettings.spc.multiplier.value === 1 || inputSettings.spc.multiplier.value === 100);
    } else {
      percent_labels = inputSettings.spc.perc_labels.value === "Yes";
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

export default dataObject;
