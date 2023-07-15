import powerbi from "powerbi-visuals-api";
import DataViewPropertyValue = powerbi.DataViewPropertyValue
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import VisualEnumerationInstanceKinds = powerbi.VisualEnumerationInstanceKinds;
import { dataViewWildcard } from "powerbi-visuals-utils-dataviewutils";
import extractSetting from "../Functions/extractSetting";
import extractConditionalFormatting from "../Functions/extractConditionalFormatting";
import defaultSettings from "./defaultSettings"
import { defaultSettingsType } from "./defaultSettings";

class settingsPair<T> {
  default: T;
  value: T;

  constructor(initialValue?: T) {
    this.default = initialValue;
    this.value = initialValue;
  }
}

type SettingsPromoteTypedT = {
  [K in keyof defaultSettingsType]: {
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
class settingsObject {
  settings: SettingsPromoteTypedT;

  public get canvas() { return this.settings.canvas; }
  public set canvas(canvasIn) { this.settings.canvas = canvasIn; }

  public get spc() { return this.settings.spc; }
  public set spc(spcIn) { this.settings.spc = spcIn; }

  public get outliers() { return this.settings.outliers; }
  public set outliers(outliersIn) { this.settings.outliers = outliersIn; }

  public get nhs_icons() { return this.settings.nhs_icons; }
  public set nhs_icons(nhs_iconsIn) { this.settings.nhs_icons = nhs_iconsIn; }

  public get scatter() { return this.settings.scatter; }
  public set scatter(scatterIn) { this.settings.scatter = scatterIn; }

  public get lines() { return this.settings.lines; }
  public set lines(linesIn) { this.settings.lines = linesIn; }

  public get x_axis() { return this.settings.x_axis; }
  public set x_axis(x_axisIn) { this.settings.x_axis = x_axisIn; }

  public get y_axis() { return this.settings.y_axis; }
  public set y_axis(y_axisIn) { this.settings.y_axis = y_axisIn; }

  public get dates() { return this.settings.dates; }
  public set dates(datesIn) { this.settings.dates = datesIn; }

  /**
   * Function to read the values from the settings pane and update the
   * values stored in the class.
   *
   * @param inputObjects
   */
  update(inputView: powerbi.DataView): void {
    const inputObjects: powerbi.DataViewObjects = inputView.metadata.objects;
    // Get the names of all classes in settingsObject which have values to be updated
    const allSettingGroups: settingsKeyT[] = Object.getOwnPropertyNames(this) as settingsKeyT[];

    allSettingGroups.forEach(settingGroup => {
      const condFormatting: defaultSettingsType[keyof defaultSettingsType] = inputView.categorical.categories
                            ? extractConditionalFormatting(inputView.categorical, settingGroup, this)[0]
                            : null;
      // Get the names of all settings in a given class and
      // use those to extract and update the relevant values
      const settingNames: string[] = Object.getOwnPropertyNames(this[settingGroup]) as string[];
      settingNames.forEach(settingName => {
        (this[settingGroup] as nestedSettingsT)[settingName].value
          = condFormatting ? condFormatting[settingName as keyof defaultSettingsType[keyof defaultSettingsType]]
                            : extractSetting(inputObjects, settingGroup, settingName,
                                              (this[settingGroup] as nestedSettingsT)[settingName].default)
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
  createSettingsEntry(settingGroupNameString: string): VisualObjectInstanceEnumeration {
    const settingGroupName: settingsKeyT = settingGroupNameString as settingsKeyT;
    const settingNames: string[] = Object.getOwnPropertyNames(this[settingGroupName]);
    const properties: Record<string, DataViewPropertyValue> = Object.fromEntries(
      settingNames.map(settingName => {
        const settingValue: DataViewPropertyValue = (this[settingGroupName] as nestedSettingsT)[settingName].value
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
    let allEntries = (Object.keys(defaultSettings) as (keyof typeof defaultSettings)[]).map(key => {
      type currGroupType = typeof this.settings[typeof key];
      let nestPromoteEntries = Object.entries(defaultSettings[key]).map((entry: [string, string | number | boolean]) => {
        return [entry[0], new settingsPair(entry[1])];
      });
      let obj: currGroupType = Object.fromEntries(nestPromoteEntries);
      return [key, obj];
    });

    this.settings = Object.fromEntries(allEntries) as SettingsPromoteTypedT;
  }
}

export { SettingsPromoteTypedT, settingsKeyT, nestedSettingsT }
export default settingsObject;
