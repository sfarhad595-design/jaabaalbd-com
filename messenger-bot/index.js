'use strict';
require('dotenv').config();

// ———————————————————————————————
// Validate required env vars
// ———————————————————————————————
const REQUIRED = ['FB_PAGE_TOKEN', 'ANTHROPIC_API_KEY'];
for (const key of REQUIRED) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    console.error('Copy .env.example to .env and fill in the values.');
    process.exit(1);
  }
}

const { tick } = require('./watcher');
const { scheduleLearning } = require('./learner');

const POLL_INTERVAL_MS = 60 * 1000; // 60 seconds

console.log('====================================');
console.log(' Sunnah Gallery Messenger Bot');
console.log(' Page ID: 103646049252710');
console.log(` Started: ${new Date().toISOString()}`);
console.log(' Kill switch: create a file named PAUSE');
console.log('====================================');

// First tick immediately
tick();

// Then every 60 seconds
setInterval(tick, POLL_INTERVAL_MS);

// Nightly learning
scheduleLearning();

// Graceful shutdown
process.on('SIGTERM', () => { console.log('Shutting down...'); process.exit(0); });
process.on('SIGINT',  () => { console.log('Shutting down...'); process.exit(0); });
