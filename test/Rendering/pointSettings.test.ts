import { describe, expect, it, vi } from "vitest";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import type { settingsValueType } from "../../src/settings";
import { sequentialKeys } from "../helpers/buildDataView";
import { renderVisual, settingsWith } from "../helpers/renderVisual";
import { must } from "powerbi-visuals-core/testing";

type Outliers = settingsValueType["outliers"];
type Status = "improvement" | "deterioration" | "neutral_low" | "neutral_high";
type Pattern = "ast" | "shift" | "trend" | "twointhree";

const numerators = [10, 12, 16, 22, 30, 34, 40, 48, 52];
const data = { key: sequentialKeys(numerators.length), numerators };

/** Every pattern fires in both directions, several points under more than one pattern */
const flagged = [10, 11, 9, 10, 11, 9, 30, 10, 12, 13, 14, 15, 16, 10, 9, 11, 3, 4, 3, 4, 10, 8, 7, 6, 5, 4, 10, -12, 10, 11];
const flaggedData = { key: sequentialKeys(flagged.length), numerators: flagged };
const patterns: Pattern[] = ["ast", "shift", "trend", "twointhree"];
const statuses: Status[] = ["improvement", "deterioration", "neutral_low", "neutral_high"];

/** A distinct colour for each pattern and status */
function flagColour(pattern: Pattern, status: Status): string {
  return `#${(patterns.indexOf(pattern) + 1).toString(16)}0${(statuses.indexOf(status) + 1).toString(16)}0a0`;
}

function rgb(hex: string): string {
  const value = parseInt(hex.slice(1), 16);
  return `rgb(${value >> 16}, ${(value >> 8) & 255}, ${value & 255})`;
}

function colouredOutliers(overrides: Partial<Outliers>): Partial<Outliers> {
  const result: Partial<Outliers> = {
    astronomical: true, shift: true, shift_n: 4, trend: true, trend_n: 4, two_in_three: true, ...overrides
  };
  for (let p = 0; p < patterns.length; p++) {
    for (let s = 0; s < statuses.length; s++) {
      Object.assign(result, { [`${patterns[p]}_colour_${statuses[s]}`]: flagColour(patterns[p], statuses[s]) });
    }
  }
  return result;
}

function dots(element: HTMLElement): NodeListOf<SVGPathElement> {
  return element.querySelectorAll<SVGPathElement>(".dotsgroup path");
}

describe("scatter settings", () => {
  it("removes the dots but keeps the lines when the scatter is hidden", () => {
    const rendered = renderVisual(settingsWith({ scatter: { show_dots: false } }), data);
    expect(dots(rendered.element)).toHaveLength(0);
    expect(rendered.element.querySelector(".values-linegroup path")).not.toBeNull();
    rendered.update(settingsWith({}));
    expect(dots(rendered.element)).toHaveLength(numerators.length);
  });

  it("draws each dot with the configured fill, outline and outline width", () => {
    const element = renderVisual(settingsWith({ scatter: { colour: "#123456", colour_outline: "#654321", width_outline: 3 } }), data).element;
    const drawn = dots(element);
    for (let i = 0; i < drawn.length; i++) {
      expect(drawn[i].style.fill).toBe("rgb(18, 52, 86)");
      expect(drawn[i].style.stroke).toBe("rgb(101, 67, 33)");
      expect(drawn[i].style.strokeWidth).toBe("3");
    }
  });

  it("draws every dot in the high-contrast foreground colour", () => {
    const host = createVisualHost({});
    Object.assign(host.colorPalette, { isHighContrast: true, foreground: { value: "#abcdef" } });
    const drawn = dots(renderVisual(settingsWith({ scatter: { colour: "#123456" } }), data, { host }).element);
    expect(drawn).toHaveLength(numerators.length);
    for (let i = 0; i < drawn.length; i++) {
      expect(drawn[i].style.fill).toBe("rgb(171, 205, 239)");
    }
  });

  // Size is the marker radius, so a circle spans twice it and a square of equal area its root-pi multiple
  it.each([2, 6])("draws distinct shapes sized by a size of %d", size => {
    const shapes = ["Circle", "Cross", "Diamond", "Square", "Star", "Triangle", "Wye"] as const;
    const paths = new Set<string>();
    const widths: Record<string, number> = {};
    for (let i = 0; i < shapes.length; i++) {
      const dot = dots(renderVisual(settingsWith({ scatter: { shape: shapes[i], size } }), data).element)[0];
      paths.add(must(dot.getAttribute("d")));
      widths[shapes[i]] = dot.getBBox().width;
    }
    expect(paths.size).toBe(shapes.length);
    expect(widths.Circle).toBeCloseTo(2 * size, 3);
    expect(widths.Square).toBeCloseTo(size * Math.sqrt(Math.PI), 3);
  });

  it("styles each dot from its own row's conditional formatting", () => {
    const rows = new Array<settingsValueType>(numerators.length);
    for (let i = 0; i < rows.length; i++) {
      rows[i] = settingsWith({ scatter: { colour: i % 2 === 0 ? "#111111" : "#222222", size: i % 2 === 0 ? 2 : 5 } });
    }
    const drawn = dots(renderVisual(rows, data).element);
    for (let i = 0; i < drawn.length; i++) {
      expect(drawn[i].style.fill).toBe(i % 2 === 0 ? "rgb(17, 17, 17)" : "rgb(34, 34, 34)");
      expect(drawn[i].getBBox().width).toBeCloseTo(i % 2 === 0 ? 4 : 10, 3);
    }
  });
});

describe("outlier colours", () => {
  // Precedence runs shift, trend, two-in-three, astronomical; each later pattern overrides the earlier
  it.each([
    {
      direction: "increase",
      expected: [
        [0, undefined], [6, ["ast", "improvement"]], [7, ["trend", "improvement"]], [9, ["twointhree", "improvement"]],
        [11, ["ast", "improvement"]], [13, ["shift", "improvement"]], [14, undefined], [16, ["ast", "deterioration"]],
        [17, ["twointhree", "deterioration"]], [21, ["trend", "deterioration"]], [24, ["twointhree", "deterioration"]],
        [27, ["ast", "deterioration"]]
      ]
    },
    {
      direction: "neutral",
      expected: [
        [0, undefined], [6, ["ast", "neutral_high"]], [7, ["trend", "neutral_high"]], [9, ["twointhree", "neutral_high"]],
        [13, ["shift", "neutral_high"]], [16, ["ast", "neutral_low"]], [17, ["twointhree", "neutral_low"]],
        [21, ["trend", "neutral_low"]], [27, ["ast", "neutral_low"]]
      ]
    }
  ] as const)("fills and outlines flagged dots with the winning pattern's $direction colour", ({ direction, expected }) => {
    const element = renderVisual(settingsWith({
      scatter: { colour: "#a6a6a6", colour_outline: "#a6a6a6" },
      outliers: colouredOutliers({ improvement_direction: direction })
    }), flaggedData).element;
    const drawn = dots(element);
    for (let i = 0; i < expected.length; i++) {
      const index = expected[i][0];
      const flag: readonly [Pattern, Status] | undefined = expected[i][1];
      const colour = flag === undefined ? "rgb(166, 166, 166)" : rgb(flagColour(flag[0], flag[1]));
      expect(drawn[index].style.fill, `point ${index}`).toBe(colour);
      expect(drawn[index].style.stroke, `point ${index}`).toBe(colour);
    }
  });

  // An increase-improving high point and a low point beyond the 3-sigma limits (indexes 6 and 16)
  it.each([
    { direction: "increase", type: "both", high: "improvement", low: "deterioration" },
    { direction: "increase", type: "improvement", high: "improvement", low: undefined },
    { direction: "increase", type: "deterioration", high: undefined, low: "deterioration" },
    { direction: "decrease", type: "both", high: "deterioration", low: "improvement" },
    { direction: "decrease", type: "improvement", high: undefined, low: "improvement" },
    { direction: "decrease", type: "deterioration", high: "deterioration", low: undefined },
    { direction: "neutral", type: "both", high: "neutral_high", low: "neutral_low" },
    // A neutral direction has no improvement or deterioration to filter by, so flags both sides
    { direction: "neutral", type: "improvement", high: "neutral_high", low: "neutral_low" },
    { direction: "neutral", type: "deterioration", high: "neutral_high", low: "neutral_low" }
  ] as const)("flags $type changes for an improvement direction of $direction", ({ direction, type, high, low }) => {
    const rendered = renderVisual(settingsWith({
      scatter: { colour: "#a6a6a6" },
      outliers: colouredOutliers({ improvement_direction: direction, process_flag_type: type, shift: false, trend: false, two_in_three: false })
    }), flaggedData);
    const drawn = dots(rendered.element);
    const astpoint = rendered.visual.viewModel.outliers[0].astpoint;
    expect(astpoint[6]).toBe(high ?? "none");
    expect(astpoint[16]).toBe(low ?? "none");
    expect(drawn[6].style.fill).toBe(high === undefined ? "rgb(166, 166, 166)" : rgb(flagColour("ast", high)));
    expect(drawn[16].style.fill).toBe(low === undefined ? "rgb(166, 166, 166)" : rgb(flagColour("ast", low)));
  });
});

describe("split on click", () => {
  it("stores a click split for the clicked point and removes it on a second click", () => {
    const host = createVisualHost({ allowInteractions: true });
    const persist = vi.spyOn(host, "persistProperties");
    const rendered = renderVisual(settingsWith({ spc: { split_on_click: true } }), data, { host });
    const select = vi.spyOn(rendered.visual.selectionManager, "select");
    const stored = (indexes: string) => ({
      replace: [{ objectName: "split_indexes_storage", selector: {}, properties: { split_indexes: indexes } }]
    });
    dots(rendered.element)[3].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(persist).toHaveBeenLastCalledWith(stored("[3]"));
    dots(rendered.element)[5].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(persist).toHaveBeenLastCalledWith(stored("[3,5]"));
    dots(rendered.element)[3].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(persist).toHaveBeenLastCalledWith(stored("[5]"));
    expect(select).not.toHaveBeenCalled();
  });

  it("selects the clicked point instead when splitting is off", () => {
    const host = createVisualHost({ allowInteractions: true });
    const persist = vi.spyOn(host, "persistProperties");
    const rendered = renderVisual(settingsWith({}), data, { host });
    const select = vi.spyOn(rendered.visual.selectionManager, "select");
    dots(rendered.element)[3].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(persist).not.toHaveBeenCalled();
    expect(select).toHaveBeenCalledWith(rendered.visual.viewModel.plotPoints[3].identity, false);
  });
});
