import dateFormat from "../Classes/dateFormat";
import broadcast_binary from "./BinaryFunctions"

//Function to handle string-to-date conversions with JS's weird conventions
function dateToStringFormat_impl(input_date: Date, date_format: dateFormat): string {
  return input_date.toLocaleDateString(date_format.locale, date_format.options)
              .replace(/(\/|(\s|,\s))/gi, date_format.delimiter);
}

const dateToStringFormat = broadcast_binary(dateToStringFormat_impl)

export default dateToStringFormat;
