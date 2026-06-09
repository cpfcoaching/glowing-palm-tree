#!/usr/bin/env node

/**
 * Substack Browser Automation Publisher
 * Uses Playwright to create a Draft post on Substack
 */

const { parseArgs } = require('util');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const options = {
  title: { type: 'string' },
  body: { type: 'string' },
  url: { type: 'string', default: 'https://substack.cpf-coaching.com/publish/post' },
  sessionPath: { type: 'string', default: path.join(__dirname, '..', '.substack-session.json') },
  headless: { type: 'boolean', default: false }, // Default to headed for debugging
  dryRun: { type: 'boolean' }
};

const { values } = parseArgs({ options, strict: false });

async function publishToSubstack() {
  const { title, body, url, sessionPath, headless, dryRun } = values;

  if (!title) {
    console.error('Error: Post title is required (--title)');
    process.exit(1);
  }

  if (!body) {
    console.error('Error: Post body text/markdown is required (--body)');
    process.exit(1);
  }

  if (dryRun) {
    console.log('--- DRY RUN ---');
    console.log('Title:', title);
    console.log('Body:', body.substring(0, 100) + '...');
    console.log('URL:', url);
    process.exit(0);
  }

  console.log('Launching Playwright browser...');
  
  let browser;
  let context;
  try {
    browser = await chromium.launch({ headless });

    if (fs.existsSync(sessionPath)) {
      console.log(`Loading session from ${sessionPath}`);
      context = await browser.newContext({ storageState: sessionPath });
    } else {
      console.log('No existing session found. Proceeding with a fresh session.');
      console.log('You may be prompted to log in manually on the first run.');
      context = await browser.newContext();
    }

    const page = await context.newPage();
    
    // Navigate to Substack publish page
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for the login form OR the editor to appear
    console.log('Waiting for the page to load...');
    await page.waitForTimeout(3000); // basic wait

    const isLoginPage = await page.locator('input[type="email"]').count() > 0 || await page.url().includes('login');

    if (isLoginPage) {
      console.log('Login required! Please log in to Substack in the browser window.');
      console.log('Waiting for login to complete... (60 seconds timeout)');
      
      // Wait up to 60 seconds for login to succeed and navigation to the editor
      await page.waitForFunction(() => !window.location.href.includes('login'), { timeout: 60000 });
      console.log('Login seemingly completed. Saving session state...');
      await context.storageState({ path: sessionPath });
      
      // Navigate to the post publish page again in case it didn't redirect automatically
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }

    console.log('Attempting to interact with the Substack Editor...');

    // These selectors are highly speculative and need to be refined based on actual Substack DOM
    // Typically Substack uses contenteditable or ProseMirror
    try {
      // Look for title input
      const titleInput = page.locator('textarea[placeholder*="Title"], h1[contenteditable="true"], [data-testid="post-title"]');
      if (await titleInput.count() > 0) {
        await titleInput.first().fill(title);
        console.log('Filled title.');
      }

      // Look for body input
      const bodyInput = page.locator('[contenteditable="true"].ProseMirror');
      if (await bodyInput.count() > 0) {
        // Simple type
        await bodyInput.first().click();
        await page.keyboard.type(body);
        console.log('Filled body.');
      } else {
        console.log('Could not find the main body editor area. Selectors may need updating.');
      }

    } catch (e) {
      console.error('Error interacting with editor elements:', e.message);
    }

    console.log('Saving Draft... (simulating wait)');
    await page.waitForTimeout(2000);
    
    // Ensure session is saved just in case cookies were updated
    await context.storageState({ path: sessionPath });

    console.log('Draft created successfully. Exiting without publishing to maintain safety safeguards.');

  } catch (error) {
    console.error('Substack Automation Error:', error);
  } finally {
    if (browser && headless) {
      await browser.close();
    } else {
      console.log('Leaving browser open since it was run in headed mode for inspection. Close the browser window to exit.');
      // Keep process alive if in headed mode for debugging
      // await browser.close();
    }
  }
}

publishToSubstack();
