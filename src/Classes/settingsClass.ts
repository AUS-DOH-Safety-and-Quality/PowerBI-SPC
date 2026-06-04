import type powerbi from "powerbi-visuals-api"
type DataView = powerbi.DataView;
type FormattingDescriptor = powerbi.visuals.FormattingDescriptor;
import extractConditionalFormatting from "../Functions/extractConditionalFormatting";
import { default as settingsModel, defaultSettings, type settingsValueType,
  type settingsValueTypesUnion, type SettingsValueKeys, type SettingsValueNestedKeys,
  type settingsModelKeys, type settingsModelType
 } from "../settings";
import derivedSettingsClass from "./derivedSettingsClass";
import { type ConditionalReturnT, type SettingsValidationT } from "../Functions/extractConditionalFormatting";
import getNested from "../Functions/getNested"
import { FormattingComponent, type MergeUnions, type FormattingComponentKeys } from "../Settings Model/common";

export type optionalSettingsTypes = Partial<{
  [K in keyof typeof defaultSettings]: Partial<settingsValueType[K]>;
}>;

// Re-declare enum to avoid importing powerbi module everywhere settingsClass is used
const VisualEnumerationInstanceKinds = {
  Constant: 1 << 0 as powerbi.VisualEnumerationInstanceKinds.Rule,
  Rule: 1 << 1 as powerbi.VisualEnumerationInstanceKinds.Rule,
  ConstantOrRule: (1 << 0 | 1 << 1) as powerbi.VisualEnumerationInstanceKinds.ConstantOrRule,
} as const;

/**
 * This is the core class which controls the initialisation and
 * updating of user-settings. Each member is its own class defining
 * the types and default values for a given group of settings.
 *
 * These are defined in the settingsGroups.ts file
 */
export default class settingsClass {
  settings: settingsValueType[];
  derivedSettings: derivedSettingsClass[];
  validationStatus: SettingsValidationT;

  /**
   * Function to read the values from the settings pane and update the
   * values stored in the class.
   *
   * @param inputObjects
   */
  update(inputView: DataView, groupIdxs: number[][]): void {
    this.validationStatus
      = JSON.parse(JSON.stringify({ status: 0, messages: new Array<string[]>(), error: "" }));

    // Initialize settings array based on number of groups
    this.settings = new Array<settingsValueType>();
    this.derivedSettings = new Array<derivedSettingsClass>();

    groupIdxs.forEach(() => {
      this.settings.push(settingsModel.defaultValues);
      this.derivedSettings.push(new derivedSettingsClass(this.settings[0].spc));
    });

    const all_idxs: number[] = groupIdxs.flat();
    // Get the names of all classes in settingsObject which have values to be updated
    const allSettingGroups: string[] = Object.keys(this.settings[0]);

    allSettingGroups.forEach((settingGroup) => {
      const condFormatting: ConditionalReturnT<settingsValueTypesUnion>
        = extractConditionalFormatting(inputView.categorical!, settingGroup, this.settings[0], all_idxs);

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
      const settingNames: string[] = Object.keys(this.settings[0][settingGroup as SettingsValueKeys]);
      settingNames.forEach((settingName) => {
        groupIdxs.forEach((idx, idx_idx) => {
          (this.settings[idx_idx] as any)[settingGroup][settingName]
            = condFormatting?.values
              ? condFormatting?.values[idx[0]][settingName as keyof settingsValueTypesUnion]
              : getNested(defaultSettings, settingGroup as SettingsValueKeys, settingName as SettingsValueNestedKeys)
        })
      })
    })

    if (this.settings[0].nhs_icons.show_variation_icons) {
      const patterns: string[] = ["astronomical", "shift", "trend", "two_in_three"];
      const anyOutlierPatterns: boolean = patterns.some(d => this.settings[0].outliers[d as keyof settingsValueType["outliers"]]);
      if (!anyOutlierPatterns) {
        this.validationStatus.status = 1;
        this.validationStatus.error = "Variation icons require at least one outlier pattern to be selected";
      }
    }
/*
    if (this.settings[0].nhs_icons.show_assurance_icons) {
      const altTargetPresent: boolean = !isNullOrUndefined(this.settings[0].lines.alt_target);
      const improvementDirection: string = this.settings[0].outliers.improvement_direction;
      if (!altTargetPresent || improvementDirection === "neutral") {
        this.validationStatus.status = 1;
        this.validationStatus.error = "Assurance icons require an alternative target and a non-neutral improvement direction";
      }
    }
*/
    this.settings.forEach((settingsItem, idx) => {
      this.derivedSettings[idx] = new derivedSettingsClass(settingsItem.spc);
    });
  }

  public getFormattingModel(): powerbi.visuals.FormattingModel {
    const formattingModel: powerbi.visuals.FormattingModel = {
      cards: []
    };

    for (const settingsModelKey in settingsModel) {
      const currCardName: settingsModelKeys = settingsModelKey as settingsModelKeys;
      let curr_card: powerbi.visuals.FormattingCard = {
        description: settingsModel[currCardName].description,
        displayName: settingsModel[currCardName].displayName,
        uid: currCardName + "_card_uid",
        groups: [],
        revertToDefaultDescriptors: []
      };

      const currSettingsGroups = settingsModel[currCardName].settingsGroups as MergeUnions<settingsModelType[settingsModelKeys]["settingsGroups"]>;
      for (const settingsGroupKey in currSettingsGroups) {
        const currSettingsGroupName = settingsGroupKey as keyof typeof currSettingsGroups;
        let curr_group: powerbi.visuals.FormattingGroup = {
          displayName: currSettingsGroupName === "all" ? settingsModel[currCardName].displayName : currSettingsGroupName,
          uid: currCardName + "_" + currSettingsGroupName + "_uid",
          slices: []
        };

        const currSettings = currSettingsGroups[currSettingsGroupName] as MergeUnions<(typeof currSettingsGroups)[keyof typeof currSettingsGroups]>;
        for (const settingNamekey in currSettings) {
          const currSettingName = settingNamekey as keyof typeof currSettings;
          curr_card.revertToDefaultDescriptors!.push({
            objectName: currCardName,
            propertyName: currSettingName
          });

          let currType = currSettings[currSettingName].type as FormattingComponentKeys;

          let curr_slice: powerbi.visuals.SimpleVisualFormattingSlice = {
            uid: currCardName + "_" + currSettingsGroupName + "_" + currSettingName + "_slice_uid",
            displayName: currSettings[currSettingName].displayName,
            control: {
              type: currSettings[currSettingName].type,
              properties: {
                descriptor: {
                  objectName: currCardName,
                  propertyName: currSettingName,
                  selector: { data: [{ dataViewWildcard: { matchingOption: 0 } }] }
                },
                value: {} as any
              }
            } as Extract<powerbi.visuals.FormattingSimpleControl, {type: typeof currType}>
          };

          const currSettingValue = getNested(this.settings[0], currCardName, currSettingName);

          if (currSettings[currSettingName].type === FormattingComponent.ColorPicker) {
            (curr_slice.control.properties as powerbi.visuals.ColorPicker).value
              = { value: currSettingValue as string }
          } else if (currSettings[currSettingName].type === FormattingComponent.Dropdown) {
            const currItems: powerbi.IEnumMember[] = currSettings[currSettingName].items as powerbi.IEnumMember[];
            (curr_slice.control.properties as powerbi.visuals.ItemDropdown).items
              = currItems;

            // Extract matching display label for current selection
            (curr_slice.control.properties as powerbi.visuals.ItemDropdown).value
              = currItems.find(item => item.value === currSettingValue) as powerbi.IEnumMember;
          } else {
            curr_slice.control.properties.value = currSettingValue;
          }

          if (currSettings[currSettingName].type !== FormattingComponent.ToggleSwitch) {
            (curr_slice.control.properties.descriptor! as FormattingDescriptor).instanceKind
              = VisualEnumerationInstanceKinds.ConstantOrRule
          }

          if ("options" in currSettings[currSettingName]) {
            (curr_slice.control.properties as powerbi.visuals.NumUpDown).options
              = currSettings[currSettingName].options as powerbi.visuals.NumUpDownFormat
          }

          curr_group.slices!.push(curr_slice);
        }

        curr_card.groups.push(curr_group);
      }

      formattingModel.cards.push(curr_card);
    }

    return formattingModel;
  }

  constructor() {
    this.validationStatus = { status: 0, messages: new Array<string[]>(), error: "" };
    this.settings = [settingsModel.defaultValues as settingsValueType];
    this.derivedSettings = [new derivedSettingsClass(this.settings[0].spc)];
  }
}
