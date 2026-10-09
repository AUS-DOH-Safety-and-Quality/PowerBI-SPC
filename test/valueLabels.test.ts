import { describe, expect, it, vi } from "vitest";
import type powerbi from "powerbi-visuals-api";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { trianglePath } from "powerbi-visuals-core/rendering";
import { Visual } from "../src/visual";
import type { plotData } from "../src/Classes/viewModelClass";
import { defaultSettings, type settingsValueType } from "../src/settings";
import buildDataView, { sequentialKeys } from "./helpers/buildDataView";

const numerators = [10, 12, 16, 22, 30, 34, 40, 48];
const labels = ["One", "", "Three", "Four", "Five", "Six", "Seven", "Eight"];

function labelledView(overrides: Partial<settingsValueType["labels"]>): powerbi.DataView {
  const settings: settingsValueType = {
    ...defaultSettings,
    spc: { ...defaultSettings.spc, chart_type: "i" },
    labels: { ...defaultSettings.labels, ...overrides }
  };
  return buildDataView({ key: sequentialKeys(numerators.length), numerators, labels }, settings);
}

function render(element: HTMLElement, overrides: Partial<settingsValueType["labels"]>, visual = new Visual({ element, host: createVisualHost({}) })): Visual {
  visual.update({ dataViews: [labelledView(overrides)], viewport: { width: 500, height: 500 }, type: 2 });
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
  return { point, x: visual.plotProperties.xScale(point.x) as number, y: visual.plotProperties.yScale(point.value) as number };
}

// Value labels render through Core's shared implementation.
describe("Value labels", () => {
  it("labels points above by default, skips empty labels and anchors the connector at the point", () => {
    const element = testDom("500", "500");
    const visual = render(element, {});
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

  it("labels points below with the bottom placement and honours the vertical offset", () => {
    const element = testDom("500", "500");
    const visual = render(element, { label_position: "bottom", label_y_offset: 40 });
    const y = firstPoint(visual).y;
    const axisY = visual.viewModel.svgHeight - visual.plotProperties.yAxis.start_padding;
    const text = labelGroups(element)[0].querySelector("text");
    expect(attribute(text, "y")).toBeGreaterThan(y);
    expect(attribute(text, "y")).toBeCloseTo(axisY - 40, 6);
  });

  it("applies text, connector and marker styles from the label settings", () => {
    const element = testDom("500", "500");
    render(element, {
      label_size: 13, label_font: "'Arial Black'", label_colour: "#123456",
      label_line_colour: "#654321", label_line_width: 2, label_line_type: "2 5",
      label_marker_size: 4, label_marker_colour: "#abcdef"
    });
    const group = labelGroups(element)[0];
    const text = group.querySelector("text");
    const line = group.querySelector("line");
    const path = group.querySelector("path");
    if (text === null || line === null || path === null) {
      throw new Error("Missing label elements");
    }
    expect(text.style.fontSize).toBe("13px");
    expect(text.style.fontFamily).toContain("Arial Black");
    expect(text.style.fill).toBe("rgb(18, 52, 86)");
    expect(line.style.stroke).toBe("rgb(101, 67, 33)");
    expect(line.style.strokeWidth).toBe("2");
    expect(line.style.strokeDasharray).toMatch(/^2,? 5$/);
    expect(path.style.fill).toBe("rgb(171, 205, 239)");
    expect(path.getAttribute("d")).toBe(trianglePath(16));
  });

  // The marker switch is honoured; the connector still ends at the marker position.
  it("omits the marker when the marker switch is off", () => {
    const element = testDom("500", "500");
    render(element, { label_marker_show: false });
    const group = labelGroups(element)[0];
    expect(group.querySelector("path")).toBeNull();
    expect(group.querySelector("line")).not.toBeNull();
    expect(group.querySelector("text")?.textContent).toBe("One");
  });

  it("removes and restores labels with the visibility switch and survives repeated redraws", () => {
    const element = testDom("500", "500");
    const visual = render(element, { show_labels: false });
    expect(element.querySelector(".text-labels")).toBeNull();
    render(element, {}, visual);
    expect(labelGroups(element)).toHaveLength(labels.length - 1);
    visual.drawVisual();
    visual.drawVisual();
    expect(labelGroups(element)).toHaveLength(labels.length - 1);
    expect(element.querySelectorAll(".text-labels")).toHaveLength(1);
  });

  it("redraws a label at its stored angle and distance", () => {
    const element = testDom("500", "500");
    const visual = render(element, {});
    const first = firstPoint(visual);
    const point = first.point;
    const x = first.x;
    const y = first.y;
    point.label.angle = 0;
    point.label.distance = 7;
    visual.drawVisual();
    const text = labelGroups(element)[0].querySelector("text");
    expect(attribute(text, "x")).toBeCloseTo(x + 7, 6);
    expect(attribute(text, "y")).toBeCloseTo(y, 6);
  });

  it("drags a label in SVG coordinates, updates the point and detaches on pointer cancel", () => {
    const element = testDom("500", "500");
    const capture = vi.spyOn(Element.prototype, "setPointerCapture").mockImplementation(() => undefined);
    const release = vi.spyOn(Element.prototype, "releasePointerCapture").mockImplementation(() => undefined);
    try {
      const visual = render(element, { label_marker_offset: 20 });
      const svg = element.querySelector("svg");
      if (svg === null) {
        throw new Error("Missing svg");
      }
      const group = labelGroups(element)[0];
      const first = firstPoint(visual);
      const point = first.point;
      const pointX = first.x;
      const pointY = first.y;
      expect(group.style.touchAction).toBe("none");

      group.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1, bubbles: true }));
      expect(capture).toHaveBeenCalledWith(1);
      const rect = svg.getBoundingClientRect();
      const clientX = rect.left + 300;
      const clientY = rect.top + 200;
      const svgPoint = svg.createSVGPoint();
      svgPoint.x = clientX;
      svgPoint.y = clientY;
      const ctm = svg.getScreenCTM();
      if (ctm === null) {
        throw new Error("Missing CTM");
      }
      const expected = svgPoint.matrixTransform(ctm.inverse());
      group.dispatchEvent(new PointerEvent("pointermove", { pointerId: 1, clientX, clientY }));
      const expectedAngle = Math.atan2(expected.y - pointY, expected.x - pointX) * 180 / Math.PI;
      expect(point.label.angle).toBeCloseTo(expectedAngle, 6);
      expect(point.label.distance).toBeCloseTo(Math.hypot(expected.x - pointX, expected.y - pointY), 6);
      const text = group.querySelector("text");
      expect(attribute(text, "x")).toBeCloseTo(expected.x, 6);
      expect(attribute(text, "y")).toBeCloseTo(expected.y, 6);
      // The marker keeps the configured offset (20 + font size 10 / 2) while dragging
      const line = group.querySelector("line");
      const radians = expectedAngle * Math.PI / 180;
      expect(attribute(line, "x2")).toBeCloseTo(pointX + 25 * Math.cos(radians), 6);
      expect(attribute(line, "y2")).toBeCloseTo(pointY + 25 * Math.sin(radians), 6);

      group.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 1 }));
      expect(release).toHaveBeenCalledWith(1);
      group.dispatchEvent(new PointerEvent("pointermove", { pointerId: 1, clientX: clientX + 50, clientY }));
      expect(point.label.angle).toBeCloseTo(expectedAngle, 6);

      visual.drawVisual();
      const redrawn = labelGroups(element)[0].querySelector("text");
      expect(attribute(redrawn, "x")).toBeCloseTo(expected.x, 6);
      expect(attribute(redrawn, "y")).toBeCloseTo(expected.y, 6);
    } finally {
      capture.mockRestore();
      release.mockRestore();
    }
  });

  it("attaches no drag handlers when rendering headless", () => {
    const element = testDom("500", "500");
    const visual = new Visual({ element, host: createVisualHost({}) });
    visual.update({
      dataViews: [labelledView({})], viewport: { width: 500, height: 500 }, type: 2, headless: true
    });
    const group = labelGroups(element)[0];
    expect(group.style.touchAction).toBe("");
    group.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1, bubbles: true }));
    group.dispatchEvent(new PointerEvent("pointermove", { pointerId: 1, clientX: 300, clientY: 200 }));
    expect(firstPoint(visual).point.label.angle).toBeUndefined();
  });
});
