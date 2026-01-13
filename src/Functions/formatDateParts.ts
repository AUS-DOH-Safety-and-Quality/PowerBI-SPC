/**
 * Date formatting module compatible with QuickJS (no Intl support)
 *
 * Provides locale-aware date formatting for en-GB and en-US locales only.
 * This module replaces Intl.DateTimeFormat.formatToParts() with a custom
 * implementation using native JavaScript Date methods.
 */

/**
 * Date format options matching a subset of Intl.DateTimeFormatOptions
 */
export interface DateFormatOptions {
  weekday?: "short" | "long";
  day?: "2-digit";
  month?: "2-digit" | "short" | "long";
  year?: "numeric" | "2-digit";
}

/**
 * Object containing formatted date component strings
 */
export interface DatePartsRecord {
  weekday: string;
  day: string;
  month: string;
  year: string;
}

/**
 * Weekday names in short format (3 letters)
 * Index corresponds to Date.getDay() return value (0 = Sunday)
 */
const weekdayShort: Record<"en-GB" | "en-US", string[]> = {
  "en-GB": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  "en-US": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
};

/**
 * Weekday names in long format (full name)
 * Index corresponds to Date.getDay() return value (0 = Sunday)
 */
const weekdayLong: Record<"en-GB" | "en-US", string[]> = {
  "en-GB": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  "en-US": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
};

/**
 * Month names in short format (3 letters)
 * Index corresponds to Date.getMonth() return value (0 = January)
 */
const monthShort: Record<"en-GB" | "en-US", string[]> = {
  "en-GB": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  "en-US": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
};

/**
 * Month names in long format (full name)
 * Index corresponds to Date.getMonth() return value (0 = January)
 */
const monthLong: Record<"en-GB" | "en-US", string[]> = {
  "en-GB": ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"],
  "en-US": ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"]
};

/**
 * Formats a Date object into individual components based on locale and format options.
 *
 * This function replaces Intl.DateTimeFormat.formatToParts() for QuickJS compatibility.
 * It uses native JavaScript Date methods and lookup tables to format date components
 * according to the specified locale and formatting options.
 *
 * @param date - The Date object to format
 * @param locale - The locale to use for formatting ("en-GB" or "en-US")
 * @param options - Formatting options specifying which components to include and how to format them
 * @returns Object containing formatted date component strings (empty string if not requested)
 *
 * @example
 * ```typescript
 * const date = new Date(2024, 0, 15); // January 15, 2024 (Monday)
 *
 * // Format with weekday and full date
 * formatDateParts(date, "en-GB", {
 *   weekday: "long",
 *   day: "2-digit",
 *   month: "long",
 *   year: "numeric"
 * });
 * // Returns: { weekday: "Monday", day: "15", month: "January", year: "2024" }
 *
 * // Format with short month and 2-digit year
 * formatDateParts(date, "en-US", {
 *   month: "short",
 *   day: "2-digit",
 *   year: "2-digit"
 * });
 * // Returns: { weekday: "", day: "15", month: "Jan", year: "24" }
 * ```
 */
export default function formatDateParts(
  date: Date,
  locale: "en-GB" | "en-US",
  options: DateFormatOptions
): DatePartsRecord {
  // Initialize all components as empty strings
  const result: DatePartsRecord = {
    weekday: "",
    day: "",
    month: "",
    year: ""
  };

  // Format weekday if requested
  if (options.weekday === "short") {
    result.weekday = weekdayShort[locale][date.getDay()];
  } else if (options.weekday === "long") {
    result.weekday = weekdayLong[locale][date.getDay()];
  }

  // Format day if requested (always 2-digit when present)
  if (options.day === "2-digit") {
    result.day = String(date.getDate()).padStart(2, "0");
  }

  // Format month based on requested format
  if (options.month === "2-digit") {
    // getMonth() returns 0-11, so add 1 for display
    result.month = String(date.getMonth() + 1).padStart(2, "0");
  } else if (options.month === "short") {
    result.month = monthShort[locale][date.getMonth()];
  } else if (options.month === "long") {
    result.month = monthLong[locale][date.getMonth()];
  }

  // Format year based on requested format
  if (options.year === "numeric") {
    result.year = String(date.getFullYear());
  } else if (options.year === "2-digit") {
    // Get last 2 digits of year
    result.year = String(date.getFullYear()).slice(-2);
  }

  return result;
}
