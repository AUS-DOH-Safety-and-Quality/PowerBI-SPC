import buildControlLimitsArgs from "./build-control-limits-args";

describe("buildControlLimitsArgs", () => {
  const keys = ["a", "b", "c"];
  const numerators = [10, 20, 30];

  it("maps string keys to objects with x, id, and label", () => {
    const args = buildControlLimitsArgs({ keys, numerators });
    expect(args.keys.length).toBe(3);
    expect(args.keys[0]).toEqual({ x: 0, id: 0, label: "a" });
    expect(args.keys[1]).toEqual({ x: 1, id: 1, label: "b" });
    expect(args.keys[2]).toEqual({ x: 2, id: 2, label: "c" });
  });

  it("sets numerators from input array", () => {
    const args = buildControlLimitsArgs({ keys, numerators });
    expect(args.numerators).toEqual([10, 20, 30]);
  });

  it("defaults denominators to undefined when not provided", () => {
    const args = buildControlLimitsArgs({ keys, numerators });
    expect(args.denominators).toBeUndefined();
  });

  it("passes denominators through when provided", () => {
    const denoms = [100, 200, 300];
    const args = buildControlLimitsArgs({ keys, numerators, denominators: denoms });
    expect(args.denominators).toEqual([100, 200, 300]);
  });

  it("defaults subset_points to all indices [0..n-1]", () => {
    const args = buildControlLimitsArgs({ keys, numerators });
    expect(args.subset_points).toEqual([0, 1, 2]);
  });

  it("uses custom subset_points when provided", () => {
    const args = buildControlLimitsArgs({ keys, numerators, subset_points: [0, 2] });
    expect(args.subset_points).toEqual([0, 2]);
  });

  it("defaults outliers_in_limits to true", () => {
    const args = buildControlLimitsArgs({ keys, numerators });
    expect(args.outliers_in_limits).toBeTrue();
  });

  it("sets outliers_in_limits to false when specified", () => {
    const args = buildControlLimitsArgs({ keys, numerators, outliers_in_limits: false });
    expect(args.outliers_in_limits).toBeFalse();
  });

  it("passes xbar_sds through when provided", () => {
    const sds = [1.5, 2.0, 2.5];
    const args = buildControlLimitsArgs({ keys, numerators, xbar_sds: sds });
    expect(args.xbar_sds).toEqual([1.5, 2.0, 2.5]);
  });

  it("returns undefined for xbar_sds when not provided", () => {
    const args = buildControlLimitsArgs({ keys, numerators });
    expect(args.xbar_sds).toBeUndefined();
  });

  it("keys array length matches input keys length", () => {
    const longKeys = ["a", "b", "c", "d", "e"];
    const longNums = [1, 2, 3, 4, 5];
    const args = buildControlLimitsArgs({ keys: longKeys, numerators: longNums });
    expect(args.keys.length).toBe(5);
    expect(args.subset_points.length).toBe(5);
  });
});
