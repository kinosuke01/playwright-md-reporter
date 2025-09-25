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

export const mockFailedTestCase: TestCase = {
  id: "test-failed",
  title: "should fail with error",
  location: {
    file: "/test/project/tests/failed.spec.ts",
    line: 15,
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
  titlePath: () => ["Failed Tests", "should fail with error"],
  results: [],
  type: "test",
};

export const mockTimedOutTestCase: TestCase = {
  id: "test-timeout",
  title: "should timeout",
  location: {
    file: "/test/project/tests/timeout.spec.ts",
    line: 20,
    column: 3,
  },
  parent: {} as Suite,
  repeatEachIndex: 0,
  retries: 0,
  timeout: 5000,
  expectedStatus: "passed",
  annotations: [],
  tags: [],
  ok: () => false,
  outcome: () => "unexpected",
  titlePath: () => ["Timeout Tests", "should timeout"],
  results: [],
  type: "test",
};

export const mockInterruptedTestCase: TestCase = {
  id: "test-interrupted",
  title: "should be interrupted",
  location: {
    file: "/test/project/tests/interrupted.spec.ts",
    line: 25,
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
  titlePath: () => ["Interrupted Tests", "should be interrupted"],
  results: [],
  type: "test",
};

export const mockFailedTestResult: TestResult = {
  retry: 0,
  parallelIndex: 0,
  workerIndex: 0,
  duration: 800,
  status: "failed",
  errors: [],
  error: {
    message: "Expected true to be false",
    stack: `Error: Expected true to be false
    at /test/project/tests/failed.spec.ts:16:20
    at TestFunction (/playwright/lib/test/testFunction.js:123:45)`,
    location: {
      file: "/test/project/tests/failed.spec.ts",
      line: 16,
      column: 20,
    },
  },
  stdout: [],
  stderr: [],
  annotations: [],
  startTime: FIXED_DATE,
  attachments: [],
  steps: [
    {
      title: "Navigate to page",
      category: "test.step",
      startTime: FIXED_DATE,
      duration: 300,
      error: undefined,
      steps: [],
      titlePath: () => ["Navigate to page"],
      annotations: [],
      attachments: [],
    },
    {
      title: "Click submit button",
      category: "test.step",
      startTime: FIXED_DATE,
      duration: 500,
      error: {
        message: "Element not found: #submit",
        stack: "Error: Element not found: #submit\n    at clickButton (/test/utils.js:45:12)",
      },
      steps: [],
      titlePath: () => ["Click submit button"],
      annotations: [],
      attachments: [],
    },
  ],
};

export const mockTimedOutTestResult: TestResult = {
  retry: 0,
  parallelIndex: 1,
  workerIndex: 1,
  duration: 5000,
  status: "timedOut",
  errors: [],
  error: {
    message: "Test timeout of 5000ms exceeded",
    stack: undefined,
    location: undefined,
  },
  stdout: [],
  stderr: [],
  annotations: [],
  startTime: FIXED_DATE,
  attachments: [],
  steps: [
    {
      title: "Wait for element",
      category: "test.step",
      startTime: FIXED_DATE,
      duration: 5000,
      error: {
        message: "Timeout waiting for element",
        stack: undefined,
      },
      steps: [],
      titlePath: () => ["Wait for element"],
      annotations: [],
      attachments: [],
    },
  ],
};

export const mockInterruptedTestResult: TestResult = {
  retry: 0,
  parallelIndex: 2,
  workerIndex: 2,
  duration: 200,
  status: "interrupted",
  errors: [],
  error: undefined,
  stdout: [],
  stderr: [],
  annotations: [],
  startTime: FIXED_DATE,
  attachments: [],
  steps: [
    {
      title: "Setup test",
      category: "test.step",
      startTime: FIXED_DATE,
      duration: 200,
      error: undefined,
      steps: [],
      titlePath: () => ["Setup test"],
      annotations: [],
      attachments: [],
    },
  ],
};

export const mockSuite: Suite = {
  title: "Error Tests",
  suites: [],
  tests: [mockFailedTestCase, mockTimedOutTestCase, mockInterruptedTestCase],
  parent: undefined,
  project: () => undefined,
  allTests: () => [mockFailedTestCase, mockTimedOutTestCase, mockInterruptedTestCase],
  entries: () => [mockFailedTestCase, mockTimedOutTestCase, mockInterruptedTestCase],
  titlePath: () => ["Error Tests"],
  type: "describe",
};

// Update parent references
mockFailedTestCase.parent = mockSuite;
mockTimedOutTestCase.parent = mockSuite;
mockInterruptedTestCase.parent = mockSuite;

export const mockFullResult: FullResult = {
  status: "failed",
  startTime: FIXED_DATE,
  duration: 3,
};