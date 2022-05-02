import powerbi from "powerbi-visuals-api"
import settingsObject from "./settingsObject"
import checkValidInput from "../Functions/checkValidInput"
import extractValues from "../Functions/extractValues"
import plotKey from "../Type Definitions/plotKey"
import isDate from "../Functions/isDate"
import strToDMY from "../Functions/stringToDMY"

type dataObjectConstructor = {
  inputView?: powerbi.DataViewCategorical;
  inputSettings?: settingsObject
  empty?: boolean
}

class dataObject {
  keys: plotKey[];
  numerators: number[];
  denominators: number[];
  groups: string[];
  chart_type: string;
  multiplier: number;
  highlights: powerbi.PrimitiveValue[];
  categories: powerbi.DataViewCategoryColumn;

  constructor(args: dataObjectConstructor) {
    if (args.empty) {
      this.keys = null;
      this.numerators = null;
      this.denominators = null;
      this.groups = null;
      this.chart_type = null;
      this.multiplier = null;
      this.highlights = null;
      this.categories = null;
      return;
    }
    let numerators_raw: powerbi.DataViewValueColumn = args.inputView.values.filter(d => d.source.roles.numerators)[0];

    let denominators_raw: powerbi.DataViewValueColumn = args.inputView.values.filter(d => d.source.roles.denominators)[0];
    let groups_raw: powerbi.DataViewValueColumn = args.inputView.values.filter(d => d.source.roles.groups)[0];
    let chart_type_raw: powerbi.DataViewValueColumn = args.inputView.values.filter(d => d.source.roles.chart_type)[0];
    let multiplier_raw: powerbi.DataViewValueColumn = args.inputView.values.filter(d => d.source.roles.chart_multiplier)[0];

    let numerators: number[] = <number[]>numerators_raw.values;
    let denominators: number[] = denominators_raw ? <number[]>denominators_raw.values : null;
    let groups: string[] = groups_raw ? <string[]>groups_raw.values : [];
    let chart_type: string = chart_type_raw ? <string>chart_type_raw.values[0] : args.inputSettings.spc.chart_type.value;
    let multiplier: number = multiplier_raw ? <number>multiplier_raw.values[0] : args.inputSettings.spc.multiplier.value;

    let valid_ids: number[] = new Array<number>();

    let valid_keys: plotKey[] = new Array<plotKey>();

    console.log("numerators: ", numerators)
    console.log(groups)

    for (let i: number = 0; i < numerators.length; i++) {
      if(checkValidInput(numerators[i], denominators ? denominators[i] : null, chart_type)) {
        valid_ids.push(i);
        let allCategories: string[] = <string[]>args.inputView.categories.map(category => category.values[i]);
        allCategories = allCategories.map(category => isDate(category) ? strToDMY(category) : category);
        valid_keys.push({ x: null, id: i, label: allCategories.join(" ") })
      }
    }

    valid_keys.forEach((d, idx) => { d.x = idx });

    this.keys = valid_keys;
    this.numerators = extractValues(numerators, valid_ids);
    this.denominators = extractValues(denominators, valid_ids);
    this.groups = extractValues(groups, valid_ids);
    this.chart_type = chart_type;
    this.multiplier = multiplier;
    this.highlights = numerators_raw.highlights ? extractValues(numerators_raw.highlights, valid_ids) : numerators_raw.highlights;
    this.categories = args.inputView.categories[0]
  }
}

export default dataObject;
