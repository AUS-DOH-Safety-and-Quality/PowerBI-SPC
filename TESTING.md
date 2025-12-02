# Testing Guide for PowerBI-SPC

This document provides comprehensive guidance on testing the PowerBI-SPC custom visual.

## Table of Contents

- [Quick Start](#quick-start)
- [Test Infrastructure](#test-infrastructure)
- [Running Tests](#running-tests)
- [Test Organization](#test-organization)
- [Writing Tests](#writing-tests)
- [Test Data Management](#test-data-management)
- [Debugging Tests](#debugging-tests)
- [Coverage Requirements](#coverage-requirements)
- [Continuous Integration](#continuous-integration)

---

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage report
npm test

# Run tests including gated failing tests
npm run test:failing

# Debug tests in browser
npm run debug
```

---

## Test Infrastructure

### Framework Stack

- **Test Runner:** Karma v6.4.4
- **Testing Framework:** Jasmine v5.12.0
- **Browser:** Chrome Headless (via Playwright Chromium)
- **Module Bundler:** Webpack v5.97.1
- **Coverage Tool:** Istanbul (karma-coverage-istanbul-reporter)

### Configuration Files

- `karma.conf.ts` - Karma test runner configuration
- `test.tsconfig.json` - TypeScript compiler options for tests
- `test.webpack.config.js` - Webpack bundling configuration for tests

---

## Running Tests

### Basic Commands

```bash
# Run all tests (default)
npm test

# Run tests including gated failing tests
npm run test:failing

# Open tests in browser for debugging
npm run debug
```

### Environment Variables

- `RUN_FAILING_TESTS=true` - Include tests gated behind the `itFailing()` helper

### Running Specific Test Suites

Use Karma's `--grep` option to run specific tests:

```bash
# Run tests matching a pattern
npm test -- --grep="Performance"

# Run tests for a specific chart type
npm test -- --grep="I chart"

# Run regression tests only
npm test -- --grep="Regression"
```

---

## Test Organization

### Test Categories

Tests are organized into the following categories:

#### 1. Unit Tests (60% of test suite)

**Location:** `test/test-functions-*.ts`, `test/test-limits-*.ts`, `test/test-outlier-*.ts`

**Purpose:** Test individual functions in isolation

**Examples:**
- `test/test-functions-math.ts` - Mathematical utility functions
- `test/test-functions-broadcasting.ts` - Array broadcasting operations
- `test/test-limits-basic.ts` - Basic SPC chart limit calculations
- `test/test-outlier-rules.ts` - Outlier detection rules

#### 2. Integration Tests (30% of test suite)

**Location:** `test/test-*-class.ts`, `test/test-d3-*.ts`, `test/test-visual-*.ts`

**Purpose:** Test interactions between components

**Examples:**
- `test/test-viewmodel-class.ts` - View model data orchestration
- `test/test-d3-rendering.ts` - D3 rendering with data
- `test/test-visual-lifecycle.ts` - Complete visual lifecycle

#### 3. Performance Tests (5% of test suite)

**Location:** `test/test-performance-*.ts`, `test/test-large-datasets.ts`

**Purpose:** Validate performance and scalability

**Examples:**
- `test/test-performance-calculations.ts` - Calculation performance benchmarks
- `test/test-performance-rendering.ts` - Rendering performance
- `test/test-large-datasets.ts` - Large dataset handling

#### 4. Regression Tests (5% of test suite)

**Location:** `test/test-regression-suite.ts`

**Purpose:** Prevent regressions using golden datasets

**Examples:**
- Reference dataset validation
- Baseline calculations
- API compatibility

### Test File Naming Conventions

- `test-{component}.ts` - Unit tests for a specific component
- `test-{component}-class.ts` - Tests for class-based components
- `test-{category}-{subcategory}.ts` - Tests for specific categories
- `test-performance-{aspect}.ts` - Performance-related tests
- `test-regression-suite.ts` - Regression tests

---

## Writing Tests

### Basic Test Structure

```typescript
import { functionToTest } from "../src/path/to/function";

describe("Component Name", () => {
  
  describe("Function Name", () => {
    
    it("should do something specific", () => {
      // Arrange
      const input = { /* test data */ };
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe(expectedValue);
    });
    
    it("should handle edge case", () => {
      // Test edge case
    });
  });
});
```

### Using Test Helpers

#### Assertions

The `test/helpers/assertions.ts` file provides custom assertion functions:

```typescript
import {
  assertControlLimitsStructure,
  assertControlLimitsLength,
  assertControlLimitsValid,
  assertApproximately,
  LIMIT_TOLERANCE
} from "./helpers/assertions";

it("should calculate correct limits", () => {
  const result = calculateLimits(data);
  
  // Validate structure
  assertControlLimitsStructure(result);
  
  // Validate length
  assertControlLimitsLength(result, 10);
  
  // Validate values
  assertControlLimitsValid(result);
  
  // Check specific value
  assertApproximately(result.cl[0], 50.0, LIMIT_TOLERANCE);
});
```

#### Test Constants

The `test/helpers/testConstants.ts` file provides test-specific constants:

```typescript
import {
  TOLERANCE,
  DATASET_SIZES,
  PERFORMANCE_TARGETS,
  TEST_PATTERNS
} from "./helpers/testConstants";

it("should detect astronomical outliers", () => {
  const data = TEST_PATTERNS.ASTRONOMICAL.ABOVE;
  const result = detectOutliers(data);
  expect(result[3]).toBe(1); // Point 3 is above limit
});
```

#### Test Data Fixtures

The `test/fixtures/` directory provides reusable test datasets:

```typescript
import { simpleAscending, constantValues, withOutlier } from "./fixtures/test-data-basic";
import { nhsAE4Hour, montgomeryPistonRings } from "./fixtures/test-data-reference";
import { extremelySkewed, bimodalDistribution } from "./fixtures/test-data-edge-cases";

it("should handle NHS reference data", () => {
  const result = calculateLimits(nhsAE4Hour);
  assertApproximately(result.cl[0], nhsAE4Hour.expectedCL, LIMIT_TOLERANCE);
});
```

### Test Data Builder

Use `buildDataView` to create PowerBI DataView objects for testing:

```typescript
import buildDataView from "./helpers/buildDataView";

it("should process PowerBI data", () => {
  const dataView = buildDataView({
    key: ["Jan", "Feb", "Mar"],
    numerators: [45, 50, 48],
    denominators: [100, 100, 100]
  });
  
  const result = processDataView(dataView);
  expect(result).toBeDefined();
});
```

### Testing Patterns

#### Testing Pure Functions

```typescript
describe("Mathematical Functions", () => {
  it("should add arrays element-wise", () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    const result = add(a, b);
    expect(result).toEqual([5, 7, 9]);
  });
});
```

#### Testing with Edge Cases

```typescript
describe("Edge Cases", () => {
  it("should handle empty array", () => {
    expect(sum([])).toBe(0);
  });
  
  it("should handle null values", () => {
    expect(sum([1, null, 3])).toBe(4);
  });
  
  it("should handle division by zero", () => {
    const result = divide(10, 0);
    expect(result).toBeNull();
  });
});
```

#### Testing Limit Calculations

```typescript
describe("I Chart Limits", () => {
  it("should calculate limits for typical data", () => {
    const args = {
      keys: ["A", "B", "C", "D", "E"],
      numerators: [48, 52, 49, 51, 50],
      subset_points: [0, 1, 2, 3, 4]
    };
    
    const result = iLimits(args);
    
    assertControlLimitsStructure(result);
    assertControlLimitsLength(result, 5);
    assertControlLimitsValid(result);
    expect(result.cl[0]).toBeGreaterThan(0);
  });
});
```

#### Testing Outlier Detection

```typescript
describe("Astronomical Rule", () => {
  it("should flag points outside 3-sigma limits", () => {
    const values = [50, 51, 49, 200, 50, 51]; // 200 is outlier
    const ul99 = [60, 60, 60, 60, 60, 60];
    const ll99 = [40, 40, 40, 40, 40, 40];
    
    const flags = astronomical(values, ll99, ul99);
    
    expect(flags[3]).toBe(1); // Above limit
    expect(flags[0]).toBe(0); // Normal
  });
});
```

#### Testing Visual Rendering

```typescript
describe("D3 Rendering", () => {
  it("should create SVG elements", () => {
    const svg = d3.select("body").append("svg");
    drawDots(svg, data, settings);
    
    const dots = svg.selectAll("circle");
    expect(dots.size()).toBe(data.length);
  });
});
```

### Gated Failing Tests

For tests that document known bugs, use the `itFailing()` helper:

```typescript
const itFailing = typeof process !== 'undefined' && process.env.RUN_FAILING_TESTS === "true"
  ? it
  : xit;

describe("Known Bugs", () => {
  itFailing("should handle division by zero gracefully", () => {
    // This test fails due to known bug
    const result = calculateLimits(dataWithZeroDenominators);
    expect(result.ul99[0]).toBeNull(); // Currently returns Infinity
  });
});
```

---

## Test Data Management

### Test Fixtures

Test fixtures are organized in `test/fixtures/`:

#### Basic Test Data (`test-data-basic.ts`)

Simple, reusable datasets for common scenarios:
- `simpleAscending` - Sequential increasing values
- `constantValues` - No variation
- `withOutlier` - Dataset with a single outlier
- `withShift` - Dataset with a process shift
- `withTrend` - Dataset with a trend

#### Reference Test Data (`test-data-reference.ts`)

Published examples from SPC literature:
- `nhsAE4Hour` - NHS Making Data Count example
- `nhsHospitalInfections` - C. diff infections example
- `montgomeryPistonRings` - Montgomery textbook example

#### Edge Case Test Data (`test-data-edge-cases.ts`)

Boundary conditions and error cases:
- `emptyDataset` - No data points
- `nullValues` - Null and undefined values
- `zeroDenominators` - Division by zero scenarios
- `extremelySkewed` - Highly skewed distribution

### Creating New Test Data

```typescript
// In test/fixtures/test-data-basic.ts
export const myNewDataset = {
  keys: ["A", "B", "C"],
  numerators: [10, 20, 30],
  denominators: [100, 100, 100],
  description: "Description of what this tests"
};
```

---

## Debugging Tests

### Browser Debugging

```bash
# Open tests in Chrome browser (not headless)
npm run debug
```

This will:
1. Open Chrome browser
2. Navigate to test page
3. Keep browser open for debugging
4. Show console output

### Console Logging

Add `console.log()` statements to tests for debugging:

```typescript
it("should calculate correctly", () => {
  const result = calculate(data);
  console.log("Result:", result);
  console.log("Centerline:", result.cl);
  expect(result).toBeDefined();
});
```

### Debugging Specific Tests

Use `fit()` to run only one test:

```typescript
fit("should focus on this test only", () => {
  // Only this test will run
});
```

Use `fdescribe()` to run only one describe block:

```typescript
fdescribe("Focus on this suite", () => {
  it("test 1", () => {});
  it("test 2", () => {});
});
```

### Common Issues

#### Tests Pass Locally but Fail in CI

**Cause:** Performance timing differences in CI environment

**Solution:** Use relaxed performance targets or skip timing assertions in CI

```typescript
const timeout = process.env.CI ? 200 : 100;
expect(duration).toBeLessThan(timeout);
```

#### Flaky Tests

**Cause:** Non-deterministic behavior (timing, randomness)

**Solution:** 
- Use fixed random seeds
- Use median of multiple runs for timing
- Add retry logic for network-dependent tests

#### Memory Leaks

**Cause:** Not cleaning up DOM elements or event listeners

**Solution:**
```typescript
afterEach(() => {
  d3.select("body").selectAll("svg").remove();
});
```

---

## Coverage Requirements

### Overall Coverage Targets

| Metric | Target | Current |
|--------|--------|---------|
| **Statements** | ≥ 85% | 77.40% |
| **Branches** | ≥ 75% | 62.81% |
| **Functions** | ≥ 85% | 82.33% |
| **Lines** | ≥ 85% | 77.23% |

### Component-Specific Targets

| Component | Target | Rationale |
|-----------|--------|-----------|
| **Functions/** | 95%+ | Pure logic, critical |
| **Limit Calculations/** | 98%+ | Mathematical core |
| **Outlier Flagging/** | 95%+ | Rule detection |
| **Classes/** | 80%+ | Integration points |
| **D3 Plotting Functions/** | 75%+ | Visual rendering |
| **visual.ts** | 85%+ | Main orchestration |

### Viewing Coverage Reports

After running `npm test`, coverage reports are available in:
- **Terminal:** Summary printed at end of test run
- **HTML Report:** `.tmp/coverage/html/index.html` (if configured)

### Improving Coverage

1. **Identify uncovered code:**
   - Check coverage report
   - Look for red/yellow highlighted lines

2. **Write targeted tests:**
   - Focus on uncovered branches
   - Test error conditions
   - Test edge cases

3. **Remove dead code:**
   - If code is truly unused, consider removing it

---

## Continuous Integration

### CI Pipeline

Tests run automatically on:
- **Every Pull Request:** All tests must pass
- **Every commit to main:** Regression protection
- **Nightly:** Performance tests and full suite

### CI-Specific Considerations

#### Performance Targets

CI environments are typically 2-3x slower than local development:

```typescript
// Adjust targets for CI
const isCI = process.env.CI === "true";
const performanceTarget = isCI ? 200 : 100;

expect(duration).toBeLessThan(performanceTarget);
```

#### Parallel Execution

Tests should be independent and not rely on execution order.

#### Artifacts

- Test results: JUnit XML format
- Coverage reports: Istanbul JSON/HTML
- Performance baselines: JSON files

---

## Best Practices

### DO

✅ Write descriptive test names that explain what is being tested  
✅ Test one thing per test  
✅ Use assertion helpers for common patterns  
✅ Test edge cases and error conditions  
✅ Keep tests fast (< 100ms per test)  
✅ Make tests deterministic  
✅ Clean up after tests (remove DOM elements, etc.)  
✅ Use test fixtures for common data  
✅ Document complex test scenarios  
✅ Gate known failing tests with `itFailing()`

### DON'T

❌ Test implementation details  
❌ Write tests that depend on execution order  
❌ Use hard-coded delays (`setTimeout`)  
❌ Test third-party library code  
❌ Create tests that rely on external services  
❌ Use random data without a fixed seed  
❌ Leave commented-out tests  
❌ Ignore failing tests  
❌ Skip writing tests for bug fixes  
❌ Make assumptions about test execution environment

---

## Troubleshooting

### Test Won't Run

**Problem:** Test file not being picked up

**Solution:** Ensure file matches pattern in `karma.conf.ts`:
```typescript
files: [
  "test/**/*.ts"  // All .ts files in test/ directory
]
```

### Import Errors

**Problem:** Cannot find module

**Solution:** Check import paths are relative to test file:
```typescript
// Correct
import { func } from "../src/path/to/module";

// Incorrect
import { func } from "src/path/to/module";
```

### Type Errors

**Problem:** TypeScript compilation errors in tests

**Solution:** Check `test.tsconfig.json` includes test directory:
```json
{
  "include": ["test/**/*", "src/**/*"]
}
```

### Tests Timeout

**Problem:** Test exceeds default timeout

**Solution:** Increase timeout for specific test:
```typescript
it("long running test", (done) => {
  // Test code
  done();
}, 10000); // 10 second timeout
```

---

## Additional Resources

- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Documentation](https://karma-runner.github.io/)
- [PowerBI Custom Visuals API](https://docs.microsoft.com/en-us/power-bi/developer/visuals/)
- [TEST_EXTENSION_PLAN.md](./TEST_EXTENSION_PLAN.md) - Overall testing strategy
- [TEST_MAINTENANCE.md](./TEST_MAINTENANCE.md) - Maintenance guidelines

---

## Contributing

When adding new tests:

1. Follow existing test structure and naming conventions
2. Add tests in appropriate category (unit/integration/performance)
3. Use existing test helpers and fixtures when possible
4. Update this documentation if adding new patterns
5. Ensure all tests pass locally before committing
6. Verify coverage hasn't decreased

---

**Last Updated:** November 22, 2025  
**Test Count:** 847 tests (836 total, 11 skipped)  
**Coverage:** 77.40% statements
