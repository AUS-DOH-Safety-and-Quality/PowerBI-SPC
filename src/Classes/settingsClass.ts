import type powerbi from "powerbi-visuals-api";
import { readSettingsGroups, buildFormattingModel, type SettingsValidation } from "powerbi-visuals-core/powerbi";
import settingsModel, { defaultSettings, type settingsValueType } from "../settings";
import { createDefaultValues } from "powerbi-visuals-core/settings";
import derivedSettingsClass from "./derivedSettingsClass";

export type optionalSettingsTypes = Partial<{
  [K in keyof typeof defaultSettings]: Partial<settingsValueType[K]>;
}>;

export default class settingsClass {
  settings: settingsValueType[];
  derivedSettings: derivedSettingsClass[];
  validationStatus: SettingsValidation;
  messagePositionByRowIndex = new Map<number, number>();

  update(inputView: powerbi.DataView | undefined, groupIdxs: readonly (readonly number[])[]): void {
    this.validationStatus = { status: 0, messages: [] };
    this.messagePositionByRowIndex = new Map<number, number>();
    const category = inputView?.categorical?.categories?.[0];
    if (category === undefined || groupIdxs.length === 0) {
      this.settings = [createDefaultValues(settingsModel)];
      this.derivedSettings = [new derivedSettingsClass(this.settings[0].spc)];
      return;
    }
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
      this.derivedSettings[i] = new derivedSettingsClass(this.settings[i].spc);
    }
  }

  public getFormattingModel(): powerbi.visuals.FormattingModel {
    // API 5.1 omits the visual's unset numeric values and legacy option shapes.
    return buildFormattingModel(settingsModel, this.settings[0]) as powerbi.visuals.FormattingModel;
  }

  constructor() {
    this.validationStatus = { status: 0, messages: [] };
    this.settings = [createDefaultValues(settingsModel)];
    this.derivedSettings = [new derivedSettingsClass(this.settings[0].spc)];
  }
}
