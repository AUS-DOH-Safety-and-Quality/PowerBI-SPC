import { isNullOrUndefined } from "powerbi-visuals-core/data";
import type powerbi from "powerbi-visuals-api";
import type { settingsValueType } from "../settings";
import { formatPrimitiveValue } from "powerbi-visuals-core/powerbi";
import dateSettingsToFormatOptions from "./dateSettingsToFormatOptions";
import parseInputDates from "./parseInputDates";
import formatDateParts from "./formatDateParts";

function formatKeys(col: powerbi.DataViewCategoryColumn[], inputSettings: settingsValueType, idxs: number[]): (string | undefined)[] {
  const n_keys: number = idxs.length;
  let ret = new Array<string | undefined>(n_keys);
  if (col.length === 1 && !(col[0].source.type?.temporal)) {
    for (let i = 0; i < n_keys; i++) {
      ret[i] = formatPrimitiveValue(col[0].values[idxs[i]]);
    }
    return ret;
  }
  const delim: string = inputSettings.dates.date_format_delim;
  // Only an all-temporal (date hierarchy) key is formatted as a date; mixed columns are joined as-is
  let allTemporal = true;
  for (let i = 0; i < col.length; i++) {
    if (!col[i].source.type?.temporal) {
      allTemporal = false;
    }
  }
  if (!allTemporal) {
    const blankKey = delim.repeat(col.length - 1);
    for (let i = 0; i < n_keys; i++) {
      let key = "";
      for (let j = 0; j < col.length; j++) {
        if (j > 0) {
          key += delim;
        }
        key += formatPrimitiveValue(col[j].values[idxs[i]]) ?? "";
      }
      ret[i] = key === blankKey ? undefined : key;
    }
    return ret;
  }
  const inputDates = parseInputDates(col, idxs);
  const formatOptions = dateSettingsToFormatOptions(inputSettings.dates);
  const locale = inputSettings.dates.date_format_locale;
  const day_elem = locale === "en-GB" ? "day" : "month";
  const month_elem = locale === "en-GB" ? "month" : "day";

  for (let i = 0; i < n_keys; i++) {
    if (isNullOrUndefined(inputDates.dates[i])) {
      ret[i] = undefined
    } else {
      const datePartsRecord = formatDateParts(inputDates.dates[i], locale, formatOptions);
      const datePartStrings: string[] = [datePartsRecord.weekday + " " + datePartsRecord[day_elem],
                                          datePartsRecord[month_elem],
                                          inputDates.quarters[i] ?? "",
                                          datePartsRecord.year];
      let key = "";
      let partCount = 0;
      for (let j = 0; j < datePartStrings.length; j++) {
        if (!datePartStrings[j].trim()) {
          continue;
        }
        if (partCount++ > 0) {
          key += delim;
        }
        key += datePartStrings[j];
      }
      ret[i] = key;
    }
  }
  return ret
}

export default function extractKeys(col: powerbi.DataViewCategoryColumn[], inputSettings: settingsValueType, idxs: number[]): (string | undefined)[] {
  const groupedCols: Record<string, powerbi.DataViewCategoryColumn[]> = Object.create(null);
  const uniqueQueryNames = new Set<string>();
  for (let i = 0; i < col.length; i++) {
    let queryName = col[i].source.queryName ?? "";
    if (uniqueQueryNames.has(queryName)) {
      queryName = `${i}_${queryName}`;
    }
    uniqueQueryNames.add(queryName);
    if (queryName.includes("Date Hierarchy")) {
      const lastDot = queryName.lastIndexOf(".");
      if (lastDot !== -1) {
        queryName = queryName.substring(0, lastDot);
      }
    }
    (groupedCols[queryName] ??= []).push(col[i]);
  }
  const queryNames = Object.keys(groupedCols);
  const combinedKeys = new Array<string | undefined>(idxs.length);
  if (queryNames.length === 0) {
    return combinedKeys.fill(undefined);
  }
  for (let i = 0; i < queryNames.length; i++) {
    const groupKeys = formatKeys(groupedCols[queryNames[i]], inputSettings, idxs);
    for (let j = 0; j < idxs.length; j++) {
      const key = groupKeys[j];
      if (i === 0 || combinedKeys[j] === undefined) {
        combinedKeys[j] = key;
      } else if (key !== undefined) {
        combinedKeys[j] += ` ${key}`;
      }
    }
  }
  return combinedKeys;
}
