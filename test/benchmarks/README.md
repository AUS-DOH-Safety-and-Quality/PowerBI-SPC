# PowerBI-SPC Performance Benchmarking System

A comprehensive benchmark suite for tracking and comparing performance of the PowerBI-SPC custom visual over time.

## Features

- 📊 **Comprehensive Benchmarks** - Tests all 14 chart types and 4 outlier detection rules
- 📈 **Historical Tracking** - All benchmark runs saved with git commit info
- 🎯 **Baseline Comparison** - Compare current performance against established baseline
- 📉 **Trend Analysis** - View performance trends over time
- 🔄 **Easy Updates** - Simple flag to update baseline when improvements are made
- 📝 **Export Support** - Export data to CSV for analysis

## Quick Start

### Run Benchmarks

Compare current performance against baseline:

```bash
npm run benchmark
```

### Update Baseline

After making performance improvements, update the baseline:

```bash
npm run benchmark:update
```

Or using the environment variable directly:

```bash
UPDATE_BASELINE=true npm run benchmark
```

### View History

See all historical benchmark runs:

```bash
npm run benchmark:history
```

View last 5 runs only:

```bash
npm run benchmark:history -- --last 5
```

View specific commit:

```bash
npm run benchmark:history -- --commit abc123
```

Filter by category:

```bash
npm run benchmark:history -- --category "Limit Calculations"
```

### Compare Commits

Compare performance between two commits:

```bash
npm run benchmark:history -- --compare abc123 def456
```

### View Trends

See performance trend for a specific benchmark:

```bash
npm run benchmark:history -- --trend "Limit Calculations" "i chart" 100
```

### Export Data

Export all benchmark history to CSV:

```bash
npm run benchmark:export
```

Or specify output file:

```bash
npm run benchmark:history -- --export my-benchmarks.csv
```

## Benchmark Categories

### Limit Calculations

Benchmarks for all 14 SPC chart limit calculations:
- i chart (XmR)
- mr chart
- run chart
- p chart (proportions)
- xbar chart (sample means)
- And 9 more...

Tested with dataset sizes: 10, 100, 500, 1000 points

### Outlier Detection

Benchmarks for all 4 SPC outlier detection rules:
- astronomical rule
- shift rule
- trend rule
- twoInThree rule

Tested with dataset sizes: 10, 100, 500, 1000 points

## Understanding Results

### Benchmark Output

Each benchmark shows:
- **Median**: Middle value of all runs (most reliable metric) in microseconds (μs)
- **Mean**: Average of all runs in microseconds
- **StdDev**: Standard deviation (lower = more consistent) in microseconds
- **Min/Max**: Fastest and slowest runs in microseconds

Example output:
```
Limit Calculations:
  i chart (100 pts): 24.567μs (±3.214μs)
  mr chart (100 pts): 27.891μs (±4.123μs)
  ...
```

### Comparison Indicators

When comparing with baseline:
- 📉 Green checkmark: Performance improved (faster)
- 📈 Red warning: Performance regressed (slower)
- ➡️ Arrow: No significant change (< 5%)

Example:
```
📉 Limit Calculations - i chart (100 pts):
   Baseline: 32.145μs
   Current:  24.567μs
   Change:   -23.68% ✅
```

## Benchmark Data Storage

### Files

Benchmark results are stored in `benchmark-results/`:

- `benchmark-history.json` - Complete history of all runs
- `benchmark-baseline.json` - Current baseline for comparisons

### Data Structure

Each benchmark run includes:
- Timestamp
- Git commit hash
- Git branch name
- Node.js version
- Platform/architecture
- All benchmark results with statistics

Example:
```json
{
  "timestamp": "2025-11-22T10:00:00.000Z",
  "gitCommit": "abc1234567890",
  "gitBranch": "main",
  "environment": {
    "nodeVersion": "v18.17.0",
    "platform": "linux",
    "arch": "x64"
  },
  "results": [
    {
      "name": "i chart",
      "category": "Limit Calculations",
      "dataPoints": 100,
      "iterations": 20,
      "median": 24.567,
      "mean": 25.325,
      "min": 21.234,
      "max": 30.123,
      "stdDev": 3.214
    }
  ]
}
```

## Workflow for Performance Improvements

### 1. Establish Baseline

Before making changes:

```bash
npm run benchmark:update
```

This creates a baseline at the current commit.

### 2. Make Performance Improvements

Edit code to improve performance.

### 3. Verify Improvements

Run benchmarks and compare:

```bash
npm run benchmark
```

Look for green checkmarks (📉) showing improvements.

### 4. Update Baseline

If satisfied with improvements:

```bash
npm run benchmark:update
```

This updates the baseline to the new, improved performance.

### 5. Track Over Time

View historical trend:

```bash
npm run benchmark:history -- --trend "Limit Calculations" "i chart" 100
```

## Advanced Usage

### Custom Iterations

Modify `test/benchmarks/run-benchmarks.ts` to change iteration counts:

```typescript
runner.benchmark(
  'i chart',
  'Limit Calculations',
  () => iLimits(args),
  { iterations: 50, dataPoints: size }  // Increase for more accuracy
);
```

### Add New Benchmarks

Edit `test/benchmarks/run-benchmarks.ts`:

```typescript
// Add your benchmark
runner.benchmark(
  'my new operation',
  'My Category',
  () => myFunction(),
  { iterations: 20, dataPoints: 100 }
);
```

### CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run Benchmarks
  run: npm run benchmark

- name: Upload Results
  uses: actions/upload-artifact@v3
  with:
    name: benchmark-results
    path: benchmark-results/
```

## Performance Targets

Based on established baselines (in microseconds):

| Operation | 100 pts | 1000 pts |
|-----------|---------|----------|
| Limit Calculations | < 50μs | < 200μs |
| Outlier Detection | < 100μs | < 200μs |

*Note: 1000 microseconds (μs) = 1 millisecond (ms)*

Significant regressions (> 20% slower) should be investigated.

## Troubleshooting

### "No baseline found"

Run `npm run benchmark:update` to create initial baseline.

### High variance in results

- Close other applications
- Run more iterations
- Use `median` instead of `mean` for comparisons

### Git info not captured

Ensure you're in a git repository with commits.

## Files

- `test/benchmarks/benchmark-runner.ts` - Core benchmark runner
- `test/benchmarks/run-benchmarks.ts` - Main benchmark suite
- `test/benchmarks/benchmark-history.ts` - History viewer and comparison tools
- `benchmark-results/` - Stored results (git ignored by default)

## Contributing

When adding new features:

1. Add benchmarks for new operations
2. Run baseline before and after changes
3. Document performance impact in PR
4. Update baseline if improvements are significant

## License

Same as main project.
