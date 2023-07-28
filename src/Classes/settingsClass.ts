import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import DataViewCategorical = powerbi.DataViewCategorical;
import DataViewPropertyValue = powerbi.DataViewPropertyValue
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import VisualEnumerationInstanceKinds = powerbi.VisualEnumerationInstanceKinds;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualObjectInstanceContainer = powerbi.VisualObjectInstanceContainer;
import { dataViewWildcard } from "powerbi-visuals-utils-dataviewutils";
import extractConditionalFormatting from "../Functions/extractConditionalFormatting";
import defaultSettings from "../defaultSettings"
import { defaultSettingsType, defaultSettingsKey, settingsPaneGroupings } from "../defaultSettings";
import isNotNullOrUndefined from "../Functions/isNotNullOrUndefined";

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
  update(inputView: DataView): void {
    // Get the names of all classes in settingsObject which have values to be updated
    const allSettingGroups: string[] = Object.getOwnPropertyNames(this);

    allSettingGroups.forEach(settingGroup => {
      let condFormatting: defaultSettingsType[defaultSettingsKey] | undefined;
      if (isNotNullOrUndefined(inputView.categorical) && isNotNullOrUndefined(inputView.categorical.categories)) {
        condFormatting = extractConditionalFormatting(inputView.categorical as DataViewCategorical, settingGroup, this)[0];
      }
      // Get the names of all settings in a given class and
      // use those to extract and update the relevant values
      const settingNames: string[] = Object.getOwnPropertyNames(this[settingGroup]);
      settingNames.forEach(settingName => {
        this[settingGroup][settingName] = isNotNullOrUndefined(condFormatting)
                                            ? (condFormatting as defaultSettingsType[defaultSettingsKey])[settingName]
                                            : defaultSettings[settingGroup][settingName]
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
    const settingsGrouped: boolean = Object.keys(settingsPaneGroupings).includes(settingGroupName);
    const paneGroupings: Record<string, string[]> = settingsGrouped ? settingsPaneGroupings[settingGroupName] : { "all": settingNames };
    const rtnInstances = new Array<VisualObjectInstance>();
    const rtnContainers = new Array<VisualObjectInstanceContainer>();

    Object.keys(paneGroupings).forEach((currKey, idx) => {
      const props = Object.fromEntries(
        paneGroupings[currKey].map(currSetting => {
          const settingValue: DataViewPropertyValue = this[settingGroupName][currSetting]
          return [currSetting, settingValue]
        })
      );

      rtnInstances.push({
        objectName: settingGroupName,
        properties: props,
        propertyInstanceKind: Object.fromEntries((paneGroupings[currKey]).map(setting => [setting, VisualEnumerationInstanceKinds.ConstantOrRule])),
        selector: dataViewWildcard.createDataViewWildcardSelector(dataViewWildcard.DataViewWildcardMatchingOption.InstancesAndTotals)
      })

      if (currKey !== "all") {
        rtnInstances[idx].containerIdx = idx
        rtnContainers.push({ displayName: currKey })
      }
    });

    return { instances: rtnInstances, containers: rtnContainers };
  }

  constructor() {
    Object.keys(defaultSettings).forEach(key => {
      this[key] = {};
      Object.assign(this[key], defaultSettings[key]);
    });
  }
}
