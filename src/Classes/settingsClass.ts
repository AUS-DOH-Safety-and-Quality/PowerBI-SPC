import * as powerbi from "powerbi-visuals-api"
type DataView = powerbi.default.DataView;
type DataViewPropertyValue = powerbi.default.DataViewPropertyValue
type VisualObjectInstanceEnumerationObject = powerbi.default.VisualObjectInstanceEnumerationObject;
type VisualObjectInstance = powerbi.default.VisualObjectInstance;
type VisualObjectInstanceContainer = powerbi.default.VisualObjectInstanceContainer;
import { extractConditionalFormatting, isNullOrUndefined } from "../Functions";
import { default as defaultSettings, type settingsValueTypes, settingsPaneGroupings, settingsPaneToggles } from "../defaultSettings";
import derivedSettingsClass from "./derivedSettingsClass";
import { type ConditionalReturnT, type SettingsValidationT } from "../Functions/extractConditionalFormatting";

type NestedKeysOf<T>
  = T extends object
    ? { [K in keyof T]: K extends string ? K : never; }[keyof T]
    : never;

export type defaultSettingsType = settingsValueTypes;
export type defaultSettingsKey = keyof defaultSettingsType;
export type defaultSettingsNestedKey = NestedKeysOf<defaultSettingsType[defaultSettingsKey]>;
export type settingsScalarTypes = number | string | boolean;

export type optionalSettingsTypes = Partial<{
  [K in keyof typeof defaultSettings]: Partial<defaultSettingsType[K]>;
}>;

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
  derivedSettings: derivedSettingsClass;
  validationStatus: SettingsValidationT;
  settingsGrouped: defaultSettingsType[];
  derivedSettingsGrouped: derivedSettingsClass[];

  /**
   * Function to read the values from the settings pane and update the
   * values stored in the class.
   *
   * @param inputObjects
   */
  update(inputView: DataView): void {
    this.validationStatus
      = JSON.parse(JSON.stringify({ status: 0, messages: new Array<string[]>(), error: "" }));
    // Get the names of all classes in settingsObject which have values to be updated
    const allSettingGroups: string[] = Object.keys(this.settings);

    const is_grouped: boolean = inputView.categorical.values?.source?.roles?.indicator;
    let group_idxs: number[] = new Array<number>();
    this.settingsGrouped = new Array<defaultSettingsType>();
    if (is_grouped) {
      group_idxs = inputView.categorical.values.grouped().map(d => {
        this.settingsGrouped.push(Object.fromEntries(Object.keys(defaultSettings).map((settingGroupName) => {
          return [settingGroupName, Object.fromEntries(Object.keys(defaultSettings[settingGroupName]).map((settingName) => {
            return [settingName, defaultSettings[settingGroupName][settingName]];
          }))];
        })) as settingsValueTypes);

        return d.values[0].values.findIndex(d_in => !isNullOrUndefined(d_in));
      });
    }


    allSettingGroups.forEach((settingGroup: defaultSettingsKey) => {
      const condFormatting: ConditionalReturnT<defaultSettingsType[defaultSettingsKey]>
        = extractConditionalFormatting(inputView?.categorical, settingGroup, this.settings);

      if (condFormatting.validation.status !== 0) {
        this.validationStatus.status = condFormatting.validation.status;
        this.validationStatus.error = condFormatting.validation.error;
      }

      if (this.validationStatus.messages.length === 0) {
        this.validationStatus.messages = condFormatting.validation.messages;
      } else if (!condFormatting.validation.messages.every(d => d.length === 0)) {
        condFormatting.validation.messages.forEach((message, idx) => {
          if (message.length > 0) {
            this.validationStatus.messages[idx] = this.validationStatus.messages[idx].concat(message)
          }
        });
      }

      // Get the names of all settings in a given class and
      // use those to extract and update the relevant values
      const settingNames: string[] = Object.keys(this.settings[settingGroup]);
      settingNames.forEach((settingName: defaultSettingsNestedKey) => {
        this.settings[settingGroup][settingName]
          = condFormatting?.values
            ? condFormatting?.values[0][settingName]
            : defaultSettings[settingGroup][settingName]["default"]

        if (is_grouped) {
          group_idxs.forEach((idx, idx_idx) => {
            this.settingsGrouped[idx_idx][settingGroup][settingName]
              = condFormatting?.values
                ? condFormatting?.values[idx][settingName]
                : defaultSettings[settingGroup][settingName]["default"]
          })
        }
      })
    })

    if (this.settings.nhs_icons.show_variation_icons) {
      const patterns: string[] = ["astronomical", "shift", "trend", "two_in_three"];
      const anyOutlierPatterns: boolean = patterns.some(d => this.settings.outliers[d]);
      if (!anyOutlierPatterns) {
        this.validationStatus.status = 1;
        this.validationStatus.error = "Variation icons require at least one outlier pattern to be selected";
      }
    }

    if (this.settings.nhs_icons.show_assurance_icons) {
      const altTargetPresent: boolean = !isNullOrUndefined(this.settings.lines.alt_target);
      const improvementDirection: string = this.settings.outliers.improvement_direction;
      if (!altTargetPresent || improvementDirection === "neutral") {
        this.validationStatus.status = 1;
        this.validationStatus.error = "Assurance icons require an alternative target and a non-neutral improvement direction";
      }
    }

    this.derivedSettings.update(this.settings.spc)
    this.derivedSettingsGrouped = new Array<derivedSettingsClass>();
    if (is_grouped) {
      this.settingsGrouped.forEach((d) => {
        const newDerived = new derivedSettingsClass();
        newDerived.update(d.spc);
        this.derivedSettingsGrouped.push(newDerived);
      })
    }
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
        selector: { data: [{ roles: ["key"] }] },
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
