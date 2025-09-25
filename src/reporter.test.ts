import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type {
  FullConfig,
  FullResult,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import MarkdownReporter from "./reporter";

describe("MarkdownReporter", () => {
  let tempDir: string;
  let reporter: MarkdownReporter;

  beforeEach(() => {
    // Create temporary directory for test output
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "playwright-md-test-"));
    reporter = new MarkdownReporter({
      outputDir: tempDir,
      filename: "test-report.md",
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
            },
            {
              title: "Type password",
              category: "test.step",
              startTime: new Date(),
              duration: 150,
              error: undefined,
              steps: [],
            },
          ],
        },
        {
          title: "Click login button",
          category: "test.step",
          startTime: new Date(),
          duration: 700,
          error: undefined,
          steps: [],
        },
      ],
    };

    // Mock data for Suite
    const mockSuite: Suite = {
      title: "Login Tests",
      suites: [],
      tests: [mockTestCase],
      parent: undefined,
      project: undefined,
      allTests: () => [mockTestCase],
    };

    // Mock data for FullResult
    const mockFullResult: FullResult = {
      status: "passed",
      startTime: new Date(),
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

    // Verify essential content elements
    expect(markdownContent).toContain("# Test Report");
    expect(markdownContent).toContain("## Summary");
    expect(markdownContent).toContain("**Total Tests** | 1");
    expect(markdownContent).toContain("**Passed** | 1");
    expect(markdownContent).toContain("**Failed** | 0");
    expect(markdownContent).toContain("**Status** | PASSED");
    expect(markdownContent).toContain("## login.spec.ts");
    expect(markdownContent).toContain("### ✅ should login successfully");
    expect(markdownContent).toContain("**Status:** PASSED");
    expect(markdownContent).toContain("**Duration:** 1.50s");
    expect(markdownContent).toContain("🔹 Navigate to login page");
    expect(markdownContent).toContain("🔹 Fill username and password");
    expect(markdownContent).toContain("🔹 Type username");
    expect(markdownContent).toContain("🔹 Type password");
    expect(markdownContent).toContain("🔹 Click login button");
    expect(markdownContent).toContain("**Screenshots:**");
    expect(markdownContent).toContain("📸 screenshot:");

    // Verify that screenshot directory was created
    const screenshotDir = path.join(tempDir, "screenshots");
    expect(fs.existsSync(screenshotDir)).toBe(true);

    // Verify that screenshot files were created
    const screenshotFiles = fs.readdirSync(screenshotDir);
    expect(screenshotFiles.length).toBe(1);
    expect(screenshotFiles[0]).toMatch(/.*\.png$/);
  });
});
