// @ts-check
import { defineConfig } from "@playwright/test";

export default defineConfig({
  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
    {
      name: "firefox",
      use: { browserName: "firefox" },
    },
    {
      name: "webkit",
      use: { browserName: "webkit" },
    },
  ],

  // Reporter configuration
  reporter: [
    // Built-in HTML reporter
    ["html"],

    // Custom Markdown reporter
    [
      "playwright-md-reporter",
      {
        outputFile: "test-results/report.md",
        includeStackTrace: true,
        includeAttachments: false,
        customTitle: "My Project Test Results",
      },
    ],
  ],

  // Other test configuration
  testDir: "./tests",
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
});
