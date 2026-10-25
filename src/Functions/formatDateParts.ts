import { at } from "powerbi-visuals-core/util";
/** Subset of Intl.DateTimeFormatOptions. */
export type DateFormatOptions = {
  readonly weekday?: "short" | "long" | undefined;
  readonly day?: "2-digit" | undefined;
  readonly month?: "2-digit" | "short" | "long" | undefined;
  readonly year?: "numeric" | "2-digit" | undefined;
}

/** Formatted date parts; unrequested parts are empty strings. */
export type DatePartsRecord = {
  weekday: string;
  day: string;
  month: string;
  year: string;
}

const weekdayShort: readonly string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const weekdayLong: readonly string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const monthShort: readonly string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const monthLong: readonly string[] = ["January", "February", "March", "April", "May", "June",
                                      "July", "August", "September", "October", "November", "December"];

/**
 * Stands in for Intl.DateTimeFormat.formatToParts, which QuickJS lacks.
 * Unrequested parts are empty strings.
 */
export default function formatDateParts(
  date: Date,
  options: DateFormatOptions
): DatePartsRecord {
  const result: DatePartsRecord = {
    weekday: "",
    day: "",
    month: "",
    year: ""
  };

  if (options.weekday === "short") {
    result.weekday = at(weekdayShort, date.getDay());
  } else if (options.weekday === "long") {
    result.weekday = at(weekdayLong, date.getDay());
  }

  if (options.day === "2-digit") {
    result.day = String(date.getDate()).padStart(2, "0");
  }

  if (options.month === "2-digit") {
    result.month = String(date.getMonth() + 1).padStart(2, "0");
  } else if (options.month === "short") {
    result.month = at(monthShort, date.getMonth());
  } else if (options.month === "long") {
    result.month = at(monthLong, date.getMonth());
  }

  if (options.year === "numeric") {
    result.year = String(date.getFullYear());
  } else if (options.year === "2-digit") {
    result.year = String(date.getFullYear()).slice(-2);
  }

  return result;
}
