import { at } from "powerbi-visuals-core/util";
import { isNullOrUndefined } from "powerbi-visuals-core/data";
import type powerbi from "powerbi-visuals-api";
import type { settingsValueType } from "../settings";
import { formatPrimitiveValue } from "powerbi-visuals-core/powerbi";
import dateSettingsToFormatOptions from "./dateSettingsToFormatOptions";
import parseInputDates from "./parseInputDates";
import formatDateParts from "./formatDateParts";

function formatKeys(col: readonly powerbi.DataViewCategoryColumn[], inputSettings: settingsValueType, idxs: readonly number[]): (string | undefined)[] {
  const n_keys: number = idxs.length;
  const ret = new Array<string | undefined>(n_keys);
  const only = col.length === 1 ? at(col, 0) : undefined;
  if (only !== undefined && !only.source.type?.temporal) {
    for (let i = 0; i < n_keys; i++) {
      ret[i] = formatPrimitiveValue(only.values[at(idxs, i)]);
    }
    return ret;
  }
  const delim: string = inputSettings.dates.date_format_delim;
  // Only an all-temporal (date hierarchy) key is formatted as a date; mixed columns are joined as-is
  let allTemporal = true;
  for (let i = 0; i < col.length; i++) {
    if (!at(col, i).source.type?.temporal) {
      allTemporal = false;
    }
  }
  if (!allTemporal) {
    const blankKey = delim.repeat(col.length - 1);
    for (let i = 0; i < n_keys; i++) {
      const row = at(idxs, i);
      let key = "";
      for (let j = 0; j < col.length; j++) {
        if (j > 0) {
          key += delim;
        }
        key += formatPrimitiveValue(at(col, j).values[row]) ?? "";
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
    const date = inputDates.dates[i];
    if (isNullOrUndefined(date)) {
      ret[i] = undefined
    } else {
      const present = at(inputDates.present, i);
      // A weekday needs the whole date
      const datePartsRecord = formatDateParts(date, {
        weekday: present.day && present.month && present.year ? formatOptions.weekday : undefined,
        day: present.day ? formatOptions.day : undefined,
        month: present.month ? formatOptions.month : undefined,
        year: present.year ? formatOptions.year : undefined
      });
      const datePartStrings: string[] = [(datePartsRecord.weekday + " " + datePartsRecord[day_elem]).trim(),
                                          datePartsRecord[month_elem],
                                          inputDates.quarters[i] ?? "",
                                          datePartsRecord.year];
      let key = "";
      let partCount = 0;
      for (let j = 0; j < datePartStrings.length; j++) {
        const part = at(datePartStrings, j);
        if (!part.trim()) {
          continue;
        }
        if (partCount++ > 0) {
          key += delim;
        }
        key += part;
      }
      ret[i] = key;
    }
  }
  return ret
}

export default function extractKeys(col: readonly powerbi.DataViewCategoryColumn[], inputSettings: settingsValueType, idxs: readonly number[]): (string | undefined)[] {
  const groupedCols = Object.create(null) as Record<string, powerbi.DataViewCategoryColumn[]>;
  for (let i = 0; i < col.length; i++) {
    const column = at(col, i);
    let queryName = column.source.queryName ?? "";
    if (queryName.includes("Date Hierarchy")) {
      const lastDot = queryName.lastIndexOf(".");
      if (lastDot !== -1) {
        queryName = queryName.substring(0, lastDot);
      }
    }
    (groupedCols[queryName] ??= []).push(column);
  }
  const groups = Object.values(groupedCols);
  if (groups.length === 1) {
    return formatKeys(at(groups, 0), inputSettings, idxs);
  }
  const combinedKeys = new Array<string | undefined>(idxs.length);
  for (let i = 0; i < groups.length; i++) {
    const groupKeys = formatKeys(at(groups, i), inputSettings, idxs);
    for (let j = 0; j < idxs.length; j++) {
      const key = groupKeys[j];
      const combined = combinedKeys[j];
      if (i === 0 || combined === undefined) {
        combinedKeys[j] = key;
      } else if (key !== undefined) {
        combinedKeys[j] = `${combined} ${key}`;
      }
    }
  }
  return combinedKeys;
}
