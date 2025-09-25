# Test Report

**Generated:** 2025/1/1 21:00:00

## Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | 3 |
| **Passed** | 1 |
| **Failed** | 1 |
| **Skipped** | 1 |
| **Duration** | 0ms |
| **Status** | FAILED |

## mixed.spec.ts

### ✅ should pass with fixtures

**Status:** PASSED | **Duration:** 1.20s

- 🪝 beforeEach hook (100ms)
- ⚙️ Setup database (200ms)
  - ⚙️ Connect to database (100ms)
  - ⚙️ Create test data (100ms)
- 🧪 Run actual test (800ms)
- 🪝 afterEach hook (100ms)

### ❌ should fail with hooks

**Status:** FAILED | **Duration:** 600ms

**Error:**
```
Assertion failed

Stack Trace:
Error: Assertion failed
    at test (/test/mixed.spec.ts:22:10)
```

- 🪝 beforeEach hook (100ms)
- 🧪 Main test step (400ms)
- 📝 Unknown category step (100ms)

### ⏭️ should be skipped

**Status:** SKIPPED | **Duration:** 0ms

