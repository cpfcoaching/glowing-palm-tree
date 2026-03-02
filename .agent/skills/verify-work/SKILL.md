---
name: verify-work
description: End-of-session review checking coding practices, security, and feature completeness.
---

# Verify Work

## Overview

A pre-flight checklist triggered at the end of a session to ensure no minor mistakes (unused imports, logs, edge cases) are shipped.

## When to Use This Skill

- Before submitting a PR or closing a task.
- When "finished" with a set of changes.
- To ensure project-specific standards are met.

## Step-by-Step Checklist

- [ ] **Technical Debt**: Remove unused imports, console.logs, or commented-out code.
- [ ] **Tests**: Run the test suite and ensure no regressions.
- [ ] **Security**: Check for exposed keys or insecure patterns.
- [ ] **Completeness**: Compare against the original task/requirements.
- [ ] **Documentation**: Ensure new functions or logic are documented.

## Anti-Patterns

❌ **Early Closure**: Declaring a task "done" without running this verification.
