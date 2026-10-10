import { describe, expect, it } from "vitest";
import type { settingsValueType } from "../../src/settings";
import { rep } from "powerbi-visuals-core/math";
import { sequentialKeys } from "../helpers/buildDataView";
import { must, renderVisual, settingsWith } from "../helpers/renderVisual";

type Icons = settingsValueType["nhs_icons"];
type Location = Icons["variation_icons_locations"];

// An improvement (50) and a deterioration (-30) before a common-cause last point
const mixed = [10, 10, 11, 10, 9, 10, 50, 10, 11, 10, 9, 10, -30, 10, 10];
const data = { key: sequentialKeys(mixed.length), numerators: mixed };
const locations: Location[] = ["Top Right", "Bottom Right", "Top Left", "Bottom Left"];

function render(icons: Partial<Icons>, overrides: Parameters<typeof settingsWith>[0] = {}) {
  return renderVisual(settingsWith({
    ...overrides,
    outliers: { astronomical: true, ...overrides.outliers },
    lines: { show_alt_target: true, alt_target: 100, ...overrides.lines },
    nhs_icons: icons
  }), data);
}

/** Drawn icons in order, with their boxes relative to the svg */
function icons(element: HTMLElement): { name: string; box: DOMRect }[] {
  const svg = must(element.querySelector("svg")).getBoundingClientRect();
  const groups = element.querySelectorAll<SVGGElement>("svg > .icongroup");
  const result: { name: string; box: DOMRect }[] = [];
  for (let i = 0; i < groups.length; i++) {
    const rect = must(groups[i].querySelector(":scope > g > rect")).getBoundingClientRect();
    result.push({
      name: must(groups[i].querySelector(":scope > g")?.getAttribute("class")),
      box: new DOMRect(rect.x - svg.x, rect.y - svg.y, rect.width, rect.height)
    });
  }
  return result;
}

function iconNames(drawn: { name: string }[]): string[] {
  const names = new Array<string>(drawn.length);
  for (let i = 0; i < drawn.length; i++) {
    names[i] = drawn[i].name;
  }
  return names;
}

function expectInCorner(box: DOMRect, location: Location): void {
  if (location.includes("Right")) {
    expect(box.right).toBeCloseTo(500, 3);
  } else {
    expect(box.left).toBeCloseTo(0, 3);
  }
  if (location.includes("Bottom")) {
    expect(box.bottom).toBeCloseTo(500, 3);
  } else {
    expect(box.top).toBeCloseTo(0, 3);
  }
}

describe("chart NHS icons", () => {
  it("draws no icons unless requested", () => {
    expect(icons(render({}).element)).toHaveLength(0);
  });

  it.each(locations)("places the variation icons in the %s corner, scaled by their setting", location => {
    const scalings = [1, 1.5];
    for (let s = 0; s < scalings.length; s++) {
      const scaling = scalings[s];
      const drawn = icons(render({ show_variation_icons: true, flag_last_point: false, variation_icons_locations: location, variation_icons_scaling: scaling }).element);
      expect(iconNames(drawn)).toEqual(["improvementHigh", "concernLow"]);
      // Icons are 8% of the canvas height, side by side from the corner inwards
      for (let i = 0; i < drawn.length; i++) {
        expect(drawn[i].box.width).toBeCloseTo(40 * scaling, 3);
        expect(drawn[i].box.height).toBeCloseTo(40 * scaling, 3);
      }
      expectInCorner(drawn[0].box, location);
      const step = location.includes("Right") ? -40 * scaling : 40 * scaling;
      expect(drawn[1].box.left - drawn[0].box.left).toBeCloseTo(step, 3);
      expect(drawn[1].box.top).toBeCloseTo(drawn[0].box.top, 3);
    }
  });

  it.each([
    { flag_last_point: true, direction: "increase", expected: ["commonCause"] },
    { flag_last_point: false, direction: "increase", expected: ["improvementHigh", "concernLow"] },
    { flag_last_point: false, direction: "decrease", expected: ["improvementLow", "concernHigh"] },
    { flag_last_point: false, direction: "neutral", expected: ["neutralLow", "neutralHigh"] }
  ] as const)("draws $expected with flag_last_point=$flag_last_point and a $direction direction", ({ flag_last_point, direction, expected }) => {
    const drawn = icons(render({ show_variation_icons: true, flag_last_point }, { outliers: { improvement_direction: direction } }).element);
    expect(iconNames(drawn)).toEqual(expected);
  });

  it.each(locations)("places the assurance icon in the %s corner, scaled by its setting", location => {
    const drawn = icons(render({ show_assurance_icons: true, assurance_icons_locations: location, assurance_icons_scaling: 0.5 }).element);
    expect(drawn).toHaveLength(1);
    expect(drawn[0].name).toBe("consistentFail");
    expect(drawn[0].box.width).toBeCloseTo(20, 3);
    expectInCorner(drawn[0].box, location);
  });

  it.each(locations)("sets the assurance icon beside variation icons sharing the %s corner", location => {
    const drawn = icons(render({
      show_variation_icons: true, flag_last_point: false, variation_icons_locations: location,
      show_assurance_icons: true, assurance_icons_locations: location
    }).element);
    expect(iconNames(drawn)).toEqual(["improvementHigh", "concernLow", "consistentFail"]);
    const step = location.includes("Right") ? -40 : 40;
    expect(drawn[2].box.left - drawn[1].box.left).toBeCloseTo(step, 3);
  });

  it("keeps the assurance icon in its own corner when the variation icons are elsewhere", () => {
    const drawn = icons(render({
      show_variation_icons: true, flag_last_point: false, variation_icons_locations: "Top Right",
      show_assurance_icons: true, assurance_icons_locations: "Bottom Left"
    }).element);
    expect(drawn).toHaveLength(3);
    expectInCorner(drawn[2].box, "Bottom Left");
  });

  it.each([
    { label: "a passed target with an increase direction", lines: { alt_target: -100 }, outliers: {}, expected: "consistentPass" },
    { label: "a failed target with a decrease direction", lines: { alt_target: -100 }, outliers: { improvement_direction: "decrease" }, expected: "consistentFail" },
    { label: "a target within the limits", lines: { alt_target: 10 }, outliers: {}, expected: "inconsistent" }
  ] as const)("draws the assurance icon for $label", ({ lines, outliers, expected }) => {
    const drawn = icons(render({ show_assurance_icons: true }, { lines, outliers }).element);
    expect(drawn).toHaveLength(1);
    expect(drawn[0].name).toBe(expected);
  });

  it.each([
    { label: "a neutral direction", overrides: { outliers: { improvement_direction: "neutral" } } },
    { label: "a hidden alt. target", overrides: { lines: { show_alt_target: false } } },
    { label: "a run chart", overrides: { spc: { chart_type: "run" } } }
  ] as const)("draws no assurance icon for $label", ({ overrides }) => {
    const rendered = render({ show_assurance_icons: true }, overrides);
    expect(rendered.element.querySelector(".errormessage")).toBeNull();
    expect(icons(rendered.element)).toHaveLength(0);
  });

  // Proportions near 50% are shown as percentages, so an unscaled alt. target is read as a percentage
  it.each([
    { alt_target: 90, multiplier_alt_target: false, expected: "consistentFail" },
    { alt_target: 0.9, multiplier_alt_target: true, expected: "consistentFail" },
    { alt_target: 0.9, multiplier_alt_target: false, expected: "consistentPass" }
  ])("compares an alt. target of $alt_target with multiplier_alt_target=$multiplier_alt_target in display units", ({ alt_target, multiplier_alt_target, expected }) => {
    const proportions = [48, 52, 50, 47, 53, 49, 51, 50, 46, 54];
    const element = renderVisual(settingsWith({
      spc: { chart_type: "p" },
      lines: { show_alt_target: true, alt_target, multiplier_alt_target },
      nhs_icons: { show_assurance_icons: true }
    }), { key: sequentialKeys(proportions.length), numerators: proportions, denominators: rep(100, proportions.length) }).element;
    expect(iconNames(icons(element))).toEqual([expected]);
  });

  it("rejects variation icons without any outlier pattern to draw them from", () => {
    const element = renderVisual(settingsWith({ nhs_icons: { show_variation_icons: true } }), data).element;
    const texts = element.querySelectorAll(".errormessage text");
    expect(texts[texts.length - 1].textContent).toBe("Variation icons require at least one outlier pattern to be selected");
    expect(icons(element)).toHaveLength(0);
  });
});
