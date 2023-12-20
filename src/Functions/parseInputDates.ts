import powerbi from "powerbi-visuals-api"
import { valueType } from "powerbi-visuals-utils-typeutils";
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

export default function parseInputDates(inputs: powerbi.DataViewCategoryColumn[]) {
  let inputDates: Date[];
  const inputQuarters: string[] = new Array<string>();
  // If a 'Date Hierarchy' type is passed then there will be multiple 'key" entries
  if (inputs.length > 1) {
    inputDates = inputs[0].values.map((_, idx) => {
      const datePartsArray: (string | number)[][] = [];
      for (let i = 0; i < inputs.length; i++) {
        datePartsArray.push(temporalTypeToKey(inputs[i].source.type, inputs[i].values[idx]));
      }
      const datePartsObj: datePartsType = Object.fromEntries(datePartsArray);
      if (datePartsObj?.quarter) {
        inputQuarters.push(datePartsObj.quarter)
      }
      return new Date(datePartsObj?.year ?? 1970, datePartsObj?.month ?? 0, datePartsObj?.day ?? 1)
    });
  } else {
    inputDates = <Date[]>inputs?.[0]?.values
  }
  return { dates: inputDates, quarters: inputQuarters }
}
