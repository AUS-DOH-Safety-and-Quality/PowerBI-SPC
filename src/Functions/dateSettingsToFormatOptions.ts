import { isNullOrUndefined } from "powerbi-visuals-core/data";
import type { settingsValueType } from "../settings"
import type { DateFormatOptions } from "./formatDateParts"

const weekdayDateMap: Record<string, "long" | "short" | null> = {
  "DD" : null,
  "Thurs DD" : "short",
  "Thursday DD" : "long",
  "(blank)" : null
}

const monthDateMap: Record<string, "2-digit" | "short" | "long" | null> = {
  "MM" : "2-digit",
  "Mon" : "short",
  "Month" : "long",
  "(blank)" : null
}

const yearDateMap: Record<string, "numeric" | "2-digit" | null> = {
  "YYYY" : "numeric",
  "YY" : "2-digit",
  "(blank)" : null
}

const dayDateMap: Record<string, "2-digit" | null> = {
  "DD" : "2-digit",
  "Thurs DD" : "2-digit",
  "Thursday DD" : "2-digit",
  "(blank)" : null
}

const dateOptionsLookup = {
  "weekday" : weekdayDateMap,
  "day" : dayDateMap,
  "month" : monthDateMap,
  "year" : yearDateMap
}

/**
 * formatDateParts options from the visual's date settings; "(blank)" omits a part,
 * and "Thurs DD" / "Thursday DD" also request the weekday name.
 */
export default function dateSettingsToFormatOptions(date_settings: settingsValueType["dates"]): DateFormatOptions {
  const formatOpts: string[][] = new Array<string[]>();
  const keys = Object.keys(date_settings);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    // Locale and delimiter are applied by the caller
    if (key !== "date_format_locale" && key !== "date_format_delim") {
      const formattedKey = key.replace("date_format_", "");
      const lookup = dateOptionsLookup[formattedKey as keyof typeof dateOptionsLookup];
      const dateSettingValue = date_settings[key as keyof typeof date_settings];
      const val = lookup[dateSettingValue as keyof typeof lookup];
      if (!isNullOrUndefined(val)) {
        formatOpts.push([formattedKey, val])
        if (formattedKey === "day" && dateSettingValue !== "DD" && !isNullOrUndefined(weekdayDateMap[dateSettingValue])) {
          formatOpts.push(["weekday", weekdayDateMap[dateSettingValue]])
        }
      }
    }
  }
  return Object.fromEntries(formatOpts);
}
