import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import MarkdownReporter from "./reporter";
import * as basicInput from "./testdata/basic/input";
import * as failedInput from "./testdata/failed-with-errors/input";
import * as mixedInput from "./testdata/mixed-status/input";
import * as screenshotInput from "./testdata/screenshot-variations/input";
import * as edgeCasesInput from "./testdata/edge-cases/input";

describe("MarkdownReporter", () => {
  let tempDir: string;
  let reporter: MarkdownReporter;
  let uuidCounter: number;

  beforeEach(() => {
    // Create temporary directory for test output
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "playwright-md-test-"));

    // Reset UUID counter for each test
    uuidCounter = 0;
    const mockGenerateUUID = () => `test-uuid-${++uuidCounter}`;
    const mockGetCurrentDate = () => new Date("2025-01-01T12:00:00Z");

    reporter = new MarkdownReporter({
      outputDir: tempDir,
      filename: "test-report.md",
      generateUUID: mockGenerateUUID,
      getCurrentDate: mockGetCurrentDate,
    });
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  const testCases = [
    {
      name: "basic successful test",
      input: basicInput,
      expectedScreenshots: 1,
      expectedExtensions: [".png"],
    },
    {
      name: "failed tests with errors",
      input: failedInput,
      expectedScreenshots: 0,
      expectedExtensions: [],
    },
    {
      name: "mixed status tests",
      input: mixedInput,
      expectedScreenshots: 0,
      expectedExtensions: [],
    },
    {
      name: "screenshot variations",
      input: screenshotInput,
      expectedScreenshots: 4,
      expectedExtensions: [".jpg", ".jpg", ".png", ".png"],
    },
    {
      name: "edge cases",
      input: edgeCasesInput,
      expectedScreenshots: 0,
      expectedExtensions: [],
    },
  ];

  testCases.forEach(({ name, input, expectedScreenshots, expectedExtensions }) => {
    it(`should generate markdown report for ${name}`, () => {
      // Execute the complete reporter flow
      reporter.onBegin(input.mockConfig, input.mockSuite);

      // Handle different test structures
      if (name === "basic successful test") {
        reporter.onTestBegin(input.mockTestCase, input.mockTestResult);
        reporter.onTestEnd(input.mockTestCase, input.mockTestResult);
      } else if (name === "failed tests with errors") {
        reporter.onTestBegin(input.mockFailedTestCase, input.mockFailedTestResult);
        reporter.onTestEnd(input.mockFailedTestCase, input.mockFailedTestResult);
        reporter.onTestBegin(input.mockTimedOutTestCase, input.mockTimedOutTestResult);
        reporter.onTestEnd(input.mockTimedOutTestCase, input.mockTimedOutTestResult);
        reporter.onTestBegin(input.mockInterruptedTestCase, input.mockInterruptedTestResult);
        reporter.onTestEnd(input.mockInterruptedTestCase, input.mockInterruptedTestResult);
      } else if (name === "mixed status tests") {
        reporter.onTestBegin(input.mockPassedTestCase, input.mockPassedTestResult);
        reporter.onTestEnd(input.mockPassedTestCase, input.mockPassedTestResult);
        reporter.onTestBegin(input.mockFailedTestCase, input.mockFailedTestResult);
        reporter.onTestEnd(input.mockFailedTestCase, input.mockFailedTestResult);
        reporter.onTestBegin(input.mockSkippedTestCase, input.mockSkippedTestResult);
        reporter.onTestEnd(input.mockSkippedTestCase, input.mockSkippedTestResult);
      } else if (name === "screenshot variations") {
        reporter.onTestBegin(input.mockJpegTestCase, input.mockJpegTestResult);
        reporter.onTestEnd(input.mockJpegTestCase, input.mockJpegTestResult);
        reporter.onTestBegin(input.mockFilePathTestCase, input.mockFilePathTestResult);
        reporter.onTestEnd(input.mockFilePathTestCase, input.mockFilePathTestResult);
        reporter.onTestBegin(input.mockNoScreenshotTestCase, input.mockNoScreenshotTestResult);
        reporter.onTestEnd(input.mockNoScreenshotTestCase, input.mockNoScreenshotTestResult);
      } else if (name === "edge cases") {
        reporter.onTestBegin(input.mockUnknownStatusTestCase, input.mockUnknownStatusTestResult);
        reporter.onTestEnd(input.mockUnknownStatusTestCase, input.mockUnknownStatusTestResult);
        reporter.onTestBegin(input.mockFilePathErrorTestCase, input.mockFilePathErrorTestResult);
        reporter.onTestEnd(input.mockFilePathErrorTestCase, input.mockFilePathErrorTestResult);
      }

      reporter.onEnd(input.mockFullResult);

      // Verify that the markdown file was created
      const reportPath = path.join(tempDir, "test-report.md");
      expect(fs.existsSync(reportPath)).toBe(true);

      // Read and verify the markdown content
      const markdownContent = fs.readFileSync(reportPath, "utf8");

      // Load expected markdown template from external file
      let testDir: string;
      switch (name) {
        case "basic successful test":
          testDir = "basic";
          break;
        case "failed tests with errors":
          testDir = "failed-with-errors";
          break;
        case "mixed status tests":
          testDir = "mixed-status";
          break;
        case "screenshot variations":
          testDir = "screenshot-variations";
          break;
        case "edge cases":
          testDir = "edge-cases";
          break;
        default:
          throw new Error(`Unknown test case: ${name}`);
      }

      const expectedTemplate = fs.readFileSync(
        path.join(__dirname, "testdata", testDir, "expected.md"),
        "utf8",
      );

      // Convert template to array - no need for dynamic handling with DI
      const expectedMarkdownLines = expectedTemplate.split("\n");

      // Perform line-by-line comparison for better debugging
      const actualLines = markdownContent.split("\n");

      // Compare length first
      if (actualLines.length !== expectedMarkdownLines.length) {
        console.log("Actual content:");
        console.log(markdownContent);
        console.log(
          `\nExpected ${expectedMarkdownLines.length} lines, but got ${actualLines.length} lines`,
        );
      }
      expect(actualLines.length).toBe(expectedMarkdownLines.length);

      // Compare each line individually for precise error reporting
      for (let i = 0; i < expectedMarkdownLines.length; i++) {
        const actualLine = actualLines[i] || "";
        const expectedLine = expectedMarkdownLines[i];

        if (actualLine !== expectedLine) {
          console.log(`Line ${i + 1} mismatch:`);
          console.log(`  Actual:   "${actualLine}"`);
          console.log(`  Expected: "${expectedLine}"`);
        }
        expect(actualLine).toBe(expectedLine);
      }

      // Verify that screenshot directory was created
      const screenshotDir = path.join(tempDir, "screenshots");
      expect(fs.existsSync(screenshotDir)).toBe(true);

      // Verify that screenshot files were created with predictable names
      const screenshotFiles = fs.readdirSync(screenshotDir);
      expect(screenshotFiles.length).toBe(expectedScreenshots);

      if (expectedScreenshots > 0) {
        expectedExtensions.forEach((ext, index) => {
          expect(screenshotFiles[index]).toBe(`test-uuid-${index + 1}${ext}`);
        });
      }
    });
  });
});
