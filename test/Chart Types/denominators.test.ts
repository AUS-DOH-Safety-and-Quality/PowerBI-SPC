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
  const expected: ExpectedLimits = { values, targets: values.map(() => centre) };
  if (sigmas) {
    const bands = [["ll68", "ul68", 1], ["ll95", "ul95", 2], ["ll99", "ul99", 3]] as const;
    bands.forEach(([ll, ul, width]) => {
      expected[ll] = sigmas.map(sigma => Math.max(lower, centre - width * sigma));
      expected[ul] = sigmas.map(sigma => Math.min(upper, centre + width * sigma));
    });
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

  try {
    visual.update({
      dataViews: [buildDataView({ ...input, key: input.numerators.map((_, i) => String(i + 1)) }, settings)],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(failed).not.toHaveBeenCalled();
    expect(finished).toHaveBeenCalledOnce();
    expect(element.querySelector(".errormessage")).toBeNull();
    const limits = visual.viewModel.controlLimits[0];
    const multiplier = ["p", "pp"].includes(chart_type) ? 100 : 1;
    expect(limits.keys).toHaveLength(expected.values.length);
    for (const line of ["values", "targets", ...limitNames] as const) {
      if (!expected[line]) {
        expect(limits[line], line).toBeUndefined();
        continue;
      }
      expect(limits[line], line).toHaveLength(expected[line]!.length);
      expected[line]!.forEach((value, i) => {
        expect(limits[line]![i], `${line} at ${i}`).toBeCloseTo(value! * multiplier, 8);
      });
    }

    expect(element.querySelector("svg")!.outerHTML).not.toMatch(/NaN|Infinity/);
    const dots = element.querySelectorAll<SVGPathElement>(".dotsgroup path");
    expect(dots).toHaveLength(expected.values.length);
    dots.forEach(dot => {
      const matrix = dot.transform.baseVal.consolidate()!.matrix;
      expect(matrix.a).toBe(1);
      expect(matrix.e).toBeGreaterThanOrEqual(0);
      expect(matrix.e).toBeLessThanOrEqual(500);
      expect(matrix.f).toBeGreaterThanOrEqual(0);
      expect(matrix.f).toBeLessThanOrEqual(500);
    });
    const paths = element.querySelectorAll(".linesgroup path");
    expect(paths.length).toBeGreaterThan(0);
    paths.forEach(path => expect(path.getAttribute("d")).toBeTruthy());
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
      const values = Array(4).fill(input.ratio);
      let expected: ExpectedLimits;
      switch (chart_type) {
        case "xbar":
          expected = limitsAround(input.numerators, input.xbarCentre,
            input.denominators.map(n => input.xbarSd / (c4[n] * Math.sqrt(n))));
          break;
        case "s":
          expected = limitsAround(input.numerators, input.sCentre,
            input.denominators.map(n => input.sCentre * Math.sqrt(1 - c4[n] ** 2) / c4[n]));
          break;
        case "mr":
          expected = limitsAround([0, 0, 0], 0, [0, 0, 0]);
          break;
        case "run":
          expected = limitsAround(values, input.ratio);
          break;
        case "p":
          expected = limitsAround(values, input.ratio,
            input.denominators.map(n => Math.sqrt(input.ratio * (1 - input.ratio) / n)), 0, 1);
          break;
        case "u":
          expected = limitsAround(values, input.ratio, input.denominators.map(n => Math.sqrt(input.ratio / n)), 0);
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
const references = [
  { chart_type: "i", input: ratioInput, expected: limitsAround(ratioValues, 0.5375, Array(4).fill((13 / 60) / 1.128)) },
  { chart_type: "i_m", input: ratioInput, expected: limitsAround(ratioValues, 0.5, Array(4).fill((13 / 60) / 1.128)) },
  { chart_type: "i_mm", input: ratioInput, expected: limitsAround(ratioValues, 0.5, Array(4).fill(0.25 / 1.128)) },
  { chart_type: "run", input: ratioInput, expected: limitsAround(ratioValues, 0.5) },
  {
    chart_type: "mr", input: ratioInput,
    expected: {
      values: [0.25, 0, 0.4], targets: Array(3).fill(13 / 60),
      ll68: [0, 0, 0], ll95: [0, 0, 0], ll99: [0, 0, 0],
      ul68: Array(3).fill(0.23595), ul95: Array(3).fill(0.4719), ul99: Array(3).fill(0.70785)
    }
  },
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
