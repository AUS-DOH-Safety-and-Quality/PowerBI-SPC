# Test Maintenance Guide

This document provides guidelines for maintaining the test suite for the PowerBI-SPC custom visual.

## Table of Contents

- [When to Update Tests](#when-to-update-tests)
- [Test Review Process](#test-review-process)
- [Handling Flaky Tests](#handling-flaky-tests)
- [Test Refactoring Guidelines](#test-refactoring-guidelines)
- [Test Performance Optimization](#test-performance-optimization)
- [Managing Test Dependencies](#managing-test-dependencies)
- [Documentation Updates](#documentation-updates)

---

## When to Update Tests

### Code Changes

**Add tests when:**
- Adding new features
- Adding new chart types
- Adding new utility functions
- Adding new validation rules

**Update tests when:**
- Changing function signatures
- Changing expected behavior
- Renaming functions or classes
- Refactoring code structure

**Example:**
```typescript
// Before: Function changed from returning number to number|null
function calculate(x: number): number { ... }

// After: Update test expectations
it("should return null for invalid input", () => {
  expect(calculate(NaN)).toBeNull(); // Previously would fail
});
```

### Bug Fixes

**Always:**
1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify the test now passes
4. Keep the test to prevent regression

**Example:**
```typescript
describe("Bug #123: Division by zero", () => {
  it("should return null instead of Infinity for zero denominator", () => {
    const result = divide(10, 0);
    expect(result).toBeNull();
  });
});
```

### New Features

**Test-Driven Development (TDD) Approach:**
1. Write tests for new feature first
2. Tests will fail initially
3. Implement the feature
4. Tests should pass
5. Refactor if needed

**Example:**
```typescript
describe("New Feature: Z-Score Chart", () => {
  it("should calculate z-scores", () => {
    const result = zScoreChart(data);
    expect(result.values[0]).toBeCloseTo(0, 2);
  });
  
  it("should handle edge cases", () => {
    // Test edge cases
  });
});
```

### Dependency Updates

**When updating npm packages:**
1. Run full test suite before updating
2. Update dependencies
3. Run tests again
4. Fix any breaking changes
5. Update test dependencies if needed

---

## Test Review Process

### Pull Request Checklist

Before merging code changes, verify:

- [ ] All tests pass locally
- [ ] All tests pass in CI
- [ ] No test coverage decrease
- [ ] New code has appropriate tests
- [ ] Edge cases are tested
- [ ] Documentation updated
- [ ] No commented-out tests
- [ ] No `.only` or `.skip` modifiers left in code

### Code Review Guidelines

**Review tests for:**
- **Clarity:** Test name clearly describes what is tested
- **Independence:** Tests don't depend on execution order
- **Completeness:** Edge cases and error conditions tested
- **Performance:** Tests complete in reasonable time
- **Maintainability:** Tests use helpers and fixtures appropriately

**Example - Good Test:**
```typescript
it("should calculate control limits for P chart with variable denominators", () => {
  const args = {
    keys: ["A", "B", "C"],
    numerators: [5, 10, 8],
    denominators: [50, 100, 75],
    subset_points: [0, 1, 2]
  };
  
  const result = pLimits(args);
  
  assertControlLimitsValid(result);
  expect(result.ul99[1]).not.toEqual(result.ul99[0]); // Limits should vary
});
```

**Example - Test Needs Improvement:**
```typescript
it("should work", () => {  // ❌ Vague name
  const r = pLimits(d);    // ❌ Unclear variable names
  expect(r).toBeTruthy();  // ❌ Weak assertion
});
```

---

## Handling Flaky Tests

### Identifying Flaky Tests

A flaky test is one that passes and fails without code changes. Common causes:

1. **Timing issues** - Tests depend on timing
2. **Random data** - Tests use Math.random() without seed
3. **Network dependencies** - Tests make external requests
4. **State pollution** - Tests affect each other
5. **Environment differences** - CI vs. local

### Fixing Flaky Tests

#### 1. Timing Issues

**Problem:**
```typescript
it("should complete quickly", () => {
  const start = Date.now();
  calculate(data);
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(10); // ❌ Flaky on slow machines
});
```

**Solution:**
```typescript
it("should complete in reasonable time", () => {
  const times = [];
  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    calculate(data);
    times.push(performance.now() - start);
  }
  
  // Use median time
  times.sort((a, b) => a - b);
  const medianTime = times[Math.floor(times.length / 2)];
  
  // Relaxed threshold
  expect(medianTime).toBeLessThan(50);
});
```

#### 2. Random Data

**Problem:**
```typescript
it("should handle random data", () => {
  const data = Array.from({ length: 10 }, () => Math.random()); // ❌ Non-deterministic
  const result = calculate(data);
  expect(result).toBe(expectedValue);
});
```

**Solution:**
```typescript
it("should handle random data", () => {
  // Use seeded random or fixed data
  const data = [0.5, 0.3, 0.7, 0.2, 0.9, 0.4, 0.6, 0.8, 0.1, 0.5];
  const result = calculate(data);
  expect(result).toBeCloseTo(expectedValue, 2);
});
```

#### 3. State Pollution

**Problem:**
```typescript
let sharedData = [];

it("test 1", () => {
  sharedData.push(1); // ❌ Modifies shared state
  expect(sharedData.length).toBe(1);
});

it("test 2", () => {
  expect(sharedData.length).toBe(0); // ❌ Fails if test 1 ran first
});
```

**Solution:**
```typescript
describe("Tests", () => {
  let data;
  
  beforeEach(() => {
    data = []; // ✅ Fresh state for each test
  });
  
  it("test 1", () => {
    data.push(1);
    expect(data.length).toBe(1);
  });
  
  it("test 2", () => {
    expect(data.length).toBe(0);
  });
});
```

### Gating Flaky Tests

If a test is persistently flaky and cannot be easily fixed:

```typescript
const itFailing = typeof process !== 'undefined' && process.env.RUN_FAILING_TESTS === "true"
  ? it
  : xit;

itFailing("sometimes fails in CI", () => {
  // Flaky test
});
```

**Document the issue:**
```typescript
// TODO: Fix flaky test - Issue #456
// This test occasionally fails in CI due to timing issues
itFailing("should complete in 10ms", () => {
  // Test code
});
```

---

## Test Refactoring Guidelines

### When to Refactor Tests

Refactor tests when:
- Tests are difficult to understand
- Tests have significant duplication
- Tests are slow without good reason
- Tests use outdated patterns

### Refactoring Patterns

#### Extract Test Data

**Before:**
```typescript
it("test 1", () => {
  const data = {
    keys: ["A", "B", "C"],
    numerators: [10, 20, 30],
    denominators: [100, 100, 100]
  };
  // Test code
});

it("test 2", () => {
  const data = {
    keys: ["A", "B", "C"],
    numerators: [10, 20, 30],
    denominators: [100, 100, 100]
  };
  // Test code
});
```

**After:**
```typescript
// In test/fixtures/test-data-basic.ts
export const basicData = {
  keys: ["A", "B", "C"],
  numerators: [10, 20, 30],
  denominators: [100, 100, 100]
};

// In test file
import { basicData } from "./fixtures/test-data-basic";

it("test 1", () => {
  // Use basicData
});

it("test 2", () => {
  // Use basicData
});
```

#### Extract Assertion Logic

**Before:**
```typescript
it("test 1", () => {
  const result = calculate(data);
  expect(result.cl).toBeDefined();
  expect(result.ll99).toBeDefined();
  expect(result.ul99).toBeDefined();
  expect(result.cl[0]).toBeGreaterThan(0);
});
```

**After:**
```typescript
// In test/helpers/assertions.ts
export function assertValidLimits(result) {
  expect(result.cl).toBeDefined();
  expect(result.ll99).toBeDefined();
  expect(result.ul99).toBeDefined();
  expect(result.cl[0]).toBeGreaterThan(0);
}

// In test file
it("test 1", () => {
  const result = calculate(data);
  assertValidLimits(result);
});
```

#### Use Test Builders

**Before:**
```typescript
it("test with complex setup", () => {
  const dataView = {
    metadata: {
      columns: [
        { displayName: "Key", queryName: "key", type: ValueType.fromDescriptor({ text: true }) }
      ]
    },
    categorical: {
      categories: [/* complex structure */],
      values: [/* complex structure */]
    }
  };
  // Test code
});
```

**After:**
```typescript
it("test with complex setup", () => {
  const dataView = buildDataView({
    key: ["A", "B", "C"],
    numerators: [10, 20, 30]
  });
  // Test code
});
```

### Maintaining Test Performance

**Guidelines:**
- Keep unit tests under 10ms each
- Keep integration tests under 100ms each
- Use `beforeAll` for expensive setup that can be shared
- Use `beforeEach` for setup that must be fresh per test
- Mock expensive operations when possible

**Example:**
```typescript
describe("Expensive Setup", () => {
  let expensiveResource;
  
  // Run once for all tests
  beforeAll(() => {
    expensiveResource = createExpensiveResource();
  });
  
  // Clean state per test
  beforeEach(() => {
    expensiveResource.reset();
  });
  
  // Cleanup
  afterAll(() => {
    expensiveResource.destroy();
  });
});
```

---

## Test Performance Optimization

### Identifying Slow Tests

Run tests with timing information:

```bash
npm test -- --reporters=spec
```

Look for tests taking > 100ms.

### Optimization Strategies

#### 1. Reduce Data Size

```typescript
// Before: ❌ Unnecessarily large dataset
const data = Array.from({ length: 10000 }, (_, i) => i);

// After: ✅ Minimal dataset that still tests the behavior
const data = [1, 2, 3, 4, 5];
```

#### 2. Mock Expensive Operations

```typescript
// Before: ❌ Actually renders to DOM
it("should render", () => {
  const visual = new Visual(realHost, realElement);
  visual.update(realOptions);
  expect(element.querySelectorAll("circle").length).toBe(100);
});

// After: ✅ Mock rendering
it("should call render function", () => {
  const mockRender = jasmine.createSpy("render");
  const visual = new Visual(mockHost, mockElement, mockRender);
  visual.update(options);
  expect(mockRender).toHaveBeenCalled();
});
```

#### 3. Batch Similar Tests

```typescript
// Before: ❌ Multiple similar tests with repeated setup
describe("Chart Types", () => {
  it("should work for i chart", () => { /* setup, test */ });
  it("should work for p chart", () => { /* setup, test */ });
  it("should work for u chart", () => { /* setup, test */ });
});

// After: ✅ Parameterized test
describe("Chart Types", () => {
  const chartTypes = ["i", "p", "u"];
  
  chartTypes.forEach(chartType => {
    it(`should work for ${chartType} chart`, () => {
      // Single setup, parameterized test
    });
  });
});
```

---

## Managing Test Dependencies

### Updating Test Frameworks

When updating Jest, Karma, or Jasmine:

1. Check changelog for breaking changes
2. Update in development branch
3. Run full test suite
4. Fix any compatibility issues
5. Update test documentation if syntax changes

### Managing Test Utilities

Keep test utilities in sync:

- **`test/helpers/`** - Custom assertion helpers
- **`test/fixtures/`** - Test data
- **`test/helpers/buildDataView.ts`** - PowerBI mocks

When updating utilities:
1. Update the utility
2. Update all tests using it
3. Update documentation
4. Add tests for the utility itself if complex

---

## Documentation Updates

### When to Update Documentation

Update test documentation when:
- Adding new test patterns
- Changing test infrastructure
- Adding new test helpers
- Discovering new best practices
- Fixing common issues

### Documentation Files to Maintain

| File | Purpose | Update When |
|------|---------|-------------|
| `TESTING.md` | Main testing guide | New patterns, infrastructure changes |
| `TEST_MAINTENANCE.md` | This file | New maintenance procedures |
| `TEST_EXTENSION_PLAN.md` | Overall strategy | Major changes to test approach |
| `TEST_EXTENSION_PLAN_SESSION_*.md` | Session reports | Completing test sessions |

### Documentation Best Practices

- Keep examples up to date with current code
- Include both good and bad examples
- Explain *why*, not just *how*
- Link to related documentation
- Include troubleshooting tips

---

## Continuous Improvement

### Regular Maintenance Tasks

**Weekly:**
- Review any new failing tests
- Check for flaky tests
- Monitor test execution time

**Monthly:**
- Review test coverage reports
- Identify gaps in testing
- Plan new test coverage
- Refactor problematic tests

**Quarterly:**
- Update test dependencies
- Review and update test documentation
- Analyze test suite performance
- Plan strategic test improvements

### Metrics to Track

- Test count (target: steady increase)
- Test coverage (target: ≥ 85%)
- Test execution time (target: < 2 minutes)
- Flaky test count (target: 0)
- Test failure rate (target: < 1%)

---

## Getting Help

### Common Issues

See [TESTING.md#Troubleshooting](./TESTING.md#troubleshooting) for common issues and solutions.

### Escalation

If you encounter:
- Tests that consistently fail for unclear reasons
- Performance degradation in test suite
- Coverage drops that can't be explained
- Infrastructure issues

Contact the test maintainers or create an issue in the repository.

---

## Checklist for Test Maintainers

### Before Releasing

- [ ] All tests pass
- [ ] No flaky tests
- [ ] Coverage meets targets
- [ ] Performance benchmarks met
- [ ] Documentation up to date
- [ ] No skipped tests without good reason
- [ ] No `.only` or `.skip` in committed code

### After Releasing

- [ ] Monitor CI for new failures
- [ ] Review any user-reported test issues
- [ ] Update baseline performance metrics if needed
- [ ] Document any new testing patterns discovered

---

**Last Updated:** November 22, 2025  
**Maintainer:** QA Team  
**Review Frequency:** Quarterly
