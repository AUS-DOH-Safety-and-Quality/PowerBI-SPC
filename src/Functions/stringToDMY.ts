//Function to handle string-to-date conversions with JS's weird conventions
function stringToDMY(text: string, date_format: string): string {
  let step1: Date = new Date(text);
  let step2: Date = new Date(step1.getTime() + Math.abs(step1.getTimezoneOffset() * 60000));
  let DD: string = step2.getUTCDate().toString().padStart(2, "0");
  let MM: string = (step2.getUTCMonth() + 1).toString().padStart(2, "0");
  let YYYY: string = step2.getUTCFullYear().toString();

  if (date_format === "DD/MM/YYYY") {
    return DD + "/" + MM + "/" + YYYY;
  } else if (date_format === "MM/DD/YYYY") {
    return MM + "/" + DD + "/" + YYYY;
  } else if (date_format === "MM/YYYY") {
    return MM + "/" + YYYY;
  } else if (date_format === "YYYY") {
    return YYYY;
  }
}

export default stringToDMY;
