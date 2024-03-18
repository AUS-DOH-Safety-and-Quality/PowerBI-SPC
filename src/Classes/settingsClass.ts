import * as powerbi from "powerbi-visuals-api"
type DataView = powerbi.default.DataView;
type DataViewPropertyValue = powerbi.default.DataViewPropertyValue
type VisualObjectInstanceEnumerationObject = powerbi.default.VisualObjectInstanceEnumerationObject;
type VisualObjectInstance = powerbi.default.VisualObjectInstance;
type VisualObjectInstanceContainer = powerbi.default.VisualObjectInstanceContainer;
import { dataViewWildcard } from "powerbi-visuals-utils-dataviewutils";
import { extractConditionalFormatting } from "../Functions";
import { default as defaultSettings, type settingsValueTypes, settingsPaneGroupings, settingsPaneToggles } from "../defaultSettings";
import derivedSettingsClass from "./derivedSettingsClass";

type NestedKeysOf<T>
  = T extends object
    ? { [K in keyof T]: K extends string ? K : never; }[keyof T]
    : never;

export type defaultSettingsType = settingsValueTypes;
export type defaultSettingsKey = keyof defaultSettingsType;
export type defaultSettingsNestedKey = NestedKeysOf<defaultSettingsType[defaultSettingsKey]>;
export type settingsScalarTypes = number | string | boolean;

export type paneGroupingsNestedKey = "all" | NestedKeysOf<typeof settingsPaneGroupings[keyof typeof settingsPaneGroupings]>;
export type paneTogglesNestedKey = "all" | NestedKeysOf<typeof settingsPaneToggles[keyof typeof settingsPaneToggles]>;

/**
 * This is the core class which controls the initialisation and
 * updating of user-settings. Each member is its own class defining
 * the types and default values for a given group of settings.
 *
 * These are defined in the settingsGroups.ts file
 */
export default class settingsClass {
  settings: defaultSettingsType;
  derivedSettings: derivedSettingsClass

  /**
   * Function to read the values from the settings pane and update the
   * values stored in the class.
   *
   * @param inputObjects
   */
  update(inputView: DataView): void {
    // Get the names of all classes in settingsObject which have values to be updated
    const allSettingGroups: string[] = Object.keys(this.settings);

    allSettingGroups.forEach((settingGroup: defaultSettingsKey) => {
      const condFormatting: defaultSettingsType[defaultSettingsKey]
        = extractConditionalFormatting(inputView?.categorical, settingGroup, this.settings)[0];

      // Get the names of all settings in a given class and
      // use those to extract and update the relevant values
      const settingNames: string[] = Object.keys(this.settings[settingGroup]);
      settingNames.forEach((settingName: defaultSettingsNestedKey) => {
        this.settings[settingGroup][settingName]
          = condFormatting ? condFormatting[settingName] : defaultSettings[settingGroup][settingName]["default"]
      })
    })

    this.derivedSettings.update(this.settings)
  }

  /**
   * Get the names of all settings in a given group, and remove any which are toggled off.
   *
   * @param settingGroupName
   * @returns
   */
  getSettingNames(settingGroupName: defaultSettingsKey): Record<paneGroupingsNestedKey, defaultSettingsNestedKey[]> {
    const settingsGrouped: boolean = Object.keys(settingsPaneGroupings)
                                           .includes(settingGroupName);
    const paneGroupings: Record<paneGroupingsNestedKey, defaultSettingsNestedKey[]>
      = settingsGrouped
        ? JSON.parse(JSON.stringify(settingsPaneGroupings[settingGroupName]))
        : { "all": Object.keys(this.settings[settingGroupName]) };

    if (Object.keys(settingsPaneToggles).includes(settingGroupName)) {
      const toggledSettings: Record<paneGroupingsNestedKey, typeof settingsPaneToggles[keyof typeof settingsPaneToggles]>
        = settingsGrouped
          ? settingsPaneToggles[settingGroupName]
          : { "all": settingsPaneToggles[settingGroupName]};

      Object.keys(toggledSettings).forEach((toggleGroup: paneGroupingsNestedKey) => {
        let settingsToRemove: string[] = new Array<string>();
        Object.keys(toggledSettings[toggleGroup]).forEach((settingToggle: paneTogglesNestedKey) => {
          if (this.settings[settingGroupName][settingToggle] !== true) {
            settingsToRemove = settingsToRemove.concat(toggledSettings[toggleGroup][settingToggle])
          }
        })
        paneGroupings[toggleGroup] = paneGroupings[toggleGroup].filter(setting => !settingsToRemove.includes(setting))
      })
    }
    return paneGroupings;
  }

  /**
   * Function to extract all values for a given settings group, which are then
   * rendered to the Settings pane in PowerBI
   *
   * @param settingGroupName
   * @param inputData
   * @returns An object where each element is the value for a given setting in the named group
   */
  createSettingsEntry(settingGroupName: defaultSettingsKey): VisualObjectInstanceEnumerationObject {
    const paneGroupings: Record<paneGroupingsNestedKey, defaultSettingsNestedKey[]>
      = this.getSettingNames(settingGroupName);

    const rtnInstances = new Array<VisualObjectInstance>();
    const rtnContainers = new Array<VisualObjectInstanceContainer>();

    Object.keys(paneGroupings).forEach((currKey: paneGroupingsNestedKey, idx) => {
      const props = Object.fromEntries(
        paneGroupings[currKey].map(currSetting => {
          const settingValue: DataViewPropertyValue = this.settings[settingGroupName][currSetting]
          return [currSetting, settingValue]
        })
      );

      type propArray = Array<string | powerbi.default.VisualEnumerationInstanceKinds>;
      const propertyKinds: propArray[] = new Array<propArray>();

      (paneGroupings[currKey]).forEach(setting => {
        if ((typeof this.settings[settingGroupName][setting]) != "boolean") {
          propertyKinds.push([setting, powerbi.default.VisualEnumerationInstanceKinds.ConstantOrRule])
        }
      })

      rtnInstances.push({
        objectName: settingGroupName,
        properties: props,
        propertyInstanceKind: Object.fromEntries(propertyKinds),
        selector: dataViewWildcard.createDataViewWildcardSelector(dataViewWildcard.DataViewWildcardMatchingOption.InstancesAndTotals),
        validValues: Object.fromEntries(Object.keys(defaultSettings[settingGroupName]).map((settingName: defaultSettingsNestedKey) => {
          return [settingName, defaultSettings[settingGroupName][settingName]?.["valid"]]
        }))
      })

      if (currKey !== "all") {
        rtnInstances[idx].containerIdx = idx
        rtnContainers.push({ displayName: currKey })
      }
    });

    return { instances: rtnInstances, containers: rtnContainers };
  }

  constructor() {
    this.settings = Object.fromEntries(Object.keys(defaultSettings).map((settingGroupName) => {
      return [settingGroupName, Object.fromEntries(Object.keys(defaultSettings[settingGroupName]).map((settingName) => {
        return [settingName, defaultSettings[settingGroupName][settingName]];
      }))];
    })) as settingsValueTypes;
    this.derivedSettings = new derivedSettingsClass();
  }
}
