import type { defaultSettingsType } from "../Classes/settingsClass"
import isNullOrUndefined from "./isNullOrUndefined"

/**
 * Mapping from user-friendly visual settings to Intl.DateTimeFormat weekday options.
 *
 * Maps PowerBI visual dropdown options to JavaScript Intl.DateTimeFormat API values:
 * - "DD" → null (no weekday, just day number)
 * - "Thurs DD" → "short" (abbreviated weekday name)
 * - "Thursday DD" → "long" (full weekday name)
 * - "(blank)" → null (omit day entirely)
 */
const weekdayDateMap: Record<string, "long" | "short"> = {
  "DD" : null,
  "Thurs DD" : "short",
  "Thursday DD" : "long",
  "(blank)" : null
}

/**
 * Mapping from user-friendly visual settings to Intl.DateTimeFormat month options.
 *
 * Maps PowerBI visual dropdown options to JavaScript Intl.DateTimeFormat API values:
 * - "MM" → "2-digit" (e.g., "01", "12")
 * - "Mon" → "short" (e.g., "Jan", "Dec")
 * - "Month" → "long" (e.g., "January", "December")
 * - "(blank)" → null (omit month entirely)
 */
const monthDateMap: Record<string, "2-digit" | "short" | "long"> = {
  "MM" : "2-digit",
  "Mon" : "short",
  "Month" : "long",
  "(blank)" : null
}

/**
 * Mapping from user-friendly visual settings to Intl.DateTimeFormat year options.
 *
 * Maps PowerBI visual dropdown options to JavaScript Intl.DateTimeFormat API values:
 * - "YYYY" → "numeric" (e.g., "2024")
 * - "YY" → "2-digit" (e.g., "24")
 * - "(blank)" → null (omit year entirely)
 */
const yearDateMap: Record<string, "numeric" | "2-digit"> = {
  "YYYY" : "numeric",
  "YY" : "2-digit",
  "(blank)" : null
}

/**
 * Mapping from user-friendly visual settings to Intl.DateTimeFormat day options.
 *
 * Maps PowerBI visual dropdown options to JavaScript Intl.DateTimeFormat API values.
 * All non-blank options produce "2-digit" day format (e.g., "01", "15", "31").
 */
const dayDateMap = {
  "DD" : "2-digit",
  "Thurs DD" : "2-digit",
  "Thursday DD" : "2-digit",
  "(blank)" : null
}

/**
 * Central lookup table mapping Intl.DateTimeFormat option names to their respective
 * setting-to-value translation maps.
 */
const dateOptionsLookup = {
  "weekday" : weekdayDateMap,
  "day" : dayDateMap,
  "month" : monthDateMap,
  "year" : yearDateMap
}

/**
 * Converts PowerBI SPC visual date settings into Intl.DateTimeFormatOptions format.
 *
 * This function transforms user-friendly date format settings from the PowerBI visual
 * (e.g., "MM", "YYYY", "Thursday DD") into the appropriate options object for JavaScript's
 * Intl.DateTimeFormat API, enabling locale-aware date formatting.
 *
 * Key behaviors:
 * - Filters out locale and delimiter settings (handled separately)
 * - Maps visual setting keys to Intl.DateTimeFormat option keys
 * - Translates visual setting values to valid Intl API values
 * - Automatically includes weekday format when day format includes weekday name
 * - Omits date components when set to "(blank)"
 *
 * @param date_settings - The date configuration from the visual's settings object
 * @returns Intl.DateTimeFormatOptions object suitable for use with new Intl.DateTimeFormat()
 *
 * @example
 * ```typescript
 * const settings = {
 *   date_format_day: "Thursday DD",
 *   date_format_month: "Month",
 *   date_format_year: "YYYY",
 *   date_format_delim: "/",
 *   date_format_locale: "en-GB"
 * };
 *
 * const options = dateSettingsToFormatOptions(settings);
 * // Returns: { weekday: "long", day: "2-digit", month: "long", year: "numeric" }
 *
 * const formatter = new Intl.DateTimeFormat("en-GB", options);
 * formatter.format(new Date("2024-01-15"));
 * // Output: "Monday, 15 January 2024"
 * ```
 */
export default function dateSettingsToFormatOptions(date_settings: defaultSettingsType["dates"]): Intl.DateTimeFormatOptions {
  // Array to collect [key, value] pairs for the options object
  const formatOpts: string[][] = new Array<string[]>();

  // Iterate through all date settings
  Object.keys(date_settings).forEach((key) => {
    // Skip locale and delimiter - these are handled separately by the formatter
    if (key !== "date_format_locale" && key !== "date_format_delim") {
      // Remove "date_format_" prefix to get the Intl option name (e.g., "day", "month", "year")
      const formattedKey = key.replace("date_format_", "");

      // Get the appropriate mapping for this date component
      const lookup = dateOptionsLookup[formattedKey];

      // Translate the visual setting value to the Intl API value
      const val = lookup[date_settings[key]];

      // Only include non-null values (null means "(blank)" was selected)
      if (!isNullOrUndefined(val)) {
        formatOpts.push([formattedKey, val])

        // Special case: when day format includes weekday name, also add weekday option
        // This handles "Thurs DD" and "Thursday DD" formats
        if (formattedKey === "day" && date_settings[key] !== "DD") {
          formatOpts.push(["weekday", weekdayDateMap[date_settings[key]]])
        }
      }
    }
  })

  // Convert array of [key, value] pairs to an object
  return Object.fromEntries(formatOpts);
}
