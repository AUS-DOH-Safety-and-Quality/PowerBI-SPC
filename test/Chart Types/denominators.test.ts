import { describe, expect, it, vi } from "vitest";
import { createVisualHost, testDom } from "powerbi-visuals-utils-testutils";
import type { controlLimitsObject } from "../../src/Classes/viewModelClass";
import { defaultSettings } from "../../src/settings";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";

const chartTypes = ["p", "pp", "u", "up", "i", "i_m", "i_mm", "mr", "run", "xbar", "s"] as const;
const limitNames = ["ll68", "ul68", "ll95", "ul95", "ll99", "ul99"] as const;
type ExpectedLimits = Pick<controlLimitsObject, "values" | "targets" | typeof limitNames[number]>;
type Input = { numerators: number[], denominators: number[], xbar_sds?: number[] };

function limitsAround(values: number[], centre: number, sigmas?: number[], lower = -Infinity, upper = Infinity): ExpectedLimits {
  const expected: ExpectedLimits = { values, targets: new Array<number>(values.length) };
  for (let i = 0; i < values.length; i++) {
    expected.targets[i] = centre;
  }
  if (sigmas) {
    const bands = [["ll68", "ul68", 1], ["ll95", "ul95", 2], ["ll99", "ul99", 3]] as const;
    for (const [ll, ul, width] of bands) {
      expected[ll] = new Array<number>(sigmas.length);
      expected[ul] = new Array<number>(sigmas.length);
      for (let i = 0; i < sigmas.length; i++) {
        expected[ll]![i] = Math.max(lower, centre - width * sigmas[i]);
        expected[ul]![i] = Math.min(upper, centre + width * sigmas[i]);
      }
    }
  }
  return expected;
}

function checkChart(chart_type: string, input: Input, expected: ExpectedLimits, outliers_in_limits: boolean, num_points_subset?: number) {
  const element = testDom("500", "500");
  const host = createVisualHost({});
  const failed = vi.spyOn(host.eventService, "renderingFailed");
  const finished = vi.spyOn(host.eventService, "renderingFinished");
  const visual = new Visual({ element, host });
  const settings = {
    ...defaultSettings,
    spc: { ...defaultSettings.spc, chart_type, outliers_in_limits, num_points_subset }
  };
  const keys = new Array<string>(input.numerators.length);
  for (let i = 0; i < keys.length; i++) {
    keys[i] = String(i + 1);
  }

  try {
    visual.update({
      dataViews: [buildDataView({ ...input, key: keys }, settings)],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(failed).not.toHaveBeenCalled();
    expect(finished).toHaveBeenCalledOnce();
    expect(element.querySelector(".errormessage")).toBeNull();
    const limits = visual.viewModel.controlLimits[0];
    const multiplier = chart_type === "p" || chart_type === "pp" ? 100 : 1;
    expect(limits.keys).toHaveLength(expected.values.length);
    for (const line of ["values", "targets", ...limitNames] as const) {
      if (!expected[line]) {
        expect(limits[line], line).toBeUndefined();
        continue;
      }
      expect(limits[line], line).toHaveLength(expected[line]!.length);
      for (let i = 0; i < expected[line]!.length; i++) {
        expect(limits[line]![i], `${line} at ${i}`).toBeCloseTo(expected[line]![i]! * multiplier, 8);
      }
    }

    expect(element.querySelector("svg")!.outerHTML).not.toMatch(/NaN|Infinity/);
    const dots = element.querySelectorAll<SVGPathElement>(".dotsgroup path");
    expect(dots).toHaveLength(expected.values.length);
    for (let i = 0; i < dots.length; i++) {
      const matrix = dots[i].transform.baseVal.consolidate()!.matrix;
      expect(matrix.a).toBe(1);
      expect(matrix.e).toBeGreaterThanOrEqual(0);
      expect(matrix.e).toBeLessThanOrEqual(500);
      expect(matrix.f).toBeGreaterThanOrEqual(0);
      expect(matrix.f).toBeLessThanOrEqual(500);
    }
    const paths = element.querySelectorAll(".linesgroup path");
    expect(paths.length).toBeGreaterThan(0);
    for (let i = 0; i < paths.length; i++) {
      expect(paths[i].getAttribute("d")).toBeTruthy();
    }
  } finally {
    failed.mockRestore();
    finished.mockRestore();
    element.remove();
  }
}

// Closed-form c4 constants for subgroup sizes 2–5, independent of the production gamma function.
const c4: Record<number, number> = {
  2: Math.sqrt(2 / Math.PI), 3: Math.sqrt(Math.PI) / 2,
  4: Math.sqrt(8 / (3 * Math.PI)), 5: 3 * Math.sqrt(2 * Math.PI) / 8
};
const boundaryCases = [
  {
    name: "equal varying counts", numerators: [2, 3, 4, 5], denominators: [2, 3, 4, 5],
    xbar_sds: [1, 2, 3, 4], ratio: 1, xbarCentre: 27 / 7, xbarSd: Math.sqrt(10), sCentre: Math.sqrt(17)
  },
  {
    name: "equal constant counts", numerators: [3, 3, 3, 3], denominators: [3, 3, 3, 3],
    xbar_sds: [0, 0, 0, 0], ratio: 1, xbarCentre: 3, xbarSd: 0, sCentre: 3
  },
  {
    name: "zero numerators", numerators: [0, 0, 0, 0], denominators: [2, 3, 4, 5],
    xbar_sds: [0, 0, 0, 0], ratio: 0, xbarCentre: 0, xbarSd: 0, sCentre: 0
  },
  {
    name: "constant half proportions", numerators: [1, 2, 1, 2], denominators: [2, 4, 2, 4],
    xbar_sds: [0, 0, 0, 0], ratio: 0.5, xbarCentre: 5 / 3, xbarSd: 0, sCentre: Math.sqrt(13 / 4)
  }
];

describe.each(chartTypes)("%s chart with denominators", chart_type => {
  describe.each([false, true])("outliers_in_limits=%s", keepOutliers => {
    it.each(boundaryCases)("renders $name with the expected limits", input => {
      const values = new Array<number>(input.denominators.length);
      const sigmas = new Array<number>(input.denominators.length);
      for (let i = 0; i < values.length; i++) {
        values[i] = input.ratio;
      }
      let expected: ExpectedLimits;
      switch (chart_type) {
        case "xbar":
          for (let i = 0; i < sigmas.length; i++) {
            const n = input.denominators[i];
            sigmas[i] = input.xbarSd / (c4[n] * Math.sqrt(n));
          }
          expected = limitsAround(input.numerators, input.xbarCentre, sigmas);
          break;
        case "s":
          for (let i = 0; i < sigmas.length; i++) {
            const n = input.denominators[i];
            sigmas[i] = input.sCentre * Math.sqrt(1 - c4[n] ** 2) / c4[n];
          }
          expected = limitsAround(input.numerators, input.sCentre, sigmas);
          break;
        case "mr":
          expected = limitsAround([0, 0, 0], 0, [0, 0, 0]);
          break;
        case "run":
          expected = limitsAround(values, input.ratio);
          break;
        case "p":
          for (let i = 0; i < sigmas.length; i++) {
            sigmas[i] = Math.sqrt(input.ratio * (1 - input.ratio) / input.denominators[i]);
          }
          expected = limitsAround(values, input.ratio, sigmas, 0, 1);
          break;
        case "u":
          for (let i = 0; i < sigmas.length; i++) {
            sigmas[i] = Math.sqrt(input.ratio / input.denominators[i]);
          }
          expected = limitsAround(values, input.ratio, sigmas, 0);
          break;
        default:
          expected = limitsAround(values, input.ratio, [0, 0, 0, 0]);
      }
      checkChart(chart_type, input, expected, keepOutliers);
    });
  });
});

describe.each([false, true])("Constant baseline subsets with outliers_in_limits=%s", keepOutliers => {
  it.each([
    { chart_type: "pp", centre: 1 },
    { chart_type: "pp", centre: 0 },
    { chart_type: "up", centre: 0 }
  ])("preserves later values for $chart_type with baseline $centre", ({ chart_type, centre }) => {
    const input = { numerators: [2 * centre, 4 * centre, 1, 3], denominators: [2, 4, 2, 4] };
    checkChart(chart_type, input, limitsAround([centre, centre, 0.5, 0.75], centre, [0, 0, 0, 0]), keepOutliers, 2);
  });
});

const ratioInput = { numerators: [1, 4, 2, 18], denominators: [4, 8, 4, 20] };
const ratioValues = [0.25, 0.5, 0.5, 0.9];
// Mean = 0.5375, median = 0.5, pooled proportion = 25/36; moving ranges = [0.25, 0, 0.4].
const laneySigmas = [0.267163309639303, 0.18891298793019248, 0.267163309639303, 0.11947906428946126];
const meanRangeSigmas = new Array<number>(4);
const medianRangeSigmas = new Array<number>(4);
for (let i = 0; i < 4; i++) {
  meanRangeSigmas[i] = (13 / 60) / 1.128;
  medianRangeSigmas[i] = 0.25 / 1.128;
}
const movingRangeLimits: ExpectedLimits = {
  values: [0.25, 0, 0.4], targets: new Array<number>(3),
  ll68: [0, 0, 0], ll95: [0, 0, 0], ll99: [0, 0, 0],
  ul68: new Array<number>(3), ul95: new Array<number>(3), ul99: new Array<number>(3)
};
for (let i = 0; i < 3; i++) {
  movingRangeLimits.targets[i] = 13 / 60;
  movingRangeLimits.ul68![i] = 0.23595;
  movingRangeLimits.ul95![i] = 0.4719;
  movingRangeLimits.ul99![i] = 0.70785;
}
const references = [
  { chart_type: "i", input: ratioInput, expected: limitsAround(ratioValues, 0.5375, meanRangeSigmas) },
  { chart_type: "i_m", input: ratioInput, expected: limitsAround(ratioValues, 0.5, meanRangeSigmas) },
  { chart_type: "i_mm", input: ratioInput, expected: limitsAround(ratioValues, 0.5, medianRangeSigmas) },
  { chart_type: "run", input: ratioInput, expected: limitsAround(ratioValues, 0.5) },
  { chart_type: "mr", input: ratioInput, expected: movingRangeLimits },
  {
    chart_type: "p", input: ratioInput,
    expected: limitsAround(ratioValues, 25 / 36, [0.230321165996903, 0.162861658327202, 0.230321165996903, 0.103002756765218], 0, 1)
  },
  { chart_type: "pp", input: ratioInput, expected: limitsAround(ratioValues, 25 / 36, laneySigmas, 0, 1) },
  {
    chart_type: "u", input: ratioInput,
    expected: limitsAround(ratioValues, 25 / 36, [0.416666666666667, 0.294627825494395, 0.416666666666667, 0.186338998124982], 0)
  },
  { chart_type: "up", input: ratioInput, expected: limitsAround(ratioValues, 25 / 36, laneySigmas, 0) },
  {
    chart_type: "xbar", input: { numerators: [10, 12, 16, 22], denominators: [2, 3, 4, 5], xbar_sds: [1, 2, 3, 4] },
    expected: limitsAround([10, 12, 16, 22], 230 / 14, [2.802495608198964, 2.060129077457011, 1.716171061619567, 1.50450555612735])
  },
  {
    chart_type: "s", input: { numerators: [1, 2, 3, 4], denominators: [2, 3, 4, 5] },
    expected: limitsAround([1, 2, 3, 4], Math.sqrt(10), [2.389134418141634, 1.652995900585246, 1.334530798056653, 1.147904543980176])
  }
];

it.each(references)("$chart_type chart matches reference limits for varying ratios or subgroups", ({ chart_type, input, expected }) => {
  checkChart(chart_type, input, expected, false);
});
