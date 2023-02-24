import powerbi from "powerbi-visuals-api"
import { dataViewObjects } from "powerbi-visuals-utils-dataviewutils";
import dataObject from "./dataObject";
import {
  canvasSettings,
  spcSettings,
  outliersSettings,
  scatterSettings,
  lineSettings,
  xAxisSettings,
  yAxisSettings,
  settingsInData
} from "./settingsGroups"
import first from "../Functions/first"

/**
 * This is the core class which controls the initialisation and
 * updating of user-settings. Each member is its own class defining
 * the types and default values for a given group of settings.
 *
 * These are defined in the settingsGroups.ts file
 */
class settingsObject {
  [key: string] : any;
  canvas: canvasSettings;
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
  update(inputObjects: powerbi.DataViewObjects): void {
    // Get the names of all classes in settingsObject which have values to be updated
    let allSettingGroups: string[] = Object.getOwnPropertyNames(this)
                                           .filter(groupName => !(["settingsInData"].includes(groupName)));

    allSettingGroups.forEach(settingGroup => {
      // Get the names of all settings in a given class and
      // use those to extract and update the relevant values
      let settingNames: string[] = Object.getOwnPropertyNames(this[settingGroup]);
      settingNames.forEach(settingName => {
        type MethodTypes = Pick<typeof dataViewObjects, 'getFillColor' | 'getValue'>;
        let methodName: string = settingName.includes("colour") ? "getFillColor" : "getValue";
        this[settingGroup][settingName].value = dataViewObjects[methodName as keyof MethodTypes](
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
        ? inputData[settingNames[0] as keyof dataObject]
        : this[settingGroupName][settingNames[0]].value
    };
    return settingNames.reduce((previousSetting, currentSetting) => {
      return {
        ...previousSetting,
        ...{
          [currentSetting]: this.settingsInData.includes(currentSetting)
            ? (first(inputData[currentSetting as keyof dataObject]) ? first(inputData[currentSetting as keyof dataObject]) : this[settingGroupName][currentSetting].value)
            : this[settingGroupName][currentSetting].value
        }
      }
    }, firstSettingObject);
  }

  constructor() {
    this.canvas = new canvasSettings();
    this.spc = new spcSettings();
    this.outliers = new outliersSettings();
    this.scatter = new scatterSettings();
    this.lines = new lineSettings();
    this.x_axis = new xAxisSettings();
    this.y_axis = new yAxisSettings();
    this.settingsInData = Object.keys(settingsInData);
  }
}

export default settingsObject;
