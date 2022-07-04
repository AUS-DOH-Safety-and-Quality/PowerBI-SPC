//Function to handle string-to-date conversions with JS's weird conventions
function stringToDMY(text: string) {
  let step1: Date = new Date(text);
  let step2: Date = new Date(step1.getTime() + Math.abs(step1.getTimezoneOffset() * 60000));

  return step2.getUTCDate() + "/" + (step2.getUTCMonth() + 1) + "/" + step2.getUTCFullYear()
}

export default stringToDMY;
