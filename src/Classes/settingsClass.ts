import type powerbi from "powerbi-visuals-api";
import { readSettingsGroups, buildFormattingModel, type FormattingModel, type SettingsValidation } from "powerbi-visuals-core/powerbi";
import settingsModel, { type settingsValueType } from "../settings";
import { createDefaultValues } from "powerbi-visuals-core/settings";
import derivedSettingsClass from "./derivedSettingsClass";

export default class settingsClass {
  settings: settingsValueType[];
  derivedSettings: derivedSettingsClass[];
  validationStatus: SettingsValidation;
  messagePositionByRowIndex = new Map<number, number>();

  update(category: powerbi.DataViewCategoryColumn, groupIdxs: readonly (readonly number[])[]): void {
    const result = readSettingsGroups(settingsModel, category, groupIdxs);
    this.settings = result.values;
    this.validationStatus = result.validation;
    this.messagePositionByRowIndex = result.messagePositionByRowIndex;
    this.derivedSettings = new Array<derivedSettingsClass>(groupIdxs.length);

    const settings = this.settings[0];
    if (settings.nhs_icons.show_variation_icons) {
      const patterns = settings.outliers;
      if (!patterns.astronomical && !patterns.shift && !patterns.trend && !patterns.two_in_three) {
        this.validationStatus = { status: 1, messages: this.validationStatus.messages,
          error: "Variation icons require at least one outlier pattern to be selected" };
      }
    }
    for (let i = 0; i < this.settings.length; i++) {
      const outliers = this.settings[i].outliers;
      const flagsOnSpecification = (outliers.astronomical && outliers.astronomical_limit === "Specification")
        || (outliers.two_in_three && outliers.two_in_three_limit === "Specification");
      if (flagsOnSpecification && !this.settings[i].lines.show_specification) {
        this.validationStatus = { status: 1, messages: this.validationStatus.messages,
          error: "Flagging against specification limits requires the specification lines to be shown" };
      }
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
