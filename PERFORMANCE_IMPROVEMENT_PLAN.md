# Performance Improvement Plan for PowerBI-SPC Custom Visual

## Executive Summary

This document outlines a comprehensive 5-session performance improvement plan for the PowerBI-SPC custom visual. The plan is based on analysis of the existing benchmark system and identification of key performance bottlenecks in the visual's architecture.

### Current State Assessment

The existing benchmark system (`test/benchmarks/`) provides solid infrastructure for:
- **Limit Calculations**: Benchmarking 4 chart types (i, mr, run, p) across 4 dataset sizes (10, 100, 500, 1000 points)
- **Outlier Detection**: Benchmarking 4 rules (astronomical, shift, trend, twoInThree)
- **Historical Tracking**: JSON-based history with git commit tracking
- **Baseline Comparison**: Ability to compare against established baselines

### Key Performance Observations

Based on benchmark results analysis:

| Category | Operation | 100 pts | 1000 pts | Notes |
|----------|-----------|---------|----------|-------|
| Limit Calculations | i chart | ~33μs | ~535μs | Good linear scaling |
| Limit Calculations | p chart | ~73μs | ~1250μs | Higher complexity due to denominator calculations |
| Outlier Detection | astronomical | ~18μs | ~26μs | Excellent O(n) performance |
| Outlier Detection | twoInThree | ~29μs | ~234μs | Needs optimization investigation - likely O(n²) sliding window |

### Identified Performance Bottlenecks

1. **Rendering Pipeline**: D3 data binding and DOM manipulation in `drawDots.ts` and `drawLines.ts`
2. **Data Processing**: Deep copy operations in `viewModelClass.ts` (JSON.parse/stringify)
3. **Missing Benchmarks**: No rendering performance coverage in standalone benchmark suite
4. **Statistical Calculations**: Some limit calculation functions (p chart, xbar) show higher complexity

---

## Session 1: Benchmark System Enhancement

### Objective
Extend the benchmark system to provide comprehensive coverage of all performance-critical operations.

### Key Deliverables

1. **Complete Limit Calculation Coverage**
   - Add benchmarks for all 14 chart types: i, mr, run, c, p, u, s, pprime, uprime, xbar, g, t, i_m, i_mm
   - Currently only 4 types are benchmarked in `run-benchmarks.ts`

2. **Add Memory Profiling**
   - Track memory allocation during benchmark runs
   - Identify memory leaks in repeated operations
   - Add `heapUsed` and `heapTotal` metrics to benchmark results

3. **Add Rendering Benchmarks to Standalone Suite**
   - Create headless rendering benchmarks using linkedom
   - Measure D3 data binding performance
   - Benchmark DOM element creation/update cycles

4. **Improve Statistical Accuracy**
   - Increase default iterations from 20 to 50 for more stable results
   - Add percentile metrics (p95, p99) for outlier detection
   - Implement warm-up phase improvements

### Implementation Guidance

```typescript
// benchmark-runner.ts additions
interface BenchmarkResult {
  // Existing fields...
  p95: number;          // 95th percentile
  p99: number;          // 99th percentile
  memoryUsed?: number;  // Heap memory delta in bytes
}

// Add memory tracking
benchmark(name: string, category: string, fn: () => void, options: BenchmarkOptions): BenchmarkResult {
  const memBefore = process.memoryUsage().heapUsed;
  // ... run benchmarks
  const memAfter = process.memoryUsage().heapUsed;
  result.memoryUsed = memAfter - memBefore;
}
```

### Rationale
- Complete benchmark coverage enables accurate identification of optimization opportunities
- Memory profiling is critical for Power BI visuals as they operate in constrained environments
- Statistical improvements reduce noise in measurements

---

## Session 2: Limit Calculation Optimizations

### Objective
Optimize the most computationally expensive limit calculation algorithms.

### Key Deliverables

1. **Optimize p chart Calculations**
   - Current: ~1250μs for 1000 points
   - Target: <800μs for 1000 points
   - Focus on reducing redundant array operations

2. **Optimize Array Operations in Helper Functions**
   - Review `src/Functions/` for inefficient patterns
   - Replace chained `.map().filter()` with single-pass operations
   - Use typed arrays where appropriate

3. **Implement Memoization for Repeated Calculations**
   - Cache statistical calculations (mean, standard deviation)
   - Implement lazy evaluation for limit arrays

4. **Optimize xbar Chart Weighted Calculations**
   - Profile and optimize the complex weighted mean calculations
   - Reduce object allocations during processing

### Implementation Guidance

```typescript
// Example optimization for consecutive difference calculation in i.ts
// Before:
const consec_diff: number[] = abs(diff(ratio_subset));

// After (single pass):
const consec_diff: number[] = new Array(ratio_subset.length - 1);
for (let i = 0; i < ratio_subset.length - 1; i++) {
  consec_diff[i] = Math.abs(ratio_subset[i + 1] - ratio_subset[i]);
}
```

### Rationale
- p chart is the slowest limit calculation (~2.3x slower than i chart)
- Function call overhead compounds in tight loops
- Typed arrays provide better JIT optimization opportunities

---

## Session 3: Outlier Detection Optimizations

### Objective
Improve outlier detection algorithm performance, particularly for the twoInThree rule.

### Key Deliverables

1. **Optimize twoInThree Rule**
   - Current: Shows non-linear scaling (29μs → 234μs, ~8x for 10x data)
   - Target: Linear O(n) scaling
   - Review sliding window implementation

2. **Optimize shift Rule**
   - Current: ~112μs for 1000 points
   - Target: <80μs for 1000 points
   - Implement running count optimization

3. **Optimize trend Rule**
   - Current: ~103μs for 1000 points
   - Target: <70μs for 1000 points
   - Use incremental direction tracking

4. **Implement Early Exit Optimizations**
   - Skip outlier detection for data subsets below threshold
   - Add early termination for sequences meeting criteria

### Implementation Guidance

```typescript
// Optimized shift rule with running count
export default function shift(values: number[], targets: number[], n: number): string[] {
  const result: string[] = new Array(values.length).fill("none");
  let aboveCount = 0;
  let belowCount = 0;
  
  for (let i = 0; i < values.length; i++) {
    if (values[i] > targets[i]) {
      aboveCount++;
      belowCount = 0;
    } else if (values[i] < targets[i]) {
      belowCount++;
      aboveCount = 0;
    } else {
      aboveCount = 0;
      belowCount = 0;
    }
    
    if (aboveCount >= n) {
      for (let j = i - n + 1; j <= i; j++) {
        result[j] = "upper";
      }
    }
    if (belowCount >= n) {
      for (let j = i - n + 1; j <= i; j++) {
        result[j] = "lower";
      }
    }
  }
  return result;
}
```

### Rationale
- twoInThree shows concerning O(n²) behavior that needs addressing
- SPC outlier rules are applied on every data update
- Early exit conditions can significantly reduce average-case time

---

## Session 4: D3 Rendering Pipeline Optimizations

### Objective
Optimize the D3 rendering pipeline for faster visual updates and reduced DOM manipulation overhead.

### Key Deliverables

1. **Optimize drawDots.ts**
   - Pre-compute symbol paths once per unique shape/size combination
   - Cache scale calculations
   - Reduce per-element style calculations

2. **Optimize drawLines.ts**
   - Pre-compute line generators
   - Batch path string generation
   - Reduce filter/defined function calls

3. **Implement Efficient Update Pattern**
   - Add change detection to avoid unnecessary re-renders
   - Implement partial updates for data changes vs. style changes
   - Use D3's enter/update/exit pattern more efficiently

4. **Optimize SVG Element Attributes**
   - Batch attribute changes
   - Reduce CSS property lookups
   - Use transform instead of individual x/y attributes where appropriate

### Implementation Guidance

```typescript
// Pre-computed symbol path cache in drawDots.ts
// Caches the generated path string for each unique shape/size combination
const symbolPathCache = new Map<string, string>();

function getSymbolPath(shape: string, size: number): string {
  const key = `${shape}-${size}`;
  if (!symbolPathCache.has(key)) {
    // Generate the path string once and cache it
    const symbolGenerator = d3.symbol().type(d3[`symbol${shape}`]).size((size * size) * Math.PI);
    symbolPathCache.set(key, symbolGenerator());
  }
  return symbolPathCache.get(key);
}

// Use in render - returns cached path string directly:
.attr("d", (d: plotData) => getSymbolPath(d.aesthetics.shape, d.aesthetics.size))
```

### Rationale
- DOM manipulation is the primary rendering bottleneck
- Symbol path generation is pure and deterministic (ideal for caching)
- Power BI visuals receive frequent resize and update events

---

## Session 5: Data Processing & ViewModel Optimizations

### Objective
Optimize data processing in the ViewModel to reduce memory allocation and improve update performance.

### Key Deliverables

1. **Eliminate Deep Copy Operations**
   - Replace `JSON.parse(JSON.stringify())` with structured cloning or manual copy
   - Use object pooling for frequently created structures
   - Implement immutable data patterns where appropriate

2. **Optimize initialisePlotData Function**
   - Current loop creates many intermediate objects
   - Implement batch processing for large datasets
   - Pre-allocate arrays with known sizes

3. **Optimize initialiseGroupedLines Function**
   - Reduce object creation in inner loops
   - Use typed arrays for coordinate data
   - Implement lazy line data generation

4. **Add Incremental Update Support**
   - Detect minimal changes in data updates
   - Implement delta updates instead of full recalculation
   - Cache computed values between updates

### Implementation Guidance

```typescript
// Replace JSON.parse/stringify deep copy pattern
// BEFORE (inefficient - creates string intermediary, ~10x slower):
const data: dataObject = JSON.parse(JSON.stringify(inputData));

// AFTER Option 1 - Using structuredClone (Node 17+, best for complex nested objects):
const data: dataObject = structuredClone(inputData);

// AFTER Option 2 - Manual structured copy (for performance-critical paths):
function deepCopyLimitArgs(data: dataObject): dataObject {
  return {
    ...data,
    limitInputArgs: {
      keys: data.limitInputArgs.keys.slice(),
      numerators: data.limitInputArgs.numerators.slice(),
      denominators: data.limitInputArgs.denominators?.slice(),
      // ... other fields
    }
  };
}

// Pre-allocate arrays in initialisePlotData
initialisePlotData(host: IVisualHost): void {
  const n = this.controlLimits.keys.length;
  this.plotPoints = new Array(n);  // Pre-allocate
  this.tickLabels = new Array(n);  // Pre-allocate
  
  for (let i = 0; i < n; i++) {
    // Direct assignment instead of push()
    this.plotPoints[i] = { /* ... */ };
    this.tickLabels[i] = { /* ... */ };
  }
}
```

### Rationale
- `JSON.parse(JSON.stringify())` is expensive (~10x slower than manual copy)
- Array pre-allocation reduces GC pressure
- Power BI visual updates should complete in <16ms for 60fps interaction

---

## Performance Targets

### Limit Calculations
| Operation | Current (1000 pts) | Target | Improvement |
|-----------|-------------------|--------|-------------|
| i chart | ~535μs | <400μs | 25% |
| p chart | ~1250μs | <800μs | 35% |
| xbar chart | TBD | <600μs | - |

### Outlier Detection
| Operation | Current (1000 pts) | Target | Improvement |
|-----------|-------------------|--------|-------------|
| astronomical | ~26μs | <25μs | 5% |
| shift | ~112μs | <80μs | 30% |
| trend | ~103μs | <70μs | 30% |
| twoInThree | ~234μs | <150μs | 35% |

### Rendering (New Benchmarks)
| Operation | Target (100 pts) | Target (1000 pts) |
|-----------|-----------------|-------------------|
| Initial render | <100ms | <500ms |
| Update render | <50ms | <200ms |
| Resize | <20ms | <50ms |

---

## Success Metrics

1. **Benchmark Improvements**: All sessions should demonstrate measurable improvements in benchmark results
2. **Test Coverage**: Maintain or improve existing test coverage (currently 77.4% statements)
3. **No Regressions**: All 834 existing tests must continue to pass
4. **Real-World Performance**: Visual should remain responsive with datasets up to 10,000 points

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Optimization breaks edge cases | Medium | High | Comprehensive test suite coverage |
| Memory optimizations cause leaks | Low | High | Memory profiling in benchmarks |
| Rendering changes affect visual output | Medium | Medium | Visual regression testing |
| Type safety compromises | Low | Medium | TypeScript strict mode |

---

## Appendix: Current Benchmark System Analysis

### Strengths
- Comprehensive statistical metrics (mean, median, stdDev, min, max)
- Git commit tracking for historical analysis
- CSV export capability for external analysis
- Well-documented README with usage examples

### Areas for Improvement
- Limited to 4 of 14 chart types in benchmarks
- No memory profiling
- No rendering benchmarks in standalone suite
- Iteration count (20) may be insufficient for noisy results

### File Structure
```
test/benchmarks/
├── README.md              # Documentation
├── benchmark-runner.ts    # Core runner class
├── run-benchmarks.ts      # Main benchmark suite
└── benchmark-history.ts   # History viewer/exporter

benchmark-results/
├── benchmark-history.json # Historical results
└── benchmark-baseline.json # Baseline for comparisons (when created)
```

---

## Session Completion Status

### Session 1: Benchmark System Enhancement ✅ COMPLETED

**Completion Date:** 2025-11-27

**Summary:** Successfully enhanced the benchmark system with comprehensive coverage, memory profiling, and statistical improvements.

**Key Deliverables:**
- ✅ Extended limit calculation benchmarks to 12 of 14 chart types (s and xbar skipped due to ts-node circular dependency issue)
- ✅ Added memory profiling with heap usage tracking
- ✅ Added P95 and P99 percentile metrics
- ✅ Increased default iterations from 10 to 50
- ✅ Added 4 rendering benchmarks using linkedom
- ✅ Improved warm-up phase from 3 to 5 runs

**Detailed Documentation:** See [PERFORMANCE_IMPROVEMENT_PLAN_SESSION_1.md](PERFORMANCE_IMPROVEMENT_PLAN_SESSION_1.md)

**Key Performance Findings:**
| Category | 1000 pts Median | Notes |
|----------|-----------------|-------|
| Fastest limit calc | mr chart: ~475μs | Simple formula |
| Slowest limit calc | t chart: ~2.3ms | Power transforms |
| Fastest outlier | astronomical: ~25μs | O(n) performance |
| DOM creation | ~1.3ms | High variance |

### Session 2-5: Pending

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-27 | Performance Agent | Initial plan creation |
| 1.1 | 2025-11-27 | Performance Agent | Session 1 completion, added session status section |
