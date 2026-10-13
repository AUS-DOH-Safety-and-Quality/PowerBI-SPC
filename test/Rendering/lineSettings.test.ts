import { describe, expect, it } from "vitest";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import { keyedHost, findBy, must } from "powerbi-visuals-core/testing";
import { lineSetting } from "powerbi-visuals-core/settings";
import type { settingsValueType } from "../../src/settings";
import type lineKeys from "../../src/Functions/lineKeys";
import type { LineName } from "../../src/Functions/lineKeys";
import type { Visual } from "../../src/visual";
import { sequentialKeys } from "../helpers/buildDataView";
import { renderVisual, settingsWith } from "../helpers/renderVisual";

type Lines = settingsValueType["lines"];
type LineKey = typeof lineKeys[LineName];

const numerators = [10, 12, 16, 22, 30, 34, 40, 48, 52];
const data = { key: sequentialKeys(numerators.length), numerators };

/** Every line group, the lines it draws and what makes it drawable on an i chart */
const lineGroups: { key: LineKey; names: LineName[]; enable: Partial<Lines> }[] = [
  { key: "main", names: ["values"], enable: {} },
  { key: "target", names: ["target"], enable: {} },
  { key: "alt_target", names: ["alt_target"], enable: { show_alt_target: true, alt_target: 25 } },
  { key: "68", names: ["ll68", "ul68"], enable: { show_68: true } },
  { key: "95", names: ["ll95", "ul95"], enable: {} },
  { key: "99", names: ["ll99", "ul99"], enable: {} },
  { key: "specification", names: ["speclimits_lower", "speclimits_upper"],
    enable: { show_specification: true, specification_lower: 5, specification_upper: 60 } },
  { key: "trend", names: ["trend_line"], enable: { show_trend: true } }
];
/** The alt. target breaks where its value changes rather than at rebaselines */
const rebaselining: typeof lineGroups = [];
for (let i = 0; i < lineGroups.length; i++) {
  if (lineGroups[i].key !== "alt_target") {
    rebaselining.push(lineGroups[i]);
  }
}

/** `<setting>_<key>` overrides for one line group */
function lineOverrides(key: LineKey, values: Readonly<Record<string, string | number | boolean>>): Partial<Lines> {
  const result: Partial<Lines> = {};
  const names = Object.keys(values);
  for (let i = 0; i < names.length; i++) {
    Object.assign(result, { [`${names[i]}_${key}`]: values[names[i]] });
  }
  return result;
}

function lineGroup(element: HTMLElement, name: LineName): SVGGElement | null {
  return element.querySelector<SVGGElement>(`.linesgroup > .${name}-linegroup`);
}

/** Separately drawn runs of a single-path line */
function runs(element: HTMLElement, name: LineName): number {
  return (must(lineGroup(element, name)?.querySelector("path")).getAttribute("d")?.match(/M/g) ?? []).length;
}

function lastPoint(visual: Visual, name: LineName): { x: number; value: number } {
  const points = must(findBy(visual.viewModel.groupedLines, 0, name))[1];
  const last = points[points.length - 1];
  return { x: last.x, value: must(last.line_value) };
}

describe("line settings", () => {
  it.each(lineGroups)("draws $key lines with their own width, dash and colour and removes them when hidden", ({ key, names, enable }) => {
    const rendered = renderVisual(settingsWith({
      lines: { ...enable, ...lineOverrides(key, { width: 3.5, type: "2 5", colour: "#123456" }) }
    }), data);
    const drawn = rendered.element.querySelectorAll(".linesgroup > g").length;
    for (let i = 0; i < names.length; i++) {
      const path = must(lineGroup(rendered.element, names[i])?.querySelector("path"));
      expect(path.getAttribute("stroke"), names[i]).toBe("#123456");
      expect(path.getAttribute("stroke-width"), names[i]).toBe("3.5");
      expect(path.getAttribute("stroke-dasharray"), names[i]).toBe("2 5");
    }
    if (key !== "main") {
      expect(must(lineGroup(rendered.element, "values")?.querySelector("path")).getAttribute("stroke")).toBe("#A6A6A6");
    }

    rendered.update(settingsWith({ lines: { ...enable, ...lineOverrides(key, { show: false }) } }));
    for (let i = 0; i < names.length; i++) {
      expect(lineGroup(rendered.element, names[i]), names[i]).toBeNull();
    }
    expect(rendered.element.querySelectorAll(".linesgroup > g")).toHaveLength(drawn - names.length);
  });

  it.each(lineGroups)("fades $key lines to their own unselected opacity while a point is selected", async ({ key, names, enable }) => {
    const rendered = renderVisual(settingsWith({
      lines: { ...enable, ...lineOverrides(key, { opacity: 0.6, opacity_unselected: 0.3 }) }
    }), data, { host: keyedHost() });
    const other: LineName = key === "main" ? "target" : "values";
    for (let i = 0; i < names.length; i++) {
      expect(must(lineGroup(rendered.element, names[i])).style.strokeOpacity, names[i]).toBe("0.6");
    }
    expect(must(lineGroup(rendered.element, other)).style.strokeOpacity).toBe("1");

    await rendered.visual.selectionManager.select(rendered.visual.viewModel.plotPoints[2].identity);
    rendered.visual.updateHighlighting();
    for (let i = 0; i < names.length; i++) {
      expect(must(lineGroup(rendered.element, names[i])).style.strokeOpacity, names[i]).toBe("0.3");
    }
    expect(must(lineGroup(rendered.element, other)).style.strokeOpacity).toBe("0.2");
  });

  it.each(rebaselining)("breaks $key lines at a rebaseline unless they are connected", ({ key, names, enable }) => {
    const split = renderVisual(settingsWith({ lines: enable }), data, { splitIndexes: [3] });
    const joined = renderVisual(settingsWith({ lines: { ...enable, ...lineOverrides(key, { join_rebaselines: true }) } }), data, { splitIndexes: [3] });
    for (let i = 0; i < names.length; i++) {
      expect(runs(split.element, names[i]), names[i]).toBe(2);
      expect(runs(joined.element, names[i]), names[i]).toBe(1);
    }
  });

  it("breaks the alt. target line where its value changes, not at rebaselines, unless connected", () => {
    function rows(join: boolean): settingsValueType[] {
      const result = new Array<settingsValueType>(numerators.length);
      for (let i = 0; i < result.length; i++) {
        result[i] = settingsWith({ lines: { show_alt_target: true, alt_target: i < 5 ? 20 : 30, join_rebaselines_alt_target: join } });
      }
      return result;
    }
    const constant = renderVisual(settingsWith({ lines: { show_alt_target: true, alt_target: 20 } }), data, { splitIndexes: [3] });
    expect(runs(constant.element, "alt_target")).toBe(1);
    expect(runs(renderVisual(rows(false), data).element, "alt_target")).toBe(2);
    expect(runs(renderVisual(rows(true), data).element, "alt_target")).toBe(1);
  });

  it("draws each segment in its own row's style when conditional formatting varies along a line", () => {
    const rows = new Array<settingsValueType>(numerators.length);
    for (let i = 0; i < rows.length; i++) {
      rows[i] = settingsWith({ lines: { colour_99: i < 4 ? "#111111" : "#222222", width_99: i < 4 ? 1 : 4 } });
    }
    const rendered = renderVisual(rows, data, { splitIndexes: [3] });
    const group = must(lineGroup(rendered.element, "ul99"));
    expect(group.querySelector("path")).toBeNull();
    const segments = group.querySelectorAll("line");
    expect(segments.length).toBeGreaterThan(0);
    const styles = new Set<string>();
    for (let i = 0; i < segments.length; i++) {
      styles.add(`${segments[i].getAttribute("stroke")} ${segments[i].getAttribute("stroke-width")}`);
    }
    expect([...styles].sort()).toEqual(["#111111 1", "#222222 4"]);
    expect(must(lineGroup(rendered.element, "target")?.querySelector("path")).getAttribute("stroke")).toBe("#000000");
  });

  it("draws every line in the high-contrast foreground colour", () => {
    const host = createVisualHost({});
    Object.assign(host.colorPalette, { isHighContrast: true, foreground: { value: "#abcdef" } });
    const all: Partial<Lines> = {};
    for (let i = 0; i < lineGroups.length; i++) {
      Object.assign(all, lineGroups[i].enable);
    }
    const rendered = renderVisual(settingsWith({ lines: all }), data, { host });
    const paths = rendered.element.querySelectorAll(".linesgroup path");
    expect(paths).toHaveLength(12);
    for (let i = 0; i < paths.length; i++) {
      expect(paths[i].getAttribute("stroke")).toBe("#abcdef");
    }
  });
});

describe("line value labels", () => {
  it.each(lineGroups)("labels the end of each $key line with its own text settings and placement", ({ key, names, enable }) => {
    const rendered = renderVisual(settingsWith({
      lines: {
        ...enable,
        ...lineOverrides(key, {
          plot_label_show: true, plot_label_position: "above", plot_label_vpad: 4, plot_label_hpad: 6,
          plot_label_font: "Georgia", plot_label_size: 13, plot_label_colour: "#123456", plot_label_prefix: "P: "
        })
      }
    }), data);
    const visual = rendered.visual;
    const labels = rendered.element.querySelectorAll<SVGTextElement>(".linesgroup text");
    expect(labels).toHaveLength(names.length);
    const width = lineSetting<number>(visual.viewModel.inputSettings.settings[0].lines, "width", key);
    const format = visual.viewModel.inputSettings.derivedSettings[0].formatValue;
    for (let i = 0; i < names.length; i++) {
      const end = lastPoint(visual, names[i]);
      const label = labels[i];
      expect(label.textContent, names[i]).toBe(`P: ${format(end.value, "value")}`);
      expect(Number(label.getAttribute("x"))).toBeCloseTo(visual.plotProperties.xScale(end.x), 6);
      expect(Number(label.getAttribute("y"))).toBeCloseTo(visual.plotProperties.yScale(end.value), 6);
      expect(label.getAttribute("fill")).toBe("#123456");
      expect(label.getAttribute("font-size")).toBe("13px");
      expect(label.getAttribute("font-family")).toBe("Georgia");
      expect(label.getAttribute("text-anchor")).toBe("end");
      expect(label.getAttribute("dx")).toBe("-6px");
      expect(label.getAttribute("dy")).toBe(`${-4 - width}px`);
    }
  });

  it.each(lineGroups)("labels the last N or every segment end of $key lines", ({ key, names, enable }) => {
    function labelCount(extra: Readonly<Record<string, number | boolean>>): number {
      const rendered = renderVisual(settingsWith({
        lines: { ...enable, ...lineOverrides(key, { plot_label_show: true, ...extra }) }
      }), data, { splitIndexes: [2, 5] });
      return rendered.element.querySelectorAll(".linesgroup text").length;
    }
    expect(labelCount({})).toBe(names.length);
    expect(labelCount({ plot_label_show_n: 2 })).toBe(2 * names.length);
    expect(labelCount({ plot_label_show_n: 5 })).toBe(3 * names.length);
    expect(labelCount({ plot_label_show_n: 2, plot_label_show_all: true })).toBe(3 * names.length);
  });

  it.each(["main", "99"] as const)("labels the end of every re-baselined period when the %s line is joined", joined => {
    const rendered = renderVisual(settingsWith({
      lines: { plot_label_show_99: true, plot_label_show_all_99: true, ...lineOverrides(joined, { join_rebaselines: true }) }
    }), data, { splitIndexes: [2, 5] });
    const frame = rendered.visual.plotProperties;
    const limits = rendered.visual.viewModel.controlLimits[0];
    const format = rendered.visual.viewModel.inputSettings.derivedSettings[0].formatValue;
    const labels = rendered.element.querySelectorAll<SVGTextElement>(".linesgroup text");
    const ends = [2, 5, 8];
    expect(labels).toHaveLength(2 * ends.length);
    for (let i = 0; i < ends.length; i++) {
      const lower = labels[2 * i];
      const upper = labels[2 * i + 1];
      expect(Number(lower.getAttribute("x"))).toBeCloseTo(frame.xScale(limits.keys[ends[i]].x), 6);
      expect(Number(upper.getAttribute("x"))).toBeCloseTo(frame.xScale(limits.keys[ends[i]].x), 6);
      expect(lower.textContent).toBe(format(must(limits.ll99[ends[i]]), "value"));
      expect(upper.textContent).toBe(format(must(limits.ul99[ends[i]]), "value"));
    }
  });

  it("labels each period at its last point inside the axis limits without squashing the plot", () => {
    const x_axis = { xlimit_u: 4 };
    const lines = { plot_label_show_99: true, plot_label_show_all_99: true, plot_label_position_99: "above" } as const;
    const plain = renderVisual(settingsWith({ x_axis }), data, { splitIndexes: [2, 5] }).visual.plotProperties;
    const rendered = renderVisual(settingsWith({ x_axis, lines }), data, { splitIndexes: [2, 5] });
    const frame = rendered.visual.plotProperties;
    expect(frame.xScale.range()).toEqual(plain.xScale.range());
    expect(frame.yScale.range()).toEqual(plain.yScale.range());
    const limits = rendered.visual.viewModel.controlLimits[0];
    const format = rendered.visual.viewModel.inputSettings.derivedSettings[0].formatValue;
    const labels = rendered.element.querySelectorAll<SVGTextElement>(".linesgroup text");
    // The second period ends past the limit and the third lies wholly beyond it
    const ends = [2, 4];
    expect(labels).toHaveLength(2 * ends.length);
    for (let i = 0; i < ends.length; i++) {
      expect(Number(labels[2 * i].getAttribute("x"))).toBeCloseTo(frame.xScale(limits.keys[ends[i]].x), 6);
      expect(labels[2 * i].textContent).toBe(format(must(limits.ll99[ends[i]]), "value"));
      expect(labels[2 * i + 1].textContent).toBe(format(must(limits.ul99[ends[i]]), "value"));
    }
  });

  // Outside and inside are relative to the band, so the lower line of a pair mirrors the upper
  it.each([
    { position: "outside", upperAbove: true },
    { position: "inside", upperAbove: false }
  ] as const)("places $position labels on the upper and lower limits on opposite sides", ({ position, upperAbove }) => {
    const rendered = renderVisual(settingsWith({
      lines: {
        plot_label_show_99: true, plot_label_position_99: position, plot_label_vpad_99: 3,
        show_specification: true, specification_lower: 5, specification_upper: 60,
        plot_label_show_specification: true, plot_label_position_specification: position, plot_label_vpad_specification: 3
      }
    }), data);
    const labels = rendered.element.querySelectorAll<SVGTextElement>(".linesgroup text");
    const dy: Record<string, number> = {};
    const format = rendered.visual.viewModel.inputSettings.derivedSettings[0].formatValue;
    const names: LineName[] = ["ul99", "ll99", "speclimits_upper", "speclimits_lower"];
    for (let n = 0; n < names.length; n++) {
      const text = format(lastPoint(rendered.visual, names[n]).value, "value");
      for (let i = 0; i < labels.length; i++) {
        if (labels[i].textContent === text) {
          dy[names[n]] = parseFloat(must(labels[i].getAttribute("dy")));
        }
      }
    }
    // Above sits clear of the line width (2); below drops by the font size (10)
    const above = -3 - 2;
    const below = 3 + 10;
    expect(dy).toEqual({
      ul99: upperAbove ? above : below,
      ll99: upperAbove ? below : above,
      speclimits_upper: upperAbove ? above : below,
      speclimits_lower: upperAbove ? below : above
    });
  });
});
