'use strict';
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const db = require('./db');
const { handleConversation, notifyOwner } = require('./replier');

const PAGE_ID = '103646049252710';
const TOKEN = process.env.FB_PAGE_TOKEN;
const PAUSE_FILE = path.join(__dirname, 'PAUSE');
const BOT_WAIT_MS = 3 * 60 * 1000;    // 3 minutes
const MAX_AGE_MS  = 24 * 60 * 60 * 1000; // 24 hours
const MAX_BOT_ROW = 3;                 // max 3 bot messages in a row

let running = false;

// ———————————————————————————————
// Graph API helper
// ———————————————————————————————
async function graphGet(path, params = {}) {
  const url = new URL(`https://graph.facebook.com/v19.0/${path}`);
  url.searchParams.set('access_token', TOKEN);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.error) throw new Error(`Graph API: ${JSON.stringify(data.error)}`);
  return data;
}

// ———————————————————————————————
// Fetch recent conversations
// ———————————————————————————————
async function fetchConversations() {
  const data = await graphGet(`${PAGE_ID}/conversations`, {
    platform: 'messenger',
    fields: 'updated_time,participants,messages.limit(10){message,from,created_time}',
    limit: '25',
  });
  return data.data || [];
}

// ———————————————————————————————
// Parse one conversation
// ———————————————————————————————
function parseConversation(conv, pageUserId) {
  const msgs = (conv.messages?.data || []).reverse(); // oldest first
  if (msgs.length === 0) return null;

  const lastMsg = msgs[msgs.length - 1];
  const lastFrom = lastMsg.from?.id;
  const isLastFromCustomer = lastFrom !== pageUserId;
  if (!isLastFromCustomer) return null;

  const lastCustomerTime = new Date(lastMsg.created_time).getTime();
  const now = Date.now();

  if (now - lastCustomerTime < BOT_WAIT_MS) return null;   // too fresh
  if (now - lastCustomerTime > MAX_AGE_MS) return null;    // too old

  // Find customer ID
  const participants = conv.participants?.data || [];
  const customer = participants.find(p => p.id !== pageUserId);
  if (!customer) return null;

  // Build message history
  const messages = msgs.map(m => ({
    text: m.message || '',
    isBot: m.from?.id === pageUserId,
    time: new Date(m.created_time).getTime(),
  }));

  const lastCustomerText = lastMsg.message || '';

  return {
    conversationId: conv.id,
    customerId: customer.id,
    lastCustomerText,
    lastCustomerTime,
    lastMsgId: lastMsg.id,
    messages,
  };
}

// ———————————————————————————————
// Get page's own user ID
// ———————————————————————————————
let pageUserId = null;
async function getPageUserId() {
  if (pageUserId) return pageUserId;
  const data = await graphGet(`${PAGE_ID}`, { fields: 'id' });
  pageUserId = data.id;
  return pageUserId;
}

// ———————————————————————————————
// Log moderator replies for learning
// ———————————————————————————————
function detectModeratorReplies(msgs, pageUserId, convId) {
  for (let i = 1; i < msgs.length; i++) {
    const prev = msgs[i - 1];
    const curr = msgs[i];
    const prevIsCustomer = prev.from?.id !== pageUserId;
    const currIsModerator = curr.from?.id === pageUserId;
    if (prevIsCustomer && currIsModerator && prev.message && curr.message) {
      db.logModeratorReply(convId, prev.message, curr.message);
    }
  }
}

// ———————————————————————————————
// Main polling tick
// ———————————————————————————————
async function tick() {
  if (running) return;
  running = true;

  try {
    if (fs.existsSync(PAUSE_FILE)) {
      console.log('[PAUSED] PAUSE file exists — skipping.');
      return;
    }

    const myId = await getPageUserId();
    const conversations = await fetchConversations();
    db.incStat('total_chats');

    let waiting = 0;

    for (const conv of conversations) {
      try {
        const rawMsgs = (conv.messages?.data || []).reverse();
        detectModeratorReplies(rawMsgs, myId, conv.id);

        const parsed = parseConversation(conv, myId);
        if (!parsed) continue;

        const { conversationId, lastMsgId } = parsed;
        const state = db.getHandled(conversationId);

        // Already handled this message
        if (state?.last_message_id === lastMsgId) continue;

        // Check moderator replied recently (within 3 min of last customer msg)
        const rawMsgsChronological = rawMsgs;
        const lastMsgsAfterCustomer = rawMsgsChronological.slice(
          rawMsgsChronological.findIndex(m => m.id === lastMsgId)
        );
        const modRepliedRecently = lastMsgsAfterCustomer.some(m => {
          return m.from?.id === myId &&
                 Date.now() - new Date(m.created_time).getTime() < 3 * 60 * 1000;
        });
        if (modRepliedRecently) continue;

        // Check bot message row limit
        if (state && state.bot_reply_count >= MAX_BOT_ROW) {
          if (state.last_customer_msg === parsed.lastCustomerTime) continue;
        }

        waiting++;
        await handleConversation(parsed);

        db.setHandled({
          conversation_id: conversationId,
          last_message_id: lastMsgId,
          bot_reply_count: (state?.last_customer_msg === parsed.lastCustomerTime
            ? (state?.bot_reply_count || 0) + 1
            : 1),
          last_bot_reply: Date.now(),
          last_customer_msg: parsed.lastCustomerTime,
        });

      } catch (err) {
        console.error(`[tick] conv ${conv.id}:`, err.message);
      }
    }

    console.log(`[tick] ${new Date().toISOString()} — ${conversations.length} convs, ${waiting} replied`);

  } catch (err) {
    console.error('[tick] fatal:', err.message);
  } finally {
    running = false;
  }
}

module.exports = { tick };
