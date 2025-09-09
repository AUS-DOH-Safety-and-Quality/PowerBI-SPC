import powerbi from "powerbi-visuals-api"
import { valueType } from "powerbi-visuals-utils-typeutils";
import isNullOrUndefined from "./isNullOrUndefined";
type ValueType = valueType.ValueType;

const monthNameToNumber: { [key: string]: number } = {
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


function temporalTypeToKey(inputType: powerbi.ValueTypeDescriptor, inputValue: powerbi.PrimitiveValue) {
  const temporalType: ValueType = valueType.ValueType.fromExtendedType(inputType['underlyingType'])
  if (temporalType.temporal.day) {
    return ["day", <number>(inputValue)]
  } else if (temporalType.temporal.month) {
    return ["month", monthNameToNumber[<string>(inputValue)]]
  } else if (temporalType.temporal.quarter) {
    return ["quarter", <string>inputValue]
  } else if (temporalType.temporal.year) {
    return ["year", <number>(inputValue)]
  } else {
    return null
  }
}

type datePartsType = {
  day?: number,
  month?: number,
  quarter?: string,
  year?: number
}

export default function parseInputDates(inputs: powerbi.DataViewCategoryColumn[], idxs: number[]) {
  const n_keys: number = idxs.length;
  let inputDates: Date[] = [];
  const inputQuarters: string[] = [];
  // If a 'Date Hierarchy' type is passed then there will be multiple 'key" entries
  if (inputs.length > 1) {
    for (let i = 0; i < n_keys; i++) {
      const datePartsArray: (string | number)[][] = [];
      for (let j = 0; j < inputs.length; j++) {
        datePartsArray.push(temporalTypeToKey(inputs[j].source.type, inputs[j].values[idxs[i]]));
      }
      const datePartsObj: datePartsType = Object.fromEntries(datePartsArray);
      if (datePartsObj?.quarter) {
        inputQuarters.push(datePartsObj.quarter)
      }
      inputDates[i] = new Date(datePartsObj?.year ?? 1970, datePartsObj?.month ?? 0, datePartsObj?.day ?? 1)
    }
  } else {
    for (let i = 0; i < n_keys; i++) {
      inputDates[i] = isNullOrUndefined(inputs?.[0]?.values[idxs[i]]) ? null : new Date(<Date>(inputs?.[0]?.values[idxs[i]]))
    }
  }
  return { dates: inputDates, quarters: inputQuarters }
}
