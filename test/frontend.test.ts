import { expect, it } from "vitest";
import { frontend } from "../src/frontend";
import { renderVisual, settingsWith } from "./helpers/renderVisual";
import { sequentialKeys } from "./helpers/buildDataView";

it("returns flat limits with the original indicator values", () => {
  const numerators = [5, 6, 5, 7, 6, 5, 4];
  const rendered = renderVisual(settingsWith({}), {
    key: [...sequentialKeys(7), ...sequentialKeys(7)],
    numerators: [...numerators, ...numerators],
    indicator: [...Array<string>(7).fill(""), ...Array<string>(7).fill("B")]
  });
  const result = frontend.limits(rendered.visual);
  expect(result.limits).toHaveLength(14);
  expect(result).toHaveProperty(["limits", "6", "Indicator"], "");
  expect(result).toHaveProperty(["limits", "6", "value"], 4);
  expect(result).toHaveProperty(["limits", "13", "Indicator"], "B");
  expect(result).toHaveProperty(["limits", "13", "value"], 4);
});
