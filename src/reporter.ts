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
  }

  onBegin(_config: FullConfig, suite: Suite) {
    this.startTime = new Date();

    // 出力ディレクトリのクリーニングと作成
    if (fs.existsSync(this.outputDir)) {
      // 既存のディレクトリとその中身を全削除
      fs.rmSync(this.outputDir, { recursive: true, force: true });
    }

    // ディレクトリを作成
    fs.mkdirSync(this.outputDir, { recursive: true });
    fs.mkdirSync(this.dataDir, { recursive: true });

    console.log(
      `📝 Markdown Reporter: Starting test run with ${
        suite.allTests().length
      } tests`,
    );
  }

  onTestBegin(_test: TestCase, _result: TestResult) {
    // スイート管理は不要になったため、何もしない
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

        // 再帰的に子ステップを処理
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
    const endTime = new Date();
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

    // screenshotsディレクトリの存在確認と作成
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    for (const attachment of result.attachments) {
      // スクリーンショット関連のattachmentを対象とする
      if (
        attachment.contentType === "image/png" ||
        attachment.contentType === "image/jpeg"
      ) {
        if (attachment.body) {
          // バイナリデータから直接ファイルを作成
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
          // ファイルパスから読み込んでコピー
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
    markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;

    // サマリー
    markdown += `## Summary\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| **Total Tests** | ${totalTests} |\n`;
    markdown += `| **Passed** | ${passedTests} |\n`;
    markdown += `| **Failed** | ${failedTests} |\n`;
    markdown += `| **Skipped** | ${skippedTests} |\n`;
    markdown += `| **Duration** | ${this.formatDuration(duration)} |\n`;
    markdown += `| **Status** | ${result.status.toUpperCase()} |\n\n`;

    // ファイルごとにテストをグループ化
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

    // ファイル名でソートして出力
    const sortedFileNames = Array.from(testsByFile.keys()).sort();

    for (const fileName of sortedFileNames) {
      const tests = testsByFile.get(fileName);
      if (!tests) continue;
      markdown += `## ${fileName}\n\n`;

      for (const test of tests) {
        const statusIcon = this.getStatusIcon(test.status);
        markdown += `### ${statusIcon} ${test.title}\n\n`;

        // テストメタ情報
        markdown += `**Status:** ${test.status.toUpperCase()} | **Duration:** ${this.formatDuration(
          test.duration,
        )}\n\n`;

        // エラー情報（テストレベル）
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

        // ステップ詳細を階層化リスト形式で表示
        if (test.stepDetails.length > 0) {
          for (const step of test.stepDetails) {
            const stepIcon = this.getStepIcon(step.category);
            const indent = "  ".repeat(step.level); // 階層レベルに応じたインデント
            markdown += `${indent}- ${stepIcon} ${step.title}`;

            if (step.duration > 0) {
              markdown += ` (${this.formatDuration(step.duration)})`;
            }

            markdown += `\n`;

            // ステップレベルのエラー
            if (step.error) {
              markdown += `${indent}  - ❌ Step failed\n`;
            }
          }
          markdown += `\n`;
        }

        // テストレベルのスクリーンショット（全てのスクリーンショットを表示）
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
