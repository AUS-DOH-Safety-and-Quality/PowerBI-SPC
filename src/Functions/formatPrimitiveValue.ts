import type powerbi from "powerbi-visuals-api"
import type { defaultSettingsType } from "../Classes/settingsClass"
import broadcastBinary from "./broadcastBinary"
import isNullOrUndefined from "./isNullOrUndefined"
type PrimitiveValue = powerbi.PrimitiveValue
type ValueTypeDescriptor = powerbi.ValueTypeDescriptor

const formatPrimitiveValue = broadcastBinary((rawValue: PrimitiveValue,
                                              config: { valueType: ValueTypeDescriptor,
                                                        dateSettings: defaultSettingsType["dates"]}): string => {
  if (isNullOrUndefined(rawValue)) {
    return null;
  }

  if (config.valueType.numeric) {
    return (<number>rawValue).toString()
  } else {
    return <string>rawValue
  }
})

export default formatPrimitiveValue;
