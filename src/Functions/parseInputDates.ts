import type powerbi from "powerbi-visuals-api"
import isNullOrUndefined from "./isNullOrUndefined";

const monthNameToNumber: Record<string, number> = {
  "January": 0,
  "February": 1,
  "March": 2,
  "April": 3,
  "May": 4,
  "June": 5,
  "July": 6,
  "August": 7,
  "September": 8,
  "October": 9,
  "November": 10,
  "December": 11
};


function temporalTypeToKey(inputType: { temporal?: boolean, category?: string}, inputValue: powerbi.PrimitiveValue) {
  if (!inputType.temporal) {
    return [];
  }

  if (inputType?.["category"] === "DayOfMonth") {
    return ["day", (inputValue as number)]
  } else if (inputType?.["category"] === "Months") {
    return ["month", monthNameToNumber[(inputValue as string)]]
  } else if (inputType?.["category"] === "Quarters") {
    return ["quarter", (inputValue as string)]
  } else if (inputType?.["category"] === "Years") {
    return ["year", (inputValue as number)]
  } else {
    return []
  }
}

interface datePartsType {
  day?: number,
  month?: number,
  quarter?: string,
  year?: number
}

export default function parseInputDates(inputs: powerbi.DataViewCategoryColumn[], idxs: number[]) {
  const n_keys: number = idxs.length;
  const inputDates: (Date | undefined)[] = [];
  const inputQuarters: string[] = [];
  // If a 'Date Hierarchy' type is passed then there will be multiple 'key" entries
  if (inputs.length > 1) {
    for (let i = 0; i < n_keys; i++) {
      const datePartsArray: (string | number)[][] = [];
      for (let j = 0; j < inputs.length; j++) {
        datePartsArray.push(temporalTypeToKey(inputs[j].source.type! as unknown as { temporal?: boolean, category?: string}, inputs[j].values[idxs[i]]));
      }
      const datePartsObj: datePartsType = Object.fromEntries(datePartsArray);
      if (datePartsObj?.quarter) {
        inputQuarters.push(datePartsObj.quarter)
      }
      inputDates[i] = new Date(datePartsObj?.year ?? 1970, datePartsObj?.month ?? 0, datePartsObj?.day ?? 1)
    }
  } else {
    for (let i = 0; i < n_keys; i++) {
      inputDates[i] = isNullOrUndefined(inputs?.[0]?.values[idxs[i]]) ? undefined : new Date((inputs?.[0]?.values[idxs[i]] as Date))
    }
  }
  return { dates: inputDates, quarters: inputQuarters }
}
