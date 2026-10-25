import { at } from "powerbi-visuals-core/util";
import { isNullOrUndefined } from "powerbi-visuals-core/data";
import type powerbi from "powerbi-visuals-api"

const monthNameToNumber: Readonly<Record<string, number>> = {
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

/** Power BI's runtime value types also carry the hierarchy level's category, which the api's descriptor omits */
type datePartType = { readonly temporal?: unknown; readonly category?: string };

function readDatePart(parts: datePartsType, inputType: datePartType | undefined, inputValue: powerbi.PrimitiveValue | undefined): void {
  if (inputType?.temporal == null || isNullOrUndefined(inputValue)) {
    return;
  }
  if (inputType.category === "DayOfMonth") {
    parts.day = inputValue as number;
  } else if (inputType.category === "Months") {
    const month = monthNameToNumber[inputValue as string];
    if (month !== undefined) {
      parts.month = month;
    }
  } else if (inputType.category === "Quarters") {
    parts.quarter = inputValue as string;
  } else if (inputType.category === "Years") {
    parts.year = inputValue as number;
  }
}

/** A date-only string is a local date; a UTC parse would shift it a day west of Greenwich */
function parseDate(value: powerbi.PrimitiveValue): Date {
  const parts = typeof value === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  if (parts !== null) {
    return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
  }
  return new Date((value as Date));
}

/** A hierarchy level names the part it holds; a whole date does not */
function isDatePart(input: powerbi.DataViewCategoryColumn): boolean {
  const type: datePartType | undefined = input.source.type;
  return type?.category !== undefined;
}

/** The parts a row's key gave; the date fills in the others only so that it can be formatted */
export type DatePartsPresent = { readonly day: boolean; readonly month: boolean; readonly year: boolean };

const allParts: DatePartsPresent = { day: true, month: true, year: true };

export default function parseInputDates(inputs: readonly powerbi.DataViewCategoryColumn[], idxs: readonly number[]): { dates: (Date | undefined)[]; quarters: (string | undefined)[]; present: DatePartsPresent[] } {
  const n_keys: number = idxs.length;
  const inputDates: (Date | undefined)[] = [];
  const inputQuarters: (string | undefined)[] = new Array<string | undefined>(n_keys);
  const present = new Array<DatePartsPresent>(n_keys);
  // A date hierarchy gives one key column per level, however many levels are shown
  if (inputs.length > 1 || isDatePart(at(inputs, 0))) {
    for (let i = 0; i < n_keys; i++) {
      const row = at(idxs, i);
      const datePartsObj: datePartsType = {};
      for (let j = 0; j < inputs.length; j++) {
        const input = at(inputs, j);
        readDatePart(datePartsObj, input.source.type, input.values[row]);
      }
      inputQuarters[i] = datePartsObj.quarter;
      const partsPresent: DatePartsPresent = { day: datePartsObj.day !== undefined, month: datePartsObj.month !== undefined, year: datePartsObj.year !== undefined };
      present[i] = partsPresent;
      const anyPart = partsPresent.day || partsPresent.month || partsPresent.year || datePartsObj.quarter !== undefined;
      inputDates[i] = anyPart ? new Date(datePartsObj.year ?? 1970, datePartsObj.month ?? 0, datePartsObj.day ?? 1) : undefined;
    }
  } else {
    const input = at(inputs, 0);
    for (let i = 0; i < n_keys; i++) {
      const value = input.values[at(idxs, i)];
      inputDates[i] = isNullOrUndefined(value) ? undefined : parseDate(value)
      present[i] = allParts;
    }
  }
  return { dates: inputDates, quarters: inputQuarters, present }
}
