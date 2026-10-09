import { expect, it } from "vitest";
import settingsModel, { defaultSettings } from "../src/settings";
import { createDefaultValues } from "powerbi-visuals-core/settings";
import { buildFormattingModel, readSettingsRows } from "powerbi-visuals-core/powerbi";

it("resolves the formatting contracts through the installed Core package", () => {
  const defaults = createDefaultValues(settingsModel);
  expect(defaultSettings).toEqual(defaults);
  const rows = readSettingsRows(settingsModel.canvas, "canvas", defaults.canvas, {
    objects: [{ canvas: { lower_padding: 0, show_errors: false } }]
  }, [0]);
  expect(rows.values[0]).toMatchObject({ lower_padding: 0, show_errors: false });
  const pane = buildFormattingModel(settingsModel, { ...defaults, canvas: rows.values[0] });
  expect(pane.cards[0].uid).toBe("canvas_card_uid");
  expect(pane.cards).toHaveLength(Object.keys(defaultSettings).length);
});
