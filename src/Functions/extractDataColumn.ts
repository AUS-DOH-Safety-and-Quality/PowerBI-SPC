import powerbi from "powerbi-visuals-api"
type DataViewValueColumn = powerbi.DataViewValueColumn;
type DataViewCategorical = powerbi.DataViewCategorical;
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import type { defaultSettingsType } from "../Classes/";
import { formatPrimitiveValue, dateSettingsToFormatOptions, parseInputDates, rep, isNullOrUndefined } from "../Functions";
type TargetT = number[] | string[] | VisualTooltipDataItem[][];

function datePartsToRecord(dateParts: Intl.DateTimeFormatPart[]) {
  const datePartsRecord = Object.fromEntries(dateParts.filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  ["weekday", "day", "month", "year"].forEach(key => {
    datePartsRecord[key] ??= ""
  })
  return datePartsRecord
}

function extractKeys(inputView: DataViewCategorical, inputSettings: defaultSettingsType, idxs: number[]): string[] {
  const col: powerbi.DataViewCategoryColumn[] = inputView.categories.filter(viewColumn => viewColumn.source?.roles?.["key"]);
  const n_keys: number = idxs.length;
  let ret = new Array<string>(n_keys);
  if (col.length === 1 && !(col[0].source.type?.temporal)) {
    for (let i = 0; i < n_keys; i++) {
      ret[i] = isNullOrUndefined(col[0].values[idxs[i]]) ? null : String(col[0].values[idxs[i]]);
    }
    return ret;
  }
  const delim: string = inputSettings.dates.date_format_delim;
  // If multiple inputs are passed but not as a 'Date Hierarchy' type then
  // just concatenate and do not attempt to format
  // TODO(Andrew): Support formatting individual date parts
  //  - e.g., Mixing Date Hierarchy and string inputs
  if (!(col.every(d => d.source?.type?.temporal))) {
    const blankKey: string = rep("", col.length).join(delim)
    for (let i = 0; i < n_keys; i++) {
      const currKey: string = col.map(keyCol => keyCol.values[idxs[i]]).join(delim)
      ret[i] = currKey === blankKey ? null : currKey
    }
    return ret;
  }
  const inputDates = parseInputDates(col, idxs)
  const formatter = new Intl.DateTimeFormat(inputSettings.dates.date_format_locale, dateSettingsToFormatOptions(inputSettings.dates));
  for (let i = 0; i < n_keys; i++) {
    if (isNullOrUndefined(inputDates.dates[i])) {
      ret[i] = null
    }
    const dateParts = datePartsToRecord(formatter.formatToParts(<Date>inputDates.dates[i]))
    const datePartStrings: string[] = [dateParts.weekday + " " + dateParts.day,
                                        dateParts.month,
                                        inputDates.quarters?.[i] ?? "",
                                        dateParts.year];
    ret[i] = datePartStrings.filter(d => String(d).trim()).join(delim)
  }
  return ret
}

function extractTooltips(inputView: DataViewCategorical, inputSettings: defaultSettingsType, idxs: number[]): VisualTooltipDataItem[][] {
  const tooltipColumns = inputView.values.filter(viewColumn => viewColumn.source.roles.tooltips);
  const n_keys: number = idxs.length;
  let ret: VisualTooltipDataItem[][] = new Array<VisualTooltipDataItem[]>(n_keys);
  for (let i = 0; i < n_keys; i++) {
    ret[i] = tooltipColumns.map(viewColumn => {
      const config = { valueType: viewColumn.source.type, dateSettings: inputSettings.dates };
      const tooltipValueFormatted: string = formatPrimitiveValue(viewColumn?.values?.[idxs[i]], config)
      return <VisualTooltipDataItem>{
        displayName: viewColumn.source.displayName,
        value: tooltipValueFormatted
      }
    })
  }
  return ret;
}

export default function extractDataColumn<T extends TargetT>(inputView: DataViewCategorical,
                                              name: string,
                                              inputSettings: defaultSettingsType,
                                              idxs: number[]): T {
  if (name === "key") {
    return extractKeys(inputView, inputSettings, idxs) as Extract<T, string[]>;
  }
  if (name === "tooltips") {
    return extractTooltips(inputView, inputSettings, idxs) as Extract<T, VisualTooltipDataItem[][]>;
  }

  const columnRaw = inputView.values.filter(viewColumn => viewColumn?.source?.roles?.[name]) as DataViewValueColumn[];
  if (columnRaw.length === 0) {
    return null
  }
  const n_keys: number = idxs.length;
  if (name === "groupings") {
    let ret = new Array<string>(n_keys);
    for (let i = 0; i < n_keys; i++) {
      ret[i] = isNullOrUndefined(columnRaw?.[0]?.values?.[idxs[i]]) ? null : String(columnRaw[0].values[idxs[i]]);
    }
    return ret as Extract<T, string[]>;
  }
  // Assumed that any other requested columns are numeric columns for plotting
  let ret = new Array<number>(n_keys);
  for (let i = 0; i < n_keys; i++) {
    ret[i] = isNullOrUndefined(columnRaw?.[0]?.values?.[idxs[i]]) ? null : Number(columnRaw[0].values[idxs[i]]);
  }
  return ret as Extract<T, number[]>;
}
