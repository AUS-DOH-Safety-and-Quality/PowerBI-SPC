import type { defaultSettingsType } from "../Classes"
import { broadcastBinary } from "../Functions"


// Mapping from the Visual settings options to the required option for the dateFormat function
const weekdayDateMap: Record<string, "long" | "short"> = {
  "Thurs DD" : "short",
  "Thursday DD" : "long"
}

const monthDateMap: Record<string, "2-digit" | "short" | "long"> = {
  "MM" : "2-digit",
  "Mon" : "short",
  "Month" : "long"
}

const yearDateMap: Record<string, "numeric" | "2-digit"> = {
  "YYYY" : "numeric",
  "YY" : "2-digit"
}

const dateToFormattedString = broadcastBinary(
  (input_date: Date, date_settings: defaultSettingsType["dates"]): string => {
    if (input_date === null) {
      return null;
    }
    if (typeof input_date === "string") {
      input_date = new Date(input_date)
    }

    const inpLocale: string = date_settings.date_format_locale;
    const inpDay: string = date_settings.date_format_day;
    const inpMonth: string = date_settings.date_format_month;
    const inpYear: string = date_settings.date_format_year;
    const inpDelim: string = date_settings.date_format_delim;
    const inpHideDay : boolean = inpDay === "DoNotShowDay"


    const formatOptions: Intl.DateTimeFormatOptions = {
      ...(inpHideDay ?  {} : {day: "2-digit"}), 
      month: monthDateMap[inpMonth],
      year: yearDateMap[inpYear]
    };

    const formattedDateString: string = input_date.toLocaleDateString(inpLocale, formatOptions)
                                                  .replace(/(\/|(\s|,\s))/gi, inpDelim);
    if ( inpDay == "DD" || inpHideDay ) {
      return formattedDateString;
    } else  {
      const weekdayName: string = input_date.toLocaleDateString(inpLocale, {weekday : weekdayDateMap[inpDay]})
      return weekdayName + " " + formattedDateString;
    } 
  }
);

export default dateToFormattedString;
