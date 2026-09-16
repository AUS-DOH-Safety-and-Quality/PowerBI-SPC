import { describe, expect, it } from "vitest";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import viewModelClass, { type controlLimitsObject } from "../../src/Classes/viewModelClass";
import { defaultSettings, type settingsValueType } from "../../src/settings";
import buildDataView from "../helpers/buildDataView";

const numerators = [10, 12, 16, 22, 30, 34, 40, 48, 60, 66, 74, 84];

function calculateLimits(
  spc: Partial<settingsValueType["spc"]>,
  groupings?: string[],
  splitIndexes: number[] = [],
  values = numerators,
  denominators?: number[],
  xbar_sds?: number[]
) {
  const settings: settingsValueType = {
    ...defaultSettings,
    spc: { ...defaultSettings.spc, chart_type: "i", outliers_in_limits: true, ...spc }
  };
  const dataView = buildDataView({
    key: values.map((_, i) => String(i + 1)),
    numerators: values,
    denominators,
    xbar_sds,
    groupings
  }, settings);
  dataView.metadata.objects = {
    split_indexes_storage: { split_indexes: JSON.stringify(splitIndexes) }
  };
  const viewModel = new viewModelClass();
  const result = viewModel.update({
    dataViews: [dataView],
    viewport: { width: 500, height: 500 },
    type: 2
  }, createVisualHost({}));
  expect(result.status).toBe(true);
  return viewModel.controlLimits[0];
}

const bands = [["ll68", "ul68", 1], ["ll95", "ul95", 2], ["ll99", "ul99", 3]] as const;

function expectLimits(limits: controlLimitsObject, centres: number[], sigmas: number[], lower = -Infinity, upper = Infinity) {
  expect(limits.targets).toHaveLength(centres.length);
  centres.forEach((centre, i) => expect(limits.targets[i], `target at ${i}`).toBeCloseTo(centre, 8));
  bands.forEach(([ll, ul, width]) => {
    expect(limits[ll]).toHaveLength(centres.length);
    expect(limits[ul]).toHaveLength(centres.length);
    centres.forEach((centre, i) => {
      expect(limits[ll]![i], `${ll} at ${i}`).toBeCloseTo(Math.max(lower, centre - width * sigmas[i]), 8);
      expect(limits[ul]![i], `${ul} at ${i}`).toBeCloseTo(Math.min(upper, centre + width * sigmas[i]), 8);
    });
  });
}

describe.each(["groupings", "click splits", "both"])("Limit subsets with %s", source => {
  const groupings = source === "click splits" ? undefined
    : numerators.map((_, i) => String(Math.floor(i / (source === "both" ? 8 : 4))));
  const splitIndexes = source === "groupings" ? [] : source === "both" ? [3] : [3, 7];

  it.each([
    { from: "Start", rebaselines: true, means: [11, 32, 63], ranges: [2, 4, 6] },
    { from: "End", rebaselines: true, means: [19, 44, 79], ranges: [6, 8, 10] },
    { from: "Start", rebaselines: false, means: [11, 38, 71], ranges: [2, 6, 8] },
    { from: "End", rebaselines: false, means: [19, 38, 71], ranges: [6, 6, 8] }
  ])("uses $from points with subset_rebaselines=$rebaselines", ({ from, rebaselines, means, ranges }) => {
    const limits = calculateLimits({
      num_points_subset: 2,
      subset_points_from: from,
      subset_rebaselines: rebaselines,
      split_on_click: source !== "groupings"
    }, groupings, splitIndexes);

    expect(limits.values).toEqual(numerators);
    expect(limits.keys.map(key => key.id)).toEqual(numerators.map((_, i) => i));
    expectLimits(limits, means.flatMap(mean => Array(4).fill(mean)), ranges.flatMap(range => Array(4).fill(range / 1.128)));
  });

  it.each([undefined, 0, 20])("uses every point when the subset count is %s", count => {
    const limits = calculateLimits({ num_points_subset: count }, groupings, splitIndexes);
    expectLimits(limits, [15, 38, 71].flatMap(mean => Array(4).fill(mean)), [4, 6, 8].flatMap(range => Array(4).fill(range / 1.128)));
  });
});

describe("Limit subsets without rebaselines", () => {
  it.each([
    { from: "Start", rebaselines: true, mean: 11 },
    { from: "Start", rebaselines: false, mean: 11 },
    { from: "End", rebaselines: true, mean: 79 },
    { from: "End", rebaselines: false, mean: 79 }
  ])("uses $from points with subset_rebaselines=$rebaselines", ({ from, rebaselines, mean }) => {
    const limits = calculateLimits({
      num_points_subset: 2,
      subset_points_from: from,
      subset_rebaselines: rebaselines
    });
    expect(limits.values).toEqual(numerators);
    expectLimits(limits, numerators.map(() => mean), numerators.map(() => (from === "Start" ? 2 : 10) / 1.128));
  });
});

it.each(["Start", "End"])("uses every point in short rebaselines when selecting from %s", from => {
  const limits = calculateLimits({
    num_points_subset: 3,
    subset_points_from: from,
    subset_rebaselines: true
  }, ["A", "A", "A", "A", "B", "B", "C"], [], numerators.slice(0, 7));

  expect(limits.targets.slice(0, 4)).toEqual(Array(4).fill(from === "Start" ? 38 / 3 : 50 / 3));
  expect(limits.targets.slice(4)).toEqual([32, 32, 40]);
  bands.forEach(([ll, ul, width]) => {
    for (let i = 0; i < 6; i++) {
      const mean = i < 4 ? (from === "Start" ? 38 / 3 : 50 / 3) : 32;
      const range = i < 4 ? (from === "Start" ? 3 : 5) : 4;
      expect(limits[ll]![i]).toBeCloseTo(mean - width * range / 1.128, 8);
      expect(limits[ul]![i]).toBeCloseTo(mean + width * range / 1.128, 8);
    }
    expect(limits[ll]![6]).toBeUndefined();
    expect(limits[ul]![6]).toBeUndefined();
  });
});

const varyingDenominators = [100, 200, 400, 100, 300, 100, 200, 400];
// Reference centres and one-sigma widths use hand-calculated totals, moving ranges, and pooled variances.
const chartReferences = [
  {
    chart_type: "i", denominators: varyingDenominators, lower: -Infinity, upper: Infinity,
    Start: {
      centres: [0.08, 0.22],
      sigmas: [Array(4).fill(0.0354609929), Array(4).fill(0.2127659574)]
    },
    End: {
      centres: [0.13, 0.16],
      sigmas: [Array(4).fill(0.1595744681), Array(4).fill(0.0709219858)]
    },
    All: {
      centres: [0.105, 0.19],
      sigmas: [Array(4).fill(0.0709219858), Array(4).fill(0.1359338061)]
    }
  },
  {
    chart_type: "p", denominators: varyingDenominators, lower: 0, upper: 1,
    Start: {
      centres: [22 / 300, 64 / 400],
      sigmas: [[0.0260682864, 0.0184330621, 0.0130341432, 0.0260682864], [0.0211660105, 0.0366606056, 0.0259229628, 0.0183303028]]
    },
    End: {
      centres: [38 / 500, 88 / 600],
      sigmas: [[0.0264998113, 0.0187381963, 0.0132499057, 0.0264998113], [0.0204251116, 0.0353773311, 0.0250155507, 0.0176886655]]
    },
    All: {
      centres: [60 / 800, 152 / 1000],
      sigmas: [[0.0263391344, 0.0186245805, 0.0131695672, 0.0263391344], [0.0207280808, 0.0359020891, 0.0253866106, 0.0179510445]]
    }
  },
  {
    chart_type: "u", denominators: varyingDenominators, lower: 0, upper: Infinity,
    Start: {
      centres: [22 / 300, 64 / 400],
      sigmas: [[0.0270801280, 0.0191485422, 0.0135400640, 0.0270801280], [0.0230940108, 0.0400000000, 0.0282842712, 0.0200000000]]
    },
    End: {
      centres: [38 / 500, 88 / 600],
      sigmas: [[0.0275680975, 0.0194935887, 0.0137840488, 0.0275680975], [0.0221108319, 0.0382970843, 0.0270801280, 0.0191485422]]
    },
    All: {
      centres: [60 / 800, 152 / 1000],
      sigmas: [[0.0273861279, 0.0193649167, 0.0136930639, 0.0273861279], [0.0225092574, 0.0389871774, 0.0275680975, 0.0194935887]]
    }
  },
  {
    chart_type: "xbar", denominators: [2, 3, 4, 5, 5, 4, 3, 2], xbar_sds: [1, 2, 3, 4, 5, 6, 7, 8], lower: -Infinity, upper: Infinity,
    Start: {
      centres: [56 / 5, 286 / 9],
      sigmas: [[1.5349900619, 1.1283791671, 0.9399856030, 0.8240516310], [2.5934414241, 2.9583068696, 3.5512159239, 4.8308948888]]
    },
    End: {
      centres: [174 / 9, 216 / 5],
      sigmas: [[3.1953366214, 2.3489085466, 1.9567360697, 1.7154002620], [3.4961549779, 3.9880211645, 4.7873073648, 6.5124112910]]
    },
    All: {
      centres: [230 / 14, 502 / 14],
      sigmas: [[2.8024956082, 2.0601290775, 1.7161710616, 1.5045055561], [2.8939742195, 3.3011209486, 3.9627374022, 5.3907079355]]
    }
  }
];

describe.each(["groupings", "click splits"])("Numerical control limits with %s", source => {
  describe.each(chartReferences)("$chart_type chart", reference => {
    it.each([
      { from: "Start", rebaselines: true },
      { from: "End", rebaselines: true },
      { from: "Start", rebaselines: false },
      { from: "End", rebaselines: false }
    ] as const)("matches reference limits from $from with subset_rebaselines=$rebaselines", ({ from, rebaselines }) => {
      const limits = calculateLimits({
        chart_type: reference.chart_type,
        num_points_subset: 2,
        subset_points_from: from,
        subset_rebaselines: rebaselines,
        split_on_click: source === "click splits",
        perc_labels: "No"
      }, source === "groupings" ? ["A", "A", "A", "A", "B", "B", "B", "B"] : undefined,
      source === "click splits" ? [3] : [], numerators.slice(0, 8), reference.denominators, reference.xbar_sds);

      const first = reference[from];
      const second = rebaselines ? reference[from] : reference.All;
      const centres = [...Array(4).fill(first.centres[0]), ...Array(4).fill(second.centres[1])];
      expectLimits(limits, centres, [...first.sigmas[0], ...second.sigmas[1]], reference.lower, reference.upper);
      expect(limits.values).toEqual(numerators.slice(0, 8).map((value, i) => reference.chart_type === "xbar" ? value : value / reference.denominators[i]));
      expect(limits.keys.map(key => key.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });
  });
});

it.each([true, false])("calculates subset limits with outliers_in_limits=%s", keepOutliers => {
  const values = [10, 11, 12, 13, 113, 999, 30, 32, 34, 36, 236, 888];
  const limits = calculateLimits({
    num_points_subset: 5,
    subset_rebaselines: true,
    outliers_in_limits: keepOutliers
  }, values.map((_, i) => i < 6 ? "A" : "B"), [], values);

  // The selected moving ranges are [1, 1, 1, 100] and [2, 2, 2, 200].
  const ranges = keepOutliers ? [25.75, 51.5] : [1, 2];
  expectLimits(limits, [31.8, 73.6].flatMap(mean => Array(6).fill(mean)), ranges.flatMap(range => Array(6).fill(range / 1.128)));
  expect(limits.values).toEqual(values);
});
