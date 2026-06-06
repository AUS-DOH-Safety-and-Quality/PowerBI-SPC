import type powerbi from "powerbi-visuals-api"
import type { settingsValueType } from "../settings"
import isNullOrUndefined from "./isNullOrUndefined"
type PrimitiveValue = powerbi.PrimitiveValue
type ValueTypeDescriptor = powerbi.ValueTypeDescriptor

export default function formatPrimitiveValue(rawValue: PrimitiveValue,
                                              config: { valueType: ValueTypeDescriptor,
                                                        dateSettings: settingsValueType["dates"]}): string {
  if (isNullOrUndefined(rawValue)) {
    return "";
  }

  if (config.valueType.numeric) {
    return (rawValue as number).toString()
  } else {
    return rawValue as string
  }
}
