import { defaultSettingsType } from "../defaultSettings"
import broadcast_binary from "./BinaryFunctions"

type dateFormat = {
  locale: string,
  options?: Intl.DateTimeFormatOptions,
  delimiter?: string
}

let weekdayDateMap: Record<string, "long" | "short"> = {
  "DD" : "short",
  "Thurs DD" : "short",
  "Thursday DD" : "long"
}

let monthDateMap: Record<string, string>= {
  "MM" : "\"month\" : \"2-digit\"",
  "Mon" : "\"month\" : \"short\"",
  "Month" : "\"month\" : \"long\""
}

let yearDateMap: Record<string, string>= {
  "YYYY" : "\"year\" : \"numeric\"",
  "YY" : "\"year\" : \"2-digit\""
}

let delimDateMap: Record<string, string>= {
  "/" : "\"delimiter\": \"/\"",
  "-" : "\"delimiter\": \"-\"",
  " " : "\"delimiter\": \" \""
}

let localeDateMap: Record<string, string>= {
  "en-GB" : "\"locale\": \"en-GB\"",
  "en-US" : "\"locale\": \"en-US\""
}

function dateToFormattedString_impl(input_date: Date, date_settings: defaultSettingsType["dates"]): string {
  const inpLocale: string = date_settings.date_format_locale;
  const inpDay: string = date_settings.date_format_day;
  const inpMonth: string = date_settings.date_format_month;
  const inpYear: string = date_settings.date_format_year;
  const inpDelim: string = date_settings.date_format_delim;

  const formatString: string = `{ ${localeDateMap[inpLocale]}, \"options\": { \"day\" : \"2-digit\", ${monthDateMap[inpMonth]}, ${yearDateMap[inpYear]} }, ${delimDateMap[inpDelim]} }`;
  const date_format: dateFormat = JSON.parse(formatString);
  const formattedString: string = input_date.toLocaleDateString(date_format.locale, date_format.options)
                                            .replace(/(\/|(\s|,\s))/gi, date_format.delimiter);
  if (inpDay !== "DD") {
    const weekday: string = input_date.toLocaleDateString(date_format.locale, {weekday : weekdayDateMap[inpDay]})
    return weekday + " " + formattedString;
  } else {
    return formattedString;
  }
}

const dateToFormattedString = broadcast_binary(dateToFormattedString_impl)

export default dateToFormattedString;
