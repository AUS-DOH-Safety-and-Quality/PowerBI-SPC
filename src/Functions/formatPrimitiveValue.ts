import type powerbi from "powerbi-visuals-api"
import dateToFormattedString from "./dateToFormattedString"
import { defaultSettingsType } from "../Classes"
import broadcastBinary from "./broadcastBinary"
type PrimitiveValue = powerbi.PrimitiveValue
type ValueTypeDescriptor = powerbi.ValueTypeDescriptor

const formatPrimitiveValue = broadcastBinary((rawValue: PrimitiveValue,
                                              config: { valueType: ValueTypeDescriptor,
                                                        dateSettings: defaultSettingsType["dates"]}): string => {
  if (rawValue === null || rawValue === undefined) {
    return "";
  }

  if (config.valueType.numeric) {
    return (<number>rawValue).toString()
  } else if (config.valueType.dateTime) {
    return dateToFormattedString(<Date>(rawValue), config.dateSettings)
  } else {
    return <string>rawValue
  }
})

export default formatPrimitiveValue;
