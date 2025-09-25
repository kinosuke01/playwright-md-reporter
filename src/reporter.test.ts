import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import MarkdownReporter from "./reporter";
import {
  mockConfig,
  mockFullResult,
  mockSuite,
  mockTestCase,
  mockTestResult,
} from "./testdata/input";

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

  it("should generate markdown report following the complete execution flow", () => {
    // Execute the complete reporter flow
    reporter.onBegin(mockConfig, mockSuite);
    reporter.onTestBegin(mockTestCase, mockTestResult);
    reporter.onTestEnd(mockTestCase, mockTestResult);
    reporter.onEnd(mockFullResult);

    // Verify that the markdown file was created
    const reportPath = path.join(tempDir, "test-report.md");
    expect(fs.existsSync(reportPath)).toBe(true);

    // Read and verify the markdown content
    const markdownContent = fs.readFileSync(reportPath, "utf8");

    // Load expected markdown template from external file
    const expectedTemplate = fs.readFileSync(
      path.join(__dirname, "testdata", "expected.md"),
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
    expect(screenshotFiles.length).toBe(1);
    expect(screenshotFiles[0]).toBe("test-uuid-1.png");
  });
});
