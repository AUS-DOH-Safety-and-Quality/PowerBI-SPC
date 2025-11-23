# NaN Handling in SPC Charts - Analysis and Recommendations

**Date:** November 22, 2025  
**Context:** Session 3 Test Extension - Bug Investigation  
**Status:** Analysis Complete - Recommendations Provided

---

## Executive Summary

**Current Implementation:** The codebase currently replaces NaN values with 0 using `isNaN(d) ? 0 : d` in several limit calculation functions (run, i, i_m, i_mm charts).

**Research Finding:** This approach is **incorrect** according to SPC best practices and NHS "Making Data Count" guidelines. 

**Recommended Approach:**
1. **Exclude NaN/Infinity from calculations** (limits, centerlines)
2. **Flag missing data visually on charts** (gaps, ghosted points, annotations)
3. **Do NOT impute or replace with arbitrary values** (including 0)
4. **Document reasons for missing data** in chart annotations

---

## Evidence Review

### 1. Current Code Behavior

**Files Affected:**
- `src/Limit Calculations/run.ts` (line 13)
- `src/Limit Calculations/i.ts` (line 23)
- `src/Limit Calculations/i_m.ts`
- `src/Limit Calculations/i_mm.ts`

**Current Implementation:**
```typescript
values: ratio.map(d => isNaN(d) ? 0 : d)
```

**Problems with This Approach:**

1. **Division by Zero Issue:** 
   - `divide(x, 0)` produces `Infinity`, not `NaN`
   - `isNaN(Infinity)` returns `false`
   - Therefore, Infinity is NOT replaced with 0
   - Found in our tests: 3 test failures documenting this

2. **Mathematical Incorrectness:**
   - Replacing missing/invalid data with 0 distorts the actual data distribution
   - A missing value is NOT equivalent to zero
   - Zero is a valid measurement (e.g., 0 defects, 0 events)
   - This creates false data points on the chart

3. **Statistical Impact:**
   - Artificially inflates the count of 0 values
   - Skews mean/median calculations toward 0
   - Can trigger false special cause variation signals
   - Violates SPC assumption of continuous measurement

### 2. NHS "Making Data Count" Best Practices

**Source:** NHS England's "Making Data Count - Strengthening Your Decisions" guidance

**Key Principles:**

1. **Acknowledge and Clearly Flag Missing Data**
   - Missing data must be visible on SPC charts
   - Use marked gaps, "ghosted" data points, or special symbols
   - Never hide or silently replace missing values

2. **Do Not Impute Without Strong Justification**
   - Avoid filling in missing values with averages or estimates
   - Imputation risks distorting patterns of variation
   - Could mask real special cause signals

3. **Exclude NaNs from Calculations of Control Limits**
   - Missing points should be excluded when calculating:
     - Averages (centre lines)
     - Control limits
     - Standard deviations
   - This prevents artificial tightening or widening of limits

4. **Document Why Data Are Missing**
   - Data collection or recording issues should be documented
   - Chart annotations should explain missing periods
   - Transparency helps users interpret signals properly

5. **Ghosting or Annotating Points**
   - Plot missing points as faint markers or flagged positions
   - Maintains visual continuity
   - Alerts viewers that points are absent from calculations

6. **Reliability Threshold**
   - If too many consecutive points are missing, chart reliability decreases
   - Consider supplementing with additional data sources
   - May need to revert to run charts if coverage is poor

### 3. ELFT Statistical Process Control Charting Guidelines

**Source:** East London NHS Foundation Trust SPC Guidelines

**Additional Guidance:**

- **Visual Representation:** Use special markers (e.g., hollow points, different color) for missing data
- **Calculation Exclusion:** Never include missing/invalid values in statistical calculations
- **Annotation:** Add text annotations explaining gaps in data collection
- **Threshold:** If >20% of data is missing, consider chart validity carefully

### 4. General SPC Literature

**Source:** Montgomery's "Statistical Quality Control" and SPC textbooks

**Consensus:**

- **Missing Data Treatment:**
  - Exclude from calculations
  - Show as gaps or special markers on charts
  - Never substitute with arbitrary values (0, mean, median)

- **Invalid Data (NaN, Infinity):**
  - Results from calculation errors (division by zero, log of negative)
  - Should be flagged as data quality issues
  - Investigate root cause (measurement error, data entry error)
  - Do not include in any calculations

- **Zero vs. Missing:**
  - Zero is a valid measurement
  - Missing data means no measurement was taken
  - These are fundamentally different and must not be conflated

---

## Analysis of Current Implementation

### What the Code Does Now

1. **Limit Calculation Functions** (run, i, i_m, i_mm):
   - Calculate ratios via `divide(numerators, denominators)`
   - Map values: `isNaN(d) ? 0 : d`
   - Return these values for plotting

2. **Division Function** (`broadcastBinary.ts`):
   - Simple: `(x: number, y: number): number => x / y`
   - Division by zero produces `Infinity` (JavaScript default)
   - No special handling

3. **Validation** (`validateInputData.ts`):
   - Checks for NaN numerators, denominators, SDs
   - Validation occurs BEFORE limit calculations
   - But doesn't prevent runtime division by zero

### What Should Happen

1. **Pre-Calculation Validation:**
   - ✅ Already checks for NaN inputs (good!)
   - ❌ Should also check for zero denominators
   - ❌ Should flag these as invalid data

2. **During Calculation:**
   - ❌ Should exclude invalid values from ratio array
   - ❌ Should NOT replace with 0
   - ✅ subset_points mechanism exists for excluding points

3. **In Output:**
   - ❌ Values array should contain actual values or special marker (null, undefined, NaN)
   - ❌ Should NOT contain fabricated 0 values
   - ✅ Visual layer should handle display of missing points

---

## Recommended Solution

### Option 1: Use `null` for Invalid Values (RECOMMENDED)

**Approach:**
```typescript
// In limit calculation functions
values: ratio.map(d => (!isFinite(d) || isNaN(d)) ? null : d)
```

**Rationale:**
- `null` explicitly means "no value" in JavaScript/TypeScript
- Distinguishes from valid 0 measurements
- D3.js (used for plotting) handles null gracefully as gaps
- Follows SPC best practice of excluding from calculations
- Validation can identify null values for user warning

**Impact:**
- Plotting code may need updates to handle null
- Validation messages can say "X points have invalid data"
- Users see gaps in chart where data is missing/invalid

### Option 2: Filter Invalid Values Before Calculation

**Approach:**
```typescript
// Create valid indices
const validIndices = ratio
  .map((d, i) => (!isFinite(d) && !isNaN(d)) ? i : -1)
  .filter(i => i !== -1);

// Use in subset_points
const effective_subset = args.subset_points 
  ? args.subset_points.filter(i => validIndices.includes(i))
  : validIndices;

// Calculate limits only on valid data
const cl = median(extractValues(ratio, effective_subset));

// Return with nulls for invalid
return {
  values: ratio.map(d => (!isFinite(d) || isNaN(d)) ? null : d),
  // ... rest
};
```

**Rationale:**
- Excludes invalid data from limit calculations
- Maintains all original data points (valid and invalid) in output
- Aligns with NHS guidance

### Option 3: Validation Layer Prevents Invalid Calculations

**Approach:**
```typescript
// In validateInputData.ts - add new checks
if (args.denominators) {
  const hasZeroDenom = args.denominators.some(d => d === 0);
  if (hasZeroDenom) {
    return {
      status: 1,
      error: "Denominators contain zero values - division by zero will occur",
      type: "ZeroDenominator"
    };
  }
}
```

**Rationale:**
- Prevents invalid calculations from occurring
- User gets clear error message
- Chart doesn't render with bad data

---

## Specific Issues Found in Testing

### Issue 1: Infinity Not Handled

**Test Data:**
```typescript
numerators: [1, 2, 3]
denominators: [1, 0, 1]  // Division by 0
```

**Expected:** Value at index 1 should be flagged as invalid  
**Actual:** `Infinity` in values array  
**Current "Fix":** Replace with 0 (incorrect)  
**Correct Fix:** Replace with `null` OR prevent via validation

### Issue 2: All Same Values → NaN Limits

**Test Data:**
```typescript
numerators: [10, 10, 10, 10, 10]  // No variation
```

**Problem:** Consecutive differences all 0 → sigma calculation has division by zero  
**Current Behavior:** NaN limits  
**Expected:** Should either:
  - Return null limits (no variation to measure)
  - Return limits equal to centerline (sigma = 0)
  - Validation warning: "No variation in data"

This is a different issue - not about invalid input data, but about mathematical edge case.

---

## Recommended Implementation Plan

### Phase 1: Immediate Fix (Minimal Change)

**Change in limit calculation functions:**
```typescript
// OLD:
values: ratio.map(d => isNaN(d) ? 0 : d),

// NEW:
values: ratio.map(d => (!isFinite(d) || isNaN(d)) ? null : d),
```

**Files to update:**
- `src/Limit Calculations/run.ts`
- `src/Limit Calculations/i.ts`
- `src/Limit Calculations/i_m.ts`
- `src/Limit Calculations/i_mm.ts`

**Test expectations to update:**
```typescript
// OLD expectation:
expect(result.values[1]).toBe(0);

// NEW expectation:
expect(result.values[1]).toBeNull();
```

### Phase 2: Enhanced Validation (Recommended)

**Add to `validateInputData.ts`:**
```typescript
// Check for zero denominators
if (args.denominators && args.denominators.some(d => d === 0)) {
  validationRtn.status = 1;
  validationRtn.error = "Division by zero detected - denominators contain zero values";
  return validationRtn;
}

// Check for no variation (optional)
if (args.numerators.every(n => n === args.numerators[0])) {
  validationRtn.warning = "All values are identical - no variation to measure";
}
```

### Phase 3: Visual Enhancement (Future)

**In plotting code:**
- Handle `null` values as gaps
- Add option for "ghosted" points (hollow circles)
- Add annotations for missing data runs
- Tooltip shows "Data unavailable" for null points

---

## Impact Assessment

### Current Test Failures (4)

1. **runLimits - NaN replacement** (1 failure)
   - Will PASS with recommended fix (expects null instead of 0)

2. **iLimits - NaN replacement** (1 failure)
   - Will PASS with recommended fix (expects null instead of 0)

3. **iLimits - All same values** (1 failure)
   - Separate issue - needs mathematical edge case handling
   - Should guard against division by zero in sigma calculation

4. **cLimits - Truncation** (1 failure)
   - Unrelated issue - investigating truncate() usage

**After Phase 1 Fix:** 2 failures remain (all same values, truncation)

### User Impact

**Positive:**
- Charts correctly show missing/invalid data as gaps
- No false zero values distorting statistics
- Aligns with NHS best practices
- Users can see data quality issues

**Potential Issues:**
- Users seeing gaps may question data quality (this is good! highlights real issues)
- May need UI/documentation updates explaining null handling
- Existing charts with bad data will look different (show gaps instead of zeros)

### Code Impact

**Minimal:**
- 4 files to update (limit calculations)
- Test expectations to update (change 0 to null)
- Validation could be enhanced (optional)
- Plotting code likely already handles null (D3.js does by default)

---

## Recommendations

### Immediate Action

1. **Change NaN handling to use `null`** instead of `0`
   - More correct mathematically
   - Aligns with SPC best practices
   - Minimal code change

2. **Update test expectations**
   - Accept `null` for invalid values
   - Tests should document this behavior

3. **Add validation for zero denominators**
   - Prevent division by zero at validation stage
   - Clearer error messages for users

### Future Enhancements

1. **Visual handling of null values**
   - Ensure plotting shows gaps or ghosted points
   - Add tooltips explaining missing data
   - Follow NHS "Making Data Count" visualization guidelines

2. **Handle mathematical edge cases**
   - All same values (zero variation)
   - Single data point
   - Very small sample sizes
   - Return meaningful messages rather than NaN

3. **Documentation**
   - Document null handling in README
   - Explain to users why they see gaps
   - Reference NHS guidelines

---

## Conclusion

**The current approach of replacing NaN with 0 is incorrect** and violates SPC best practices. 

**Recommended approach:**
- Use `null` for invalid/missing values
- Exclude from statistical calculations
- Show as gaps on charts
- Add validation to prevent division by zero

This aligns with:
- NHS "Making Data Count" guidance ✅
- ELFT SPC Guidelines ✅
- Statistical best practices ✅
- Proper data visualization principles ✅

**Test Failures:** The failing tests are actually **documenting the correct behavior** - they expect values that don't conflate missing data with zero. We should update the code to match these expectations, not adjust the tests to accept incorrect behavior.

---

## References

1. NHS England (2019). "Making Data Count - Strengthening Your Decisions"
   https://www.england.nhs.uk/publication/making-data-count/

2. East London NHS Foundation Trust. "SPC Charting Guidelines" (2022)
   https://qi.elft.nhs.uk/resource/elft-spc-guidelines/

3. Hospital Pediatrics (2024). "A Practical Guide to QI Data Analysis: Run and Statistical Process Control Charts"

4. Anhoej, J. "Mastering Statistical Process Control Charts in Healthcare"
   https://anhoej.github.io/spc4hc/

5. Montgomery, D.C. "Introduction to Statistical Quality Control" (7th ed.)

6. Wheeler, D.J. "Understanding Variation: The Key to Managing Chaos" (2nd ed.)
