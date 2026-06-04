import type powerbi from "powerbi-visuals-api";
type VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import isNullOrUndefined from "./isNullOrUndefined";

const enum UpdateOptionsValidTypes {
  Valid = 1,
  Undefined = 2,
  MissingNumerators = 3
}

export default function updateOptionsUndefined(options: VisualUpdateOptions): UpdateOptionsValidTypes {
  if (
    isNullOrUndefined(options?.dataViews)
    || (options.dataViews.length === 0)
    || isNullOrUndefined(options.dataViews[0]?.categorical)
    || isNullOrUndefined(options.dataViews[0].categorical?.categories)
    || options.dataViews[0].categorical.categories.length === 0
    || isNullOrUndefined(options.dataViews[0].categorical.categories[0].source)
    || isNullOrUndefined(options.dataViews[0].metadata?.columns)
    || !(options.dataViews[0].metadata.columns.some(d => !isNullOrUndefined(d?.roles?.key)))
  ) {
    return UpdateOptionsValidTypes.Undefined
  }

  if (
    isNullOrUndefined(options.dataViews[0].categorical?.values)
    || !(options.dataViews[0].metadata.columns.some(d => !isNullOrUndefined(d?.roles?.numerators)))
  ) {
    return UpdateOptionsValidTypes.MissingNumerators
  }

  return UpdateOptionsValidTypes.Valid
}

export { UpdateOptionsValidTypes }
