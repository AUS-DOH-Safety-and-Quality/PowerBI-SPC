import type powerbi from "powerbi-visuals-api";
import {
  readSettingsGroups, buildFormattingModel, type FormattingModel, type SettingsGroupRule, type SettingsValidation
} from "powerbi-visuals-core/powerbi";
import settingsModel, { type settingsValueType } from "../settings";
import { createDefaultValues, orderedBoundsError } from "powerbi-visuals-core/settings";
import derivedSettingsClass from "./derivedSettingsClass";

const rules: SettingsGroupRule<settingsValueType>[] = [
  settings => {
    const patterns = settings.outliers;
    if (settings.nhs_icons.show_variation_icons && !patterns.astronomical && !patterns.shift && !patterns.trend && !patterns.two_in_three) {
      return "Variation icons require at least one outlier pattern to be selected";
    }
    return undefined;
  },
  settings => {
    const outliers = settings.outliers;
    const flagsOnSpecification = (outliers.astronomical && outliers.astronomical_limit === "Specification")
      || (outliers.two_in_three && outliers.two_in_three_limit === "Specification");
    if (flagsOnSpecification && !settings.lines.show_specification) {
      return "Flagging against specification limits requires the specification lines to be shown";
    }
    return undefined;
  },
  settings => orderedBoundsError(settings, settings.spc)
];

export default class settingsClass {
  settings: settingsValueType[];
  derivedSettings: derivedSettingsClass[];
  validationStatus: SettingsValidation;
  messagePositionByRowIndex = new Map<number, number>();

  update(category: powerbi.DataViewCategoryColumn, groupIdxs: readonly (readonly number[])[]): void {
    const result = readSettingsGroups(settingsModel, category, groupIdxs, rules);
    this.settings = result.values;
    this.validationStatus = result.validation;
    this.messagePositionByRowIndex = result.messagePositionByRowIndex;
    this.derivedSettings = new Array<derivedSettingsClass>(this.settings.length);
    for (let i = 0; i < this.settings.length; i++) {
      this.derivedSettings[i] = new derivedSettingsClass(this.settings[i].spc);
    }
  }

  public getFormattingModel(): FormattingModel {
    return buildFormattingModel(settingsModel, this.settings[0]);
  }

  constructor() {
    this.validationStatus = { status: 0, messages: [] };
    this.settings = [createDefaultValues(settingsModel)];
    this.derivedSettings = [new derivedSettingsClass(this.settings[0].spc)];
  }
}
