import dateFormat from "../Classes/dateFormat";

//Function to handle string-to-date conversions with JS's weird conventions
function stringToDMY(input_datestrings: string[], date_format: dateFormat): string[] {
  return input_datestrings.map(dateString => {
    let step1: Date = new Date(dateString);
    let step2: Date = new Date(step1.getTime() + Math.abs(step1.getTimezoneOffset() * 60000));

    return step2.toLocaleDateString(date_format.locale, date_format.options)
                .replace(/(\/|(\s|,\s))/gi, date_format.delimiter);
  })
}

export default stringToDMY;
