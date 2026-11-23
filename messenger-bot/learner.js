'use strict';
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const db = require('./db');
const { notifyOwner } = require('./replier');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const LEARN_FILE = path.join(__dirname, 'learn.jsonl');

async function runNightlyLearning() {
  console.log('[learner] Starting nightly learning...');

  const logs = db.getUnlearnedLogs();
  if (logs.length === 0) {
    console.log('[learner] No new moderator replies to learn from.');
    return;
  }

  // Append to learn.jsonl
  const lines = logs.map(r => JSON.stringify({
    conv: r.conversation_id,
    q: r.customer_msg,
    a: r.moderator_reply,
    t: r.logged_at,
  }));
  fs.appendFileSync(LEARN_FILE, lines.join('\n') + '\n');

  // Build prompt for Claude
  const pairs = logs.slice(0, 20).map(r =>
    `প্রশ্ন: ${r.customer_msg}\nমডারেটরের উত্তর: ${r.moderator_reply}`
  ).join('\n\n---\n\n');

  const prompt = `নিচে Sunnah Gallery BD-র মডারেটরের বাস্তব উত্তরের নমুনা।
বিশ্লেষণ করে:
1. নতুন FAQ rule সাজেস্ট করো (pattern + reply format)
2. মডারেটর কোনো ভুল করেছেন কিনা নোট করো

${pairs}

সংক্ষিপ্ত বাংলায় রিপোর্ট দাও।`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const summary = response.content[0].text;
    console.log('[learner] Summary:\n', summary);

    await notifyOwner(`📚 রাতের রিপোর্ট:\n${summary}\n\n(নতুন FAQ যোগ করতে faq.json এডিট করুন)`);
  } catch (err) {
    console.error('[learner] AI call failed:', err.message);
  }
}

// Schedule: every night at 2am
function scheduleLearning() {
  function msUntil2am() {
    const now = new Date();
    const target = new Date();
    target.setHours(2, 0, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return target - now;
  }

  function schedule() {
    const delay = msUntil2am();
    console.log(`[learner] Next run in ${Math.round(delay / 3600000)}h`);
    setTimeout(async () => {
      await runNightlyLearning();
      schedule(); // schedule next night
    }, delay);
  }

  schedule();
}

module.exports = { scheduleLearning, runNightlyLearning };
