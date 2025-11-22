# PowerBI-SPC Test Extension Plan

## Executive Summary

This document outlines a comprehensive 10-session plan to extend the testing infrastructure for the PowerBI-SPC custom visual. The plan will transform the current minimal test coverage (54%) into a robust, production-ready test suite with unit tests, integration tests, performance tests, and regression tests.

### Session Completion Status

- ✅ **Session 1: Utility Functions Unit Tests - Core Mathematical Operations** - [Detailed Report](TEST_EXTENSION_PLAN_SESSION_1.md)
  - **Completed:** November 22, 2025
  - **Tests Added:** 155 new tests (3 → 158 total)
  - **Coverage Improvement:** 54.06% → 55.56% statements (+1.50%)
  - **Status:** All 158 tests passing ✅
  - **Key Deliverables:** 
    - `test/test-functions-math.ts` (71 tests)
    - `test/test-functions-broadcasting.ts` (56 tests)
    - `test/test-functions-statistical.ts` (28 tests)
  - **Key Findings:** 
    - All core mathematical functions working correctly
    - Edge case identified in `calculateTrendLine()` with single-point input
    - Special `pow()` handling for negative bases documented

- ✅ **Session 2: Utility Functions Unit Tests - Data Processing & Formatting** - [Detailed Report](TEST_EXTENSION_PLAN_SESSION_2.md)
  - **Completed:** November 22, 2025
  - **Tests Added:** 177 new tests (158 → 335 total)
  - **Coverage Improvement:** 55.56% → 60.54% statements (+4.98%)
  - **Status:** All 335 tests passing ✅
  - **Key Deliverables:**
    - `test/test-functions-validation.ts` (48 tests)
    - `test/test-functions-extraction.ts` (38 tests)
    - `test/test-functions-formatting.ts` (16 tests)
    - `test/test-functions-visual.ts` (13 tests)
    - `test/test-functions-constants.ts` (58 tests)
    - `test/test-functions-valueformatter.ts` (52 tests)
  - **Key Findings:**
    - Data validation handles all error scenarios correctly
    - Statistical constants (c4, c5, a3, b3, b4) mathematically validated
    - Value formatter closure behavior documented
    - PowerBI integration functions require separate integration test suite

- ✅ **Session 3: SPC Limit Calculations Unit Tests - Part 1 (Basic Charts)** - [Detailed Report](TEST_EXTENSION_PLAN_SESSION_3.md)
  - **Completed:** November 22, 2025
  - **Tests Added:** 64 new tests (335 → 399 total)
  - **Coverage Improvement:** 60.54% → 61.83% statements (+1.29%)
  - **Status:** 395 passing, 4 failing (documenting bugs) ⚠️
  - **Key Deliverables:**
    - `test/test-limits-basic.ts` (64 tests covering 7 chart types)
    - `NaN_HANDLING_ANALYSIS.md` (SPC best practices research)
  - **Charts Tested (100% coverage each):**
    - Run chart (median-based)
    - I chart (XmR individuals) 
    - MR chart (moving range)
    - C chart (counts/Poisson)
    - P chart (proportions/binomial)
    - U chart (rates/Poisson)
    - S chart (sample standard deviations)
  - **Critical Discoveries:**
    - **Design Flaw Identified:** Current NaN replacement with 0 violates SPC best practices
    - **Research Completed:** NHS "Making Data Count" and ELFT guidelines reviewed
    - **3 Test Failures:** Document that invalid values become Infinity (not caught)
    - **1 Test Failure:** All-same-values edge case produces NaN limits
    - **Recommendation:** Replace invalid values with `null`, exclude from calculations
    - **Tests Aligned:** Tests updated to expect `null` (not `0`) per NaN_HANDLING_ANALYSIS.md guidance
  - **Documentation:** Comprehensive analysis in `NaN_HANDLING_ANALYSIS.md` with implementation plan

---

## Current Test Infrastructure Analysis

### Existing Test Setup

**Test Framework:**
- **Test Runner:** Karma v6.4.4
- **Testing Framework:** Jasmine v5.12.0
- **Browser:** Chrome Headless (via Playwright Chromium)
- **Module Bundler:** Webpack v5.97.1
- **Coverage Tool:** Istanbul (karma-coverage-istanbul-reporter)

**Configuration Files:**
- `karma.conf.ts` - Karma test runner configuration
- `test.tsconfig.json` - TypeScript compiler options for tests
- `test.webpack.config.js` - Webpack bundling for tests

**Current Test Files:**
1. `test/test-initialisation.ts` - Visual initialization and basic rendering tests (2 tests)
2. `test/test-errors.ts` - Error message rendering tests (1 test)
3. `test/helpers/buildDataView.ts` - Test data builder utility

**Current Coverage Metrics (Baseline):**
- **Statements:** 54.06% (1010/1868)
- **Branches:** 47.17% (911/1931)
- **Functions:** 59.30% (188/317)
- **Lines:** 53.79% (950/1766)

### Source Code Structure

**Total Files:** 87 TypeScript files organized in 6 main categories:

#### 1. Root Level (3 files)
- `visual.ts` - Main visual class (189 lines)
- `settings.ts` - Settings management
- `frontend.ts` - Frontend interface

#### 2. Classes/ (5 files)
- `viewModelClass.ts` - Core data model (35,524 bytes)
- `plotPropertiesClass.ts` - Plot properties management (7,410 bytes)
- `settingsClass.ts` - Settings class (8,906 bytes)
- `derivedSettingsClass.ts` - Derived settings (2,167 bytes)
- `index.ts` - Export aggregator

#### 3. Functions/ (28 files)
Utility functions including:
- Data validation: `validateDataView.ts`, `validateInputData.ts`
- Data extraction: `extractInputData.ts`, `extractDataColumn.ts`, `extractValues.ts`
- Data transformation: `truncate.ts`, `diff.ts`, `rep.ts`, `seq.ts`
- Broadcasting operations: `broadcastBinary.ts`, `broadcastUnary.ts`
- Formatting: `formatPrimitiveValue.ts`, `valueFormatter.ts`, `dateSettingsToFormatOptions.ts`
- Statistical: `calculateTrendLine.ts`
- Utility: `isNullOrUndefined.ts`, `isValidNumber.ts`, `between.ts`, `first.ts`, `leastIndex.ts`, `groupBy.ts`
- Visual-specific: `buildTooltip.ts`, `getAesthetic.ts`, `identitySelected.ts`, `parseInputDates.ts`
- Constants: `Constants.ts` (c4, c5, a3, b3, b4 constants)

#### 4. Limit Calculations/ (15 files - SPC Chart Types)
Statistical Process Control chart limit calculations:
- `i.ts` - Individual measurements (XmR)
- `i_m.ts`, `i_mm.ts` - Individual measurements variants
- `mr.ts` - Moving range
- `p.ts` - Proportions
- `pprime.ts` - Proportions with large-sample correction
- `u.ts` - Rates
- `uprime.ts` - Rates with large-sample correction
- `c.ts` - Counts
- `xbar.ts` - Sample means
- `s.ts` - Sample standard deviations
- `g.ts` - Number of non-events between events
- `t.ts` - Time between events
- `run.ts` - Run chart
- `index.ts` - Export aggregator

#### 5. Outlier Flagging/ (8 files)
SPC rule detection algorithms:
- `astronomical.ts` - Points outside control limits
- `shift.ts` - Run of points on one side
- `trend.ts` - Trending runs
- `twoInThree.ts` - Two out of three points rule
- `assuranceIconToDraw.ts` - Assurance icon determination
- `variationIconsToDraw.ts` - Variation icon determination
- `checkFlagDirection.ts` - Flag direction checking
- `index.ts` - Export aggregator

#### 6. D3 Plotting Functions/ (28 files)
Visualization rendering functions:
- Main drawing functions: `drawDots.ts`, `drawLines.ts`, `drawXAxis.ts`, `drawYAxis.ts`
- Supporting visuals: `drawIcons.ts`, `drawLineLabels.ts`, `drawValueLabels.ts`, `drawTooltipLine.ts`
- UI elements: `drawDownloadButton.ts`, `drawErrors.ts`, `drawSummaryTable.ts`
- Initialization: `initialiseSVG.ts`, `initialiseIconSVG.ts`
- Interactions: `addContextMenu.ts`
- D3 Modules/ - D3 library re-exports
- NHS Icons/ - SVG icon definitions (11 files)

### Key Testing Challenges Identified

1. **Complex Statistical Algorithms:** 14 different SPC chart types with mathematical precision requirements
2. **Visual Rendering:** D3-based SVG rendering requiring DOM manipulation testing
3. **PowerBI Integration:** Custom visual API interactions and data views
4. **Data Validation:** Multiple input validation scenarios and error handling
5. **Cross-browser Compatibility:** Ensuring consistent behavior across browsers
6. **Performance:** Large datasets and real-time filtering/highlighting
7. **Regression Risk:** Changes to limit calculations could affect chart accuracy

---

## 10-Session Test Extension Plan

### Session 1: Utility Functions Unit Tests - Core Mathematical Operations

**Objective:** Establish comprehensive test coverage for foundational utility functions that are used throughout the codebase.

**Scope:**
- Functions in `src/Functions/` directory
- Focus on pure functions with no dependencies

**Key Deliverables:**
1. Test file: `test/test-functions-math.ts`
   - `rep()` - Array repetition
   - `seq()` - Sequence generation
   - `diff()` - Consecutive differences
   - `between()` - Range checking
   - `first()` - Array first element
   - `leastIndex()` - Minimum value index
   - `isNullOrUndefined()` - Null checking
   - `isValidNumber()` - Number validation
   
2. Test file: `test/test-functions-broadcasting.ts`
   - `broadcastBinary()` and operations (add, subtract, multiply, divide, pow)
   - `broadcastUnary()` and operations (sqrt, abs, exp, lgamma, square)
   - Test scalar-to-array broadcasting
   - Test array-to-array element-wise operations
   - Test edge cases (division by zero, negative sqrt, etc.)

3. Test file: `test/test-functions-statistical.ts`
   - `truncate()` - Value truncation with upper/lower bounds
   - `calculateTrendLine()` - Linear regression calculations
   - Validate mathematical correctness with known datasets

**Testing Approach:**
- Pure unit tests with hardcoded input/output pairs
- Property-based testing for commutative operations
- Edge case testing (empty arrays, null values, infinity, NaN)
- Performance benchmarks for array operations

**Success Criteria:**
- 100% coverage for tested functions
- All edge cases handled gracefully
- Mathematical accuracy validated against reference implementations
- Tests run in < 1 second

**Rationale:** These functions form the foundation of all statistical calculations. Ensuring their correctness is critical for all downstream functionality. Pure functions are easiest to test and provide quick wins for coverage improvement.

---

### Session 2: Utility Functions Unit Tests - Data Processing & Formatting

**Objective:** Test data extraction, validation, and formatting functions.

**Scope:**
- Data validation and extraction functions
- Formatting utilities
- Date handling

**Key Deliverables:**
1. Test file: `test/test-functions-validation.ts`
   - `validateDataView()` - PowerBI data view validation
   - `validateInputData()` - Input data validation
   - Test all error conditions (missing data, invalid types, null values)
   - Verify error messages are descriptive

2. Test file: `test/test-functions-extraction.ts`
   - `extractInputData()` - Main data extraction logic
   - `extractDataColumn()` - Column extraction
   - `extractValues()` - Value array extraction
   - `groupBy()` - Data grouping
   - Mock PowerBI DataView objects
   - Test with various data structures

3. Test file: `test/test-functions-formatting.ts`
   - `formatPrimitiveValue()` - Value formatting
   - `valueFormatter()` - Formatter creation
   - `dateSettingsToFormatOptions()` - Date format conversion
   - `parseInputDates()` - Date parsing
   - Test various number formats (percentages, decimals, scientific)
   - Test date format variations

4. Test file: `test/test-functions-visual.ts`
   - `buildTooltip()` - Tooltip generation
   - `getAesthetic()` - Aesthetic property retrieval
   - `identitySelected()` - Selection identity checking
   - Test tooltip content accuracy
   - Test aesthetic defaults and overrides

**Testing Approach:**
- Create comprehensive mock DataView objects
- Test boundary conditions for each validator
- Verify formatting output matches expected strings
- Test all supported date formats

**Success Criteria:**
- All validation paths tested (success and failure)
- 95%+ coverage for data extraction functions
- All formatting edge cases handled
- Date parsing works for all expected formats

**Rationale:** Data validation and formatting are critical for user experience. Incorrect data extraction could lead to wrong chart calculations. These tests ensure data integrity from PowerBI to visualization.

---

### Session 3: SPC Limit Calculations Unit Tests - Part 1 (Basic Charts)

**Objective:** Test limit calculation algorithms for basic SPC chart types.

**Scope:**
- Test 7 basic SPC chart limit calculations
- Validate statistical correctness

**Key Deliverables:**
1. Test file: `test/test-limits-basic.ts`
   - `run.ts` - Run chart (median calculation)
   - `i.ts` - Individual measurements (XmR)
   - `mr.ts` - Moving range
   - `c.ts` - Counts (Poisson-based limits)
   - `p.ts` - Proportions (binomial-based limits)
   - `u.ts` - Rates (Poisson-based limits)
   - `s.ts` - Sample standard deviations

**Testing Approach:**
- Use published SPC examples from literature (e.g., Montgomery's Statistical Quality Control)
- Create reference datasets with known correct limit values
- Test each chart type with:
  - Minimum viable data
  - Typical datasets (20-30 points)
  - Edge cases (all zeros, all same value, large variance)
- Validate all limit outputs (cl, ll99, ll95, ll68, ul68, ul95, ul99)
- Test subset_points parameter (using only subset for limit calculation)
- Test outliers_in_limits parameter

**Reference Data Sources:**
- NHS Making Data Count example datasets
- Montgomery's textbook examples
- NHSE SPC guidance examples

**Success Criteria:**
- Each chart type produces mathematically correct limits
- Limits match published reference values within 0.01% tolerance
- All control limit properties present in output
- Edge cases handled without crashes
- 100% function coverage for basic chart types

**Rationale:** Limit calculations are the mathematical core of the SPC visual. Incorrect limits would render the entire visual useless. Testing against published examples ensures statistical validity and builds confidence in the implementation.

---

### Session 4: SPC Limit Calculations Unit Tests - Part 2 (Advanced Charts)

**Objective:** Test limit calculation algorithms for advanced SPC chart types.

**Scope:**
- Test 7 advanced/variant SPC chart limit calculations
- Special handling for corrections and complex cases

**Key Deliverables:**
1. Test file: `test/test-limits-advanced.ts`
   - `pprime.ts` - Proportions with large-sample correction
   - `uprime.ts` - Rates with large-sample correction
   - `xbar.ts` - Sample means (with SD weighting)
   - `g.ts` - Number of non-events between events
   - `t.ts` - Time between events
   - `i_m.ts` - Individual measurements variant
   - `i_mm.ts` - Individual measurements variant 2

**Testing Approach:**
- Focus on what makes each chart type unique
- For pprime/uprime: Test correction factor application
  - Compare with uncorrected versions
  - Verify correction reduces over-dispersion
- For xbar: Test weighted calculations
  - Variable sample sizes
  - Verify A3 constant application
  - Test SD weighting formula
- For g/t: Test geometric distribution handling
  - Skewed data patterns
  - Transformation calculations
- Test variant behaviors (i_m vs i_mm vs i)

**Success Criteria:**
- Advanced charts produce correct limits for complex scenarios
- Correction factors properly applied
- Weighted calculations accurate
- All variants properly differentiated
- Edge cases (single data point, all equal values) handled
- 100% function coverage for advanced chart types

**Rationale:** Advanced chart types have additional complexity and special cases. The large-sample corrections and weighted calculations require careful validation to ensure they work correctly across different data patterns.

---

### Session 5: Outlier Flagging & Rules Testing

**Objective:** Test SPC rule detection algorithms and icon determination.

**Scope:**
- Test all 4 outlier detection rules
- Test icon determination logic
- Validate rule combinations

**Key Deliverables:**
1. Test file: `test/test-outlier-rules.ts`
   - `astronomical.ts` - Points outside 3-sigma limits
     - Test points above upper limit
     - Test points below lower limit
     - Test points within limits
   - `shift.ts` - Run of 8+ points on one side of centerline
     - Test ascending shifts
     - Test descending shifts
     - Test near-miss scenarios (7 points)
   - `trend.ts` - 6+ consecutive increasing/decreasing points
     - Test upward trends
     - Test downward trends
     - Test broken trends
   - `twoInThree.ts` - 2 out of 3 points beyond 2-sigma
     - Test all combinations
     - Test edge cases

2. Test file: `test/test-icon-determination.ts`
   - `variationIconsToDraw.ts` - Variation icon logic
     - Test all variation states (common cause, special cause)
     - Verify icon selection based on rules
   - `assuranceIconToDraw.ts` - Assurance icon logic
     - Test improvement/concern states
     - Test target comparisons
   - `checkFlagDirection.ts` - Flag direction validation
     - Test with improvement_direction settings
     - Verify correct flag interpretation

**Testing Approach:**
- Create synthetic datasets that trigger specific rules
- Test rule combinations (multiple rules at once)
- Test sequential detection (rule triggered then cleared)
- Validate that rules mark correct data points
- Test with different improvement directions (increase/decrease/neutral)

**Success Criteria:**
- Each rule correctly detects its specific pattern
- Rules don't produce false positives
- Icon determination matches rule states
- All flag directions correctly interpreted
- 100% coverage for outlier flagging logic
- Rule detection runs efficiently (< 10ms for 100 points)

**Rationale:** Outlier flagging is what makes SPC charts actionable. Incorrect rule detection could lead to false alerts or missed special causes. These tests ensure the visual provides reliable quality improvement signals.

---

### Session 6: Class & ViewModel Integration Tests

**Objective:** Test the main class structures and their interactions.

**Scope:**
- Test viewModelClass, plotPropertiesClass, settingsClass
- Test class initialization and update cycles
- Test data flow through classes

**Key Deliverables:**
1. Test file: `test/test-viewmodel-class.ts`
   - Test `viewModelClass.update()` method
     - Valid data updates
     - Invalid data handling
     - Settings updates
     - Validation error propagation
   - Test data transformation pipeline
     - Input data → processed data
     - Grouped vs ungrouped data
     - Highlight handling
   - Test limit calculation orchestration
     - Chart type selection
     - Correct limit function called
   - Test tooltip generation
   - Test summary table data structure

2. Test file: `test/test-plotproperties-class.ts`
   - Test `plotPropertiesClass.update()` method
   - Test scale initialization
     - X-axis scaling
     - Y-axis scaling
   - Test padding calculations
   - Test axis configuration
   - Test responsive sizing

3. Test file: `test/test-settings-class.ts`
   - Test settings initialization
   - Test settings persistence
   - Test default values
   - Test settings validation
   - Test formatting model generation

4. Test file: `test/test-derived-settings.ts`
   - Test derived calculations from settings
   - Test setting interdependencies
   - Test setting constraint validation

**Testing Approach:**
- Create comprehensive mock VisualUpdateOptions
- Test full update cycles
- Test state transitions
- Verify class interactions
- Test error handling at class boundaries

**Success Criteria:**
- All class update methods tested
- State management validated
- Error propagation works correctly
- Settings properly applied to visualization
- 80%+ coverage for class files
- Integration between classes validated

**Rationale:** Classes orchestrate the entire visual's behavior. Testing class interactions ensures that the visual correctly processes PowerBI data updates and maintains consistent state throughout its lifecycle.

---

### Session 7: D3 Plotting Functions & Visual Rendering Tests

**Objective:** Test D3-based rendering functions and visual output.

**Scope:**
- Test all D3 plotting functions
- Validate SVG structure
- Test visual interactions

**Key Deliverables:**
1. Test file: `test/test-d3-initialization.ts`
   - `initialiseSVG.ts` - SVG initialization
   - `initialiseIconSVG.ts` - Icon SVG setup
   - Validate SVG structure created
   - Test multiple initialization calls (idempotent)

2. Test file: `test/test-d3-axes.ts`
   - `drawXAxis.ts` - X-axis rendering
   - `drawYAxis.ts` - Y-axis rendering
   - Validate axis placement
   - Test tick generation
   - Test axis labels
   - Test date formatting on x-axis

3. Test file: `test/test-d3-chart-elements.ts`
   - `drawDots.ts` - Scatter point rendering
   - `drawLines.ts` - Control limit line rendering
   - `drawIcons.ts` - NHS icon rendering
   - Validate element counts
   - Test aesthetic properties (color, size, opacity)
   - Test data binding
   - Test selection/highlighting

4. Test file: `test/test-d3-labels-annotations.ts`
   - `drawLineLabels.ts` - Line label rendering
   - `drawValueLabels.ts` - Value label rendering
   - `drawTooltipLine.ts` - Tooltip line rendering
   - Test label positioning
   - Test label content
   - Test label visibility toggles

5. Test file: `test/test-d3-ui-elements.ts`
   - `drawDownloadButton.ts` - Download button
   - `drawErrors.ts` - Error message display
   - `drawSummaryTable.ts` - Summary table rendering
   - `addContextMenu.ts` - Context menu
   - Test UI element creation
   - Test error message formatting

6. Test file: `test/test-nhs-icons.ts`
   - Test all 11 NHS icon SVG paths
   - Validate icon structure
   - Test icon rendering at different sizes

**Testing Approach:**
- Use JSDOM or similar for DOM manipulation testing
- Verify SVG element creation and attributes
- Test data binding with d3.select().data()
- Validate visual properties (fill, stroke, opacity)
- Test update patterns (enter/update/exit)
- Test responsive behavior

**Success Criteria:**
- All drawing functions create expected elements
- SVG structure matches specification
- Visual properties correctly applied
- No redundant elements created
- Update operations efficient (minimal DOM changes)
- 75%+ coverage for D3 plotting functions

**Rationale:** Visual rendering is what users see. These tests ensure the D3 code correctly translates data into visual elements, maintaining consistency and preventing visual regressions.

---

### Session 8: Visual Class Integration & End-to-End Tests

**Objective:** Test the main Visual class and complete visual lifecycle.

**Scope:**
- Test Visual class methods
- End-to-end visual rendering
- User interaction flows

**Key Deliverables:**
1. Test file: `test/test-visual-class.ts`
   - Test `Visual` constructor
     - Element creation
     - Host initialization
     - Selection manager setup
   - Test `update()` method
     - Valid data updates
     - Error handling
     - Rendering lifecycle
   - Test `drawVisual()` method
     - Complete rendering pipeline
   - Test `adjustPaddingForOverflow()` method
     - Overflow detection
     - Padding adjustments
   - Test `resizeCanvas()` method
     - Canvas resizing
     - Table/chart visibility switching
   - Test `updateHighlighting()` method
     - Selection highlighting
     - Opacity changes
     - Cross-filtering

2. Test file: `test/test-visual-lifecycle.ts`
   - Test complete initialization → update → render cycle
   - Test resize events
   - Test data refresh
   - Test settings changes
   - Test error recovery

3. Test file: `test/test-visual-interactions.ts`
   - Test selection behavior
     - Single selection
     - Multi-selection
     - Clear selection
   - Test highlighting
     - External highlights
     - Cross-visual filtering
   - Test context menu interactions
   - Test download functionality

4. Test file: `test/test-chart-type-switching.ts`
   - Test switching between all 14 chart types
   - Validate correct limits calculated for each type
   - Verify visual updates correctly
   - Test with same dataset across chart types

**Testing Approach:**
- Use powerbi-visuals-utils-testutils for mocking
- Create realistic VisualUpdateOptions
- Test complete user scenarios
- Verify PowerBI API interactions
- Test event handling
- Test asynchronous rendering

**Success Criteria:**
- Visual lifecycle properly tested
- All chart types can be initialized and updated
- User interactions work correctly
- PowerBI integration points validated
- Error states recoverable
- 80%+ coverage for visual.ts
- All 14 chart types render without errors

**Rationale:** The Visual class is the entry point for PowerBI. These integration tests ensure all components work together correctly and the visual responds properly to PowerBI events and user interactions.

---

### Session 9: Performance & Load Testing

**Objective:** Establish performance benchmarks and test visual with large datasets.

**Scope:**
- Performance testing for key operations
- Load testing with large datasets
- Optimization validation

**Key Deliverables:**
1. Test file: `test/test-performance-calculations.ts`
   - Benchmark limit calculations
     - Test with 10, 100, 1000, 10000 data points
     - Measure execution time for each chart type
     - Identify performance bottlenecks
   - Benchmark outlier detection
     - Test rule execution time
     - Test with varying dataset sizes
   - Performance targets:
     - < 100ms for 100 points
     - < 500ms for 1000 points
     - < 2s for 10000 points

2. Test file: `test/test-performance-rendering.ts`
   - Benchmark D3 rendering operations
     - Initial render time
     - Update render time
     - Measure DOM manipulation cost
   - Test with varying numbers of visual elements
     - 100, 500, 1000, 5000 dots
     - Multiple limit lines
     - Icon rendering
   - Performance targets:
     - < 200ms initial render (100 points)
     - < 50ms update render (100 points)

3. Test file: `test/test-large-datasets.ts`
   - Test with large realistic datasets
     - 1000+ data points
     - Multiple groupings
     - All chart types
   - Test memory usage
     - No memory leaks
     - Efficient data structures
   - Test update performance
     - Adding new data points
     - Changing settings
     - Filtering/highlighting

4. Test file: `test/test-performance-edge-cases.ts`
   - Test worst-case scenarios
     - Maximum data points PowerBI allows
     - Rapid updates (selection changes)
     - Complex calculations (xbar with many groups)
   - Test performance degradation patterns
   - Identify performance limits

**Testing Approach:**
- Use performance.now() for timing
- Run benchmarks multiple times for stability
- Create performance regression tests
- Profile with Chrome DevTools
- Test in both development and production builds
- Use realistic data distributions

**Performance Baselines:**

*Note: These targets are based on standard web application UX guidelines (< 100ms feels instant, < 1s feels responsive) and PowerBI's rendering budget. PowerBI custom visuals should render within 200-500ms for good user experience. Targets will be validated against actual baseline measurements in Session 9.*

```
Operation                 | Target   | Max Acceptable | Rationale
--------------------------|----------|----------------|------------------------------------
Limit calc (100 pts)      | < 50ms   | < 100ms        | Core calculation, runs on every update
Limit calc (1000 pts)     | < 200ms  | < 500ms        | Large dataset, infrequent in practice
Initial render (100 pts)  | < 100ms  | < 200ms        | First impression, feels instant
Update render (100 pts)   | < 30ms   | < 50ms         | Interaction feedback, 60fps = 16ms
Outlier detection (100)   | < 20ms   | < 50ms         | Part of calculation pipeline
Selection update          | < 10ms   | < 30ms         | User interaction, needs to feel immediate
```

**Success Criteria:**
- All operations meet target performance
- No performance regression from baseline
- Memory usage stays constant (no leaks)
- Visual remains responsive with large datasets
- Performance tests run in CI pipeline
- Performance documentation updated

**Rationale:** Performance is critical for user experience. SPC charts often have hundreds of data points, and users expect responsive interactions. These tests ensure the visual performs well across different scenarios and prevents performance regressions.

---

### Session 10: Regression Testing Framework & Test Documentation

**Objective:** Establish regression testing framework and comprehensive test documentation.

**Scope:**
- Create regression test suite
- Document all tests
- Setup CI/CD integration
- Create test maintenance guide

**Key Deliverables:**
1. **Regression Test Suite** - `test/test-regression-suite.ts`
   - Golden dataset tests
     - Create 20+ reference datasets covering:
       - All 14 chart types
       - Various data patterns (trends, shifts, outliers)
       - Edge cases (sparse data, missing values)
     - Store expected outputs (limits, rules, icons)
     - Compare current output vs. expected
   - Visual regression tests
     - Capture SVG snapshots
     - Compare against baseline
     - Detect unintended visual changes
   - API compatibility tests
     - Test PowerBI API version compatibility
     - Test capabilities.json changes
     - Ensure backward compatibility

2. **Test Documentation** - `TESTING.md`
   - Test infrastructure overview
   - How to run tests
     - Unit tests: `npm test`
     - Specific test files: `npm test -- --grep="pattern"`
     - Coverage report: `npm run coverage`
     - Performance tests: `npm run test:performance`
   - How to write new tests
     - Test file structure
     - Naming conventions
     - Mock data creation
     - Assertion patterns
   - Test categories explained
     - Unit tests
     - Integration tests
     - Performance tests
     - Regression tests
   - Debugging tests
     - Running in Chrome (not headless)
     - Using console.log
     - Debugging in VS Code
   - Coverage requirements
     - Target: 85% overall coverage
     - Critical paths: 95%+ coverage
     - How to view coverage reports

3. **Test Data Management** - `test/fixtures/`
   - Create reusable test datasets
     - `test-data-basic.ts` - Simple datasets
     - `test-data-reference.ts` - Published reference examples
     - `test-data-edge-cases.ts` - Edge case datasets
     - `test-data-large.ts` - Performance test datasets
   - Document data sources
   - Version control test data

4. **CI/CD Integration**
   - GitHub Actions workflow updates
     - Run tests on every PR
     - Run tests on every commit to main
     - Generate coverage reports
     - Fail build if coverage drops
     - Run performance tests (scheduled)
   - Coverage reporting
     - Upload to Codecov or similar
     - Display badges in README
     - Track coverage trends

5. **Test Utilities Enhancement** - `test/helpers/`
   - Expand `buildDataView.ts`
     - Support all data roles
     - Support formatting
     - Support highlights
   - Create `test/helpers/assertions.ts`
     - Custom matchers for common patterns
     - Control limit comparisons (with tolerance)
     - SVG element assertions
   - Create `test/helpers/mockPowerBI.ts`
     - Mock PowerBI host
     - Mock selection manager
     - Mock event service
   - Create `test/helpers/testConstants.ts`
     - Reusable test constants
     - Common tolerance values
     - Chart type lists

6. **Test Maintenance Guide** - `TEST_MAINTENANCE.md`
   - When to update tests
     - Code changes
     - Bug fixes
     - New features
   - Test review process
   - Handling flaky tests
   - Test refactoring guidelines
   - Test performance optimization

7. **Known Issues & Test Gaps** - Update to `TEST_EXTENSION_PLAN.md`
   - Document remaining test gaps
   - List known limitations
   - Future testing improvements
   - Technical debt tracking

**Testing Approach:**
- Create comprehensive reference datasets
- Automate regression detection
- Document everything thoroughly
- Make tests maintainable and clear
- Integrate testing into development workflow

**Success Criteria:**
- Regression test suite detects unintended changes
- All tests documented and runnable
- CI/CD pipeline includes all test types
- Test coverage > 85% overall
- Test coverage > 95% for critical paths (limit calculations, outlier detection)
- Zero flaky tests
- New developers can understand and run tests
- Test suite runs in < 2 minutes (excluding performance tests)

**Final Coverage Targets:**
- **Overall:** 85%+ (from current 54%)
- **Functions/:** 95%+ (pure logic, critical)
- **Limit Calculations/:** 98%+ (mathematical core)
- **Outlier Flagging/:** 95%+ (rule detection)
- **Classes/:** 80%+ (integration points)
- **D3 Plotting Functions/:** 75%+ (visual rendering)
- **visual.ts:** 85%+ (main orchestration)

**Rationale:** Regression testing is essential for maintaining quality over time. As the visual evolves, these tests ensure that bug fixes and new features don't break existing functionality. Comprehensive documentation ensures the test suite remains valuable and maintainable.

---

## Test Strategy Summary

### Testing Pyramid

```
       /\
      /  \  E2E Tests (10%)
     /____\
    /      \  Integration Tests (30%)
   /________\
  /          \  Unit Tests (60%)
 /__________\
```

**Unit Tests (60%):** Focus on individual functions, especially pure functions
- Sessions 1-2: Utility functions
- Sessions 3-4: Limit calculations
- Session 5: Outlier detection

**Integration Tests (30%):** Focus on class interactions and data flow
- Session 6: Class interactions
- Session 7: D3 rendering with data
- Session 8: Visual lifecycle

**E2E/Performance Tests (10%):** Focus on complete scenarios and performance
- Session 9: Performance testing
- Session 10: Regression testing

### Test Quality Principles

1. **Deterministic:** Tests produce same results every run
2. **Isolated:** Tests don't depend on each other
3. **Fast:** Unit tests run in milliseconds
4. **Clear:** Test names describe what they test
5. **Maintainable:** Tests are easy to update
6. **Comprehensive:** Cover happy paths and edge cases
7. **Documented:** Complex tests have explanatory comments

### Coverage Goals by Session

| Session | New Tests | Cumulative Coverage Target | Actual |
|---------|-----------|----------------------------|--------|
| Start   | 3         | 54% (baseline)             | 54.06% |
| 1       | 155       | 60%                        | 55.56% ✅ |
| 2       | 177       | 65%                        | 60.54% ✅ |
| 3       | ~20       | 70%                        | - |
| 4       | ~20       | 75%                        | - |
| 5       | ~15       | 78%                        | - |
| 6       | ~25       | 82%                        | - |
| 7       | ~30       | 85%                        | - |
| 8       | ~20       | 87%                        | - |
| 9       | ~15       | 88%                        | - |
| 10      | ~30       | 90%                        | - |

**Total New Tests:** ~220 tests (from current 3)

*Note on test count: This is an estimate based on comprehensive coverage goals. The actual number may vary as some complex functions may require more test cases for edge cases, while simple functions may need fewer. Focus should be on quality coverage over quantity - each test should validate a distinct behavior or edge case. Test consolidation strategies: (1) Use parameterized tests for similar test cases, (2) Group related assertions in single tests when testing same scenario, (3) Create helper functions to reduce duplication, (4) Prioritize tests for critical paths if time-constrained.*

### Test Execution Strategy

**Local Development:**
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode (to be added)
npm run test:coverage      # Generate coverage report
npm run test:unit          # Unit tests only (to be added)
npm run test:integration   # Integration tests only (to be added)
npm run test:performance   # Performance tests (to be added)
```

**CI/CD Pipeline:**
- **On PR:** Run all tests, report coverage
- **On merge:** Run all tests, update coverage baseline
- **Nightly:** Run performance tests, regression suite
- **Pre-release:** Full test suite + manual verification

### Risk Mitigation

**High-Risk Areas (Require Extra Testing):**
1. **Limit Calculations:** Mathematical errors affect all users
   - Strategy: Test against published references, multiple datasets
2. **Data Validation:** Wrong data extraction breaks everything
   - Strategy: Test all PowerBI DataView variations
3. **Outlier Detection:** False positives/negatives mislead users
   - Strategy: Synthetic datasets that trigger specific rules

**Medium-Risk Areas:**
1. **Visual Rendering:** Visual bugs are obvious but not critical
   - Strategy: Visual regression tests, DOM validation
2. **Performance:** Slow performance affects user experience
   - Strategy: Performance benchmarks, load testing

**Low-Risk Areas:**
1. **Settings Management:** Well-encapsulated, limited scope
   - Strategy: Standard unit tests
2. **Icon Rendering:** Static SVG paths
   - Strategy: Basic structure validation

---

## Implementation Notes

### Session Dependencies

- **Sessions 1-2:** Can run in parallel (different function sets)
- **Sessions 3-4:** Must follow Session 1 (use utility functions)
- **Session 5:** Must follow Sessions 3-4 (uses limit calculations)
- **Session 6:** Must follow Sessions 1-5 (uses all utilities)
- **Session 7:** Can overlap with Session 6
- **Session 8:** Must follow all previous sessions
- **Session 9:** Must follow Sessions 3-4, 6-8
- **Session 10:** Must be last (consolidates everything)

### Recommended Session Schedule

**Optimal order (fastest path to value):**
1. Session 1 → Session 2 (Foundation)
2. Session 3 → Session 4 (Core logic)
3. Session 5 (Quality rules)
4. Session 6 (Integration)
5. Session 7 (Visualization)
6. Session 8 (End-to-end)
7. Session 9 (Performance)
8. Session 10 (Regression & docs)

**Alternatively (parallel work possible):**
- Track 1: Sessions 1, 3, 4, 5 (Logic focus)
- Track 2: Sessions 2, 7 (Data & UI focus)
- Final: Sessions 6, 8, 9, 10 (Integration & completion)

### Test Maintenance

**Adding New Chart Types:**
1. Add limit calculation tests (Session 3/4 pattern)
2. Add outlier detection tests if new rules
3. Add integration test in Session 8
4. Update regression suite with reference dataset
5. Update documentation

**Bug Fixes:**
1. Write failing test that reproduces bug
2. Fix bug
3. Verify test passes
4. Add to regression suite if significant

**New Features:**
1. Write tests first (TDD approach)
2. Implement feature
3. Ensure coverage targets met
4. Update relevant test files
5. Update documentation

### Success Metrics

**Quantitative:**
- Test coverage > 85%
- Test suite runs < 2 minutes
- Zero flaky tests
- Performance benchmarks met
- 220+ total tests

**Qualitative:**
- Tests are readable and maintainable
- New developers can run and understand tests
- Tests catch regressions before production
- Confidence in code changes increased
- Documentation is complete and current

---

## Conclusion

This 10-session plan systematically transforms the PowerBI-SPC custom visual from minimal test coverage (3 tests, 54%) to comprehensive, production-ready test suite (220+ tests, 85%+ coverage). Each session builds upon previous sessions, with clear objectives, deliverables, and success criteria.

The plan prioritizes testing critical functionality (mathematical calculations, data validation) while ensuring complete coverage of the visual lifecycle. Performance and regression testing ensure the visual remains fast and stable as it evolves.

By the end of Session 10, the PowerBI-SPC project will have:
- ✅ Comprehensive unit test coverage
- ✅ Integration tests for class interactions
- ✅ Visual rendering validation
- ✅ Performance benchmarks
- ✅ Regression testing framework
- ✅ Complete test documentation
- ✅ CI/CD integration
- ✅ Maintainable test suite

This foundation will support confident development, enable faster feature iteration, and ensure the visual continues to provide accurate, reliable SPC charts to users.
