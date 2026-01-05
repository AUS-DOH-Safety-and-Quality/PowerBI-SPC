/**
 * Benchmark Runner - Records and compares performance benchmarks
 * 
 * Usage:
 * - Run benchmarks: npm run benchmark
 * - Update baselines: npm run benchmark:update
 * - Compare with history: npm run benchmark:compare
 */

import * as fs from 'fs';
import * as path from 'path';

export interface BenchmarkResult {
  name: string;
  category: string;
  dataPoints: number;
  iterations: number;
  median: number;
  mean: number;
  min: number;
  max: number;
  stdDev: number;
  p95: number;           // 95th percentile
  p99: number;           // 99th percentile
  memoryUsed?: number;   // Heap memory delta in bytes (can be negative due to GC)
}

export interface BenchmarkSuite {
  timestamp: string;
  gitCommit?: string;
  gitBranch?: string;
  environment: {
    nodeVersion: string;
    platform: string;
    arch: string;
  };
  results: BenchmarkResult[];
}

export class BenchmarkRunner {
  private results: BenchmarkResult[] = [];
  private historyFile: string;
  private baselineFile: string;

  constructor() {
    const benchmarkDir = path.join(__dirname, '../../benchmark-results');
    if (!fs.existsSync(benchmarkDir)) {
      fs.mkdirSync(benchmarkDir, { recursive: true });
    }
    
    this.historyFile = path.join(benchmarkDir, 'benchmark-history.json');
    this.baselineFile = path.join(benchmarkDir, 'benchmark-baseline.json');
  }

  /**
   * Calculate percentile from sorted array
   */
  private percentile(sortedArr: number[], p: number): number {
    const index = (p / 100) * (sortedArr.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) {
      return sortedArr[lower];
    }
    // Linear interpolation
    return sortedArr[lower] + (index - lower) * (sortedArr[upper] - sortedArr[lower]);
  }

  /**
   * Run a benchmark function multiple times and record results
   * 
   * Improvements in this version:
   * - Increased default iterations from 10 to 50 for more stable results
   * - Added p95 and p99 percentile metrics for outlier detection
   * - Added memory profiling to track heap usage
   * - Improved warm-up phase with 5 runs instead of 3
   */
  benchmark(
    name: string,
    category: string,
    fn: () => void,
    options: {
      iterations?: number;
      dataPoints?: number;
      trackMemory?: boolean;
    } = {}
  ): BenchmarkResult {
    const iterations = options.iterations || 50;  // Increased from 10 to 50
    const dataPoints = options.dataPoints || 0;
    const trackMemory = options.trackMemory !== false;  // Default to true
    const times: number[] = [];

    // Improved warm-up phase: 5 runs to ensure JIT compilation is stable
    for (let i = 0; i < 5; i++) {
      fn();
    }

    // Force garbage collection before memory measurement if available
    // Note: Requires running Node with --expose-gc flag for gc() to be available
    if (typeof global !== 'undefined' && typeof global.gc === 'function') {
      global.gc();
    }

    // Capture memory before benchmark runs
    const memBefore = trackMemory ? process.memoryUsage().heapUsed : 0;

    // Actual benchmark runs
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      const end = performance.now();
      // Store in microseconds for better precision
      times.push((end - start) * 1000);
    }

    // Capture memory after benchmark runs
    const memAfter = trackMemory ? process.memoryUsage().heapUsed : 0;
    const memoryUsed = trackMemory ? memAfter - memBefore : undefined;

    // Calculate statistics (all in microseconds)
    times.sort((a, b) => a - b);
    const median = times.length % 2 === 0
      ? (times[times.length / 2 - 1] + times[times.length / 2]) / 2
      : times[Math.floor(times.length / 2)];
    
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const min = times[0];
    const max = times[times.length - 1];
    
    // Calculate standard deviation
    const variance = times.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);

    // Calculate percentiles for outlier detection
    const p95 = this.percentile(times, 95);
    const p99 = this.percentile(times, 99);

    const result: BenchmarkResult = {
      name,
      category,
      dataPoints,
      iterations,
      median,
      mean,
      min,
      max,
      stdDev,
      p95,
      p99,
      memoryUsed
    };

    this.results.push(result);
    return result;
  }

  /**
   * Get git information for tracking
   */
  private async getGitInfo(): Promise<{ commit?: string; branch?: string }> {
    try {
      const { execSync } = require('child_process');
      const commit = execSync('git rev-parse HEAD').toString().trim();
      const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
      return { commit, branch };
    } catch {
      return {};
    }
  }

  /**
   * Save results to history and optionally update baseline
   */
  async save(updateBaseline: boolean = false): Promise<void> {
    const gitInfo = await this.getGitInfo();
    
    const suite: BenchmarkSuite = {
      timestamp: new Date().toISOString(),
      gitCommit: gitInfo.commit,
      gitBranch: gitInfo.branch,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      results: this.results
    };

    // Append to history
    let history: BenchmarkSuite[] = [];
    if (fs.existsSync(this.historyFile)) {
      const historyData = fs.readFileSync(this.historyFile, 'utf8');
      history = JSON.parse(historyData);
    }
    history.push(suite);
    fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2));

    // Update baseline if requested
    if (updateBaseline) {
      fs.writeFileSync(this.baselineFile, JSON.stringify(suite, null, 2));
      console.log(`\n✅ Baseline updated at commit ${gitInfo.commit?.substring(0, 7)}`);
    }

    console.log(`\n📊 Benchmark results saved to ${this.historyFile}`);
  }

  /**
   * Compare current results with baseline
   */
  compareWithBaseline(): void {
    if (!fs.existsSync(this.baselineFile)) {
      console.log('\n⚠️  No baseline found. Run with UPDATE_BASELINE=true to create one.');
      return;
    }

    const baselineData = fs.readFileSync(this.baselineFile, 'utf8');
    const baseline: BenchmarkSuite = JSON.parse(baselineData);

    console.log('\n📊 Benchmark Comparison with Baseline');
    console.log('='.repeat(80));
    console.log(`Baseline: ${baseline.timestamp} (${baseline.gitCommit?.substring(0, 7)})`);
    console.log('='.repeat(80));

    for (const current of this.results) {
      const baselineResult = baseline.results.find(
        r => r.name === current.name && r.category === current.category && r.dataPoints === current.dataPoints
      );

      if (!baselineResult) {
        console.log(`\n⚠️  ${current.category} - ${current.name} (${current.dataPoints} pts): NEW BENCHMARK`);
        continue;
      }

      const change = ((current.median - baselineResult.median) / baselineResult.median) * 100;
      const changeSymbol = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
      const changeColor = Math.abs(change) < 5 ? '' : change > 0 ? ' ⚠️' : ' ✅';

      console.log(`\n${changeSymbol} ${current.category} - ${current.name} (${current.dataPoints} pts):`);
      console.log(`   Baseline: ${baselineResult.median.toFixed(3)}μs`);
      console.log(`   Current:  ${current.median.toFixed(3)}μs`);
      console.log(`   Change:   ${change > 0 ? '+' : ''}${change.toFixed(2)}%${changeColor}`);
    }

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Display summary of current run
   */
  displaySummary(): void {
    console.log('\n📊 Benchmark Results Summary');
    console.log('='.repeat(80));

    const byCategory = this.results.reduce((acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    }, {} as Record<string, BenchmarkResult[]>);

    for (const [category, results] of Object.entries(byCategory)) {
      console.log(`\n${category}:`);
      for (const result of results) {
        let line = `  ${result.name} (${result.dataPoints} pts): ${result.median.toFixed(3)}μs`;
        line += ` (±${result.stdDev.toFixed(3)}μs)`;
        line += ` [p95: ${result.p95.toFixed(3)}μs, p99: ${result.p99.toFixed(3)}μs]`;
        if (result.memoryUsed !== undefined) {
          const memKB = (result.memoryUsed / 1024).toFixed(2);
          line += ` | Mem: ${memKB}KB`;
        }
        console.log(line);
      }
    }

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Display detailed summary including percentiles and memory for analysis
   */
  displayDetailedSummary(): void {
    console.log('\n📊 Detailed Benchmark Results');
    console.log('='.repeat(100));

    const byCategory = this.results.reduce((acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    }, {} as Record<string, BenchmarkResult[]>);

    for (const [category, results] of Object.entries(byCategory)) {
      console.log(`\n${category}:`);
      console.log('-'.repeat(100));
      console.log('  Name'.padEnd(25) + 'Points'.padEnd(10) + 'Median'.padEnd(12) + 'Mean'.padEnd(12) + 
                  'StdDev'.padEnd(12) + 'P95'.padEnd(12) + 'P99'.padEnd(12) + 'Memory');
      console.log('-'.repeat(100));
      
      for (const result of results) {
        const memStr = result.memoryUsed !== undefined 
          ? `${(result.memoryUsed / 1024).toFixed(1)}KB` 
          : 'N/A';
        console.log(
          `  ${result.name.padEnd(23)}` +
          `${result.dataPoints.toString().padEnd(10)}` +
          `${result.median.toFixed(3).padEnd(12)}` +
          `${result.mean.toFixed(3).padEnd(12)}` +
          `${result.stdDev.toFixed(3).padEnd(12)}` +
          `${result.p95.toFixed(3).padEnd(12)}` +
          `${result.p99.toFixed(3).padEnd(12)}` +
          memStr
        );
      }
    }

    console.log('\n' + '='.repeat(100));
  }

  /**
   * Get all results
   */
  getResults(): BenchmarkResult[] {
    return this.results;
  }

  /**
   * Clear results
   */
  clear(): void {
    this.results = [];
  }
}
