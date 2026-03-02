---
name: skill-builder
description: Meta-skill for generating well-structured, reusable SKILL.md files for Claude Code.
---

# Skill Builder

## Overview

Meta-skill that helps produce properly formatted `SKILL.md` files with correct YAML frontmatter and effective instruction hierarchy.

## When to Use This Skill

- Creating new skills for the `.agent/skills/` directory.
- Refactoring existing instructions into a structured skill format.

## Core Principles

1. **Minimal YAML**: Stick to `name` and `description` unless more metadata is required.
2. **Actionable Language**: Every section should lead to concrete actions or checks.
3. **Hierarchical Structure**: Use standard headings to organize complexity.

## YAML Format Guide

### ✅ Correct

```yaml
---
name: my-skill
description: Does the thing
---
```

### ❌ Incorrect

- Including `allowed-tools` (unsupported).
- Top-level `author` or `version` (must be inside `metadata`).

## Anti-Patterns

❌ **Tab Indentation**: Always use 2-space indentation for YAML.
❌ **Complex YAML Values**: Avoid special characters in YAML values without quoting.
