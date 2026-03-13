/**
 * VAL-002: Validation of PowerBI DataView structure
 *
 * Tests validateDataView() which checks:
 * - Empty/missing DataView → blank string
 * - Missing categories → blank string
 * - Missing numerators → "No Numerators passed!"
 * - Missing denominators for charts that require them
 * - Missing SDs for xbar chart
 * - Valid data → "valid"
 */
import validateDataView from "../../src/Functions/validateDataView";
import settingsClass from "../../src/Classes/settingsClass";
import derivedSettingsClass from "../../src/Classes/derivedSettingsClass";

// --- Helpers to build minimal DataView and settingsClass mocks ---

type MockDataViewOpts = {
  hasCategories?: boolean;
  hasIdentity?: boolean;
  roles?: Record<string, boolean>;
};

function buildMockDataView(opts: MockDataViewOpts = {}): any[] {
  const { hasCategories = true, hasIdentity = true, roles = { numerators: true } } = opts;

  if (!hasCategories) {
    return [{ categorical: {} }];
  }

  const values = Object.entries(roles).map(([role, present]) => ({
    source: { roles: present ? { [role]: true } : {} }
  }));

  return [{
    categorical: {
      categories: hasIdentity
        ? [{ source: { roles: { key: true } }, identity: [{}] }]
        : [{ source: { roles: { key: true } }, identity: [] }],
      values: values
    }
  }];
}

function buildMockSettingsClass(chartType: string): settingsClass {
  const sc = new settingsClass();
  // Update derivedSettings with the requested chart type
  const spcSettings = { ...sc.settings[0].spc, chart_type: chartType };
  sc.derivedSettings[0].update(spcSettings);
  return sc;
}

describe("validateDataView (VAL-002)", () => {

  // ---- Empty/missing DataView ----

  describe("Empty or missing DataView", () => {
    it("returns empty string for null DataView", () => {
      const sc = buildMockSettingsClass("i");
      const result = validateDataView(null as any, sc);
      expect(result).toBe("");
    });

    it("returns empty string for undefined DataView[0]", () => {
      const sc = buildMockSettingsClass("i");
      const result = validateDataView([undefined] as any, sc);
      expect(result).toBe("");
    });

    it("returns empty string for empty array", () => {
      const sc = buildMockSettingsClass("i");
      const result = validateDataView([] as any, sc);
      expect(result).toBe("");
    });

    it("returns empty string when identity array is empty", () => {
      const sc = buildMockSettingsClass("i");
      const dv = buildMockDataView({ hasIdentity: false });
      const result = validateDataView(dv, sc);
      expect(result).toBe("");
    });
  });

  // ---- Missing categories ----

  describe("Missing categories", () => {
    it("returns empty string when categories are missing", () => {
      const sc = buildMockSettingsClass("i");
      const dv = buildMockDataView({ hasCategories: false });
      const result = validateDataView(dv, sc);
      expect(result).toBe("");
    });
  });

  // ---- Missing numerators ----

  describe("Missing numerators", () => {
    it("returns error when numerators role is not present", () => {
      const sc = buildMockSettingsClass("i");
      const dv = buildMockDataView({ roles: {} });
      const result = validateDataView(dv, sc);
      expect(result).toBe("No Numerators passed!");
    });
  });

  // ---- Valid data ----

  describe("Valid data", () => {
    it("returns 'valid' for I-chart with numerators", () => {
      const sc = buildMockSettingsClass("i");
      const dv = buildMockDataView({ roles: { numerators: true } });
      const result = validateDataView(dv, sc);
      expect(result).toBe("valid");
    });

    it("returns 'valid' for P-chart with numerators and denominators", () => {
      const sc = buildMockSettingsClass("p");
      const dv = buildMockDataView({ roles: { numerators: true, denominators: true } });
      const result = validateDataView(dv, sc);
      expect(result).toBe("valid");
    });

    it("returns 'valid' for XBar-chart with numerators, denominators, and SDs", () => {
      const sc = buildMockSettingsClass("xbar");
      const dv = buildMockDataView({ roles: { numerators: true, denominators: true, xbar_sds: true } });
      const result = validateDataView(dv, sc);
      expect(result).toBe("valid");
    });
  });

  // ---- Missing denominators for charts that require them ----

  describe("Missing denominators", () => {
    const denomChartTypes = ["p", "pp", "u", "up", "xbar", "s"];

    denomChartTypes.forEach(chartType => {
      it(`returns error for ${chartType}-chart when denominators are missing`, () => {
        const sc = buildMockSettingsClass(chartType);
        const dv = buildMockDataView({ roles: { numerators: true } });
        const result = validateDataView(dv, sc);
        expect(result).toBe(`Chart type '${chartType}' requires denominators!`);
      });
    });

    it("does NOT require denominators for I-chart", () => {
      const sc = buildMockSettingsClass("i");
      const dv = buildMockDataView({ roles: { numerators: true } });
      const result = validateDataView(dv, sc);
      expect(result).toBe("valid");
    });
  });

  // ---- Missing SDs for xbar chart ----

  describe("Missing SDs", () => {
    it("returns error for XBar-chart when SDs are missing", () => {
      const sc = buildMockSettingsClass("xbar");
      const dv = buildMockDataView({ roles: { numerators: true, denominators: true } });
      const result = validateDataView(dv, sc);
      expect(result).toBe("Chart type 'xbar' requires SDs!");
    });

    it("does NOT require SDs for P-chart", () => {
      const sc = buildMockSettingsClass("p");
      const dv = buildMockDataView({ roles: { numerators: true, denominators: true } });
      const result = validateDataView(dv, sc);
      expect(result).toBe("valid");
    });
  });

  // ---- Missing key role in categories (source bug fix validation) ----

  describe("Missing key role", () => {
    it("returns empty string when categories exist but have no key role", () => {
      const sc = buildMockSettingsClass("i");
      // Categories present with identity, but role is NOT 'key'
      const dv = [{
        categorical: {
          categories: [{ source: { roles: { other: true } }, identity: [{}] }],
          values: [{ source: { roles: { numerators: true } } }]
        }
      }];
      const result = validateDataView(dv as any, sc);
      expect(result).toBe("");
    });
  });

  // ---- Multi-group scenarios ----

  describe("Multi-group settings", () => {
    it("detects denominator requirement from second group", () => {
      // Simulate 2 groups: group 1 = i-chart (no denom), group 2 = p-chart (needs denom)
      const sc = new settingsClass();
      const spcI = { ...sc.settings[0].spc, chart_type: "i" };
      const spcP = { ...sc.settings[0].spc, chart_type: "p" };
      sc.derivedSettings = [new derivedSettingsClass(), new derivedSettingsClass()];
      sc.derivedSettings[0].update(spcI);
      sc.derivedSettings[1].update(spcP);

      const dv = buildMockDataView({ roles: { numerators: true } });
      const result = validateDataView(dv as any, sc);
      // p-chart in second group requires denominators
      expect(result).toBe("Chart type 'p' requires denominators!");
    });

    it("denominator error names first chart type needing them, not last (variable-split regression)", () => {
      // Regression: old code used single chart_type variable overwritten by each group.
      // With p-chart first and u-chart second, old code would say "u", fixed code says "p".
      const sc = new settingsClass();
      const spcP = { ...sc.settings[0].spc, chart_type: "p" };
      const spcU = { ...sc.settings[0].spc, chart_type: "u" };
      sc.derivedSettings = [new derivedSettingsClass(), new derivedSettingsClass()];
      sc.derivedSettings[0].update(spcP);
      sc.derivedSettings[1].update(spcU);

      const dv = buildMockDataView({ roles: { numerators: true } });
      const result = validateDataView(dv as any, sc);
      expect(result).toBe("Chart type 'p' requires denominators!");
    });

    it("SD error names correct chart type, not last group's type (variable-split regression)", () => {
      // Regression: old code used single chart_type variable for both denom and SD errors.
      // With xbar first (needs SD) and p second (needs denom), old code would say
      // "Chart type 'p' requires SDs!" — wrong, should say "xbar".
      const sc = new settingsClass();
      const spcXbar = { ...sc.settings[0].spc, chart_type: "xbar" };
      const spcP = { ...sc.settings[0].spc, chart_type: "p" };
      sc.derivedSettings = [new derivedSettingsClass(), new derivedSettingsClass()];
      sc.derivedSettings[0].update(spcXbar);
      sc.derivedSettings[1].update(spcP);

      // DataView has numerators and denominators, but no SDs
      const dv = buildMockDataView({ roles: { numerators: true, denominators: true } });
      const result = validateDataView(dv as any, sc);
      expect(result).toBe("Chart type 'xbar' requires SDs!");
    });
  });
});
