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
   * Run a benchmark function multiple times and record results
   */
  benchmark(
    name: string,
    category: string,
    fn: () => void,
    options: {
      iterations?: number;
      dataPoints?: number;
    } = {}
  ): BenchmarkResult {
    const iterations = options.iterations || 10;
    const dataPoints = options.dataPoints || 0;
    const times: number[] = [];

    // Warm-up runs (not recorded)
    for (let i = 0; i < 3; i++) {
      fn();
    }

    // Actual benchmark runs
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      const end = performance.now();
      // Store in microseconds for better precision
      times.push((end - start) * 1000);
    }

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

    const result: BenchmarkResult = {
      name,
      category,
      dataPoints,
      iterations,
      median,
      mean,
      min,
      max,
      stdDev
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
        console.log(`  ${result.name} (${result.dataPoints} pts): ${result.median.toFixed(3)}μs (±${result.stdDev.toFixed(3)}μs)`);
      }
    }

    console.log('\n' + '='.repeat(80));
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
