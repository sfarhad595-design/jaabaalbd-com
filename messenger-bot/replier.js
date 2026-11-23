'use strict';
const fetch = require('node-fetch');
const Anthropic = require('@anthropic-ai/sdk');
const faq = require('./faq.json');
const db = require('./db');

const PAGE_ID = '103646049252710';
const TOKEN = process.env.FB_PAGE_TOKEN;
const OWNER_FB_USER_ID = process.env.OWNER_FB_USER_ID;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ———————————————————————————————
// SYSTEM PROMPT (cached by Anthropic)
// ———————————————————————————————
const SYSTEM_PROMPT = `তুমি Sunnah Gallery BD-র মেসেঞ্জার সহকারী। ২৪ ঘণ্টা ইনবক্স দেখো এবং কাস্টমারদের সাহায্য করো।

শপের তথ্য:
- শপ: Sunnah Gallery BD | ওয়েবসাইট: sunnahgallerybd.com
- পেজ: Facebook.com/SunnahGalleryBD

পণ্য: আছিয়া / মুসলিমা ভার্সন-২
মূল্য:
- ফুল সেট (বোরকা দুবাই চেরি + হিজাব-নিকাব চায়না দানা জর্জেট) — ২৪৯৯ টাকা
- ফুল সেট পুরো দুবাই চেরি — ২৫৯৯ টাকা
- শুধু হিজাব + নিকাব জর্জেট — ১৩৯৯ টাকা
- শুধু হিজাব + নিকাব দুবাই চেরি — ১৪৯৯ টাকা
ফুল সেটে ৩টি গিফট ফ্রি (হাত মোজা, পা মোজা, ইনার ক্যাপ)
সাইজ: ৪৮–৫৮; চোখ ঢেকে বা খোলা রেখে পরা যায়
অর্ডার লিংক: https://sunnahgallerybd.com/step/muslima

অর্ডারের জন্য দরকার: নাম, মোবাইল, সম্পূর্ণ ঠিকানা, সাইজ, কাপড় (জর্জেট/দুবাই চেরি), ফুল সেট নাকি শুধু হিজাব-নিকাব

ডেলিভারি: সারা বাংলাদেশ, ক্যাশ অন ডেলিভারি, ২–৩ কার্যদিবস

কঠোর নিয়ম:
1. সবসময় বাংলায় উত্তর দাও
2. কাস্টমারকে "আপু" বলে ডাকো
3. নিজে থেকে কোনো দাম, স্টক বা ডিসকাউন্ট উদ্ভাবন করবে না — শুধু উপরের তথ্য
4. অর্ডার কনফার্ম করবে না — শুধু তথ্য সংগ্রহ করে জানাবে মডারেটর কনফার্ম করবে
5. প্রতিটি উত্তরের শেষে একটি প্রশ্ন রাখো যা অর্ডারের দিকে নিয়ে যায়
6. উত্তর সংক্ষিপ্ত রাখো (১৫০ শব্দের মধ্যে)
7. ইমোজি ব্যবহার করো (🌸 🤍)
8. অভিযোগ বা রিটার্ন হলে শুধু বলো "দুঃখিত আপু, আমি এক্ষুনি সিনিয়রকে জানাচ্ছি।"`;

// ———————————————————————————————
// FAQ MATCHER (0 tokens)
// ———————————————————————————————
function matchFaq(text) {
  const lower = text.toLowerCase().trim();
  for (const rule of faq) {
    for (const pattern of rule.patterns) {
      const re = new RegExp(pattern, 'i');
      if (re.test(lower)) return rule.reply;
    }
  }
  return null;
}

// ———————————————————————————————
// ORDER DETECTION (phone + address)
// ———————————————————————————————
function isOrderDetails(text) {
  const hasPhone = /01[3-9]\d{8}/.test(text);
  const hasAddress = /(রোড|রোড নং|গ্রাম|উপজেলা|জেলা|ঠিকানা|village|district|thana|union|ward|block|flat|house)/i.test(text);
  return hasPhone && hasAddress;
}

// ———————————————————————————————
// COMPLAINT DETECTION
// ———————————————————————————————
function isComplaint(text) {
  return /(পাইনি|পাচ্ছি না|নকল|ভুল পাঠিয়েছ|রিটার্ন|ফেরত|রাগ|বাজে|খারাপ|ধোঁকা|প্রতারণা|টাকা ফেরত|refund|return|complaint|problem)/i.test(text);
}

// ———————————————————————————————
// SEND MESSAGE via Graph API
// ———————————————————————————————
async function sendMessage(recipientId, text) {
  const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${TOKEN}`;
  const body = {
    recipient: { id: recipientId },
    message: { text },
    messaging_type: 'RESPONSE',
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data;
}

// ———————————————————————————————
// NOTIFY OWNER via Messenger
// ———————————————————————————————
async function notifyOwner(text) {
  if (!OWNER_FB_USER_ID) {
    console.log('[OWNER NOTIFY]', text);
    return;
  }
  try {
    await sendMessage(OWNER_FB_USER_ID, `🤖 Bot Alert:\n${text}`);
  } catch (e) {
    console.error('[notifyOwner] failed:', e.message);
  }
}

// ———————————————————————————————
// CLAUDE AI REPLY
// ———————————————————————————————
async function aiReply(messages) {
  const userMessages = messages.map(m => ({
    role: m.isBot ? 'assistant' : 'user',
    content: m.text,
  }));

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 300,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: userMessages,
  });

  return response.content[0].text;
}

// ———————————————————————————————
// MAIN REPLY FUNCTION
// ———————————————————————————————
async function handleConversation(conv) {
  const { conversationId, customerId, messages, lastCustomerText } = conv;

  // 1) FAQ match
  const faqReply = matchFaq(lastCustomerText);
  if (faqReply) {
    await sendMessage(customerId, faqReply);
    db.incStat('faq_hits');
    db.incStat('bot_replied');
    console.log(`[FAQ] conv=${conversationId}`);
    return { type: 'faq' };
  }

  // 2) Order details → holding message + notify
  if (isOrderDetails(lastCustomerText)) {
    const holding = 'ধন্যবাদ আপু 🌸 আপনার অর্ডারের তথ্য পেয়েছি, আমাদের মডারেটর খুব দ্রুত কনফার্ম করবেন ইনশাআল্লাহ।';
    await sendMessage(customerId, holding);
    await notifyOwner(`📦 নতুন অর্ডার info:\nConv: ${conversationId}\n${lastCustomerText.slice(0, 200)}`);
    db.incStat('bot_replied');
    console.log(`[ORDER] conv=${conversationId}`);
    return { type: 'order' };
  }

  // 3) Complaint → apology + notify
  if (isComplaint(lastCustomerText)) {
    const apology = 'দুঃখিত আপু 🌸 আমি এক্ষুনি সিনিয়রকে জানাচ্ছি, তারা শীঘ্রই যোগাযোগ করবেন।';
    await sendMessage(customerId, apology);
    await notifyOwner(`⚠️ অভিযোগ আছে:\nConv: ${conversationId}\n${lastCustomerText.slice(0, 200)}`);
    db.incStat('bot_replied');
    console.log(`[COMPLAINT] conv=${conversationId}`);
    return { type: 'complaint' };
  }

  // 4) AI reply
  const recentMessages = messages.slice(-8);
  const reply = await aiReply(recentMessages);
  await sendMessage(customerId, reply);
  db.incStat('ai_calls');
  db.incStat('bot_replied');
  console.log(`[AI] conv=${conversationId}`);
  return { type: 'ai' };
}

module.exports = { handleConversation, matchFaq, isOrderDetails, isComplaint, notifyOwner };
