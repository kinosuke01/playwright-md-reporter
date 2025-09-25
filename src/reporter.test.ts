import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type {
  FullConfig,
  FullResult,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import MarkdownReporter from "./reporter";

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
    // Mock data for FullConfig
    const mockConfig: FullConfig = {
      forbidOnly: false,
      fullyParallel: false,
      globalSetup: null,
      globalTeardown: null,
      globalTimeout: 30000,
      grep: /.*/,
      grepInvert: null,
      maxFailures: 0,
      metadata: {},
      preserveOutput: "always",
      reporter: [["list"]],
      reportSlowTests: { max: 5, threshold: 15000 },
      rootDir: "/test/project",
      quiet: false,
      projects: [],
      shard: null,
      updateSnapshots: "missing",
      updateSourceMethod: "patch",
      version: "1.40.0",
      workers: 4,
      webServer: null,
    };

    // Mock data for TestCase
    const mockTestCase: TestCase = {
      id: "test-1",
      title: "should login successfully",
      location: {
        file: "/test/project/tests/login.spec.ts",
        line: 10,
        column: 3,
      },
      parent: {} as Suite,
      repeatEachIndex: 0,
      retries: 0,
      timeout: 30000,
      expectedStatus: "passed",
      annotations: [],
      tags: [],
      ok: () => true,
      outcome: () => "expected",
      titlePath: () => ["Login Tests", "should login successfully"],
      results: [],
      type: "test",
    };

    // Mock data for TestResult
    const mockTestResult: TestResult = {
      retry: 0,
      parallelIndex: 0,
      workerIndex: 0,
      duration: 1500,
      status: "passed",
      errors: [],
      error: undefined,
      stdout: [],
      stderr: [],
      annotations: [],
      startTime: new Date(),
      attachments: [
        {
          name: "screenshot",
          contentType: "image/png",
          body: Buffer.from("fake-png-data"),
        },
      ],
      steps: [
        {
          title: "Navigate to login page",
          category: "test.step",
          startTime: new Date(),
          duration: 500,
          error: undefined,
          steps: [],
          titlePath: () => ["Navigate to login page"],
          annotations: [],
          attachments: [],
        },
        {
          title: "Fill username and password",
          category: "test.step",
          startTime: new Date(),
          duration: 300,
          error: undefined,
          steps: [
            {
              title: "Type username",
              category: "test.step",
              startTime: new Date(),
              duration: 150,
              error: undefined,
              steps: [],
              titlePath: () => ["Fill username and password", "Type username"],
              annotations: [],
              attachments: [],
            },
            {
              title: "Type password",
              category: "test.step",
              startTime: new Date(),
              duration: 150,
              error: undefined,
              steps: [],
              titlePath: () => ["Fill username and password", "Type password"],
              annotations: [],
              attachments: [],
            },
          ],
          titlePath: () => ["Fill username and password"],
          annotations: [],
          attachments: [],
        },
        {
          title: "Click login button",
          category: "test.step",
          startTime: new Date(),
          duration: 700,
          error: undefined,
          steps: [],
          titlePath: () => ["Click login button"],
          annotations: [],
          attachments: [],
        },
      ],
    };

    // Mock data for Suite
    const mockSuite: Suite = {
      title: "Login Tests",
      suites: [],
      tests: [mockTestCase],
      parent: undefined,
      project: () => undefined,
      allTests: () => [mockTestCase],
      entries: () => [mockTestCase],
      titlePath: () => ["Login Tests"],
      type: "describe",
    };

    // Mock data for FullResult
    const mockFullResult: FullResult = {
      status: "passed",
      startTime: new Date("2025-01-01T12:00:00Z"),
      duration: 2000,
    };

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
