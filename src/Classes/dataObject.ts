import powerbi from "powerbi-visuals-api"
import settingsObject from "./settingsObject"
import checkValidInput from "../Functions/checkValidInput"
import extractValues from "../Functions/extractValues"
import plotKey from "../Type Definitions/plotKey"

type dataObjectConstructor = {
  inputView?: powerbi.DataViewCategorical;
  inputSettings?: settingsObject
}

class dataObject {
  keys: plotKey[];
  numerators: number[];
  denominators: number[];
  groups: string[];
  chart_type: string;
  multiplier: number;
  highlights: powerbi.PrimitiveValue[];


  constructor(args: dataObjectConstructor) {
    let numerators_raw: powerbi.DataViewValueColumn = args.inputView.values.filter(d => d.source.roles.numerators)[0];

    let groups_raw: powerbi.DataViewValueColumn = args.inputView.values.filter(d => d.source.roles.groups)[0];
    let chart_type_raw: powerbi.DataViewValueColumn = args.inputView.values.filter(d => d.source.roles.chart_type)[0];
    let multiplier_raw: powerbi.DataViewValueColumn = args.inputView.values.filter(d => d.source.roles.chart_multiplier)[0];

    let numerators: number[] = <number[]>numerators_raw.values;
    let denominators: number[] = <number[]>args.inputView.values.filter(d => d.source.roles.denominators)[0].values;
    let groups: string[] = groups_raw ? <string[]>groups_raw.values : [];
    let chart_type: string = chart_type_raw ? <string>chart_type_raw.values[0] : args.inputSettings.spc.chart_type.value;
    let multiplier: number = multiplier_raw ? <number>multiplier_raw.values[0] : args.inputSettings.spc.multiplier.value;

    let valid_ids: number[] = new Array<number>();

    let valid_keys: plotKey[] = new Array<plotKey>();

    for (let i: number = 0; i < denominators.length; i++) {
      if(checkValidInput(numerators[i], denominators[i], chart_type)) {
        valid_ids.push(i);
        let allCategories: string[] = <string[]>args.inputView.categories.map(category => category.values[i]);
        valid_keys.push({id: i, label: allCategories.join(" ") })
      }
    }

    this.keys = valid_keys;
    this.numerators = extractValues(numerators, valid_ids);
    this.denominators = extractValues(denominators, valid_ids);
    this.groups = extractValues(groups, valid_ids);
    this.chart_type = chart_type;
    this.multiplier = multiplier;
    this.highlights = numerators_raw.highlights;
  }
}

export default dataObject;
