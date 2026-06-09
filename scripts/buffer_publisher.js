#!/usr/bin/env node

/**
 * Buffer API Publisher
 * Publishes a post to Buffer's queue or schedules it for a specific time.
 */

const { parseArgs } = require('util');
const fs = require('fs');

const options = {
  token: { type: 'string' },
  profiles: { type: 'string', multiple: true }, // array of profile IDs
  text: { type: 'string' },
  image: { type: 'string' }, // Path or URL to image
  time: { type: 'string' }, // ISO time or 'now'
  dryRun: { type: 'boolean' }
};

const { values } = parseArgs({ options, strict: false });

const BUFFER_API_URL = 'https://api.bufferapp.com/1/updates/create.json';

async function publishToBuffer() {
  const token = values.token || process.env.BUFFER_ACCESS_TOKEN;
  const profiles = values.profiles && values.profiles.length > 0 ? values.profiles : (process.env.BUFFER_PROFILE_ID ? [process.env.BUFFER_PROFILE_ID] : null);
  const { text, image, time, dryRun } = values;

  if (!token) {
    console.error('Error: Buffer access token is required (--token)');
    process.exit(1);
  }

  if (!profiles || profiles.length === 0) {
    console.error('Error: At least one profile ID is required (--profiles)');
    process.exit(1);
  }

  if (!text) {
    console.error('Error: Post text is required (--text)');
    process.exit(1);
  }

  const payload = new URLSearchParams();
  payload.append('access_token', token);
  payload.append('text', text);

  profiles.forEach(profileId => {
    payload.append('profile_ids[]', profileId);
  });

  if (time && time !== 'now') {
    payload.append('scheduled_at', time);
  } else if (time === 'now') {
    payload.append('now', 'true');
  } else {
    // If not scheduled and not 'now', Buffer defaults to adding to the end of the queue
    console.log('No specific time provided. Post will be added to the queue.');
  }

  // Handle image attachment
  if (image) {
    // If image is a URL
    if (image.startsWith('http://') || image.startsWith('https://')) {
      payload.append('media[photo]', image);
    } else {
      console.warn('Local image uploads require multipart/form-data. Currently only URL images are supported in this simple script version.');
      // Future: add multipart/form-data support for local file uploads
    }
  }

  if (dryRun) {
    console.log('--- DRY RUN ---');
    console.log('URL:', BUFFER_API_URL);
    console.log('Payload:', payload.toString());
    process.exit(0);
  }

  try {
    const response = await fetch(BUFFER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: payload
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Successfully added to Buffer queue!');
      console.log('Updates:', data.updates ? data.updates.map(u => u.id).join(', ') : 'No updates array returned');
    } else {
      console.error('Buffer API Error:', data.error || data.message || JSON.stringify(data));
      process.exit(1);
    }
  } catch (error) {
    console.error('Network Error:', error);
    process.exit(1);
  }
}

publishToBuffer();
