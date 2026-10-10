import { describe, expect, it } from "vitest";
import type { settingsValueType } from "../../src/settings";
import { sequentialKeys } from "../helpers/buildDataView";
import { must, renderVisual, settingsWith, type SettingsOverrides } from "../helpers/renderVisual";

type Axis = "x" | "y";

const numerators = [10, 12, 16, 22, 30, 34, 40, 48, 52];
const data = { key: sequentialKeys(numerators.length), numerators };
const axes: Axis[] = ["x", "y"];

/** `<axis>limit_<setting>` overrides for one axis card */
function axisOverrides(axis: Axis, values: Readonly<Record<string, string | number | boolean>>, others: SettingsOverrides = {}): settingsValueType {
  const x: Partial<settingsValueType["x_axis"]> = { ...others.x_axis };
  const y: Partial<settingsValueType["y_axis"]> = { ...others.y_axis };
  const card = axis === "x" ? x : y;
  const names = Object.keys(values);
  for (let i = 0; i < names.length; i++) {
    Object.assign(card, { [`${axis}limit_${names[i]}`]: values[names[i]] });
  }
  return settingsWith({ ...others, x_axis: x, y_axis: y });
}

function tickTexts(element: HTMLElement, axis: Axis): SVGTextElement[] {
  return Array.from(element.querySelectorAll<SVGTextElement>(`.${axis}axisgroup .tick text`));
}

function translation(element: Element): { x: number; y: number } | undefined {
  const match = must(element.getAttribute("transform")).match(/^translate\(([^,]+),\s*([^)]+)\)$/);
  return match === null ? undefined : { x: Number(match[1]), y: Number(match[2]) };
}

describe("axis settings", () => {
  it.each(axes)("styles the %s axis line, ticks, title and gridlines from its settings", axis => {
    const rendered = renderVisual(axisOverrides(axis, {
      colour: "#112233", tick_font: "Georgia", tick_size: 13, tick_colour: "#445566", tick_rotation: 20,
      label: "Title", label_font: "Verdana", label_size: 15, label_colour: "#778899", label_style: "italic",
      grid_show: true, grid_colour: "#aabbcc", grid_width: 3
    }), data);
    const element = rendered.element;
    expect(must(element.querySelector(`.${axis}axisgroup`)).getAttribute("color")).toBe("#112233");
    const ticks = tickTexts(element, axis);
    expect(ticks.length).toBeGreaterThan(1);
    for (let i = 0; i < ticks.length; i++) {
      expect(ticks[i].style.fontSize).toBe("13px");
      expect(ticks[i].style.fontFamily).toBe("Georgia");
      expect(ticks[i].style.fill).toBe("rgb(68, 85, 102)");
      expect(ticks[i].getAttribute("transform")).toBe("rotate(20)");
    }
    const title = must(element.querySelector<SVGTextElement>(`.${axis}axislabel`));
    expect(title.textContent).toBe("Title");
    expect(title.style.fontFamily).toBe("Verdana");
    expect(title.style.fontSize).toBe("15px");
    expect(title.style.fill).toBe("rgb(119, 136, 153)");
    expect(title.style.fontStyle).toBe("italic");
    const grid = element.querySelectorAll<SVGLineElement>(`.gridgroup .${axis}gridline`);
    expect(grid).toHaveLength(ticks.length);
    for (let i = 0; i < grid.length; i++) {
      expect(grid[i].style.stroke).toBe("rgb(170, 187, 204)");
      expect(grid[i].style.strokeWidth).toBe("3");
    }
    // The other axis keeps its defaults
    const other: Axis = axis === "x" ? "y" : "x";
    expect(must(element.querySelector(`.${other}axisgroup`)).getAttribute("color")).toBe("#000000");
    expect(element.querySelectorAll(`.gridgroup .${other}gridline`)).toHaveLength(0);
  });

  // Only rotated x labels hang from their end; y labels keep d3's placement
  it.each([
    { rotation: -35, anchor: "end" },
    { rotation: 0, anchor: "middle" },
    { rotation: 35, anchor: "start" }
  ])("anchors x tick labels rotated by $rotation at the $anchor", ({ rotation, anchor }) => {
    const rendered = renderVisual(axisOverrides("x", { tick_rotation: rotation }), data);
    const ticks = tickTexts(rendered.element, "x");
    for (let i = 0; i < ticks.length; i++) {
      expect(ticks[i].style.textAnchor).toBe(anchor);
    }
  });

  it.each(axes)("drops the %s tick labels and marks when ticks are off or the count is zero, and caps the count otherwise", axis => {
    const all = tickTexts(renderVisual(axisOverrides(axis, {}), data).element, axis).length;
    const capped = tickTexts(renderVisual(axisOverrides(axis, { tick_count: 2 }), data).element, axis).length;
    expect(capped).toBeGreaterThan(0);
    expect(capped).toBeLessThan(all);
    const off = renderVisual(axisOverrides(axis, { ticks: false }), data).element;
    const zero = renderVisual(axisOverrides(axis, { tick_count: 0 }), data).element;
    const hidden = [off, zero];
    for (let i = 0; i < hidden.length; i++) {
      const element = hidden[i];
      expect(element.querySelectorAll(`.${axis}axisgroup .tick`)).toHaveLength(0);
      expect(element.querySelector(`.${axis}axisgroup path.domain`)).not.toBeNull();
    }
  });

  it.each(axes)("hides the %s tick marks while keeping the labels", axis => {
    const element = renderVisual(axisOverrides(axis, { tick_marks: false }), data).element;
    const marks = element.querySelectorAll<SVGLineElement>(`.${axis}axisgroup .tick line`);
    expect(marks.length).toBeGreaterThan(0);
    for (let i = 0; i < marks.length; i++) {
      expect(marks[i].style.stroke).toBe("none");
    }
    expect(tickTexts(element, axis).length).toBe(marks.length);
  });

  it("labels x ticks with the observation keys", () => {
    const element = renderVisual(settingsWith({}), { key: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon2", "Tue2"], numerators }).element;
    const ticks = tickTexts(element, "x");
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon2", "Tue2"];
    for (let i = 0; i < ticks.length; i++) {
      expect(labels).toContain(ticks[i].textContent);
    }
  });
});

describe("y tick formatting", () => {
  it.each([
    { label: "the y axis decimals", spc: { sig_figs: 1 }, y_axis: { ylimit_sig_figs: 3 }, pattern: /^-?\d+\.\d{3}$/ },
    { label: "the reported decimals when the axis has none", spc: { sig_figs: 1 }, y_axis: {}, pattern: /^-?\d+\.\d$/ },
    { label: "a percentage suffix when reporting percentages", spc: { sig_figs: 0, perc_labels: "Yes" }, y_axis: {}, pattern: /^-?\d+%$/ },
    { label: "no suffix for a plain multiplier", spc: { sig_figs: 0, multiplier: 100 }, y_axis: {}, pattern: /^-?\d+$/ }
  ] as const)("uses $label", ({ spc, y_axis, pattern }) => {
    const ticks = tickTexts(renderVisual(settingsWith({ spc, y_axis }), data).element, "y");
    expect(ticks.length).toBeGreaterThan(1);
    for (let i = 0; i < ticks.length; i++) {
      expect(ticks[i].textContent).toMatch(pattern);
    }
  });

  it("formats proportions as percentages with the y axis decimals", () => {
    const ticks = tickTexts(renderVisual(settingsWith({ spc: { chart_type: "p" }, y_axis: { ylimit_sig_figs: 1 } }),
      { key: data.key, numerators, denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100] }).element, "y");
    for (let i = 0; i < ticks.length; i++) {
      expect(ticks[i].textContent).toMatch(/^\d+\.\d%$/);
    }
  });
});

describe("axis ranges", () => {
  // The limit multiplier stretches the y range away from the centreline by the widest value or 3-sigma limit
  it.each([1, 2])("scales the automatic y range by a limit multiplier of %d", multiplier => {
    const rendered = renderVisual(settingsWith({ y_axis: { limit_multiplier: multiplier } }), data);
    const limits = rendered.visual.viewModel.controlLimits[0];
    const target = must(limits.targets[0]);
    const upper = Math.max(...numerators, must(limits.ul99[0]));
    const lower = Math.min(...numerators, must(limits.ll99[0]));
    const yAxis = rendered.visual.plotProperties.yAxis;
    expect(yAxis.upper).toBeCloseTo(target + (upper - target) * multiplier, 9);
    expect(yAxis.lower).toBeCloseTo(target - (target - lower) * multiplier, 9);
    const ticks = rendered.element.querySelectorAll<SVGGElement>(".yaxisgroup .tick");
    for (let i = 0; i < ticks.length; i++) {
      const y = must(translation(ticks[i])).y;
      expect(y).toBeGreaterThanOrEqual(yAxis.end_padding - 0.5);
      expect(y).toBeLessThanOrEqual(500 - yAxis.start_padding + 0.5);
    }
  });

  it("hides dots and breaks lines that fall outside explicit axis limits", () => {
    const rendered = renderVisual(settingsWith({
      x_axis: { xlimit_l: 1, xlimit_u: 7 },
      y_axis: { ylimit_l: 0, ylimit_u: 45 }
    }), data);
    const dots = rendered.element.querySelectorAll(".dotsgroup path");
    expect(dots).toHaveLength(numerators.length);
    const hidden: number[] = [];
    for (let i = 0; i < dots.length; i++) {
      if (dots[i].getAttribute("transform") === "translate(0, 0) scale(0)") {
        hidden.push(i);
      }
    }
    // Index 0 and 8 fall outside x, 48 (index 7) above y
    expect(hidden).toEqual([0, 7, 8]);
    const path = must(rendered.element.querySelector(".values-linegroup path")).getAttribute("d");
    expect(path?.match(/M/g)).toHaveLength(1);
    expect(path?.match(/L/g)).toHaveLength(5);
    const domain = rendered.visual.plotProperties.yScale.domain();
    expect(domain).toEqual([0, 45]);
  });
});
