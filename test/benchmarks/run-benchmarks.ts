/**
 * Main Benchmark Suite
 * 
 * Comprehensive benchmarks for PowerBI-SPC custom visual
 * Measures performance of all key operations and tracks over time
 * 
 * Usage:
 *   npm run benchmark                 # Run benchmarks and compare with baseline
 *   UPDATE_BASELINE=true npm run benchmark  # Update baseline with current results
 */

import { BenchmarkRunner } from './benchmark-runner';

// Import functions to benchmark
import iLimits from "../../src/Limit Calculations/i";
import mrLimits from "../../src/Limit Calculations/mr";
import runLimits from "../../src/Limit Calculations/run";
import pLimits from "../../src/Limit Calculations/p";

import astronomical from "../../src/Outlier Flagging/astronomical";
import shift from "../../src/Outlier Flagging/shift";
import trend from "../../src/Outlier Flagging/trend";
import twoInThree from "../../src/Outlier Flagging/twoInThree";

import { type controlLimitsArgs } from "../../src/Classes";

// Helper functions
function createKeys(n: number): { x: number, id: number, label: string }[] {
  return Array.from({ length: n }, (_, i) => ({
    x: i,
    id: i,
    label: `Point ${i + 1}`
  }));
}

function allIndices(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

function generateData(n: number, mean: number = 50, stddev: number = 10): number[] {
  return Array.from({ length: n }, () => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return Math.max(0, mean + z * stddev);
  });
}

async function runBenchmarks() {
  const runner = new BenchmarkRunner();
  const updateBaseline = process.env.UPDATE_BASELINE === 'true';

  console.log('🚀 Starting PowerBI-SPC Benchmark Suite...\n');

  // ============================================================================
  // LIMIT CALCULATION BENCHMARKS
  // ============================================================================

  console.log('📊 Benchmarking Limit Calculations...');

  // i chart benchmarks
  for (const size of [10, 100, 500, 1000]) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generateData(size),
      subset_points: allIndices(size)
    };

    runner.benchmark(
      'i chart',
      'Limit Calculations',
      () => iLimits(args),
      { iterations: 20, dataPoints: size }
    );
  }

  // mr chart benchmarks
  for (const size of [10, 100, 500, 1000]) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generateData(size),
      subset_points: allIndices(size)
    };

    runner.benchmark(
      'mr chart',
      'Limit Calculations',
      () => mrLimits(args),
      { iterations: 20, dataPoints: size }
    );
  }

  // run chart benchmarks
  for (const size of [10, 100, 500, 1000]) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generateData(size),
      subset_points: allIndices(size)
    };

    runner.benchmark(
      'run chart',
      'Limit Calculations',
      () => runLimits(args),
      { iterations: 20, dataPoints: size }
    );
  }

  // p chart benchmarks
  for (const size of [10, 100, 500, 1000]) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generateData(size, 25, 5).map(v => Math.max(0, Math.round(v))),
      denominators: generateData(size, 100, 10).map(v => Math.max(1, Math.round(v))),
      subset_points: allIndices(size)
    };

    runner.benchmark(
      'p chart',
      'Limit Calculations',
      () => pLimits(args),
      { iterations: 20, dataPoints: size }
    );
  }

  // xbar chart benchmarks (complex) - Commented out temporarily due to setup issues
  // for (const size of [10, 100, 500, 1000]) {
  //   const args: controlLimitsArgs = {
  //     keys: createKeys(size),
  //     numerators: generateData(size, 50, 10),
  //     xbar_sds: generateData(size, 5, 1),
  //     denominators: generateData(size, 10, 2).map(v => Math.max(2, Math.round(v))),
  //     subset_points: allIndices(size)
  //   };

  //   runner.benchmark(
  //     'xbar chart',
  //     'Limit Calculations',
  //     () => xbarLimits(args),
  //     { iterations: 20, dataPoints: size }
  //   );
  // }

  // ============================================================================
  // OUTLIER DETECTION BENCHMARKS
  // ============================================================================

  console.log('📊 Benchmarking Outlier Detection...');

  // astronomical rule
  for (const size of [10, 100, 500, 1000]) {
    const values = generateData(size);
    const ll99 = Array(size).fill(-3);
    const ul99 = Array(size).fill(3);

    runner.benchmark(
      'astronomical rule',
      'Outlier Detection',
      () => astronomical(values, ll99, ul99),
      { iterations: 20, dataPoints: size }
    );
  }

  // shift rule
  for (const size of [10, 100, 500, 1000]) {
    const values = generateData(size);
    const targets = Array(size).fill(50);

    runner.benchmark(
      'shift rule',
      'Outlier Detection',
      () => shift(values, targets, 8),
      { iterations: 20, dataPoints: size }
    );
  }

  // trend rule
  for (const size of [10, 100, 500, 1000]) {
    const values = generateData(size);

    runner.benchmark(
      'trend rule',
      'Outlier Detection',
      () => trend(values, 6),
      { iterations: 20, dataPoints: size }
    );
  }

  // twoInThree rule
  for (const size of [10, 100, 500, 1000]) {
    const values = generateData(size);
    const ll95 = Array(size).fill(40);
    const ul95 = Array(size).fill(60);

    runner.benchmark(
      'twoInThree rule',
      'Outlier Detection',
      () => twoInThree(values, ll95, ul95, false),
      { iterations: 20, dataPoints: size }
    );
  }

  // ============================================================================
  // SAVE RESULTS
  // ============================================================================

  runner.displaySummary();
  runner.compareWithBaseline();
  await runner.save(updateBaseline);

  if (updateBaseline) {
    console.log('\n✅ Baseline has been updated with current benchmark results.');
    console.log('   Future runs will compare against this baseline.');
  } else {
    console.log('\n💡 To update the baseline with these results, run:');
    console.log('   UPDATE_BASELINE=true npm run benchmark');
  }
}

// Run if executed directly
if (require.main === module) {
  runBenchmarks().catch(console.error);
}

export { runBenchmarks };
