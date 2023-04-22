import powerbi from "powerbi-visuals-api"
import DataViewObjects = powerbi.DataViewObjects
import { dataViewObjects } from "powerbi-visuals-utils-dataviewutils";

function extractSetting(inputObjects: DataViewObjects,
                        settingsGroup: string,
                        settingName: string,
                        defaultValue?: string | number): string | number {
  if (settingName.includes("colour")) {
    return dataViewObjects.getFillColor(
      inputObjects, {
        objectName: settingsGroup,
        propertyName: settingName
      },
      defaultValue as string | undefined
    )
  } else {
    return dataViewObjects.getValue(
      inputObjects, {
        objectName: settingsGroup,
        propertyName: settingName
      },
      defaultValue
    )
  }
}

export default extractSetting
