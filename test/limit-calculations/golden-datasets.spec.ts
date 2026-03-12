import * as limitFunctions from "../../src/Limit Calculations";
import buildControlLimitsArgs from "../helpers/build-control-limits-args";
import assertLimitsMatch from "../helpers/assert-limits-match";
import type { GoldenDataset } from "../fixtures/golden/types";
import type { controlLimitsArgs, controlLimitsObject } from "../../src/Classes/viewModelClass";

// --- Load TypeScript-seeded fixtures ---

const tsI = require("../fixtures/golden/i/basic-ratio.json") as GoldenDataset;
const tsMR = require("../fixtures/golden/mr/basic-ratio.json") as GoldenDataset;
const tsC = require("../fixtures/golden/c/basic-group1.json") as GoldenDataset;
const tsP = require("../fixtures/golden/p/basic.json") as GoldenDataset;
const tsG = require("../fixtures/golden/g/basic.json") as GoldenDataset;
const tsT = require("../fixtures/golden/t/basic.json") as GoldenDataset;
const tsS = require("../fixtures/golden/s/basic.json") as GoldenDataset;
const tsXbar = require("../fixtures/golden/xbar/basic.json") as GoldenDataset;
const tsU = require("../fixtures/golden/u/basic.json") as GoldenDataset;
const tsPP = require("../fixtures/golden/pp/basic.json") as GoldenDataset;
const tsUP = require("../fixtures/golden/up/basic.json") as GoldenDataset;
const tsIM = require("../fixtures/golden/i_m/basic.json") as GoldenDataset;
const tsIMM = require("../fixtures/golden/i_mm/basic.json") as GoldenDataset;
const tsRun = require("../fixtures/golden/run/basic.json") as GoldenDataset;

// --- Load R-generated (qicharts2) fixtures (optional — null if not yet generated) ---
// Static require strings so webpack can resolve; try/catch handles missing files.

let rI: GoldenDataset | null = null;
let rMR: GoldenDataset | null = null;
let rC: GoldenDataset | null = null;
let rP: GoldenDataset | null = null;
let rG: GoldenDataset | null = null;
let rT: GoldenDataset | null = null;
let rS: GoldenDataset | null = null;
let rU: GoldenDataset | null = null;
let rPP: GoldenDataset | null = null;
let rUP: GoldenDataset | null = null;
let rIM: GoldenDataset | null = null;
let rIMM: GoldenDataset | null = null;
let rRun: GoldenDataset | null = null;
// xbar: no R reference (qicharts2 requires raw subgroup data)

try { rI = require("../fixtures/golden/i/basic-ratio.qicharts2.json"); } catch { /* not generated */ }
try { rMR = require("../fixtures/golden/mr/basic-ratio.qicharts2.json"); } catch { /* not generated */ }
try { rC = require("../fixtures/golden/c/basic-group1.qicharts2.json"); } catch { /* not generated */ }
try { rP = require("../fixtures/golden/p/basic.qicharts2.json"); } catch { /* not generated */ }
try { rG = require("../fixtures/golden/g/basic.qicharts2.json"); } catch { /* not generated */ }
try { rT = require("../fixtures/golden/t/basic.qicharts2.json"); } catch { /* not generated */ }
try { rS = require("../fixtures/golden/s/basic.qicharts2.json"); } catch { /* not generated */ }
try { rU = require("../fixtures/golden/u/basic.qicharts2.json"); } catch { /* not generated */ }
try { rPP = require("../fixtures/golden/pp/basic.qicharts2.json"); } catch { /* not generated */ }
try { rUP = require("../fixtures/golden/up/basic.qicharts2.json"); } catch { /* not generated */ }
try { rIM = require("../fixtures/golden/i_m/basic.qicharts2.json"); } catch { /* not generated */ }
try { rIMM = require("../fixtures/golden/i_mm/basic.qicharts2.json"); } catch { /* not generated */ }
try { rRun = require("../fixtures/golden/run/basic.qicharts2.json"); } catch { /* not generated */ }

// --- Map chart_type string to limit function ---

const limitFnMap: Record<string, (args: controlLimitsArgs) => controlLimitsObject> = {
  "i": limitFunctions.i,
  "i_m": limitFunctions.i_m,
  "i_mm": limitFunctions.i_mm,
  "c": limitFunctions.c,
  "g": limitFunctions.g,
  "mr": limitFunctions.mr,
  "p": limitFunctions.p,
  "pp": limitFunctions.pp,
  "run": limitFunctions.run,
  "s": limitFunctions.s,
  "t": limitFunctions.t,
  "u": limitFunctions.u,
  "up": limitFunctions.up,
  "xbar": limitFunctions.xbar,
};

// --- Test helpers ---

function runGoldenTest(golden: GoldenDataset): void {
  const fn = limitFnMap[golden.metadata.chart_type];
  if (!fn) {
    throw new Error(`No limit function for chart type: ${golden.metadata.chart_type}`);
  }

  const args = buildControlLimitsArgs({
    keys: golden.inputs.keys,
    numerators: golden.inputs.numerators,
    denominators: golden.inputs.denominators ?? undefined,
    xbar_sds: golden.inputs.xbar_sds ?? undefined,
    outliers_in_limits: golden.inputs.outliers_in_limits ?? true,
  });

  const actual = fn(args);
  assertLimitsMatch(actual, golden.expected, golden.metadata.precision);
}

/**
 * Asserts that two golden fixtures agree on expected values.
 * Uses the LOWER precision of the two fixtures for comparison.
 */
function assertFixturesAgree(ts: GoldenDataset, r: GoldenDataset): void {
  const precision = Math.min(ts.metadata.precision, r.metadata.precision);
  const limitKeys = ["targets", "values", "ul99", "ul95", "ul68", "ll68", "ll95", "ll99"] as const;

  for (const key of limitKeys) {
    const tsValues = ts.expected[key];
    const rValues = r.expected[key];

    // Only compare keys present in BOTH fixtures
    if (!tsValues || !rValues) continue;

    expect(tsValues.length).toBe(rValues.length);
    for (let i = 0; i < tsValues.length; i++) {
      expect(tsValues[i]).toBeCloseTo(rValues[i], precision);
    }
  }
}

/** Conditionally register an R-fixture test; skips (pending) if fixture not yet generated. */
function itR(description: string, fixture: GoldenDataset | null, testFn: (g: GoldenDataset) => void): void {
  if (fixture) {
    it(description, () => testFn(fixture));
  } else {
    xit(description + " [R fixture not generated]", () => {});
  }
}

// --- Test suites ---

describe("Golden Dataset Cross-Validation", () => {

  describe("I-chart", () => {
    it("matches TypeScript-seeded reference", () => runGoldenTest(tsI));
    itR("matches R qicharts2 reference", rI, runGoldenTest);
    itR("TypeScript and R references agree", rI, (r) => assertFixturesAgree(tsI, r));
  });

  describe("MR-chart", () => {
    it("matches TypeScript-seeded reference", () => runGoldenTest(tsMR));
    itR("matches R qicharts2 reference", rMR, runGoldenTest);
    itR("TypeScript and R references agree", rMR, (r) => assertFixturesAgree(tsMR, r));
  });

  describe("C-chart", () => {
    it("matches TypeScript-seeded reference", () => runGoldenTest(tsC));
    itR("matches R qicharts2 reference", rC, runGoldenTest);
    itR("TypeScript and R references agree", rC, (r) => assertFixturesAgree(tsC, r));
  });

  describe("P-chart", () => {
    it("matches TypeScript-seeded reference", () => runGoldenTest(tsP));
    itR("matches R qicharts2 reference", rP, runGoldenTest);
    itR("TypeScript and R references agree", rP, (r) => assertFixturesAgree(tsP, r));
  });

  describe("G-chart", () => {
    it("matches TypeScript-seeded reference", () => runGoldenTest(tsG));
    itR("matches R qicharts2 reference", rG, runGoldenTest);
    itR("TypeScript and R references agree", rG, (r) => assertFixturesAgree(tsG, r));
  });

  describe("T-chart", () => {
    it("matches TypeScript-seeded reference", () => runGoldenTest(tsT));
    itR("matches R qicharts2 reference", rT, runGoldenTest);
    itR("TypeScript and R references agree", rT, (r) => assertFixturesAgree(tsT, r));
  });

  describe("S-chart", () => {
    it("matches TypeScript-seeded reference", () => runGoldenTest(tsS));
    itR("matches R qicharts2 reference", rS, runGoldenTest);
    itR("TypeScript and R references agree", rS, (r) => assertFixturesAgree(tsS, r));
  });

  describe("XBar-chart", () => {
    // No R reference: qicharts2 requires raw subgroup data, not pre-computed means
    it("matches TypeScript-seeded reference", () => runGoldenTest(tsXbar));
  });

  describe("U-chart", () => {
    it("matches TypeScript-seeded reference", () => runGoldenTest(tsU));
    itR("matches R qicharts2 reference", rU, runGoldenTest);
    itR("TypeScript and R references agree", rU, (r) => assertFixturesAgree(tsU, r));
  });

  describe("P'-chart", () => {
    it("matches TypeScript-seeded reference", () => runGoldenTest(tsPP));
    itR("matches R reference (custom Laney method)", rPP, runGoldenTest);
    itR("TypeScript and R references agree", rPP, (r) => assertFixturesAgree(tsPP, r));
  });

  describe("U'-chart", () => {
    it("matches TypeScript-seeded reference", () => runGoldenTest(tsUP));
    itR("matches R reference (custom Laney method)", rUP, runGoldenTest);
    itR("TypeScript and R references agree", rUP, (r) => assertFixturesAgree(tsUP, r));
  });

  describe("I-median chart", () => {
    it("matches TypeScript-seeded reference", () => runGoldenTest(tsIM));
    itR("matches R reference (custom calculation)", rIM, runGoldenTest);
    itR("TypeScript and R references agree", rIM, (r) => assertFixturesAgree(tsIM, r));
  });

  describe("I-median-MR chart", () => {
    it("matches TypeScript-seeded reference", () => runGoldenTest(tsIMM));
    itR("matches R reference (custom calculation)", rIMM, runGoldenTest);
    itR("TypeScript and R references agree", rIMM, (r) => assertFixturesAgree(tsIMM, r));
  });

  describe("Run chart", () => {
    it("matches TypeScript-seeded reference", () => runGoldenTest(tsRun));
    itR("matches R qicharts2 reference", rRun, runGoldenTest);
    itR("TypeScript and R references agree", rRun, (r) => assertFixturesAgree(tsRun, r));
  });
});
