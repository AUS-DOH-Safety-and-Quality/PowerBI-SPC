import powerbi from "powerbi-visuals-api"
type DataViewValueColumn = powerbi.DataViewValueColumn;
type DataViewCategorical = powerbi.DataViewCategorical;
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import type { defaultSettingsType } from "../Classes/";
import { formatPrimitiveValue, dateSettingsToFormatOptions, parseInputDates, rep, isNullOrUndefined } from "../Functions";
type TargetT = number[] | string[] | number | string | VisualTooltipDataItem[][];

function datePartsToRecord(dateParts: Intl.DateTimeFormatPart[]) {
  const datePartsRecord = Object.fromEntries(dateParts.filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  ["weekday", "day", "month", "year"].forEach(key => {
    datePartsRecord[key] ??= ""
  })
  return datePartsRecord
}

function extractKeys(inputView: DataViewCategorical, inputSettings: defaultSettingsType): string[] {
  const col: powerbi.DataViewCategoryColumn[] = inputView.categories.filter(viewColumn => viewColumn.source?.roles?.["key"]);
  if (col.length === 1 && !(col[0].source.type?.temporal)) {
    return col[0].values.map(d => isNullOrUndefined(d) ? null : String(d));
  }
  const delim: string = inputSettings.dates.date_format_delim;
  // If multiple inputs are passed but not as a 'Date Hierarchy' type then
  // just concatenate and do not attempt to format
  // TODO(Andrew): Support formatting individual date parts
  //  - e.g., Mixing Date Hierarchy and string inputs
  if (!(col.every(d => d.source?.type?.temporal))) {
    const blankKey: string = rep("", col.length).join(delim)
    return col[0].values.map((_, idx) => {
      const currKey: string = col.map(keyCol => keyCol.values[idx]).join(delim)
      return currKey === blankKey ? null : currKey
    })
  }
  const inputDates = parseInputDates(col)
  const formatter = new Intl.DateTimeFormat(inputSettings.dates.date_format_locale, dateSettingsToFormatOptions(inputSettings.dates));
  return inputDates.dates.map((value: Date, idx) => {
    if (isNullOrUndefined(value)) {
      return null
    }
    const dateParts = datePartsToRecord(formatter.formatToParts(<Date>value))
    const datePartStrings: string[] = [dateParts.weekday + " " + dateParts.day,
                                        dateParts.month,
                                        inputDates.quarters?.[idx] ?? "",
                                        dateParts.year];
    return datePartStrings.filter(d => String(d).trim()).join(delim)
  })
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

  const columnRaw = inputView.values.filter(viewColumn => viewColumn?.source?.roles?.[name]) as DataViewValueColumn[];
  if (name === "groupings") {
    return columnRaw?.[0]?.values?.map(d => isNullOrUndefined(d) ? null : String(d)) as T
  }
  // Assumed that any other requested columns are numeric columns for plotting
  return columnRaw?.[0]?.values?.map(d => isNullOrUndefined(d) ? null : Number(d)) as T
}
