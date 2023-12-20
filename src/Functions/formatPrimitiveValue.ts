import type powerbi from "powerbi-visuals-api"
import { defaultSettingsType } from "../Classes"
import broadcastBinary from "./broadcastBinary"
type PrimitiveValue = powerbi.PrimitiveValue
type ValueTypeDescriptor = powerbi.ValueTypeDescriptor

const formatPrimitiveValue = broadcastBinary((rawValue: PrimitiveValue,
                                              config: { valueType: ValueTypeDescriptor,
                                                        dateSettings: defaultSettingsType["dates"]}): string => {
  if (rawValue === null || rawValue === undefined) {
    return null;
  }

  if (config.valueType.numeric) {
    return (<number>rawValue).toString()
  } else {
    return <string>rawValue
  }
})

export default formatPrimitiveValue;
