import dateFormat from "../Classes/dateFormat";
import broadcast_binary from "./BinaryFunctions"

function dateToFormattedString_impl(input_date: Date, date_format: dateFormat): string {
  return input_date.toLocaleDateString(date_format.locale, date_format.options)
              .replace(/(\/|(\s|,\s))/gi, date_format.delimiter);
}

const dateToFormattedString = broadcast_binary(dateToFormattedString_impl)

export default dateToFormattedString;
