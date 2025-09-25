# Basic Usage Example

## Installation

```bash
npm install --save-dev playwright-md-reporter
```

## Configuration

Add the reporter to your `playwright.config.js`:

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['playwright-md-reporter', {
      outputFile: 'test-results/report.md',
      includeStackTrace: true,
      includeAttachments: false,
      customTitle: 'My Test Results'
    }]
  ],
  // ... other config
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputFile` | `string` | `'playwright-report.md'` | Path to the output Markdown file |
| `includeStackTrace` | `boolean` | `true` | Include error stack traces in failed tests |
| `includeAttachments` | `boolean` | `false` | Include test attachments (not implemented yet) |
| `customTitle` | `string` | `'Playwright Test Report'` | Custom title for the report |

## Running Tests

```bash
npx playwright test
```

This will generate a Markdown report at the specified location with a summary of your test results.