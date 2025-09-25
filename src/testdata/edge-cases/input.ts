import type {
  FullConfig,
  FullResult,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

// Fixed date for predictable test results
const FIXED_DATE = new Date("2025-01-01T12:00:00Z");

export const mockConfig: FullConfig = {
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

export const mockUnknownStatusTestCase: TestCase = {
  id: "test-unknown",
  title: "should handle unknown status",
  location: {
    file: "/test/project/tests/edge.spec.ts",
    line: 5,
    column: 3,
  },
  parent: {} as Suite,
  repeatEachIndex: 0,
  retries: 0,
  timeout: 30000,
  expectedStatus: "passed",
  annotations: [],
  tags: [],
  ok: () => false,
  outcome: () => "unexpected",
  titlePath: () => ["Edge Cases", "should handle unknown status"],
  results: [],
  type: "test",
};

export const mockFilePathErrorTestCase: TestCase = {
  id: "test-file-error",
  title: "should handle file copy errors",
  location: {
    file: "/test/project/tests/edge.spec.ts",
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
  titlePath: () => ["Edge Cases", "should handle file copy errors"],
  results: [],
  type: "test",
};

export const mockUnknownStatusTestResult: TestResult = {
  retry: 0,
  parallelIndex: 0,
  workerIndex: 0,
  duration: 100,
  status: "unknown" as TestResult["status"], // Force unknown status to trigger default case
  errors: [],
  error: undefined,
  stdout: [],
  stderr: [],
  annotations: [],
  startTime: FIXED_DATE,
  attachments: [],
  steps: [],
};

export const mockFilePathErrorTestResult: TestResult = {
  retry: 0,
  parallelIndex: 1,
  workerIndex: 1,
  duration: 200,
  status: "passed",
  errors: [],
  error: undefined,
  stdout: [],
  stderr: [],
  annotations: [],
  startTime: FIXED_DATE,
  attachments: [
    {
      name: "error-screenshot",
      contentType: "image/png",
      path: "/non/existent/path/screenshot.png", // This will cause copy error
      body: undefined,
    },
  ],
  steps: [],
};

export const mockSuite: Suite = {
  title: "Edge Cases",
  suites: [],
  tests: [mockUnknownStatusTestCase, mockFilePathErrorTestCase],
  parent: undefined,
  project: () => undefined,
  allTests: () => [mockUnknownStatusTestCase, mockFilePathErrorTestCase],
  entries: () => [mockUnknownStatusTestCase, mockFilePathErrorTestCase],
  titlePath: () => ["Edge Cases"],
  type: "describe",
};

// Update parent references
mockUnknownStatusTestCase.parent = mockSuite;
mockFilePathErrorTestCase.parent = mockSuite;

export const mockFullResult: FullResult = {
  status: "passed",
  startTime: FIXED_DATE,
  duration: 1,
};
