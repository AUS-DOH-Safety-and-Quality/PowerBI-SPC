import type powerbi from "powerbi-visuals-api"
type DataViewValueColumn = powerbi.DataViewValueColumn;
type DataViewCategorical = powerbi.DataViewCategorical;
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import type { defaultSettingsType } from "../Classes/settingsClass";
import formatPrimitiveValue from "../Functions/formatPrimitiveValue";
import dateSettingsToFormatOptions from "../Functions/dateSettingsToFormatOptions";
import parseInputDates from "../Functions/parseInputDates";
import rep from "../Functions/rep";
import isNullOrUndefined from "../Functions/isNullOrUndefined";
import formatDateParts from "../Functions/formatDateParts";
type TargetT = number[] | string[] | VisualTooltipDataItem[][];

function formatKeys(col: powerbi.DataViewCategoryColumn[], inputSettings: defaultSettingsType, idxs: number[]): string[] {
  const n_keys: number = idxs.length;
  let ret = new Array<string>(n_keys);
  // If only one input is passed and it is not a date type then just return the string values
  if (col.length === 1 && !(col[0].source.type?.temporal)) {
    for (let i = 0; i < n_keys; i++) {
      ret[i] = isNullOrUndefined(col[0].values[idxs[i]]) ? null : String(col[0].values[idxs[i]]);
    }
    return ret;
  }
  const delim: string = inputSettings.dates.date_format_delim;
  // If multiple inputs are passed but not as a 'Date Hierarchy' type then
  // just concatenate and do not attempt to format
  if (!(col.every(d => d.source?.type?.temporal))) {
    const blankKey: string = rep("", col.length).join(delim)
    for (let i = 0; i < n_keys; i++) {
      const currKey: string = col.map(keyCol => keyCol.values[idxs[i]]).join(delim)
      ret[i] = currKey === blankKey ? null : currKey
    }
    return ret;
  }
  const inputDates = parseInputDates(col, idxs);
  const formatOptions = dateSettingsToFormatOptions(inputSettings.dates);
  const locale = inputSettings.dates.date_format_locale as "en-GB" | "en-US";
  let day_elem: string = locale === "en-GB" ? "day" : "month";
  let month_elem: string = locale === "en-GB" ? "month" : "day";

  for (let i = 0; i < n_keys; i++) {
    if (isNullOrUndefined(inputDates.dates[i])) {
      ret[i] = null
    } else {
      const datePartsRecord = formatDateParts(inputDates.dates[i], locale, formatOptions);
      const datePartStrings: string[] = [datePartsRecord.weekday + " " + datePartsRecord[day_elem],
                                          datePartsRecord[month_elem],
                                          inputDates.quarters?.[i] ?? "",
                                          datePartsRecord.year];
      ret[i] = datePartStrings.filter(d => String(d).trim()).join(delim)
    }
  }
  return ret
}

function extractKeys(inputView: DataViewCategorical, inputSettings: defaultSettingsType, idxs: number[]): string[] {
  const col: powerbi.DataViewCategoryColumn[] = inputView.categories.filter(viewColumn => viewColumn.source?.roles?.["key"]);

  // To handle separately formatting multiple 'key' columns that may come from different
  // queries (e.g., Date Hierarchy + string) we first group the columns by their query name
  // then format each group separately before combining the results
  // Group the columns by their query name
  const groupedCols: { [key: string]: powerbi.DataViewCategoryColumn[] } = {};
  let queryNames: string[] = col.map(d => d.source?.queryName ?? "");
  // If any query names are duplicates (i.e., the same column passed multiple times),
  // prepend the index to the query name to make it unique
  const uniqueQueryNames: Set<string> = new Set();
  queryNames = queryNames.map((queryName, idx) => {
    if (uniqueQueryNames.has(queryName)) {
      // If the query name is already in the set, prepend the index to make it unique
      queryName = `${idx}_${queryName}`;
    }
    uniqueQueryNames.add(queryName);
    return queryName;
  });

  col.forEach((d, idx) => {
    let queryName: string = queryNames[idx];
    if (queryName.includes("Date Hierarchy")) {
      // If the query is a 'Date Hierarchy', remove the element after the last '.' (the element of the hierarchy)
      // so that we can group by the base query name
      // i.e., "source_table.source_column.Variation.Date Hierarchy.Year" becomes "source_table.source_column.Variation.Date Hierarchy"
      // So that we can capture all the date hierarchy elements in the same group
      const lastDotIndex: number = queryName.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        queryName = queryName.substring(0, lastDotIndex);
      }
    }
    if (!groupedCols[queryName]) {
      groupedCols[queryName] = [];
    }
    groupedCols[queryName].push(d);
  });

  // Format the keys for each query group
  const formattedKeys: string[][] = [];
  for (const queryName in groupedCols) {
    const group = groupedCols[queryName];
    const groupKeys = formatKeys(group, inputSettings, idxs);
    formattedKeys.push(groupKeys);
  }
  // Combine the formatted keys from all groups
  const combinedKeys: string[] = [];
  const n_keys: number = idxs.length;
  for (let i = 0; i < n_keys; i++) {
    const keyParts = formattedKeys.map(keys => keys[i]).filter(k => k !== null && k !== undefined);
    combinedKeys.push(keyParts.length > 0 ? keyParts.join(" ") : null);
  }
  return combinedKeys;
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
  if (name === "groupings" || name === "labels") {
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
