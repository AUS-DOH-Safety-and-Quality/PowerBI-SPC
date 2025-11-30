/**
 * Main Benchmark Suite
 * 
 * Comprehensive benchmarks for PowerBI-SPC custom visual
 * Measures performance of all key operations and tracks over time
 * 
 * Session 1 Enhancement:
 * - Added 12 of 14 chart types (s and xbar skipped due to ts-node circular dependency issue)
 * - Added rendering benchmarks using linkedom
 * - Increased iterations to 50 for more stable results
 * - Added memory tracking and percentile metrics
 * 
 * Note: s chart and xbar chart benchmarks are skipped due to circular dependency
 * issues with ts-node when importing Constants.ts (c4, c5, b3, b4 functions).
 * These charts work correctly in the main test suite which uses webpack bundling.
 * 
 * Usage:
 *   npm run benchmark                 # Run benchmarks and compare with baseline
 *   UPDATE_BASELINE=true npm run benchmark  # Update baseline with current results
 */

import { BenchmarkRunner } from './benchmark-runner';
import { parseHTML } from 'linkedom';
import * as d3 from 'd3-shape';

// Import limit calculation functions
// Note: sLimits and xbarLimits are imported but skipped in benchmarks due to
// circular dependency issues with ts-node (they work in karma/webpack tests)
import iLimits from "../../src/Limit Calculations/i";
import mrLimits from "../../src/Limit Calculations/mr";
import runLimits from "../../src/Limit Calculations/run";
import pLimits from "../../src/Limit Calculations/p";
import cLimits from "../../src/Limit Calculations/c";
import uLimits from "../../src/Limit Calculations/u";
// Skipped: import sLimits from "../../src/Limit Calculations/s";
import pprimeLimits from "../../src/Limit Calculations/pprime";
import uprimeLimits from "../../src/Limit Calculations/uprime";
// Skipped: import xbarLimits from "../../src/Limit Calculations/xbar";
import gLimits from "../../src/Limit Calculations/g";
import tLimits from "../../src/Limit Calculations/t";
import imLimits from "../../src/Limit Calculations/i_m";
import immLimits from "../../src/Limit Calculations/i_mm";

// Import outlier detection functions
import astronomical from "../../src/Outlier Flagging/astronomical";
import shift from "../../src/Outlier Flagging/shift";
import trend from "../../src/Outlier Flagging/trend";
import twoInThree from "../../src/Outlier Flagging/twoInThree";

import { type controlLimitsArgs } from "../../src/Classes";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

function generatePositiveIntegers(n: number, mean: number = 10, stddev: number = 3): number[] {
  return generateData(n, mean, stddev).map(v => Math.max(0, Math.round(v)));
}

function generateCountData(n: number, mean: number = 100, stddev: number = 10): number[] {
  return generateData(n, mean, stddev).map(v => Math.max(1, Math.round(v)));
}

// ============================================================================
// BENCHMARK CONFIGURATIONS
// ============================================================================

const STANDARD_ITERATIONS = 50;  // Increased from 20 for more stable results
const DATA_SIZES = [10, 100, 500, 1000];
const SVG_NS = 'http://www.w3.org/2000/svg';  // SVG namespace for DOM operations

// Chart types skipped due to ts-node circular dependency issue with Constants.ts
// These charts work correctly in karma/webpack tests
const SKIPPED_CHARTS = ['s chart', 'xbar chart'];

// ============================================================================
// MAIN BENCHMARK SUITE
// ============================================================================

async function runBenchmarks() {
  const runner = new BenchmarkRunner();
  const updateBaseline = process.env.UPDATE_BASELINE === 'true';
  const detailed = process.env.DETAILED === 'true';

  console.log('🚀 Starting PowerBI-SPC Benchmark Suite (Session 1 Enhanced)...\n');
  console.log(`   Iterations per benchmark: ${STANDARD_ITERATIONS}`);
  console.log(`   Data sizes: ${DATA_SIZES.join(', ')}`);
  console.log('');

  // ============================================================================
  // LIMIT CALCULATION BENCHMARKS - ALL 14 CHART TYPES
  // ============================================================================

  console.log('📊 Benchmarking Limit Calculations (12 of 14 chart types)...');

  // 1. i chart benchmarks (XmR - Individual)
  for (const size of DATA_SIZES) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generateData(size),
      subset_points: allIndices(size)
    };

    runner.benchmark(
      'i chart',
      'Limit Calculations',
      () => iLimits(args),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // 2. mr chart benchmarks (Moving Range)
  for (const size of DATA_SIZES) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generateData(size),
      subset_points: allIndices(size)
    };

    runner.benchmark(
      'mr chart',
      'Limit Calculations',
      () => mrLimits(args),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // 3. run chart benchmarks
  for (const size of DATA_SIZES) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generateData(size),
      subset_points: allIndices(size)
    };

    runner.benchmark(
      'run chart',
      'Limit Calculations',
      () => runLimits(args),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // 4. p chart benchmarks (Proportions)
  for (const size of DATA_SIZES) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generatePositiveIntegers(size, 25, 5),
      denominators: generateCountData(size, 100, 10),
      subset_points: allIndices(size)
    };

    runner.benchmark(
      'p chart',
      'Limit Calculations',
      () => pLimits(args),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // 5. c chart benchmarks (Counts)
  for (const size of DATA_SIZES) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generatePositiveIntegers(size, 20, 5),
      subset_points: allIndices(size)
    };

    runner.benchmark(
      'c chart',
      'Limit Calculations',
      () => cLimits(args),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // 6. u chart benchmarks (Rate)
  for (const size of DATA_SIZES) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generatePositiveIntegers(size, 25, 5),
      denominators: generateCountData(size, 100, 10),
      subset_points: allIndices(size)
    };

    runner.benchmark(
      'u chart',
      'Limit Calculations',
      () => uLimits(args),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // 7. s chart benchmarks (Standard Deviation) - SKIPPED
  // See SKIPPED_CHARTS constant for reason
  console.log(`   ⚠️  Skipping ${SKIPPED_CHARTS[0]} (ts-node circular dependency issue)`);

  // 8. p' chart benchmarks (P-Prime)
  for (const size of DATA_SIZES) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generatePositiveIntegers(size, 25, 5),
      denominators: generateCountData(size, 100, 10),
      subset_points: allIndices(size),
      outliers_in_limits: false
    };

    runner.benchmark(
      'pprime chart',
      'Limit Calculations',
      () => pprimeLimits(args),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // 9. u' chart benchmarks (U-Prime)
  for (const size of DATA_SIZES) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generatePositiveIntegers(size, 25, 5),
      denominators: generateCountData(size, 100, 10),
      subset_points: allIndices(size),
      outliers_in_limits: false
    };

    runner.benchmark(
      'uprime chart',
      'Limit Calculations',
      () => uprimeLimits(args),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // 10. xbar chart benchmarks (Sample Means) - SKIPPED
  // See SKIPPED_CHARTS constant for reason
  console.log(`   ⚠️  Skipping ${SKIPPED_CHARTS[1]} (ts-node circular dependency issue)`);

  // 11. g chart benchmarks (Geometric)
  for (const size of DATA_SIZES) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generatePositiveIntegers(size, 15, 8),  // Counts between events
      subset_points: allIndices(size)
    };

    runner.benchmark(
      'g chart',
      'Limit Calculations',
      () => gLimits(args),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // 12. t chart benchmarks (Time between events)
  for (const size of DATA_SIZES) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generateData(size, 10, 5).map(v => Math.max(0.1, v)),  // Time values
      subset_points: allIndices(size)
    };

    runner.benchmark(
      't chart',
      'Limit Calculations',
      () => tLimits(args),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // 13. i-m chart benchmarks (Individual with Median)
  for (const size of DATA_SIZES) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generateData(size),
      subset_points: allIndices(size),
      outliers_in_limits: false
    };

    runner.benchmark(
      'i_m chart',
      'Limit Calculations',
      () => imLimits(args),
    );
  }

  // 12. t chart benchmarks (Time between events)
  for (const size of DATA_SIZES) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generateData(size, 10, 5).map(v => Math.max(0.1, v)),  // Time values
      subset_points: allIndices(size)
    };

    runner.benchmark(
      't chart',
      'Limit Calculations',
      () => tLimits(args),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // 14. i-mm chart benchmarks (Individual with Median of Moving Range)
  // 13. i-m chart benchmarks (Individual with Median)
  for (const size of DATA_SIZES) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generateData(size),
      subset_points: allIndices(size),
      outliers_in_limits: false
    };


    runner.benchmark(
      'i_m chart',
      'Limit Calculations',
      () => imLimits(args),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // 14. i-mm chart benchmarks (Individual with Median of Moving Range)
  for (const size of DATA_SIZES) {
    const args: controlLimitsArgs = {
      keys: createKeys(size),
      numerators: generateData(size),
      subset_points: allIndices(size),
      outliers_in_limits: false
    };

    runner.benchmark(
      'i_mm chart',
      'Limit Calculations',
      () => immLimits(args),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // ============================================================================
  // OUTLIER DETECTION BENCHMARKS
  // ============================================================================

  console.log('📊 Benchmarking Outlier Detection (4 rules)...');

  // astronomical rule
  for (const size of DATA_SIZES) {
    const values = generateData(size);
    const ll99 = Array(size).fill(-3);
    const ul99 = Array(size).fill(3);

    runner.benchmark(
      'astronomical rule',
      'Outlier Detection',
      () => astronomical(values, ll99, ul99),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // shift rule
  for (const size of DATA_SIZES) {
    const values = generateData(size);
    const targets = Array(size).fill(50);

    runner.benchmark(
      'shift rule',
      'Outlier Detection',
      () => shift(values, targets, 8),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // trend rule
  for (const size of DATA_SIZES) {
    const values = generateData(size);

    runner.benchmark(
      'trend rule',
      'Outlier Detection',
      () => trend(values, 6),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // twoInThree rule
  for (const size of DATA_SIZES) {
    const values = generateData(size);
    const ll95 = Array(size).fill(40);
    const ul95 = Array(size).fill(60);

    runner.benchmark(
      'twoInThree rule',
      'Outlier Detection',
      () => twoInThree(values, ll95, ul95, false),
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // ============================================================================
  // RENDERING BENCHMARKS (using linkedom for headless DOM)
  // ============================================================================

  console.log('📊 Benchmarking Rendering (DOM operations)...');

  // Create a linkedom document for headless DOM benchmarking
  const { document } = parseHTML('<!DOCTYPE html><html><body><svg id="chart"></svg></body></html>');

  // DOM Element Creation Benchmark
  for (const size of DATA_SIZES) {
    runner.benchmark(
      'DOM element creation',
      'Rendering',
      () => {
        const svg = document.getElementById('chart');
        const g = document.createElementNS(SVG_NS, 'g');
        for (let i = 0; i < size; i++) {
          const circle = document.createElementNS(SVG_NS, 'circle');
          circle.setAttribute('cx', String(i * 10));
          circle.setAttribute('cy', String(Math.random() * 100));
          circle.setAttribute('r', '5');
          circle.setAttribute('fill', '#007bff');
          g.appendChild(circle);
        }
        svg?.appendChild(g);
        // Clean up for next iteration
        while (svg?.firstChild) {
          svg.removeChild(svg.firstChild);
        }
      },
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // SVG Path Generation Benchmark
  for (const size of DATA_SIZES) {
    const points = generateData(size).map((y, x) => ({ x: x * 10, y }));
    
    runner.benchmark(
      'SVG path generation',
      'Rendering',
      () => {
        // Generate a line path string similar to D3's line generator
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
          path += ` L ${points[i].x} ${points[i].y}`;
        }
        return path;
      },
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // Attribute Updates Benchmark (simulating style changes)
  for (const size of DATA_SIZES) {
    // Pre-create elements
    const svg = document.getElementById('chart');
    const elements: Element[] = [];
    for (let i = 0; i < size; i++) {
      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', String(i * 10));
      circle.setAttribute('cy', '50');
      circle.setAttribute('r', '5');
      svg?.appendChild(circle);
      elements.push(circle);
    }

    runner.benchmark(
      'attribute updates',
      'Rendering',
      () => {
        for (let i = 0; i < elements.length; i++) {
          elements[i].setAttribute('cy', String(Math.random() * 100));
          elements[i].setAttribute('fill', i % 2 === 0 ? '#ff0000' : '#00ff00');
        }
      },
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );

    // Clean up
    while (svg?.firstChild) {
      svg.removeChild(svg.firstChild);
    }
  }

  // Data Binding Simulation (D3-like enter/update/exit pattern)
  for (const size of DATA_SIZES) {
    const svg = document.getElementById('chart');
    let existingElements: Element[] = [];

    runner.benchmark(
      'data binding simulation',
      'Rendering',
      () => {
        // Simulate D3's data binding pattern
        const newData = generateData(size);
        
        // Update existing elements
        for (let i = 0; i < Math.min(existingElements.length, newData.length); i++) {
          existingElements[i].setAttribute('cy', String(newData[i]));
        }
        
        // Enter: create new elements if data is larger
        if (newData.length > existingElements.length) {
          for (let i = existingElements.length; i < newData.length; i++) {
            const circle = document.createElementNS(SVG_NS, 'circle');
            circle.setAttribute('cx', String(i * 10));
            circle.setAttribute('cy', String(newData[i]));
            circle.setAttribute('r', '5');
            svg?.appendChild(circle);
            existingElements.push(circle);
          }
        }
        
        // Exit: remove elements if data is smaller
        while (existingElements.length > newData.length) {
          const el = existingElements.pop();
          el?.parentNode?.removeChild(el);
        }
      },
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );

    // Clean up
    while (svg?.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    existingElements = [];
  }

  // ============================================================================
  // SYMBOL PATH CACHING BENCHMARKS (Session 4 Enhancement)
  // ============================================================================

  console.log('📊 Benchmarking Symbol Path Caching (Session 4)...');

  // D3 symbol shapes available in the visual
  const D3_SHAPES = ['Circle', 'Cross', 'Diamond', 'Square', 'Star', 'Triangle', 'Wye', 'Asterisk'];
  const SYMBOL_SIZES = [6, 8, 10, 12]; // Common sizes used in the visual

  // Symbol path generation without caching (baseline)
  for (const size of DATA_SIZES) {
    runner.benchmark(
      'symbol path (uncached)',
      'Symbol Caching',
      () => {
        // Simulate rendering N dots without caching
        for (let i = 0; i < size; i++) {
          const shape = D3_SHAPES[i % D3_SHAPES.length];
          const symbolSize = SYMBOL_SIZES[i % SYMBOL_SIZES.length];
          // Create a new symbol generator each time (the old approach)
          // Use fallback to symbolCircle if shape not found
          const symbolType = d3[`symbol${shape}`] ?? d3.symbolCircle;
          const symbolGen = d3.symbol()
            .type(symbolType)
            .size((symbolSize * symbolSize) * Math.PI);
          symbolGen();
        }
      },
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // Symbol path generation with caching (optimized approach)
  const symbolCache = new Map<string, string>();
  function getCachedSymbolPath(shape: string, size: number): string {
    const key = `${shape}-${size}`;
    let path = symbolCache.get(key);
    if (path === undefined) {
      // Use fallback to symbolCircle if shape not found
      const symbolType = d3[`symbol${shape}`] ?? d3.symbolCircle;
      const symbolGen = d3.symbol()
        .type(symbolType)
        .size((size * size) * Math.PI);
      path = symbolGen();
      symbolCache.set(key, path);
    }
    return path;
  }

  for (const size of DATA_SIZES) {
    // Clear cache before each size test for fair comparison
    symbolCache.clear();
    
    runner.benchmark(
      'symbol path (cached)',
      'Symbol Caching',
      () => {
        // Simulate rendering N dots with caching
        for (let i = 0; i < size; i++) {
          const shape = D3_SHAPES[i % D3_SHAPES.length];
          const symbolSize = SYMBOL_SIZES[i % SYMBOL_SIZES.length];
          getCachedSymbolPath(shape, symbolSize);
        }
      },
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // ============================================================================
  // RENDERING BENCHMARKS (using linkedom for headless DOM)
  // ============================================================================

  console.log('📊 Benchmarking Rendering (DOM operations)...');

  // Create a linkedom document for headless DOM benchmarking
  const { document } = parseHTML('<!DOCTYPE html><html><body><svg id="chart"></svg></body></html>');

  // DOM Element Creation Benchmark
  for (const size of DATA_SIZES) {
    runner.benchmark(
      'DOM element creation',
      'Rendering',
      () => {
        const svg = document.getElementById('chart');
        const g = document.createElementNS(SVG_NS, 'g');
        for (let i = 0; i < size; i++) {
          const circle = document.createElementNS(SVG_NS, 'circle');
          circle.setAttribute('cx', String(i * 10));
          circle.setAttribute('cy', String(Math.random() * 100));
          circle.setAttribute('r', '5');
          circle.setAttribute('fill', '#007bff');
          g.appendChild(circle);
        }
        svg?.appendChild(g);
        // Clean up for next iteration
        while (svg?.firstChild) {
          svg.removeChild(svg.firstChild);
        }
      },
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // SVG Path Generation Benchmark
  for (const size of DATA_SIZES) {
    const points = generateData(size).map((y, x) => ({ x: x * 10, y }));
    
    runner.benchmark(
      'SVG path generation',
      'Rendering',
      () => {
        // Generate a line path string similar to D3's line generator
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
          path += ` L ${points[i].x} ${points[i].y}`;
        }
        return path;
      },
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );
  }

  // Attribute Updates Benchmark (simulating style changes)
  for (const size of DATA_SIZES) {
    // Pre-create elements
    const svg = document.getElementById('chart');
    const elements: Element[] = [];
    for (let i = 0; i < size; i++) {
      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', String(i * 10));
      circle.setAttribute('cy', '50');
      circle.setAttribute('r', '5');
      svg?.appendChild(circle);
      elements.push(circle);
    }

    runner.benchmark(
      'attribute updates',
      'Rendering',
      () => {
        for (let i = 0; i < elements.length; i++) {
          elements[i].setAttribute('cy', String(Math.random() * 100));
          elements[i].setAttribute('fill', i % 2 === 0 ? '#ff0000' : '#00ff00');
        }
      },
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );

    // Clean up
    while (svg?.firstChild) {
      svg.removeChild(svg.firstChild);
    }
  }

  // Data Binding Simulation (D3-like enter/update/exit pattern)
  for (const size of DATA_SIZES) {
    const svg = document.getElementById('chart');
    let existingElements: Element[] = [];

    runner.benchmark(
      'data binding simulation',
      'Rendering',
      () => {
        // Simulate D3's data binding pattern
        const newData = generateData(size);
        
        // Update existing elements
        for (let i = 0; i < Math.min(existingElements.length, newData.length); i++) {
          existingElements[i].setAttribute('cy', String(newData[i]));
        }
        
        // Enter: create new elements if data is larger
        if (newData.length > existingElements.length) {
          for (let i = existingElements.length; i < newData.length; i++) {
            const circle = document.createElementNS(SVG_NS, 'circle');
            circle.setAttribute('cx', String(i * 10));
            circle.setAttribute('cy', String(newData[i]));
            circle.setAttribute('r', '5');
            svg?.appendChild(circle);
            existingElements.push(circle);
          }
        }
        
        // Exit: remove elements if data is smaller
        while (existingElements.length > newData.length) {
          const el = existingElements.pop();
          el?.parentNode?.removeChild(el);
        }
      },
      { iterations: STANDARD_ITERATIONS, dataPoints: size }
    );

    // Clean up
    while (svg?.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    existingElements = [];
  }

  // ============================================================================
  // SAVE RESULTS
  // ============================================================================

  if (detailed) {
    runner.displayDetailedSummary();
  } else {
    runner.displaySummary();
  }
  runner.compareWithBaseline();
  await runner.save(updateBaseline);

  if (updateBaseline) {
    console.log('\n✅ Baseline has been updated with current benchmark results.');
    console.log('   Future runs will compare against this baseline.');
  } else {
    console.log('\n💡 To update the baseline with these results, run:');
    console.log('   UPDATE_BASELINE=true npm run benchmark');
  }

  console.log('\n💡 For detailed output including percentiles and memory:');
  console.log('   DETAILED=true npm run benchmark');
}

// Run if executed directly
if (require.main === module) {
  runBenchmarks().catch(console.error);
}

export { runBenchmarks };
