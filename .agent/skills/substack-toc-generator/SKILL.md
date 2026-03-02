---
name: substack-toc-generator
description: Generates numbered tables of contents with working internal anchor links for Substack posts.
---

# Substack TOC Generator

## Overview

This skill automates the creation of internal anchor links for Substack, handling the specific `/i/POST_ID/section-slug` format.

## When to Use This Skill

- Formatting long Substack articles.
- When you have a `POST_ID` from a draft URL.
- Ensuring mobile-friendly navigation within a post.

## Step-by-Step Process

1. **Identify Sections**: Breakdown the article into headings.
2. **Convert to Slugs**: Transform headings into kebab-case slugs (lowercase, hyphens).
3. **Build TOC**: Generate a numbered list using the full Substack anchor format.
4. **Number Headings**: Update body headings to match the TOC numbering.
5. **Format Complete Article**: Use horizontal rules (`---`) for clear separation.

## Tool Requirements

- You need the **POST_ID** from the Substack draft URL to generate working links.

## Anti-Patterns

❌ **Broken Slugs**: Using special characters or spaces in internal links.
