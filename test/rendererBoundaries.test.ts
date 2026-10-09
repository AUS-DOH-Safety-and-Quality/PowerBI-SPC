import { describe, expect, it, vi } from "vitest";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../src/visual";
import { defaultSettings, type settingsValueType } from "../src/settings";
import buildDataView from "./helpers/buildDataView";

const numerators = [10, 12, 16, 22, 30, 34, 40, 48];
const keys = numerators.map((_, i) => String(i + 1));
const viewport = { width: 500, height: 500 };

function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("Missing element");
  return value;
}

function settingsWith(overrides: { [K in keyof settingsValueType]?: Partial<settingsValueType[K]> }): settingsValueType {
  const result: settingsValueType = { ...defaultSettings, spc: { ...defaultSettings.spc, chart_type: "i" } };
  for (const card in overrides) {
    const key = card as keyof settingsValueType;
    (result as Record<string, object>)[key] = { ...result[key], ...overrides[key] };
  }
  return result;
}

function update(visual: Visual, settings: settingsValueType): void {
  visual.update({ dataViews: [buildDataView({ key: keys, numerators }, settings)], viewport, type: 2 });
}

function render(element: HTMLElement, settings: settingsValueType, host = createVisualHost({})): Visual {
  const visual = new Visual({ element, host });
  update(visual, settings);
  return visual;
}

function precedes(first: Element, second: Element): boolean {
  return (first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

// Changeset 8: renderer prerequisites and the shared line-label, error and crosshair boundaries
describe("renderer boundaries", () => {
  it("re-adds hidden axes with ticks, beneath the lines and dots", () => {
    const element = testDom("500", "500");
    const visual = render(element, settingsWith({}));
    expect(element.querySelectorAll(".xaxisgroup .tick").length).toBeGreaterThan(0);
    update(visual, settingsWith({ x_axis: { xlimit_show: false }, y_axis: { ylimit_show: false } }));
    expect(element.querySelector(".xaxisgroup")).toBeNull();
    expect(element.querySelector(".yaxisgroup")).toBeNull();
    update(visual, settingsWith({}));
    const lines = must(element.querySelector(".linesgroup"));
    const xGroup = must(element.querySelector(".xaxisgroup"));
    const yGroup = must(element.querySelector(".yaxisgroup"));
    expect(xGroup.querySelectorAll(".tick").length).toBeGreaterThan(0);
    expect(yGroup.querySelectorAll(".tick").length).toBeGreaterThan(0);
    expect(precedes(xGroup, lines)).toBe(true);
    expect(precedes(yGroup, lines)).toBe(true);
    expect(precedes(must(element.querySelector(".xaxislabel")), lines)).toBe(true);
    expect(element.querySelectorAll(".xaxisgroup")).toHaveLength(1);
    element.remove();
  });

  // Finding 34: the host palette is read on every update
  it("applies the host palette, including high contrast, to points and error text", () => {
    const host = createVisualHost({});
    const palette = host.colorPalette as { isHighContrast: boolean; foreground: { value: string } };
    palette.isHighContrast = true;
    palette.foreground = { value: "#abcdef" };
    const element = testDom("500", "500");
    const visual = render(element, settingsWith({}), host);
    expect(visual.viewModel.colourPalette.isHighContrast).toBe(true);
    expect(must(element.querySelector<SVGPathElement>(".dotsgroup path")).style.fill).toBe("rgb(171, 205, 239)");
    visual.update({ dataViews: [buildDataView({ key: keys }, settingsWith({}))], viewport, type: 2 });
    const texts = element.querySelectorAll<SVGTextElement>(".errormessage text");
    expect(texts).toHaveLength(1);
    expect(texts[0].textContent).toBe("No numerators passed!");
    expect(texts[0].style.fill).toBe("rgb(171, 205, 239)");
    element.remove();
  });

  it("draws error text in the host foreground colour with the settings preamble", () => {
    const element = testDom("500", "500");
    render(element, settingsWith({ x_axis: { xlimit_tick_count: -1 } }));
    const texts = element.querySelectorAll<SVGTextElement>(".errormessage text");
    expect(texts).toHaveLength(2);
    expect(texts[0].textContent).toBe("Invalid settings provided for all observations! First error:");
    expect(Number(texts[0].getAttribute("y"))).toBeCloseTo(500 / 3, 6);
    expect(texts[1].getAttribute("y")).toBe("250");
    expect(texts[1].style.fill).toBe("rgb(51, 51, 51)");
    element.remove();
  });

  it("places line labels through the shared geometry", () => {
    const element = testDom("500", "500");
    render(element, settingsWith({ lines: {
      plot_label_show_main: true, plot_label_position_main: "above",
      plot_label_vpad_main: 5, plot_label_hpad_main: 3, width_main: 2,
      plot_label_show_95: true, plot_label_position_95: "beside", plot_label_hpad_95: 4
    } }));
    expect(element.querySelectorAll(".linesgroup text")).toHaveLength(3);
    const above = must(element.querySelector(".linesgroup text[text-anchor='end']"));
    expect(above.getAttribute("dx")).toBe("-3px");
    expect(above.getAttribute("dy")).toBe("-7px");
    const beside = element.querySelectorAll(".linesgroup text[text-anchor='start']");
    expect(beside).toHaveLength(2);
    expect(beside[0].getAttribute("dx")).toBe("4px");
    element.remove();
  });

  // Finding 37: segment-end labels follow the "last N" and "all re-baselines" settings
  it("labels the end of each rebaseline segment when requested", () => {
    const split = [10, 12, 16, 22, 30, 34, 40, 48, 52];
    const splitKeys = split.map((_, i) => String(i + 1));
    function labelsFor(lines: Partial<settingsValueType["lines"]>): { element: HTMLElement; visual: Visual; texts: NodeListOf<SVGTextElement> } {
      const element = testDom("500", "500");
      const visual = new Visual({ element, host: createVisualHost({}) });
      const dataView = buildDataView({ key: splitKeys, numerators: split }, settingsWith({ lines: { plot_label_show_main: true, ...lines } }));
      dataView.metadata.objects = { split_indexes_storage: { split_indexes: "[3]" } };
      visual.update({ dataViews: [dataView], viewport, type: 2 });
      return { element, visual, texts: element.querySelectorAll<SVGTextElement>(".linesgroup text") };
    }

    const last = labelsFor({});
    expect(last.texts).toHaveLength(1);
    last.element.remove();

    const all = labelsFor({ plot_label_show_all_main: true });
    expect(all.texts).toHaveLength(2);
    const points = all.visual.viewModel.groupedLines[0][1];
    let gap = -1;
    for (let i = 0; i < points.length; i++) if (points[i].line_value === undefined) gap = i;
    expect(gap).toBeGreaterThan(0);
    const segmentEnd = points[gap - 1];
    expect(Number(all.texts[0].getAttribute("x"))).toBeCloseTo(all.visual.plotProperties.xScale(segmentEnd.x) as number, 6);
    expect(Number(all.texts[0].getAttribute("y"))).toBeCloseTo(all.visual.plotProperties.yScale(segmentEnd.line_value as number) as number, 6);
    expect(Number(all.texts[1].getAttribute("x"))).toBeCloseTo(all.visual.plotProperties.xScale(points[points.length - 1].x) as number, 6);
    all.element.remove();

    const lastTwo = labelsFor({ plot_label_show_n_main: 2 });
    expect(lastTwo.texts).toHaveLength(2);
    lastTwo.element.remove();

    const joined = labelsFor({ plot_label_show_all_main: true, join_rebaselines_main: true });
    expect(joined.texts).toHaveLength(1);
    joined.element.remove();
  });

  it("draws gridlines at the ticks, hides tick marks and aligns the axis labels", () => {
    const element = testDom("500", "500");
    const visual = render(element, settingsWith({
      x_axis: { xlimit_grid_show: true, xlimit_tick_marks: false, xlimit_label: "X", xlimit_label_align: "right" },
      y_axis: { ylimit_grid_show: true, ylimit_label: "Y", ylimit_label_align: "top", ylimit_label_style: "italic" }
    }));
    const xTicks = element.querySelectorAll<SVGGElement>(".xaxisgroup .tick");
    const xGrid = element.querySelectorAll<SVGLineElement>(".gridgroup .xgridline");
    expect(xGrid.length).toBeGreaterThan(0);
    expect(xGrid).toHaveLength(xTicks.length);
    for (let i = 0; i < xTicks.length; i++) {
      // d3 offsets tick groups by half a pixel on low-DPI screens
      const tickX = Number(must(xTicks[i].getAttribute("transform")).match(/translate\(([^,]+),/)?.[1]);
      expect(Math.abs(Number(xGrid[i].getAttribute("x1")) - tickX)).toBeLessThanOrEqual(0.5);
      expect(xGrid[i].getAttribute("x2")).toBe(xGrid[i].getAttribute("x1"));
    }
    expect(xGrid[0].getAttribute("y1")).toBe(String(500 - visual.plotProperties.yAxis.start_padding));
    expect(xGrid[0].getAttribute("y2")).toBe(String(visual.plotProperties.yAxis.end_padding));
    expect(xGrid[0].style.stroke).toBe("rgb(211, 211, 211)");
    expect(xGrid[0].style.strokeWidth).toBe("1");
    expect(must(element.querySelector<SVGLineElement>(".xaxisgroup .tick line")).style.stroke).toBe("none");
    expect(must(element.querySelector<SVGLineElement>(".yaxisgroup .tick line")).style.stroke).toMatch(/currentcolor/i);
    const yGrid = element.querySelectorAll<SVGLineElement>(".gridgroup .ygridline");
    expect(yGrid).toHaveLength(element.querySelectorAll(".yaxisgroup .tick").length);
    expect(yGrid[0].getAttribute("x1")).toBe(String(visual.plotProperties.xAxis.start_padding));
    expect(yGrid[0].getAttribute("x2")).toBe(String(500 - visual.plotProperties.xAxis.end_padding));
    const xLabel = must(element.querySelector<SVGTextElement>(".xaxislabel"));
    expect(xLabel.style.textAnchor).toBe("end");
    expect(xLabel.getAttribute("x")).toBe(String(500 - visual.plotProperties.xAxis.end_padding));
    const yLabel = must(element.querySelector<SVGTextElement>(".yaxislabel"));
    expect(yLabel.style.textAnchor).toBe("end");
    expect(yLabel.getAttribute("y")).toBe(String(visual.plotProperties.yAxis.end_padding));
    expect(yLabel.style.fontStyle).toBe("italic");
    update(visual, settingsWith({ y_axis: { ylimit_show: false } }));
    expect(element.querySelectorAll(".gridgroup .xgridline")).toHaveLength(0);
    expect(element.querySelectorAll(".gridgroup .ygridline")).toHaveLength(0);
    // Centred labels sit over the plot area, not the canvas, under uneven padding
    update(visual, settingsWith({
      canvas: { left_padding: 90, right_padding: 10, upper_padding: 70, lower_padding: 30 },
      x_axis: { xlimit_label: "X" }, y_axis: { ylimit_label: "Y" }
    }));
    const xAxis = visual.plotProperties.xAxis;
    const yAxis = visual.plotProperties.yAxis;
    expect(Number(must(element.querySelector(".xaxislabel")).getAttribute("x"))).toBeCloseTo((xAxis.start_padding + 500 - xAxis.end_padding) / 2, 6);
    expect(Number(must(element.querySelector(".yaxislabel")).getAttribute("y"))).toBeCloseTo((500 - yAxis.start_padding + yAxis.end_padding) / 2, 6);
    element.remove();
  });

  it("draws a download link that exports the table rows as CSV", () => {
    const host = createVisualHost({});
    const exportVisualsContent = vi.fn();
    Object.assign(host, { downloadService: { exportVisualsContent } });
    const element = testDom("500", "500");
    const visual = render(element, settingsWith({ download_options: { show_button: true } }), host);
    const button = must(element.querySelector<SVGTextElement>(".download-btn-group"));
    expect(button.textContent).toBe("Download");
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(exportVisualsContent).toHaveBeenCalledTimes(1);
    const lines: string[] = exportVisualsContent.mock.calls[0][0].split("\n");
    expect(lines[0].startsWith("date,numerator,denominator,value,")).toBe(true);
    expect(lines).toHaveLength(keys.length + 1);
    // An individuals chart without denominators leaves the numerator and denominator columns blank
    expect(lines[1].split(",").slice(0, 4)).toEqual(["1", "", "", "10"]);
    update(visual, settingsWith({}));
    expect(element.querySelector(".download-btn-group")).toBeNull();
    element.remove();
  });

  it("shows crosshairs at the nearest point on mouse move and hides them on leave", () => {
    const element = testDom("500", "500");
    const visual = render(element, settingsWith({}));
    const svg = must(element.querySelector("svg"));
    const point = visual.viewModel.plotPoints[2];
    const px = visual.plotProperties.xScale(point.x) as number;
    const py = visual.plotProperties.yScale(point.value) as number;
    const rect = svg.getBoundingClientRect();
    svg.dispatchEvent(new MouseEvent("mousemove", { clientX: rect.left + px, clientY: rect.top + py, bubbles: true }));
    const vertical = must(element.querySelector<SVGLineElement>(".ttip-line-x"));
    const horizontal = must(element.querySelector<SVGLineElement>(".ttip-line-y"));
    expect(vertical.style.strokeOpacity).toBe("0.4");
    expect(Number(vertical.getAttribute("x1"))).toBeCloseTo(px, 6);
    expect(vertical.getAttribute("y2")).toBe(String(500 - visual.plotProperties.yAxis.start_padding));
    expect(horizontal.style.strokeOpacity).toBe("0.4");
    expect(Number(horizontal.getAttribute("y1"))).toBeCloseTo(py, 6);
    expect(horizontal.getAttribute("x1")).toBe(String(visual.plotProperties.xAxis.start_padding));
    expect(vertical.getAttribute("stroke")).toBe("black");
    svg.dispatchEvent(new MouseEvent("mouseleave"));
    expect(vertical.style.strokeOpacity).toBe("0");
    expect(horizontal.style.strokeOpacity).toBe("0");
    element.remove();
  });
});
