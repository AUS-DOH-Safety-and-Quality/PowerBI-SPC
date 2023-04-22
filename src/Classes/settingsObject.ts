import powerbi from "powerbi-visuals-api";
import DataViewPropertyValue = powerbi.DataViewPropertyValue
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import VisualEnumerationInstanceKinds = powerbi.VisualEnumerationInstanceKinds;
import { dataViewWildcard } from "powerbi-visuals-utils-dataviewutils";
import extractSetting from "../Functions/extractSetting";
import extractConditionalFormatting from "../Functions/extractConditionalFormatting";
import {
  canvasSettings,
  spcSettings,
  outliersSettings,
  scatterSettings,
  lineSettings,
  xAxisSettings,
  yAxisSettings,
  settingsInData,
  AllSettingsTypes
} from "./settingsGroups"

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
  update(inputView: powerbi.DataView): void {
    let inputObjects: powerbi.DataViewObjects = inputView.metadata.objects;
    // Get the names of all classes in settingsObject which have values to be updated
    let allSettingGroups: string[] = Object.getOwnPropertyNames(this)
                                           .filter(groupName => !(["settingsInData"].includes(groupName)));

    allSettingGroups.forEach(settingGroup => {
      let condFormatting: AllSettingsTypes = inputView.categorical.categories
                            ? extractConditionalFormatting(inputView.categorical, settingGroup, this)[0]
                            : null;
      // Get the names of all settings in a given class and
      // use those to extract and update the relevant values
      let settingNames: string[] = Object.getOwnPropertyNames(this[settingGroup]);
      settingNames.forEach(settingName => {
        this[settingGroup][settingName].value
          = condFormatting ? condFormatting[settingName as keyof AllSettingsTypes]
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
    let settingNames: string[] = Object.getOwnPropertyNames(this[settingGroupName]);

    let properties: Record<string, DataViewPropertyValue> = Object.fromEntries(
      settingNames.map(settingName => {
        let settingValue: DataViewPropertyValue = this[settingGroupName][settingName].value
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
