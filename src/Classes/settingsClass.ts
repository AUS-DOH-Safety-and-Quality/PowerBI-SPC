import powerbi from "powerbi-visuals-api";
import DataViewPropertyValue = powerbi.DataViewPropertyValue
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import VisualEnumerationInstanceKinds = powerbi.VisualEnumerationInstanceKinds;
import { dataViewWildcard } from "powerbi-visuals-utils-dataviewutils";
import extractSetting from "../Functions/extractSetting";
import extractConditionalFormatting from "../Functions/extractConditionalFormatting";
import defaultSettings from "../defaultSettings"
import { defaultSettingsType, defaultSettingsKey } from "../defaultSettings";

/**
 * This is the core class which controls the initialisation and
 * updating of user-settings. Each member is its own class defining
 * the types and default values for a given group of settings.
 *
 * These are defined in the settingsGroups.ts file
 */
export default class settingsClass implements defaultSettingsType {
  canvas: defaultSettingsType["canvas"];
  spc: defaultSettingsType["spc"];
  outliers: defaultSettingsType["outliers"];
  nhs_icons: defaultSettingsType["nhs_icons"];
  scatter: defaultSettingsType["scatter"];
  lines: defaultSettingsType["lines"];
  x_axis: defaultSettingsType["x_axis"];
  y_axis: defaultSettingsType["y_axis"];
  dates: defaultSettingsType["dates"];

  /**
   * Function to read the values from the settings pane and update the
   * values stored in the class.
   *
   * @param inputObjects
   */
  update(inputView: powerbi.DataView): void {
    const inputObjects: powerbi.DataViewObjects = inputView.metadata.objects;
    // Get the names of all classes in settingsObject which have values to be updated
    const allSettingGroups: string[] = Object.getOwnPropertyNames(this);

    allSettingGroups.forEach(settingGroup => {
      const categoricalView: powerbi.DataViewCategorical = inputView.categorical ? inputView.categorical : null;
      const condFormatting: defaultSettingsType[defaultSettingsKey] = extractConditionalFormatting(categoricalView, settingGroup, this)[0];
      // Get the names of all settings in a given class and
      // use those to extract and update the relevant values
      const settingNames: string[] = Object.getOwnPropertyNames(this[settingGroup]);
      settingNames.forEach(settingName => {
        this[settingGroup][settingName]
          = condFormatting ? condFormatting[settingName]
                            : extractSetting(inputObjects, settingGroup, settingName,
                                              defaultSettings[settingGroup][settingName])
      })
    })
  }

  /**
   * Function to extract all values for a given settings group, which are then
   * rendered to the Settings pane in PowerBI
   *
   * @param settingGroupName
   * @param inputData
   * @returns An object where each element is the value for a given setting in the named group
   */
  createSettingsEntry(settingGroupName: string): VisualObjectInstanceEnumeration {
    const settingNames: string[] = Object.getOwnPropertyNames(this[settingGroupName]);
    const properties: Record<string, DataViewPropertyValue> = Object.fromEntries(
      settingNames.map(settingName => {
        const settingValue: DataViewPropertyValue = this[settingGroupName][settingName]
        return [settingName, settingValue]
      })
    )
    return [{
      objectName: settingGroupName,
      properties: properties,
      propertyInstanceKind: Object.fromEntries(settingNames.map(setting => [setting, VisualEnumerationInstanceKinds.ConstantOrRule])),
      selector: dataViewWildcard.createDataViewWildcardSelector(dataViewWildcard.DataViewWildcardMatchingOption.InstancesAndTotals)
    }];
  }

  constructor() {
    Object.keys(defaultSettings).forEach(key => {
      this[key] = {};
      Object.assign(this[key], defaultSettings[key]);
    });
  }
}
