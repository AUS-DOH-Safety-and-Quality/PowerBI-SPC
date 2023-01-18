//Function to handle string-to-date conversions with JS's weird conventions
function stringToDMY(text: string, date_format: string): string {
  let step1: Date = new Date(text);
  let step2: Date = new Date(step1.getTime() + Math.abs(step1.getTimezoneOffset() * 60000));

  if (date_format === "DD/MM/YYYY") {
    return step2.getUTCDate() + "/" + (step2.getUTCMonth() + 1) + "/" + step2.getUTCFullYear();
  } else if (date_format === "MM/DD/YYYY") {
    return (step2.getUTCMonth() + 1) + "/" + step2.getUTCDate() + "/" + step2.getUTCFullYear();
  } else if (date_format === "MM/YYYY") {
    return (step2.getUTCMonth() + 1) + "/" + step2.getUTCFullYear();
  } else if (date_format === "YYYY") {
    return step2.getUTCFullYear().toString();
  }
}

export default stringToDMY;
