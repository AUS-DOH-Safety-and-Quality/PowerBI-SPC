import { isNullOrUndefined } from "powerbi-visuals-core/data";
import type powerbi from "powerbi-visuals-api"

const monthNameToNumber: { readonly [key: string]: number } = {
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


type datePartsType = {
  day?: number,
  month?: number,
  quarter?: string,
  year?: number
}

function readDatePart(parts: datePartsType, inputType: { readonly temporal?: boolean, readonly category?: string },
                      inputValue: powerbi.PrimitiveValue): void {
  if (!inputType.temporal) {
    return;
  }
  if (inputType.category === "DayOfMonth") {
    parts.day = <number>(inputValue);
  } else if (inputType.category === "Months") {
    parts.month = monthNameToNumber[<string>(inputValue)];
  } else if (inputType.category === "Quarters") {
    parts.quarter = <string>inputValue;
  } else if (inputType.category === "Years") {
    parts.year = <number>(inputValue);
  }
}

export default function parseInputDates(inputs: readonly powerbi.DataViewCategoryColumn[], idxs: readonly number[]) {
  const n_keys: number = idxs.length;
  let inputDates: (Date | undefined)[] = [];
  const inputQuarters: string[] = [];
  // If a 'Date Hierarchy' type is passed then there will be multiple 'key" entries
  if (inputs.length > 1) {
    for (let i = 0; i < n_keys; i++) {
      const datePartsObj: datePartsType = {};
      for (let j = 0; j < inputs.length; j++) {
        readDatePart(datePartsObj, inputs[j].source.type! as unknown as { temporal?: boolean, category?: string}, inputs[j].values[idxs[i]]);
      }
      if (datePartsObj.quarter) {
        inputQuarters.push(datePartsObj.quarter)
      }
      inputDates[i] = new Date(datePartsObj.year ?? 1970, datePartsObj.month ?? 0, datePartsObj.day ?? 1)
    }
  } else {
    for (let i = 0; i < n_keys; i++) {
      const value = inputs[0].values[idxs[i]];
      inputDates[i] = isNullOrUndefined(value) ? undefined : new Date(<Date>value)
    }
  }
  return { dates: inputDates, quarters: inputQuarters }
}
