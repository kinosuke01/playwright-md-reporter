export interface MarkdownReporterOptions {
  outputFile?: string;
  includeStackTrace?: boolean;
  includeAttachments?: boolean;
  customTitle?: string;
}

export interface TestStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  duration: number;
}
