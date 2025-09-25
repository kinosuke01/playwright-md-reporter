import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import type { MarkdownReporterOptions } from "./types";
export declare class MarkdownReporter implements Reporter {
  private options;
  private stats;
  private startTime;
  private testResults;
  constructor(options?: MarkdownReporterOptions);
  onBegin(_config: FullConfig, suite: Suite): void;
  onTestEnd(test: TestCase, result: TestResult): void;
  onEnd(_result: FullResult): void;
  private generateMarkdownReport;
  private buildMarkdownContent;
  private groupTestsByFile;
  private getStatusEmoji;
  private formatDuration;
}
//# sourceMappingURL=reporter.d.ts.map
