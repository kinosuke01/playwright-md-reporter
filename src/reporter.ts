import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
  TestStep,
} from "@playwright/test/reporter";
import type {
  MarkdownReporterOptions,
  StepDetail,
  TestCaseResult,
} from "./types";

class MarkdownReporter implements Reporter {
  private options: MarkdownReporterOptions;
  private outputDir: string;
  private dataDir: string;
  private startTime: Date = new Date();
  private allTests: TestCaseResult[] = [];
  private generateUUID: () => string;
  private getCurrentDate: () => Date;

  constructor(options: MarkdownReporterOptions = {}) {
    this.options = {
      outputDir: options.outputDir || "playwright-md-report",
      filename: options.filename || "index.md",
      generateUUID: options.generateUUID || (() => crypto.randomUUID()),
      ...options,
    };

    this.outputDir = this.options.outputDir ?? "playwright-md-report";
    this.dataDir = path.join(this.outputDir, "screenshots");
    this.generateUUID =
      this.options.generateUUID || (() => crypto.randomUUID());
    this.getCurrentDate = this.options.getCurrentDate || (() => new Date());
  }

  onBegin(_config: FullConfig, suite: Suite) {
    this.startTime = this.getCurrentDate();

    // Clean and create output directory
    if (fs.existsSync(this.outputDir)) {
      // Remove existing directory and all its contents
      fs.rmSync(this.outputDir, { recursive: true, force: true });
    }

    // Create directories
    fs.mkdirSync(this.outputDir, { recursive: true });
    fs.mkdirSync(this.dataDir, { recursive: true });

    console.log(
      `📝 Markdown Reporter: Starting test run with ${
        suite.allTests().length
      } tests`,
    );
  }

  onTestBegin(_test: TestCase, _result: TestResult) {
    // Suite management is no longer needed, so do nothing
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const screenshots = this.collectScreenshots(result);
    const stepDetails = this.collectStepDetails(result);

    const testResult: TestCaseResult = {
      title: test.title,
      filePath: test.location?.file,
      status: result.status,
      duration: result.duration,
      error: result.error
        ? {
            message: result.error.message,
            stack: result.error.stack,
            location: result.error.location
              ? {
                  file: result.error.location.file,
                  line: result.error.location.line,
                  column: result.error.location.column,
                }
              : undefined,
          }
        : undefined,
      screenshots,
      stepDetails,
    };

    this.allTests.push(testResult);
  }

  private collectStepDetails(result: TestResult): StepDetail[] {
    const stepDetails: StepDetail[] = [];

    const processSteps = (steps: TestStep[], level = 0) => {
      for (const step of steps) {
        const stepDetail: StepDetail = {
          title: step.title,
          category: step.category || "unknown",
          duration: step.duration || 0,
          error: step.error?.message || undefined,
          level: level,
        };

        stepDetails.push(stepDetail);

        // Process child steps recursively
        if (step.steps && step.steps.length > 0) {
          processSteps(step.steps, level + 1);
        }
      }
    };

    if (result.steps) {
      processSteps(result.steps);
    }

    return stepDetails;
  }

  onEnd(result: FullResult) {
    const endTime = this.getCurrentDate();
    const duration = endTime.getTime() - this.startTime.getTime();

    const markdown = this.generateMarkdown(result, duration);
    const outputPath = path.join(
      this.outputDir,
      this.options.filename ?? "index.md",
    );

    fs.writeFileSync(outputPath, markdown, "utf8");

    console.log(`📝 Markdown report generated: ${outputPath}`);
  }

  private collectScreenshots(
    result: TestResult,
  ): { name: string; path: string }[] {
    const screenshots: { name: string; path: string }[] = [];

    // Check existence and create screenshots directory
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    for (const attachment of result.attachments) {
      // Target screenshot-related attachments
      if (
        attachment.contentType === "image/png" ||
        attachment.contentType === "image/jpeg"
      ) {
        if (attachment.body) {
          // Create file directly from binary data
          const uuid = this.generateUUID();
          const ext = attachment.contentType === "image/jpeg" ? ".jpg" : ".png";
          const filename = `${uuid}${ext}`;
          const destPath = path.join(this.dataDir, filename);

          try {
            fs.writeFileSync(destPath, attachment.body);
            const savedScreenshotPath = `screenshots/${filename}`;
            screenshots.push({
              name: attachment.name || "Screenshot",
              path: savedScreenshotPath,
            });
          } catch (error) {
            console.warn(`Failed to save screenshot: ${error}`);
          }
        } else if (attachment.path) {
          // Read from file path and copy
          const originalExt = path.extname(attachment.path);
          const uuid = this.generateUUID();
          const filename = `${uuid}${originalExt}`;
          const destPath = path.join(this.dataDir, filename);

          try {
            fs.copyFileSync(attachment.path, destPath);
            const savedScreenshotPath = `screenshots/${filename}`;
            screenshots.push({
              name: attachment.name || "Screenshot",
              path: savedScreenshotPath,
            });
          } catch (error) {
            console.warn(`Failed to copy screenshot: ${error}`);
          }
        }
      }
    }

    return screenshots;
  }

  private generateMarkdown(result: FullResult, duration: number): string {
    const totalTests = this.allTests.length;
    const passedTests = this.allTests.filter(
      (t) => t.status === "passed",
    ).length;
    const failedTests = this.allTests.filter(
      (t) => t.status === "failed",
    ).length;
    const skippedTests = this.allTests.filter(
      (t) => t.status === "skipped",
    ).length;

    let markdown = `# Test Report\n\n`;
    markdown += `**Generated:** ${this.getCurrentDate().toLocaleString()}\n\n`;

    // Summary
    markdown += `## Summary\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| **Total Tests** | ${totalTests} |\n`;
    markdown += `| **Passed** | ${passedTests} |\n`;
    markdown += `| **Failed** | ${failedTests} |\n`;
    markdown += `| **Skipped** | ${skippedTests} |\n`;
    markdown += `| **Duration** | ${this.formatDuration(duration)} |\n`;
    markdown += `| **Status** | ${result.status.toUpperCase()} |\n\n`;

    // Group tests by file
    const testsByFile = new Map<string, TestCaseResult[]>();

    for (const test of this.allTests) {
      const fileName = test.filePath
        ? path.basename(test.filePath)
        : "Unknown File";
      if (!testsByFile.has(fileName)) {
        testsByFile.set(fileName, []);
      }
      const tests = testsByFile.get(fileName);
      if (tests) {
        tests.push(test);
      }
    }

    // Sort by file name and output
    const sortedFileNames = Array.from(testsByFile.keys()).sort();

    for (const fileName of sortedFileNames) {
      const tests = testsByFile.get(fileName);
      if (!tests) continue;
      markdown += `## ${fileName}\n\n`;

      for (const test of tests) {
        const statusIcon = this.getStatusIcon(test.status);
        markdown += `### ${statusIcon} ${test.title}\n\n`;

        // Test metadata
        markdown += `**Status:** ${test.status.toUpperCase()} | **Duration:** ${this.formatDuration(
          test.duration,
        )}\n\n`;

        // Error information (test level)
        if (test.error) {
          markdown += `**Error:**\n\`\`\`\n`;

          if (test.error.message) {
            markdown += `${test.error.message}\n`;
          }

          if (test.error.location) {
            markdown += `\nLocation: ${test.error.location.file}:${test.error.location.line}:${test.error.location.column}\n`;
          }

          if (test.error.stack) {
            markdown += `\nStack Trace:\n${test.error.stack}\n`;
          }

          markdown += `\`\`\`\n\n`;
        }

        // Display step details in hierarchical list format
        if (test.stepDetails.length > 0) {
          for (const step of test.stepDetails) {
            const stepIcon = this.getStepIcon(step.category);
            const indent = "  ".repeat(step.level); // Indent according to hierarchy level
            markdown += `${indent}- ${stepIcon} ${step.title}`;

            if (step.duration > 0) {
              markdown += ` (${this.formatDuration(step.duration)})`;
            }

            markdown += `\n`;

            // Step level error
            if (step.error) {
              markdown += `${indent}  - ❌ Step failed\n`;
            }
          }
          markdown += `\n`;
        }

        // Test level screenshots (display all screenshots)
        if (test.screenshots.length > 0) {
          markdown += `**Screenshots:**\n`;
          for (const screenshot of test.screenshots) {
            markdown += `- 📸 ${screenshot.name}: ![${screenshot.name}](${screenshot.path})\n`;
          }
          markdown += `\n`;
        }
      }
    }

    return markdown;
  }

  private getStepIcon(category: string): string {
    switch (category) {
      case "test.step":
        return "🔹";
      case "fixture":
        return "⚙️";
      case "hook":
        return "🪝";
      case "test":
        return "🧪";
      default:
        return "📝";
    }
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case "passed":
        return "✅";
      case "failed":
        return "❌";
      case "skipped":
        return "⏭️";
      case "timedOut":
        return "⏰";
      case "interrupted":
        return "⏸️";
      default:
        return "❓";
    }
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

export default MarkdownReporter;
