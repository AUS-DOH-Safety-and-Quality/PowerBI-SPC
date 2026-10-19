import { describe, expect, it } from "vitest";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../src/visual";
import type { plotData } from "../src/Classes/viewModelClass";
import { defaultSettings, type settingsValueType } from "../src/settings";
import buildDataView, { sequentialKeys } from "./helpers/buildDataView";
import { updateType } from "powerbi-visuals-core/powerbi";

const numerators = [10, 12, 16, 22, 30, 34, 40, 48];
const labels = ["One", "", "Three", "Four", "Five", "Six", "Seven", "Eight"];

function render(element: HTMLElement): Visual {
  const settings: settingsValueType = { ...defaultSettings, spc: { ...defaultSettings.spc, chart_type: "i" } };
  const visual = new Visual({ element, host: createVisualHost({}) });
  visual.update({
    dataViews: [buildDataView({ key: sequentialKeys(numerators.length), numerators, labels }, settings)],
    viewport: { width: 500, height: 500 },
    type: updateType.data
  });
  return visual;
}

function labelGroups(element: HTMLElement): NodeListOf<SVGGElement> {
  return element.querySelectorAll<SVGGElement>(".text-labels .text-group-inner");
}

function attribute(element: Element | null, name: string): number {
  if (element === null) {
    throw new Error(`Missing element for ${name}`);
  }
  return Number(element.getAttribute(name));
}

function firstPoint(visual: Visual): { point: plotData; x: number; y: number } {
  const point = visual.viewModel.plotPoints[0];
  return { point, x: visual.plotProperties.xScale(point.x), y: visual.plotProperties.yScale(point.value) };
}

// Value labels render through Core's shared implementation; this checks the labels column reaches it.
describe("Value labels", () => {
  it("labels points above by default, skips empty labels and anchors the connector at the point", () => {
    const element = testDom("500", "500");
    const visual = render(element);
    const groups = labelGroups(element);
    expect(groups).toHaveLength(labels.length - 1);
    const first = firstPoint(visual);
    const x = first.x;
    const y = first.y;
    const text = groups[0].querySelector("text");
    expect(text?.textContent).toBe("One");
    expect(attribute(text, "x")).toBeCloseTo(x, 6);
    expect(attribute(text, "y")).toBeLessThan(y);
    const line = groups[0].querySelector("line");
    expect(attribute(line, "x1")).toBeCloseTo(x, 6);
    expect(attribute(line, "y2")).toBeCloseTo(y - 10, 6);
    expect(groups[1].querySelector("text")?.textContent).toBe("Three");
  });
});

describe("Value label connecting line", () => {
  it("draws the connecting line with the configured dash pattern", () => {
    const settings: settingsValueType = {
      ...defaultSettings,
      spc: { ...defaultSettings.spc, chart_type: "i" },
      labels: { ...defaultSettings.labels, label_line_type: "2 5", label_line_width: 3, label_line_colour: "#123456" }
    };
    const element = testDom("500", "500");
    const visual = new Visual({ element, host: createVisualHost({}) });
    visual.update({
      dataViews: [buildDataView({ key: sequentialKeys(numerators.length), numerators, labels }, settings)],
      viewport: { width: 500, height: 500 },
      type: updateType.data
    });
    const probe = document.createElementNS("http://www.w3.org/2000/svg", "line");
    probe.style.setProperty("stroke-dasharray", "2 5");
    const defaultProbe = document.createElementNS("http://www.w3.org/2000/svg", "line");
    defaultProbe.style.setProperty("stroke-dasharray", defaultSettings.labels.label_line_type);
    expect(probe.style.strokeDasharray).not.toBe(defaultProbe.style.strokeDasharray);
    const lines = element.querySelectorAll<SVGLineElement>(".text-labels .text-group-inner line");
    expect(lines).toHaveLength(labels.length - 1);
    for (let i = 0; i < lines.length; i++) {
      expect(lines[i].style.strokeDasharray).toBe(probe.style.strokeDasharray);
      expect(lines[i].style.strokeWidth).toBe("3");
      expect(lines[i].style.stroke).toBe("rgb(18, 52, 86)");
    }
    element.remove();
  });
});
