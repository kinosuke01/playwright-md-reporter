# playwright-md-reporter

A Playwright test reporter that generates beautiful Markdown reports with test summaries, detailed results, and error information.

[![npm version](https://badge.fury.io/js/playwright-md-reporter.svg)](https://badge.fury.io/js/playwright-md-reporter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 📊 **Comprehensive Test Summary** - Overview of passed, failed, skipped, and flaky tests
- ⏱️ **Duration Tracking** - Test execution time and success rates
- 📝 **Detailed Results** - Organized by test file with individual test outcomes
- 🔍 **Error Details** - Stack traces and error messages for failed tests
- 🎨 **Clean Markdown Output** - Easy to read and integrate with documentation
- ⚙️ **Customizable Options** - Configure output file, title, and included information

## Installation

```bash
npm install --save-dev playwright-md-reporter
```

## Usage

Add the reporter to your `playwright.config.js` or `playwright.config.ts`:

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['playwright-md-reporter', {
      outputFile: 'test-results/report.md',
      includeStackTrace: true,
      customTitle: 'My Project Test Results'
    }]
  ],
  // ... other configuration
});
```

Run your tests:

```bash
npx playwright test
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputFile` | `string` | `'playwright-report.md'` | Path to the output Markdown file |
| `includeStackTrace` | `boolean` | `true` | Include error stack traces in failed tests |
| `includeAttachments` | `boolean` | `false` | Include test attachments (future feature) |
| `customTitle` | `string` | `'Playwright Test Report'` | Custom title for the report |

## Example Output

The generated report includes:

- **Summary Section**: Total tests, pass/fail counts, success rate, and duration
- **Test Results**: Organized by file with individual test status and timing
- **Error Details**: Stack traces for failed tests (when enabled)
- **Metadata**: Generation timestamp

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Lint and format
npm run lint:fix
npm run format

# Clean build artifacts
npm run clean
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
