/**
 * Benchmark History Viewer
 * 
 * Displays historical benchmark data and trends
 * 
 * Usage:
 *   npm run benchmark:history           # Show all history
 *   npm run benchmark:history -- --last 5  # Show last 5 runs
 *   npm run benchmark:history -- --commit abc123  # Show specific commit
 */

import * as fs from 'fs';
import * as path from 'path';
import { BenchmarkSuite } from './benchmark-runner';

interface ComparisonOptions {
  last?: number;
  commit?: string;
  category?: string;
  benchmark?: string;
}

class BenchmarkHistory {
  private historyFile: string;

  constructor() {
    this.historyFile = path.join(__dirname, '../../benchmark-results/benchmark-history.json');
  }

  /**
   * Load all history
   */
  loadHistory(): BenchmarkSuite[] {
    if (!fs.existsSync(this.historyFile)) {
      console.log('⚠️  No benchmark history found. Run benchmarks first.');
      return [];
    }

    const data = fs.readFileSync(this.historyFile, 'utf8');
    return JSON.parse(data);
  }

  /**
   * Display all history
   */
  displayHistory(options: ComparisonOptions = {}): void {
    let history = this.loadHistory();

    if (history.length === 0) {
      return;
    }

    // Filter by options
    if (options.commit) {
      history = history.filter(h => h.gitCommit?.startsWith(options.commit!));
    }

    if (options.last) {
      history = history.slice(-options.last);
    }

    console.log('\n📊 Benchmark History');
    console.log('='.repeat(100));

    for (const suite of history) {
      const date = new Date(suite.timestamp).toLocaleString();
      const commit = suite.gitCommit?.substring(0, 7) || 'unknown';
      const branch = suite.gitBranch || 'unknown';

      console.log(`\n📅 ${date} | Commit: ${commit} | Branch: ${branch}`);
      console.log('-'.repeat(100));

      // Group by category
      const byCategory = suite.results.reduce((acc, result) => {
        if (!acc[result.category]) {
          acc[result.category] = [];
        }
        acc[result.category].push(result);
        return acc;
      }, {} as Record<string, any[]>);

      for (const [category, results] of Object.entries(byCategory)) {
        if (options.category && category !== options.category) {
          continue;
        }

        console.log(`\n  ${category}:`);
        for (const result of results) {
          if (options.benchmark && result.name !== options.benchmark) {
            continue;
          }
          console.log(`    ${result.name} (${result.dataPoints} pts): ${result.median.toFixed(3)}μs (±${result.stdDev.toFixed(3)}μs)`);
        }
      }
    }

    console.log('\n' + '='.repeat(100));
  }

  /**
   * Compare two specific runs
   */
  compare(commit1: string, commit2: string): void {
    const history = this.loadHistory();

    const run1 = history.find(h => h.gitCommit?.startsWith(commit1));
    const run2 = history.find(h => h.gitCommit?.startsWith(commit2));

    if (!run1 || !run2) {
      console.log('⚠️  Could not find one or both commits in history.');
      return;
    }

    console.log('\n📊 Benchmark Comparison');
    console.log('='.repeat(100));
    console.log(`Commit 1: ${run1.gitCommit?.substring(0, 7)} (${new Date(run1.timestamp).toLocaleString()})`);
    console.log(`Commit 2: ${run2.gitCommit?.substring(0, 7)} (${new Date(run2.timestamp).toLocaleString()})`);
    console.log('='.repeat(100));

    for (const result1 of run1.results) {
      const result2 = run2.results.find(
        r => r.name === result1.name && r.category === result1.category && r.dataPoints === result1.dataPoints
      );

      if (!result2) {
        continue;
      }

      const change = ((result2.median - result1.median) / result1.median) * 100;
      const symbol = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
      const indicator = Math.abs(change) < 5 ? '' : change > 0 ? ' ⚠️' : ' ✅';

      console.log(`\n${symbol} ${result1.category} - ${result1.name} (${result1.dataPoints} pts):`);
      console.log(`   Commit 1: ${result1.median.toFixed(3)}μs`);
      console.log(`   Commit 2: ${result2.median.toFixed(3)}μs`);
      console.log(`   Change:   ${change > 0 ? '+' : ''}${change.toFixed(2)}%${indicator}`);
    }

    console.log('\n' + '='.repeat(100));
  }

  /**
   * Show trend for a specific benchmark
   */
  showTrend(category: string, benchmarkName: string, dataPoints: number): void {
    const history = this.loadHistory();

    console.log(`\n📈 Trend: ${category} - ${benchmarkName} (${dataPoints} points)`);
    console.log('='.repeat(100));

    for (const suite of history) {
      const result = suite.results.find(
        r => r.category === category && r.name === benchmarkName && r.dataPoints === dataPoints
      );

      if (result) {
        const date = new Date(suite.timestamp).toLocaleDateString();
        const commit = suite.gitCommit?.substring(0, 7) || 'unknown';
        console.log(`${date} (${commit}): ${result.median.toFixed(3)}μs (±${result.stdDev.toFixed(3)}μs)`);
      }
    }

    console.log('='.repeat(100));
  }

  /**
   * Export history to CSV
   * Session 1 Enhancement: Added p95, p99, and memoryUsed columns
   */
  exportToCsv(outputPath: string): void {
    const history = this.loadHistory();

    const rows = [
      ['Timestamp', 'Commit', 'Branch', 'Category', 'Benchmark', 'Data Points', 'Median', 'Mean', 'Min', 'Max', 'StdDev', 'P95', 'P99', 'MemoryUsed']
    ];

    for (const suite of history) {
      for (const result of suite.results) {
        rows.push([
          suite.timestamp,
          suite.gitCommit || '',
          suite.gitBranch || '',
          result.category,
          result.name,
          result.dataPoints.toString(),
          result.median.toFixed(2),
          result.mean.toFixed(2),
          result.min.toFixed(2),
          result.max.toFixed(2),
          result.stdDev.toFixed(2),
          result.p95 !== undefined ? result.p95.toFixed(2) : '',
          result.p99 !== undefined ? result.p99.toFixed(2) : '',
          result.memoryUsed !== undefined ? result.memoryUsed.toFixed(0) : ''
        ]);
      }
    }

    const csv = rows.map(row => row.join(',')).join('\n');
    fs.writeFileSync(outputPath, csv);
    console.log(`\n✅ Exported ${rows.length - 1} results to ${outputPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const viewer = new BenchmarkHistory();

  if (args.includes('--export')) {
    const outputIndex = args.indexOf('--export') + 1;
    const outputPath = args[outputIndex] || 'benchmark-export.csv';
    viewer.exportToCsv(outputPath);
  } else if (args.includes('--compare')) {
    const commit1Index = args.indexOf('--compare') + 1;
    const commit1 = args[commit1Index];
    const commit2 = args[commit1Index + 1];
    viewer.compare(commit1, commit2);
  } else if (args.includes('--trend')) {
    const categoryIndex = args.indexOf('--trend') + 1;
    const category = args[categoryIndex];
    const benchmark = args[categoryIndex + 1];
    const dataPoints = parseInt(args[categoryIndex + 2]);
    viewer.showTrend(category, benchmark, dataPoints);
  } else {
    const options: ComparisonOptions = {};
    
    if (args.includes('--last')) {
      const lastIndex = args.indexOf('--last') + 1;
      options.last = parseInt(args[lastIndex]);
    }
    
    if (args.includes('--commit')) {
      const commitIndex = args.indexOf('--commit') + 1;
      options.commit = args[commitIndex];
    }
    
    if (args.includes('--category')) {
      const categoryIndex = args.indexOf('--category') + 1;
      options.category = args[categoryIndex];
    }
    
    if (args.includes('--benchmark')) {
      const benchmarkIndex = args.indexOf('--benchmark') + 1;
      options.benchmark = args[benchmarkIndex];
    }

    viewer.displayHistory(options);
  }
}

export { BenchmarkHistory };
