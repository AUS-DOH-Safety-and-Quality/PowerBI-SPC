import powerbi from "powerbi-visuals-api";
import DataViewPropertyValue = powerbi.DataViewPropertyValue
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import VisualEnumerationInstanceKinds = powerbi.VisualEnumerationInstanceKinds;
import { dataViewWildcard } from "powerbi-visuals-utils-dataviewutils";
import extractSetting from "../Functions/extractSetting";
import extractConditionalFormatting from "../Functions/extractConditionalFormatting";
import defaultSettings from "./defaultSettings"
import { defaultSettingsType, defaultSettingsKey } from "./defaultSettings";

class settingsPair<T> {
  default: T;
  value: T;

  constructor(initialValue?: T) {
    this.default = initialValue;
    this.value = initialValue;
  }
}

type SettingsPromoteTypedT = {
  [K in defaultSettingsKey]: {
    [M in keyof defaultSettingsType[K]]: settingsPair<defaultSettingsType[K][M]>
  };
}
type settingsKeyT = keyof SettingsPromoteTypedT;
type nestedSettingsT = Record<string, settingsPair<string | number | boolean>>

/**
 * This is the core class which controls the initialisation and
 * updating of user-settings. Each member is its own class defining
 * the types and default values for a given group of settings.
 *
 * These are defined in the settingsGroups.ts file
 */
class settingsObject implements SettingsPromoteTypedT {
  [k: string]: any;
  canvas: SettingsPromoteTypedT["canvas"];
  spc: SettingsPromoteTypedT["spc"];
  outliers: SettingsPromoteTypedT["outliers"];
  nhs_icons: SettingsPromoteTypedT["nhs_icons"];
  scatter: SettingsPromoteTypedT["scatter"];
  lines: SettingsPromoteTypedT["lines"];
  x_axis: SettingsPromoteTypedT["x_axis"];
  y_axis: SettingsPromoteTypedT["y_axis"];
  dates: SettingsPromoteTypedT["dates"];

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
      const condFormatting: defaultSettingsType[defaultSettingsKey] = inputView.categorical.categories
                            ? extractConditionalFormatting(inputView.categorical, settingGroup, this)[0]
                            : null;
      // Get the names of all settings in a given class and
      // use those to extract and update the relevant values
      const settingNames: string[] = Object.getOwnPropertyNames(this[settingGroup]);
      settingNames.forEach(settingName => {
        this[settingGroup][settingName].value
          = condFormatting ? condFormatting[settingName as keyof defaultSettingsType[defaultSettingsKey]]
                            : extractSetting(inputObjects, settingGroup, settingName,
                                              this[settingGroup][settingName].default)
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
        const settingValue: DataViewPropertyValue = this[settingGroupName][settingName].value
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
    (Object.keys(defaultSettings) as (keyof typeof defaultSettings)[]).forEach(key => {
      type currGroupType = typeof this.settings[typeof key];
      let nestPromoteEntries = Object.entries(defaultSettings[key]).map((entry: [string, string | number | boolean]) => {
        return [entry[0], new settingsPair(entry[1])];
      });
      this[key] = Object.fromEntries(nestPromoteEntries);
    });
  }
}

export { SettingsPromoteTypedT, settingsKeyT, nestedSettingsT }
export default settingsObject;
