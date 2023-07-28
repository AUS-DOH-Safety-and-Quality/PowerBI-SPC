import powerbi from "powerbi-visuals-api"
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import PrimitiveValue = powerbi.PrimitiveValue;
import DataViewCategorical = powerbi.DataViewCategorical;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import extractDataColumn from "../Functions/extractDataColumn"
import settingsClass from "./settingsClass"
import checkValidInput from "../Functions/checkValidInput"
import extractValues from "../Functions/extractValues"
import extractConditionalFormatting from "../Functions/extractConditionalFormatting"
import { defaultSettingsType } from "../defaultSettings";

export default class dataClass {
  keys: { x: number, id: number, label: string }[];
  numerators: number[];
  denominators: number[];
  xbar_sds: number[];
  highlights: PrimitiveValue[];
  anyHighlights: boolean;
  percentLabels: boolean;
  categories: DataViewCategoryColumn;
  scatter_formatting: defaultSettingsType["scatter"][];
  tooltips: VisualTooltipDataItem[][];

  constructor(inputView?: DataViewCategorical, inputSettings?: settingsClass) {
    if (inputView && inputSettings) {
      const numerators: number[] = extractDataColumn<number[]>(inputView, "numerators", inputSettings);
      const denominators: number[] = extractDataColumn<number[]>(inputView, "denominators", inputSettings);
      const xbar_sds: number[] = extractDataColumn<number[]>(inputView, "xbar_sds", inputSettings);
      const keys: string[] = extractDataColumn<string[]>(inputView, "key", inputSettings);
      const scatter_cond = extractConditionalFormatting(inputView, "scatter", inputSettings) as defaultSettingsType["scatter"][];
      const tooltips = extractDataColumn<VisualTooltipDataItem[][]>(inputView, "tooltips", inputSettings);

      const valid_ids: number[] = new Array<number>();
      const valid_keys: { x: number, id: number, label: string }[] = new Array<{ x: number, id: number, label: string }>();

      let validCount: number = 0
      for (let i: number = 0; i < numerators.length; i++) {
        if (checkValidInput(numerators[i],
                            denominators ? denominators[i] : null,
                            xbar_sds ? xbar_sds[i] : null, inputSettings.spc.chart_type)) {
          valid_ids.push(i);
          valid_keys.push({ x: validCount, id: i, label: keys[i] })
          validCount += 1;
        }
      }

      let percent_labels: boolean;
      if (inputSettings.spc.perc_labels === "Automatic") {
        percent_labels = ["p", "pp"].includes(inputSettings.spc.chart_type) && (inputSettings.spc.multiplier === 1 || inputSettings.spc.multiplier === 100);
      } else {
        percent_labels = inputSettings.spc.perc_labels === "Yes";
      }

      const inputValues = (inputView.values as powerbi.DataViewValueColumns)[0];

      this.keys = valid_keys;
      this.numerators = extractValues(numerators, valid_ids);
      this.denominators = extractValues(denominators, valid_ids);
      this.xbar_sds = extractValues(xbar_sds, valid_ids);
      this.tooltips = extractValues(tooltips, valid_ids);
      this.highlights = inputValues.highlights ? extractValues(inputValues.highlights, valid_ids) : new Array<PrimitiveValue>;
      this.anyHighlights = (this.highlights.length > 0)
      this.categories = (inputView.categories as powerbi.DataViewCategoryColumn[])[0];
      this.percentLabels = percent_labels;
      this.scatter_formatting = extractValues(scatter_cond, valid_ids);
    }
  }
}
