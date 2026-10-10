import type powerbi from "powerbi-visuals-api";
import { onTestFinished } from "vitest";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import { defaultSettings, type settingsValueType } from "../../src/settings";
import buildDataView from "./buildDataView";

export type SettingsOverrides = { [K in keyof settingsValueType]?: Partial<settingsValueType[K]> };

export function settingsWith(overrides: SettingsOverrides): settingsValueType {
  const result: settingsValueType = { ...defaultSettings };
  const cards = Object.keys(overrides) as (keyof settingsValueType)[];
  for (let i = 0; i < cards.length; i++) {
    const key = cards[i];
    (result as Record<string, object>)[key] = { ...result[key], ...overrides[key] };
  }
  return result;
}

export type RenderOptions = {
  host?: powerbi.extensibility.visual.IVisualHost;
  /** Stored click splits, as 0-based segment ends */
  splitIndexes?: number[];
  /** Adjusts each data view before the update, e.g. column types */
  prepare?: (dataView: powerbi.DataView) => void;
};

export type Rendered = {
  element: HTMLElement;
  visual: Visual;
  update: (settings: settingsValueType | settingsValueType[], args?: Parameters<typeof buildDataView>[0]) => void;
};

/** A 500px visual, removed when the test finishes; later updates reuse the data unless given new data */
export function renderVisual(settings: settingsValueType | settingsValueType[], args: Parameters<typeof buildDataView>[0],
                             options: RenderOptions = {}): Rendered {
  const element = testDom("500", "500");
  onTestFinished(() => element.remove());
  const visual = new Visual({ element, host: options.host ?? createVisualHost({}) });
  let current = args;
  const update = (next: settingsValueType | settingsValueType[], nextArgs = current): void => {
    current = nextArgs;
    const dataView = buildDataView(nextArgs, next);
    dataView.metadata.objects = {
      split_indexes_storage: { split_indexes: JSON.stringify(options.splitIndexes ?? []) }
    };
    options.prepare?.(dataView);
    visual.update({ dataViews: [dataView], viewport: { width: 500, height: 500 }, type: 2 });
  };
  update(settings);
  return { element, visual, update };
}

export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error("Missing element");
  }
  return value;
}
