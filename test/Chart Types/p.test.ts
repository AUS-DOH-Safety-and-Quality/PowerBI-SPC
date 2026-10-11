import { defaultSettings, type settingsValueType } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { describe, it, expect, vi } from "vitest";

const keys: string[] = ["2011-07-01","2011-08-01","2011-09-01","2011-10-01","2011-11-01","2011-12-01","2012-01-01","2012-02-01","2012-03-01","2012-04-01","2012-05-01","2012-06-01","2012-07-01","2012-08-01","2012-09-01","2012-10-01","2012-11-01","2012-12-01","2013-01-01","2013-02-01","2013-03-01","2013-04-01","2013-05-01","2013-06-01","2013-07-01","2013-08-01","2013-09-01","2013-10-01","2013-11-01","2013-12-01","2014-01-01","2014-02-01","2014-03-01","2014-04-01","2014-05-01","2014-06-01"];

describe("P Chart Test", () => {
  it.each([
    { proportion: 1, perc_labels: "Automatic", expected: 100 },
    { proportion: 1, perc_labels: "No", expected: 1 },
    { proportion: 0, perc_labels: "Automatic", expected: 0 },
    { proportion: 0, perc_labels: "No", expected: 0 }
  ] as const)("renders constant proportion $proportion with percentage labels $perc_labels", ({ proportion, perc_labels, expected }) => {
    const chartElement = testDom("500", "500");
    const host = createVisualHost({});
    const renderingFailed = vi.spyOn(host.eventService, "renderingFailed");
    const renderingFinished = vi.spyOn(host.eventService, "renderingFinished");
    const chart = new Visual({ element: chartElement, host });
    const counts = [10, 20, 50, 100];
    const chartKeys = new Array<string>(counts.length);
    const numerators = new Array<number>(counts.length);
    const expectedValues = new Array<number>(counts.length);
    for (let i = 0; i < counts.length; i++) {
      chartKeys[i] = keys[i];
      numerators[i] = counts[i] * proportion;
      expectedValues[i] = expected;
    }
    const settings: settingsValueType = {
      ...defaultSettings,
      spc: { ...defaultSettings.spc, chart_type: "p", perc_labels }
    };

    try {
      chart.update({
        dataViews: [buildDataView({
          key: chartKeys,
          numerators,
          denominators: counts
        }, settings)],
        viewport: { width: 500, height: 500 },
        type: 2
      });

      expect(renderingFailed).not.toHaveBeenCalled();
      expect(renderingFinished).toHaveBeenCalledOnce();
      expect(chartElement.querySelector(".errormessage")).toBeNull();
      const limits = chart.viewModel.controlLimits[0];
      const lines = ["values", "targets", "ll68", "ul68", "ll95", "ul95", "ll99", "ul99"] as const;
      for (let l = 0; l < lines.length; l++) {
        expect(limits[lines[l]]).toEqual(expectedValues);
      }
      expect(chartElement.querySelector("svg")!.outerHTML).not.toMatch(/NaN|Infinity/);

      const dots = chartElement.querySelectorAll<SVGPathElement>(".dotsgroup path");
      expect(dots).toHaveLength(counts.length);
      const yAxis = chart.plotProperties.yAxis;
      const middleY = (500 - yAxis.start_padding + yAxis.end_padding) / 2;
      for (let i = 0; i < dots.length; i++) {
        const transform = dots[i].transform.baseVal.consolidate()!.matrix;
        expect(transform.e).toBeGreaterThanOrEqual(0);
        expect(transform.e).toBeLessThanOrEqual(500);
        expect(transform.f).toBeCloseTo(middleY, 5);
      }
      const paths = chartElement.querySelectorAll(".linesgroup path");
      expect(paths.length).toBeGreaterThan(0);
      for (let i = 0; i < paths.length; i++) {
        expect(paths[i].getAttribute("d")).toBeTruthy();
      }
      expect(chartElement.querySelectorAll(".yaxisgroup .tick")).toHaveLength(1);
    } finally {
      renderingFailed.mockRestore();
      renderingFinished.mockRestore();
      chartElement.remove();
    }
  });
});
