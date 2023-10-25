import type powerbi from "powerbi-visuals-api"
type DataViewValueColumn = powerbi.DataViewValueColumn;
type DataViewCategorical = powerbi.DataViewCategorical;
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import type { defaultSettingsType } from "../Classes/";
import { formatPrimitiveValue } from "../Functions";
type TargetT = number[] | string[] | number | string | VisualTooltipDataItem[][];

function extractKeys(inputView: DataViewCategorical, inputSettings: defaultSettingsType): string[] {
  const primitiveKeyColumns = inputView.categories.filter(viewColumn => viewColumn.source?.roles?.["key"])

  // If a 'Date Hierarchy' type is passed then there will be multiple 'key" entries
  if (primitiveKeyColumns.length > 1) {
    return primitiveKeyColumns[primitiveKeyColumns.length - 1].values.map((lastKeyValue: powerbi.PrimitiveValue, index) => {
      if (lastKeyValue === null) {
        return null
      }
      let concatKey: string = <string>lastKeyValue;
      for (let i = (primitiveKeyColumns.length - 2); i >= 0; i--) {
        concatKey += " " + primitiveKeyColumns[i].values[index];
      }
      return concatKey;
    }) as string[];
  } else {
    const primitiveKeyValues = primitiveKeyColumns?.[0]?.values;
    const primitiveKeyTypes = primitiveKeyColumns?.[0]?.source?.type;
    const config = { valueType: primitiveKeyTypes, dateSettings: inputSettings.dates}
    return formatPrimitiveValue(primitiveKeyValues, config)
  }
}

function extractTooltips(inputView: DataViewCategorical, inputSettings: defaultSettingsType): VisualTooltipDataItem[][] {
  const tooltipColumns = inputView.values.filter(viewColumn => viewColumn.source.roles.tooltips);
  return tooltipColumns?.[0]?.values?.map((_, idx) => {
    return tooltipColumns.map(viewColumn => {
      const config = { valueType: viewColumn.source.type, dateSettings: inputSettings.dates };
      const tooltipValueFormatted: string = formatPrimitiveValue(viewColumn?.values?.[idx], config)

      return <VisualTooltipDataItem>{
        displayName: viewColumn.source.displayName,
        value: tooltipValueFormatted
      }
    })
  })
}

export default function extractDataColumn<T extends TargetT>(inputView: DataViewCategorical,
                                              name: string,
                                              inputSettings: defaultSettingsType): T {
  if (name === "key") {
    return extractKeys(inputView, inputSettings) as Extract<T, string[]>;
  }
  if (name === "tooltips") {
    return extractTooltips(inputView, inputSettings) as Extract<T, VisualTooltipDataItem[][]>;
  }

  // Assumed that any other requested columns are numeric columns for plotting
  const columnRaw = inputView.values.filter(viewColumn => viewColumn?.source?.roles?.[name]) as DataViewValueColumn[];
  return columnRaw?.[0]?.values?.map(d => d === null ? null : Number(d)) as T
}
