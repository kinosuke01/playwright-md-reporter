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

export const mockTestCase: TestCase = {
  id: "test-1",
  title: "should login successfully",
  location: {
    file: "/test/project/tests/login.spec.ts",
    line: 10,
    column: 3,
  },
  parent: {} as Suite, // Will be set after mockSuite is created
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

export const mockTestResult: TestResult = {
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
  startTime: FIXED_DATE,
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
      startTime: FIXED_DATE,
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
      startTime: FIXED_DATE,
      duration: 300,
      error: undefined,
      steps: [
        {
          title: "Type username",
          category: "test.step",
          startTime: FIXED_DATE,
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
          startTime: FIXED_DATE,
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
      startTime: FIXED_DATE,
      duration: 700,
      error: undefined,
      steps: [],
      titlePath: () => ["Click login button"],
      annotations: [],
      attachments: [],
    },
  ],
};

export const mockSuite: Suite = {
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

// Update the parent reference after mockSuite is created
mockTestCase.parent = mockSuite;

export const mockFullResult: FullResult = {
  status: "passed",
  startTime: FIXED_DATE,
  duration: 1,
};
