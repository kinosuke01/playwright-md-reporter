# playwright-md-reporter

A Playwright test reporter that generates beautiful Markdown reports with test summaries, detailed results, and error information.

[![npm version](https://badge.fury.io/js/@kinosuke01%2Fplaywright-md-reporter.svg)](https://badge.fury.io/js/@kinosuke01%2Fplaywright-md-reporter)
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
npm install --save-dev @kinosuke01/playwright-md-reporter
```

## Usage

Add the reporter to your `playwright.config.js` or `playwright.config.ts`:

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['@kinosuke01/playwright-md-reporter', {
      outputDir: 'test-results',
      filename: 'report.md'
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
| `outputDir` | `string` | `'playwright-md-report'` | Directory where the report will be generated |
| `filename` | `string` | `'index.md'` | Name of the output Markdown file |

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
