import fs from "node:fs";
import path from "node:path";
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import type { MarkdownReporterOptions, TestStats } from "./types";

export class MarkdownReporter implements Reporter {
  private options: MarkdownReporterOptions;
  private stats: TestStats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0,
    duration: 0,
  };
  private startTime = 0;
  private testResults: Array<{ test: TestCase; result: TestResult }> = [];

  constructor(options: MarkdownReporterOptions = {}) {
    this.options = {
      outputFile: "playwright-report.md",
      includeStackTrace: true,
      includeAttachments: false,
      customTitle: "Playwright Test Report",
      ...options,
    };
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.startTime = Date.now();
    this.stats.total = suite.allTests().length;
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.testResults.push({ test, result });

    switch (result.status) {
      case "passed":
        this.stats.passed++;
        break;
      case "failed":
        this.stats.failed++;
        break;
      case "skipped":
        this.stats.skipped++;
        break;
      case "timedOut":
        this.stats.failed++;
        break;
      case "interrupted":
        this.stats.failed++;
        break;
      default:
        break;
    }

    if (result.status === "passed" && result.retry > 0) {
      this.stats.flaky++;
    }
  }

  onEnd(result: FullResult): void {
    this.stats.duration = Date.now() - this.startTime;
    this.generateMarkdownReport();
  }

  private generateMarkdownReport(): void {
    const markdown = this.buildMarkdownContent();
    const outputPath = path.resolve(this.options.outputFile!);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, markdown, "utf-8");

    console.log(`📊 Markdown report generated: ${outputPath}`);
  }

  private buildMarkdownContent(): string {
    const lines: string[] = [];

    // Title
    lines.push(`# ${this.options.customTitle}`);
    lines.push("");

    // Summary
    lines.push("## Summary");
    lines.push("");
    lines.push(`- **Total Tests**: ${this.stats.total}`);
    lines.push(`- **Passed**: ${this.stats.passed} ✅`);
    lines.push(`- **Failed**: ${this.stats.failed} ❌`);
    lines.push(`- **Skipped**: ${this.stats.skipped} ⏭️`);
    lines.push(`- **Flaky**: ${this.stats.flaky} 🔄`);
    lines.push(`- **Duration**: ${this.formatDuration(this.stats.duration)}`);
    lines.push("");

    // Success rate
    const successRate =
      this.stats.total > 0 ? ((this.stats.passed / this.stats.total) * 100).toFixed(1) : "0";
    lines.push(`**Success Rate**: ${successRate}%`);
    lines.push("");

    // Test Results
    if (this.testResults.length > 0) {
      lines.push("## Test Results");
      lines.push("");

      const groupedResults = this.groupTestsByFile();

      for (const [file, tests] of Object.entries(groupedResults)) {
        lines.push(`### ${file}`);
        lines.push("");

        for (const { test, result } of tests) {
          const status = this.getStatusEmoji(result.status);
          const title = test.title;
          const duration = this.formatDuration(result.duration);

          lines.push(`- ${status} **${title}** (${duration})`);

          if (result.status === "failed" && this.options.includeStackTrace) {
            if (result.error?.message) {
              lines.push(`  - Error: \`${result.error.message}\``);
            }
            if (result.error?.stack) {
              lines.push("  ```");
              lines.push(`  ${result.error.stack}`);
              lines.push("  ```");
            }
          }
        }
        lines.push("");
      }
    }

    // Footer
    lines.push("---");
    lines.push(`*Report generated on ${new Date().toISOString()}*`);

    return lines.join("\n");
  }

  private groupTestsByFile(): Record<string, Array<{ test: TestCase; result: TestResult }>> {
    const grouped: Record<string, Array<{ test: TestCase; result: TestResult }>> = {};

    for (const item of this.testResults) {
      const filePath = item.test.location.file;
      const fileName = path.basename(filePath);

      if (!grouped[fileName]) {
        grouped[fileName] = [];
      }

      grouped[fileName].push(item);
    }

    return grouped;
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case "passed":
        return "✅";
      case "failed":
      case "timedOut":
      case "interrupted":
        return "❌";
      case "skipped":
        return "⏭️";
      default:
        return "❓";
    }
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${seconds}s`;
  }
}
