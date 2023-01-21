import dateFormat from "../Classes/dateFormat";
import broadcast_binary from "./BinaryFunctions"

//Function to handle string-to-date conversions with JS's weird conventions
function stringToDMY_impl(input_datestring: string, date_format: dateFormat): string {
  let step1: Date = new Date(input_datestring);
  let step2: Date = new Date(step1.getTime() + Math.abs(step1.getTimezoneOffset() * 60000));

  return step2.toLocaleDateString(date_format.locale, date_format.options)
              .replace(/(\/|(\s|,\s))/gi, date_format.delimiter);
}

const stringToDMY = broadcast_binary(stringToDMY_impl)

export default stringToDMY;
