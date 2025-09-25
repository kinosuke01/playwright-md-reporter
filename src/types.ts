export interface MarkdownReporterOptions {
  outputDir?: string;
  filename?: string;
  generateUUID?: () => string;
  getCurrentDate?: () => Date;
}

export interface StepDetail {
  title: string;
  category: string;
  duration: number;
  error?: string;
  level: number;
}

export interface TestCaseResult {
  title: string;
  filePath?: string;
  status: "passed" | "failed" | "skipped" | "timedOut" | "interrupted";
  duration: number;
  error?: {
    message?: string;
    stack?: string;
    location?: {
      file: string;
      line: number;
      column: number;
    };
  };
  screenshots: { name: string; path: string }[];
  stepDetails: StepDetail[];
}

export interface TestSuiteResult {
  title: string;
  tests: TestCaseResult[];
}
