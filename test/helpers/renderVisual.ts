import {
  createRenderer, settingsWith as mergeSettings, type RenderOptions as BaseRenderOptions, type Rendered as BaseRendered,
  type SettingsOverrides as Overrides
} from "powerbi-visuals-core/testing";
import { Visual } from "../../src/visual";
import { defaultSettings, type settingsValueType } from "../../src/settings";
import buildDataView, { type DataViewArgs } from "./buildDataView";

export type SettingsOverrides = Overrides<settingsValueType>;

export function settingsWith(overrides: SettingsOverrides): settingsValueType {
  return mergeSettings(defaultSettings, overrides);
}

/** Settings whose cards and values tests can assign */
export type MutableSettings = { -readonly [C in keyof settingsValueType]: { -readonly [K in keyof settingsValueType[C]]: settingsValueType[C][K] } };

/** A deep copy of the defaults, for tests that mutate cards in place */
export function cloneSettings(): MutableSettings {
  return structuredClone(defaultSettings);
}

export type RenderOptions = BaseRenderOptions & {
  /** Stored click splits, as 0-based segment ends */
  splitIndexes?: number[];
};

type Settings = settingsValueType | settingsValueType[];

export type Rendered = BaseRendered<Visual, Settings, DataViewArgs>;

const render = createRenderer<Visual, Settings, DataViewArgs>(Visual, buildDataView);

/** A rendered SPC visual with its click splits stored on every data view */
export function renderVisual(settings: Settings, args: DataViewArgs, options: RenderOptions = {}): Rendered {
  return render(settings, args, {
    host: options.host,
    prepare: dataView => {
      dataView.metadata.objects = {
        split_indexes_storage: { split_indexes: JSON.stringify(options.splitIndexes ?? []) }
      };
      options.prepare?.(dataView);
    }
  });
}
