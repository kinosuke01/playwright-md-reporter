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

export const mockJpegTestCase: TestCase = {
  id: "test-jpeg",
  title: "should handle JPEG screenshots",
  location: {
    file: "/test/project/tests/screenshots.spec.ts",
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
  titlePath: () => ["Screenshot Tests", "should handle JPEG screenshots"],
  results: [],
  type: "test",
};

export const mockFilePathTestCase: TestCase = {
  id: "test-filepath",
  title: "should handle file path screenshots",
  location: {
    file: "/test/project/tests/screenshots.spec.ts",
    line: 20,
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
  titlePath: () => ["Screenshot Tests", "should handle file path screenshots"],
  results: [],
  type: "test",
};

export const mockNoScreenshotTestCase: TestCase = {
  id: "test-no-screenshot",
  title: "should handle no screenshots",
  location: {
    file: "/test/project/tests/screenshots.spec.ts",
    line: 30,
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
  titlePath: () => ["Screenshot Tests", "should handle no screenshots"],
  results: [],
  type: "test",
};

export const mockJpegTestResult: TestResult = {
  retry: 0,
  parallelIndex: 0,
  workerIndex: 0,
  duration: 500,
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
      contentType: "image/jpeg",
      body: Buffer.from("fake-jpeg-data"),
    },
    {
      name: "another-screenshot",
      contentType: "image/jpeg",
      body: Buffer.from("fake-jpeg-data-2"),
    },
  ],
  steps: [
    {
      title: "Take JPEG screenshot",
      category: "test.step",
      startTime: FIXED_DATE,
      duration: 500,
      error: undefined,
      steps: [],
      titlePath: () => ["Take JPEG screenshot"],
      annotations: [],
      attachments: [],
    },
  ],
};

export const mockFilePathTestResult: TestResult = {
  retry: 0,
  parallelIndex: 1,
  workerIndex: 1,
  duration: 300,
  status: "passed",
  errors: [],
  error: undefined,
  stdout: [],
  stderr: [],
  annotations: [],
  startTime: FIXED_DATE,
  attachments: [
    {
      name: "file-screenshot",
      contentType: "image/png",
      path: `${__dirname}/temp-file.png`,
      body: undefined,
    },
    {
      name: "Custom Screenshot Name",
      contentType: "image/png",
      path: `${__dirname}/temp-file.png`,
      body: undefined,
    },
  ],
  steps: [
    {
      title: "Take file path screenshot",
      category: "test.step",
      startTime: FIXED_DATE,
      duration: 300,
      error: undefined,
      steps: [],
      titlePath: () => ["Take file path screenshot"],
      annotations: [],
      attachments: [],
    },
  ],
};

export const mockNoScreenshotTestResult: TestResult = {
  retry: 0,
  parallelIndex: 2,
  workerIndex: 2,
  duration: 100,
  status: "passed",
  errors: [],
  error: undefined,
  stdout: [],
  stderr: [],
  annotations: [],
  startTime: FIXED_DATE,
  attachments: [],
  steps: [
    {
      title: "No screenshot step",
      category: "test.step",
      startTime: FIXED_DATE,
      duration: 100,
      error: undefined,
      steps: [],
      titlePath: () => ["No screenshot step"],
      annotations: [],
      attachments: [],
    },
  ],
};

export const mockSuite: Suite = {
  title: "Screenshot Tests",
  suites: [],
  tests: [mockJpegTestCase, mockFilePathTestCase, mockNoScreenshotTestCase],
  parent: undefined,
  project: () => undefined,
  allTests: () => [
    mockJpegTestCase,
    mockFilePathTestCase,
    mockNoScreenshotTestCase,
  ],
  entries: () => [
    mockJpegTestCase,
    mockFilePathTestCase,
    mockNoScreenshotTestCase,
  ],
  titlePath: () => ["Screenshot Tests"],
  type: "describe",
};

// Update parent references
mockJpegTestCase.parent = mockSuite;
mockFilePathTestCase.parent = mockSuite;
mockNoScreenshotTestCase.parent = mockSuite;

export const mockFullResult: FullResult = {
  status: "passed",
  startTime: FIXED_DATE,
  duration: 1,
};
