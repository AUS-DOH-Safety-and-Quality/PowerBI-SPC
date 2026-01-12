import * as powerbi from "powerbi-visuals-api"
type DataView = powerbi.default.DataView;
import extractConditionalFormatting from "../Functions/extractConditionalFormatting";
import isNullOrUndefined from "../Functions/isNullOrUndefined";
import { default as settingsModel, defaultSettings, type defaultSettingsType,
  type defaultSettingsKeys, type defaultSettingsNestedKeys
 } from "../settings";
import derivedSettingsClass from "./derivedSettingsClass";
import { type ConditionalReturnT, type SettingsValidationT } from "../Functions/extractConditionalFormatting";

export { type defaultSettingsType, type defaultSettingsKeys };
export type settingsScalarTypes = number | string | boolean;

export type optionalSettingsTypes = Partial<{
  [K in keyof typeof defaultSettings]: Partial<defaultSettingsType[K]>;
}>;

/**
 * This is the core class which controls the initialisation and
 * updating of user-settings. Each member is its own class defining
 * the types and default values for a given group of settings.
 *
 * These are defined in the settingsGroups.ts file
 */
export default class settingsClass {
  settings: defaultSettingsType[];
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
    this.settings = new Array<defaultSettingsType>();
    this.derivedSettings = new Array<derivedSettingsClass>();

    groupIdxs.forEach(() => {
      this.settings.push(Object.fromEntries(Object.keys(defaultSettings).map((settingGroupName) => {
        return [settingGroupName, Object.fromEntries(Object.keys(defaultSettings[settingGroupName]).map((settingName) => {
          return [settingName, defaultSettings[settingGroupName][settingName]];
        }))];
      })) as defaultSettingsType);
      this.derivedSettings.push(new derivedSettingsClass());
    });

    const all_idxs: number[] = groupIdxs.flat();
    // Get the names of all classes in settingsObject which have values to be updated
    const allSettingGroups: string[] = Object.keys(this.settings[0]);

    allSettingGroups.forEach((settingGroup: defaultSettingsKeys) => {
      const condFormatting: ConditionalReturnT<defaultSettingsType[defaultSettingsKeys]>
        = extractConditionalFormatting(inputView?.categorical, settingGroup, this.settings[0], all_idxs);

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
      const settingNames: string[] = Object.keys(this.settings[0][settingGroup]);
      settingNames.forEach((settingName: defaultSettingsNestedKeys) => {
        groupIdxs.forEach((idx, idx_idx) => {
          this.settings[idx_idx][settingGroup][settingName]
            = condFormatting?.values
              ? condFormatting?.values[idx[0]][settingName]
              : defaultSettings[settingGroup][settingName]["default"]
        })
      })
    })

    if (this.settings[0].nhs_icons.show_variation_icons) {
      const patterns: string[] = ["astronomical", "shift", "trend", "two_in_three"];
      const anyOutlierPatterns: boolean = patterns.some(d => this.settings[0].outliers[d]);
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
      this.derivedSettings[idx].update(settingsItem.spc);
    });
  }

  public getFormattingModel(): powerbi.default.visuals.FormattingModel {
    const formattingModel: powerbi.default.visuals.FormattingModel = {
      cards: []
    };

    for (const curr_card_name in settingsModel) {
      let curr_card: powerbi.default.visuals.FormattingCard = {
        description: settingsModel[curr_card_name].description,
        displayName: settingsModel[curr_card_name].displayName,
        uid: curr_card_name + "_card_uid",
        groups: [],
        revertToDefaultDescriptors: []
      };

      for (const card_group in settingsModel[curr_card_name].settingsGroups) {
        let curr_group: powerbi.default.visuals.FormattingGroup = {
          displayName: card_group === "all" ? settingsModel[curr_card_name].displayName : card_group,
          uid: curr_card_name + "_" + card_group + "_uid",
          slices: []
        };

        for (const setting in settingsModel[curr_card_name].settingsGroups[card_group]) {
          curr_card.revertToDefaultDescriptors.push({
            objectName: curr_card_name,
            propertyName: setting
          });

          let curr_slice: powerbi.default.visuals.FormattingSlice = {
            uid: curr_card_name + "_" + card_group + "_" + setting + "_slice_uid",
            displayName: settingsModel[curr_card_name].settingsGroups[card_group][setting].displayName,
            control: {
              type: settingsModel[curr_card_name].settingsGroups[card_group][setting].type,
              properties: {
                descriptor: {
                  objectName: curr_card_name,
                  propertyName: setting,
                  selector: { data: [{ dataViewWildcard: { matchingOption: 0 } }] },
                  instanceKind: (typeof this.settings[0][curr_card_name][setting]) != "boolean" ? powerbi.default.VisualEnumerationInstanceKinds.ConstantOrRule : null
                },
                value: this.valueLookup(curr_card_name, card_group, setting),
                items: settingsModel[curr_card_name].settingsGroups[card_group][setting]?.items,
                options: settingsModel[curr_card_name].settingsGroups[card_group][setting]?.options
              }
            }
          };

          curr_group.slices.push(curr_slice);
        }

        curr_card.groups.push(curr_group);
      }

      formattingModel.cards.push(curr_card);
    }

    return formattingModel;
  }

  valueLookup(settingCardName: string, settingGroupName: string, settingName: string) {
    if (settingName.includes("colour")) {
      return { value: this.settings[0][settingCardName][settingName] }
    }
    if (!isNullOrUndefined(settingsModel[settingCardName].settingsGroups[settingGroupName][settingName]?.items)) {
      const allItems: powerbi.default.IEnumMember[] = settingsModel[settingCardName].settingsGroups[settingGroupName][settingName].items;
      const currValue: string = this.settings[0][settingCardName][settingName];
      return allItems.find(item => item.value === currValue);
    }
    return this.settings[0][settingCardName][settingName];
  }

  constructor() {
    this.settings = [Object.fromEntries(Object.keys(defaultSettings).map((settingGroupName) => {
      return [settingGroupName, Object.fromEntries(Object.keys(defaultSettings[settingGroupName]).map((settingName) => {
        return [settingName, defaultSettings[settingGroupName][settingName]];
      }))];
    })) as defaultSettingsType];
    this.derivedSettings = [new derivedSettingsClass()];
  }
}
