# Test Report

**Generated:** 2025/1/1 21:00:00

## Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | 3 |
| **Passed** | 0 |
| **Failed** | 1 |
| **Skipped** | 0 |
| **Duration** | 0ms |
| **Status** | FAILED |

## failed.spec.ts

### ❌ should fail with error

**Status:** FAILED | **Duration:** 800ms

**Error:**
```
Expected true to be false

Location: /test/project/tests/failed.spec.ts:16:20

Stack Trace:
Error: Expected true to be false
    at /test/project/tests/failed.spec.ts:16:20
    at TestFunction (/playwright/lib/test/testFunction.js:123:45)
```

- 🔹 Navigate to page (300ms)
- 🔹 Click submit button (500ms)
  - ❌ Step failed

## interrupted.spec.ts

### ⏸️ should be interrupted

**Status:** INTERRUPTED | **Duration:** 200ms

- 🔹 Setup test (200ms)

## timeout.spec.ts

### ⏰ should timeout

**Status:** TIMEDOUT | **Duration:** 5.00s

**Error:**
```
Test timeout of 5000ms exceeded
```

- 🔹 Wait for element (5.00s)
  - ❌ Step failed

