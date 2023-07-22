import powerbi from "powerbi-visuals-api";
import DataViewPropertyValue = powerbi.DataViewPropertyValue
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import VisualEnumerationInstanceKinds = powerbi.VisualEnumerationInstanceKinds;
import { dataViewWildcard } from "powerbi-visuals-utils-dataviewutils";
import extractSetting from "../Functions/extractSetting";
import extractConditionalFormatting from "../Functions/extractConditionalFormatting";
import defaultSettings from "../defaultSettings"
import { defaultSettingsType, defaultSettingsKey, settingsPaneGroupings } from "../defaultSettings";

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
  createSettingsEntry(settingGroupName: string): VisualObjectInstanceEnumerationObject {
    const settingNames: string[] = Object.getOwnPropertyNames(this[settingGroupName]);
    if (Object.keys(settingsPaneGroupings).includes(settingGroupName)) {
      let rtnInstances = new Array<powerbi.VisualObjectInstance>;
      let rtnContainers = new Array<powerbi.VisualObjectInstanceContainer>;
      let paneGroupNames: string[] = Object.keys(settingsPaneGroupings[settingGroupName]);
      paneGroupNames.forEach((paneGroup, idx) => {
        let props = Object.fromEntries(
          (settingsPaneGroupings[settingGroupName][paneGroup]).map(currSetting => {
          const settingValue: DataViewPropertyValue = this[settingGroupName][currSetting]
          return [currSetting, settingValue]
        }));
        rtnInstances.push({
          objectName: settingGroupName,
          containerIdx: idx,
          properties: props,
          propertyInstanceKind: Object.fromEntries(settingNames.map(setting => [setting, VisualEnumerationInstanceKinds.ConstantOrRule])),
          selector: dataViewWildcard.createDataViewWildcardSelector(dataViewWildcard.DataViewWildcardMatchingOption.InstancesAndTotals)
        })
        rtnContainers.push({
          displayName: paneGroupNames[idx]
        })
      })
      return {
        instances: rtnInstances,
        containers: rtnContainers
      };
    } else {
      const properties: Record<string, DataViewPropertyValue> = Object.fromEntries(
        settingNames.map(settingName => {
          const settingValue: DataViewPropertyValue = this[settingGroupName][settingName]
          return [settingName, settingValue]
        })
      )
      return {
        instances: [{
                      objectName: settingGroupName,
                      properties: properties,
                      propertyInstanceKind: Object.fromEntries(settingNames.map(setting => [setting, VisualEnumerationInstanceKinds.ConstantOrRule])),
                      selector: dataViewWildcard.createDataViewWildcardSelector(dataViewWildcard.DataViewWildcardMatchingOption.InstancesAndTotals)
                    }]
      };
    }
  }

  constructor() {
    Object.keys(defaultSettings).forEach(key => {
      this[key] = {};
      Object.assign(this[key], defaultSettings[key]);
    });
  }
}
