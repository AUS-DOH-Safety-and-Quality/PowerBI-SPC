import buildDataView from "./build-data-view";

describe("buildDataView", () => {
  it("returns a DataView with categorical.categories and categorical.values", () => {
    const dv = buildDataView({ key: ["a", "b"], numerators: [1, 2] });
    expect(dv.categorical).toBeDefined();
    expect(dv.categorical.categories).toBeDefined();
    expect(dv.categorical.values).toBeDefined();
  });

  it("creates key category column from string array", () => {
    const dv = buildDataView({ key: ["a", "b", "c"], numerators: [1, 2, 3] });
    expect(dv.categorical.categories.length).toBeGreaterThanOrEqual(1);
    const keyCol = dv.categorical.categories[0];
    expect(keyCol.source.queryName).toBe("key");
    expect(keyCol.values).toEqual(["a", "b", "c"]);
  });

  it("creates numerators value column from number array", () => {
    const dv = buildDataView({ key: ["a"], numerators: [42] });
    expect(dv.categorical.values.length).toBeGreaterThanOrEqual(1);
    const numCol = dv.categorical.values.find(
      (v: any) => v.source.queryName === "numerators"
    );
    expect(numCol).toBeDefined();
    expect(numCol.values).toEqual([42]);
  });

  it("creates denominators value column when provided", () => {
    const dv = buildDataView({ key: ["a"], numerators: [5], denominators: [100] });
    const denomCol = dv.categorical.values.find(
      (v: any) => v.source.queryName === "denominators"
    );
    expect(denomCol).toBeDefined();
    expect(denomCol.values).toEqual([100]);
  });

  it("creates xbar_sds value column when provided", () => {
    const dv = buildDataView({ key: ["a"], numerators: [5], xbar_sds: [1.5] });
    const sdCol = dv.categorical.values.find(
      (v: any) => v.source.queryName === "xbar_sds"
    );
    expect(sdCol).toBeDefined();
    expect(sdCol.values).toEqual([1.5]);
  });

  it("creates groupings value column when provided", () => {
    const dv = buildDataView({ key: ["a"], numerators: [5], groupings: ["g1"] });
    const grpCol = dv.categorical.values.find(
      (v: any) => v.source.queryName === "groupings"
    );
    expect(grpCol).toBeDefined();
    expect(grpCol.values).toEqual(["g1"]);
  });

  it("creates indicator category column when provided", () => {
    const dv = buildDataView({ key: ["a"], numerators: [5], indicator: ["ind1"] });
    const indCol = dv.categorical.categories.find(
      (c: any) => c.source.queryName === "indicator"
    );
    expect(indCol).toBeDefined();
    expect(indCol.values).toEqual(["ind1"]);
  });

  it("omits columns for undefined optional args", () => {
    const dv = buildDataView({ key: ["a"], numerators: [5] });
    // Only key in categories, only numerators in values
    expect(dv.categorical.categories.length).toBe(1);
    expect(dv.categorical.values.length).toBe(1);
  });

  it("metadata.columns matches the number of provided fields", () => {
    const dv = buildDataView({
      key: ["a"], numerators: [5], denominators: [100], xbar_sds: [1.5]
    });
    // key + numerators + denominators + xbar_sds = 4
    expect(dv.metadata.columns.length).toBe(4);
  });

  it("handles numerators-only (no key) without error", () => {
    const dv = buildDataView({ numerators: [1, 2, 3] });
    expect(dv.categorical.categories.length).toBe(0);
    expect(dv.categorical.values.length).toBe(1);
  });
});
