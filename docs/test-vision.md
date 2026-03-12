# PowerBI-SPC Test Vision

This document defines the long-term test strategy for the PowerBI-SPC custom visual.
This visual powers healthcare dashboards where incorrect SPC calculations could lead to
wrong clinical decisions. The test infrastructure must be **enterprise-grade, reliable,
and traceable**.

---

## 1. Test Philosophy

### Guiding Principles

1. **Correctness over coverage** -- A test that validates the wrong expected value is worse
   than no test. All SPC calculation tests must be cross-validated against published
   statistical references or independent implementations (R `qicharts2`, NIST tables).
2. **Defence in depth** -- Every critical calculation is tested at multiple levels: unit
   (pure function), integration (full pipeline), and invariant (property-based).
3. **Traceability** -- Every test must trace back to a statistical requirement or user-facing
   behaviour. See the [Traceability Matrix](#8-traceability-matrix).
4. **Regression prevention** -- Every bug fix includes a regression test referencing the
   issue number. Golden datasets are version-controlled and regenerable.
5. **Fail-safe defaults** -- Tests should fail closed. If a statistical constant cannot be
   validated, the test fails rather than silently passing.

---

## 2. Test Tiers

### Tier 1: Unit Tests (target: < 5s)
Pure function tests with no DOM or Visual dependency.

| Category | Directory | Coverage Target |
|----------|-----------|----------------|
| Statistical constants | `test/functions/sample-constants.spec.ts` | 100% |
| Utility functions | `test/functions/` | 85% statements |
| Outlier flagging rules | `test/outlier-flagging/` | 95% statements |
| Direct limit calculations | `test/limit-calculations/` | 95% statements |

### Tier 2: Integration Tests (target: < 30s)
Tests that instantiate the Visual and verify the full data pipeline.

| Category | Directory | Coverage Target |
|----------|-----------|----------------|
| Chart type limit verification | `test/chart-types/` | All 14 chart types |
| Pipeline integration | `test/integration/` | 75% of viewModelClass |
| Error handling | `test/errors/` | All 13 ValidationFailTypes |
| Settings propagation | `test/settings/` | All setting categories |

### Tier 3: Visual Tests (target: < 2min)
Tests that verify rendered SVG structure and behaviour.

| Category | Directory | Coverage Target |
|----------|-----------|----------------|
| Rendering structure | `test/rendering/` | All D3 drawing functions |
| Accessibility | `test/accessibility/` | WCAG 2.1 AA compliance |
| Performance | `test/performance/` | < 500ms for 1000 points |

---

## 3. Coverage Targets by Criticality Zone

### Zone 1: Safety-Critical (95%+ statement coverage)
Code where errors directly affect clinical decisions.

- `src/Limit Calculations/` -- All 14 chart type limit functions
- `src/Outlier Flagging/` -- All 4 detection rules + flag direction + icon selection
- `src/Functions/sampleConstants.ts` -- c4, c5, a3, b3, b4 constants
- `src/Functions/gamma.ts`, `lgamma.ts`, `chebyshevPolynomial.ts` -- Math primitives

### Zone 2: Data Integrity (85%+ statement coverage)
Code that processes and validates input data.

- `src/Functions/extractInputData.ts`
- `src/Functions/validateDataView.ts`
- `src/Functions/extractDataColumn.ts`
- `src/Classes/viewModelClass.ts` (update pipeline)
- `src/Classes/settingsClass.ts`

### Zone 3: Presentation (60%+ statement coverage)
Code that renders output. Errors are visible but not safety-critical.

- `src/D3 Plotting Functions/`
- `src/Classes/plotPropertiesClass.ts`
- `src/Classes/derivedSettingsClass.ts`

### Zone 4: Utilities (40%+ statement coverage)
Simple helper functions with minimal logic.

- Trivial functions: `isNullOrUndefined`, `isValidNumber`, `last`, `truncate`
- Formatting: `formatPrimitiveValue`, `dateSettingsToFormatOptions`

---

## 4. Cross-Validation Strategy

### Golden Datasets (R `qicharts2`)

For each chart type, we maintain JSON fixture files generated from R's `qicharts2` package.
These serve as the **ground truth** for limit calculations.

**Location:** `test/fixtures/golden/<chart-type>/<scenario>.json`

**Format:**
```json
{
  "metadata": {
    "chart_type": "i",
    "source": "qicharts2 0.7.4, R 4.3.1",
    "reference": "Montgomery 2009, Chapter 6",
    "generated_date": "2026-03-12"
  },
  "inputs": {
    "keys": ["2024-01-01", "2024-02-01"],
    "numerators": [10, 12],
    "denominators": null
  },
  "expected": {
    "targets": [11, 11],
    "ul99": [17.3, 17.3],
    "ul95": [15.2, 15.2],
    "ll95": [6.8, 6.8],
    "ll99": [4.7, 4.7]
  }
}
```

**Regeneration:** `test/fixtures/golden/generators/generate_golden.R`

### Published Statistical Tables

Statistical constants (c4, A3, B3, B4, d2) are verified against:
- Montgomery, "Introduction to Statistical Quality Control", Table VI
- NIST/SEMATECH e-Handbook of Statistical Methods
- ASTM E2587 Standard

### Mathematical Identities

Property-based tests verify that calculations satisfy known invariants regardless of
input data:
- Limit ordering: `ll99 <= ll95 <= ll68 <= target <= ul68 <= ul95 <= ul99`
- Symmetry (where applicable): `ul99 - target == target - ll99`
- Non-negativity constraints per chart type
- Monotonicity of statistical constants

---

## 5. Mutation Testing

**Tool:** Stryker Mutator (scoped to safety-critical code only)

**Scope:**
- `src/Limit Calculations/**/*.ts`
- `src/Outlier Flagging/**/*.ts`
- `src/Functions/sampleConstants.ts`
- `src/Functions/gamma.ts`, `lgamma.ts`

**Targets:**
- Limit Calculations: 80%+ mutation score
- Outlier Flagging: 85%+ mutation score

**Schedule:** Nightly CI job (not PR-gating due to runtime)

---

## 6. Edge Case Catalogue

### Universal Edge Cases (all chart types)
| Case | Input | Expected Behaviour |
|------|-------|--------------------|
| Minimum data (n=2) | 2 data points | Valid limits calculated |
| Single point (n=1) | 1 data point | Graceful handling (no MR possible) |
| All identical values | `[5, 5, 5, 5, 5]` | Sigma = 0, limits collapse to centreline |
| All zeros | `[0, 0, 0, 0, 0]` | Centreline = 0, limits at 0 |
| NaN in data | `[1, NaN, 3]` | NaN excluded or error raised |
| Null in data | `[1, null, 3]` | Null excluded or error raised |
| Very large values | `[1e15, 1e15+1]` | No precision loss |
| Very small values | `[1e-15, 2e-15]` | No underflow |
| Negative values | `[-5, -3, -1]` | Valid for i, xbar; error for c, g |

### Chart-Specific Edge Cases
| Chart Type | Case | Expected |
|------------|------|----------|
| P-chart | denominator = 0 | Error or exclusion |
| P-chart | numerator > denominator | Error raised |
| P-chart | all proportions = 0 | Limits at 0, no negative |
| C-chart | negative counts | Error raised |
| XBar | subgroup size = 1 | a3(1) = null, error |
| G-chart | all zeros | Centreline = 0 |
| T-chart | zero time | Error or exclusion |
| Run chart | any data | Only centreline, no limits |

### Subset Point Edge Cases
| Case | Expected |
|------|----------|
| Full subset (all points) | Same as default |
| First half only | Limits from first half, applied to all |
| Single point subset | Degenerate but handled |
| Empty subset | Error or fallback |
| Out-of-range indices | Error raised |

---

## 7. Regression Testing Protocol

### Bug-Fix Workflow
1. Bug reported (GitHub issue created)
2. **Write a failing test** that reproduces the bug
3. Fix the bug in source code
4. Test now passes
5. Add comment to test: `// Regression: fixes #<issue_number>`
6. Update golden datasets if limit calculations affected
7. Commit test + fix together

### Regression Test Location
- Bugs in specific modules: test goes in that module's test directory
- Cross-cutting bugs: `test/regression/regressions.spec.ts`
- Golden dataset regressions: `test/fixtures/golden/regression/`

---

## 8. Traceability Matrix

| ID | Requirement | Source Module | Test File(s) | Status |
|----|-------------|---------------|-------------|--------|
| SPC-001 | I-chart limits (mean ± 3σ, σ=AMR/d2) | `Limit Calculations/i.ts` | `chart-types/i.spec.ts`, `limit-calculations/i-limits.spec.ts` | Partial |
| SPC-002 | I-chart median variant | `Limit Calculations/i_m.ts` | `chart-types/i-m.spec.ts` | Planned |
| SPC-003 | I-chart median MR variant | `Limit Calculations/i_mm.ts` | `chart-types/i-mm.spec.ts` | Planned |
| SPC-004 | P-chart limits (binomial) | `Limit Calculations/p.ts` | `chart-types/p.spec.ts` | Partial |
| SPC-005 | P'-chart (fixed limits) | `Limit Calculations/pprime.ts` | `chart-types/pprime.spec.ts` | Partial |
| SPC-006 | C-chart limits (Poisson) | `Limit Calculations/c.ts` | `chart-types/c.spec.ts` | Partial |
| SPC-007 | U-chart limits (rate) | `Limit Calculations/u.ts` | `chart-types/u.spec.ts` | Partial |
| SPC-008 | U'-chart (fixed limits) | `Limit Calculations/uprime.ts` | `chart-types/uprime.spec.ts` | Partial |
| SPC-009 | XBar-chart limits (A3) | `Limit Calculations/xbar.ts` | `chart-types/xbar.spec.ts` | Partial |
| SPC-010 | S-chart limits (B3/B4) | `Limit Calculations/s.ts` | `chart-types/s.spec.ts` | Partial |
| SPC-011 | MR-chart limits | `Limit Calculations/mr.ts` | `chart-types/mr.spec.ts` | Partial |
| SPC-012 | G-chart limits | `Limit Calculations/g.ts` | `chart-types/g.spec.ts` | Partial |
| SPC-013 | T-chart limits | `Limit Calculations/t.ts` | `chart-types/t.spec.ts` | Partial |
| SPC-014 | Run chart (median only) | `Limit Calculations/run.ts` | `chart-types/run.spec.ts` | Planned |
| OUT-001 | Astronomical point (>3σ) | `Outlier Flagging/astronomical.ts` | `outlier-flagging/astronomical.spec.ts` | Done |
| OUT-002 | Shift detection | `Outlier Flagging/shift.ts` | `outlier-flagging/shift.spec.ts` | Done |
| OUT-003 | Trend detection | `Outlier Flagging/trend.ts` | `outlier-flagging/trend.spec.ts` | Done |
| OUT-004 | Two-in-three rule | `Outlier Flagging/twoInThree.ts` | `outlier-flagging/two-in-three.spec.ts` | Done |
| OUT-005 | Flag direction check | `Outlier Flagging/checkFlagDirection.ts` | `outlier-flagging/check-flag-direction.spec.ts` | Done |
| OUT-006 | Variation icon selection | `Outlier Flagging/variationIconsToDraw.ts` | `outlier-flagging/variation-icons-to-draw.spec.ts` | Done |
| OUT-007 | Assurance icon selection | `Outlier Flagging/assuranceIconToDraw.ts` | `outlier-flagging/assurance-icon-to-draw.spec.ts` | Done |
| CONST-001 | c4 bias correction | `Functions/sampleConstants.ts` | `functions/sample-constants.spec.ts` | Planned |
| CONST-002 | c5 relative variability | `Functions/sampleConstants.ts` | `functions/sample-constants.spec.ts` | Planned |
| CONST-003 | A3 X-bar factor | `Functions/sampleConstants.ts` | `functions/sample-constants.spec.ts` | Planned |
| CONST-004 | B3/B4 S-chart factors | `Functions/sampleConstants.ts` | `functions/sample-constants.spec.ts` | Planned |
| VAL-001 | Data validation (13 types) | `Functions/validateInputData.ts` | `errors/validation-inputdata.spec.ts` | Planned |
| VAL-002 | DataView validation | `Functions/validateDataView.ts` | `errors/validation-dataview.spec.ts` | Planned |
| INV-001 | Limit ordering invariant | All limit calculations | `limit-calculations/limit-invariants.spec.ts` | Planned |
| INV-002 | Non-negativity constraints | p, c, u, g, t limit calcs | `limit-calculations/limit-invariants.spec.ts` | Planned |

**Status key:** Done = tested and validated | Partial = basic test exists, needs expansion | Planned = test to be created

---

## 9. Developer Workflow

### Running Tests Locally
```bash
# Run all tests (headless)
npm test

# Run unit tests only (fast feedback)
npm run test:unit

# Run integration tests
npm run test:integration

# Run tests with Chrome UI for debugging
npm run debug

# Run mutation testing (slow, nightly)
npm run test:mutation

# View coverage report
open coverage/html-report/index.html
```

### Adding a New Chart Type Test
1. Generate golden dataset: add scenario to `test/fixtures/golden/generators/generate_golden.R`
2. Run R script to generate JSON fixture
3. Create `test/chart-types/<type>.spec.ts` following existing pattern
4. Create `test/limit-calculations/<type>-limits.spec.ts` for direct function testing
5. Add invariant checks in `test/limit-calculations/limit-invariants.spec.ts`
6. Update traceability matrix in this document
7. Run `npm test` and verify all pass

### Adding a Regression Test
1. Create issue on GitHub describing the bug
2. Write failing test referencing `// Regression: fixes #<number>`
3. Fix the bug
4. Verify test passes
5. If limit calculation affected, update golden datasets

---

## 10. CI Pipeline

### PR Checks (required to merge)
1. Lint (`pbiviz lint`)
2. Unit tests with coverage thresholds
3. Integration tests
4. Build verification (`pbiviz package`)
5. Coverage delta check (must not decrease)

### Nightly Jobs
1. Mutation testing (Stryker)
2. Full coverage report generation
3. Golden dataset validation (if generators changed)

### Release Gates
1. All PR checks pass
2. Mutation score above thresholds
3. No "Planned" items in traceability matrix for modified modules
4. Visual regression baselines reviewed (if rendering changed)

---

## 11. Future Considerations

- **Visual regression testing** via Playwright screenshot comparison (separate suite)
- **Accessibility testing** for WCAG 2.1 AA compliance (ARIA labels, keyboard nav, high contrast)
- **Performance benchmarking** with large datasets (1000+ points)
- **Contract testing** for PowerBI API compatibility across visual API versions
- **Chaos testing** for malformed DataView inputs from PowerBI host
