import { isNullOrUndefined } from "powerbi-visuals-core/data";

/** Subset of Intl.DateTimeFormatOptions. */
export interface DateFormatOptions {
  weekday?: "short" | "long";
  day?: "2-digit";
  month?: "2-digit" | "short" | "long";
  year?: "numeric" | "2-digit";
}

/** Formatted date parts; unrequested parts are empty strings. */
export interface DatePartsRecord {
  weekday: string;
  day: string;
  month: string;
  year: string;
}

const weekdayShort: Record<"en-GB" | "en-US", string[]> = {
  "en-GB": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  "en-US": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
};

const weekdayLong: Record<"en-GB" | "en-US", string[]> = {
  "en-GB": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  "en-US": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
};

const monthShort: Record<"en-GB" | "en-US", string[]> = {
  "en-GB": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  "en-US": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
};

const monthLong: Record<"en-GB" | "en-US", string[]> = {
  "en-GB": ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"],
  "en-US": ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"]
};

/**
 * Stands in for Intl.DateTimeFormat.formatToParts, which QuickJS lacks.
 * Unrequested parts are empty strings.
 */
export default function formatDateParts(
  date: Date | undefined,
  locale: "en-GB" | "en-US",
  options: DateFormatOptions
): DatePartsRecord {
  const result: DatePartsRecord = {
    weekday: "",
    day: "",
    month: "",
    year: ""
  };

  if (isNullOrUndefined(date)) {
    return result;
  }

  if (options.weekday === "short") {
    result.weekday = weekdayShort[locale][date.getDay()];
  } else if (options.weekday === "long") {
    result.weekday = weekdayLong[locale][date.getDay()];
  }

  if (options.day === "2-digit") {
    result.day = String(date.getDate()).padStart(2, "0");
  }

  if (options.month === "2-digit") {
    result.month = String(date.getMonth() + 1).padStart(2, "0");
  } else if (options.month === "short") {
    result.month = monthShort[locale][date.getMonth()];
  } else if (options.month === "long") {
    result.month = monthLong[locale][date.getMonth()];
  }

  if (options.year === "numeric") {
    result.year = String(date.getFullYear());
  } else if (options.year === "2-digit") {
    result.year = String(date.getFullYear()).slice(-2);
  }

  return result;
}
