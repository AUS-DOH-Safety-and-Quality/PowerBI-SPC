import powerbi from "powerbi-visuals-api"
import { dataViewObjects } from "powerbi-visuals-utils-dataviewutils";
import dataObject from "./dataObject";
import {
  axispadSettings,
  spcSettings,
  outliersSettings,
  scatterSettings,
  lineSettings,
  xAxisSettings,
  yAxisSettings
} from "./settingsGroups"

/**
 * This is the core class which controls the initialisation and
 * updating of user-settings. Each member is its own class defining
 * the types and default values for a given group of settings.
 *
 * These are defined in the settingsGroups.ts file
 */
class settingsObject {
  axispad: axispadSettings;
  spc: spcSettings;
  outliers: outliersSettings;
  scatter: scatterSettings;
  lines: lineSettings;
  x_axis: xAxisSettings;
  y_axis: yAxisSettings;
  // Specify the names of settings which can be provided as data
  // so that the correct value can be rendered to the settings pane
  settingsInData: string[];

  /**
   * Function to read the values from the settings pane and update the
   * values stored in the class.
   *
   * @param inputObjects
   */
  updateSettings(inputObjects: powerbi.DataViewObjects): void {
    // Get the names of all classes in settingsObject which have values to be updated
    let allSettingGroups: string[] = Object.getOwnPropertyNames(this)
                                           .filter(groupName => !(["axispad", "settingsInData"].includes(groupName)));

    allSettingGroups.forEach(settingGroup => {
      // Get the names of all settings in a given class and
      // use those to extract and update the relevant values
      let settingNames: string[] = Object.getOwnPropertyNames(this[settingGroup]);
      settingNames.forEach(settingName => {
        // A different function is required for extracting colours provided by settings
        let method: string = settingName.includes("colour") ? "getFillColor" : "getValue";

        this[settingGroup][settingName].value = dataViewObjects[method](
          inputObjects, {
            objectName: settingGroup,
            propertyName: settingName
          },
          this[settingGroup][settingName].default
        )
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
  returnValues(settingGroupName: string, inputData: dataObject) {
    let settingNames: string[] = Object.getOwnPropertyNames(this[settingGroupName]);
    let firstSettingObject = {
      [settingNames[0]]: this.settingsInData.includes(settingNames[0])
        ? inputData[settingNames[0]]
        : this[settingGroupName][settingNames[0]].value
    };
    return settingNames.reduce((previousSetting, currentSetting) => {
      return {
        ...previousSetting,
        ...{
          [currentSetting]: this.settingsInData.includes(currentSetting)
            ? inputData[currentSetting]
            : this[settingGroupName][currentSetting].value
        }
      }
    }, firstSettingObject);
  }

  constructor() {
    this.axispad = new axispadSettings();
    this.spc = new spcSettings();
    this.outliers = new outliersSettings();
    this.scatter = new scatterSettings();
    this.lines = new lineSettings();
    this.x_axis = new xAxisSettings();
    this.y_axis = new yAxisSettings();
    this.settingsInData = ["chart_type", "multiplier", "flag_direction"];
  }
}

export default settingsObject;
