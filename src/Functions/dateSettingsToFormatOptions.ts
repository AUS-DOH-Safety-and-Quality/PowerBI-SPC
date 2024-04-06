import type { defaultSettingsType } from "../Classes"
import isNullOrUndefined from "./isNullOrUndefined"

// Mapping from the Visual settings options to the required option for the dateFormat function
const weekdayDateMap: Record<string, "long" | "short"> = {
  "DD" : null,
  "Thurs DD" : "short",
  "Thursday DD" : "long",
  "(blank)" : null
}

const monthDateMap: Record<string, "2-digit" | "short" | "long"> = {
  "MM" : "2-digit",
  "Mon" : "short",
  "Month" : "long",
  "(blank)" : null
}

const yearDateMap: Record<string, "numeric" | "2-digit"> = {
  "YYYY" : "numeric",
  "YY" : "2-digit",
  "(blank)" : null
}

const dayDateMap = {
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

export default function dateSettingsToFormatOptions(date_settings: defaultSettingsType["dates"]): Intl.DateTimeFormatOptions {
  const formatOpts: string[][] = new Array<string[]>();
  Object.keys(date_settings).forEach((key) => {
    if (key !== "date_format_locale" && key !== "date_format_delim") {
      const formattedKey = key.replace("date_format_", "");
      const lookup = dateOptionsLookup[formattedKey];
      const val = lookup[date_settings[key]];
      if (!isNullOrUndefined(val)) {
        formatOpts.push([formattedKey, val])
        if (formattedKey === "day" && date_settings[key] !== "DD") {
          formatOpts.push(["weekday", weekdayDateMap[date_settings[key]]])
        }
      }
    }
  })
  return Object.fromEntries(formatOpts);
}
