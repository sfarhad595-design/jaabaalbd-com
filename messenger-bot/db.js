'use strict';
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'bot.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS handled (
    conversation_id TEXT NOT NULL,
    last_message_id TEXT NOT NULL,
    bot_reply_count  INTEGER NOT NULL DEFAULT 0,
    last_bot_reply   INTEGER,         -- unix ms
    last_customer_msg INTEGER,        -- unix ms
    PRIMARY KEY (conversation_id)
  );

  CREATE TABLE IF NOT EXISTS moderator_log (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id  TEXT NOT NULL,
    customer_msg     TEXT NOT NULL,
    moderator_reply  TEXT NOT NULL,
    logged_at        INTEGER NOT NULL  -- unix ms
  );

  CREATE TABLE IF NOT EXISTS stats (
    day         TEXT PRIMARY KEY,     -- YYYY-MM-DD
    total_chats INTEGER DEFAULT 0,
    bot_replied INTEGER DEFAULT 0,
    faq_hits    INTEGER DEFAULT 0,
    ai_calls    INTEGER DEFAULT 0
  );
`);

const getHandled = db.prepare(`SELECT * FROM handled WHERE conversation_id = ?`);
const upsertHandled = db.prepare(`
  INSERT INTO handled (conversation_id, last_message_id, bot_reply_count, last_bot_reply, last_customer_msg)
  VALUES (@conversation_id, @last_message_id, @bot_reply_count, @last_bot_reply, @last_customer_msg)
  ON CONFLICT(conversation_id) DO UPDATE SET
    last_message_id  = excluded.last_message_id,
    bot_reply_count  = excluded.bot_reply_count,
    last_bot_reply   = excluded.last_bot_reply,
    last_customer_msg = excluded.last_customer_msg
`);
const insertModLog = db.prepare(`
  INSERT INTO moderator_log (conversation_id, customer_msg, moderator_reply, logged_at)
  VALUES (?, ?, ?, ?)
`);
const getUnlearnedLogs = db.prepare(`
  SELECT * FROM moderator_log ORDER BY logged_at DESC LIMIT 50
`);
const updateDayStat = db.prepare(`
  INSERT INTO stats (day, total_chats, bot_replied, faq_hits, ai_calls)
  VALUES (@day, @total_chats, @bot_replied, @faq_hits, @ai_calls)
  ON CONFLICT(day) DO UPDATE SET
    total_chats = stats.total_chats + excluded.total_chats,
    bot_replied = stats.bot_replied + excluded.bot_replied,
    faq_hits    = stats.faq_hits + excluded.faq_hits,
    ai_calls    = stats.ai_calls + excluded.ai_calls
`);

function today() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = {
  getHandled: (id) => getHandled.get(id),
  setHandled: (row) => upsertHandled.run(row),
  logModeratorReply: (conv_id, customer_msg, mod_reply) =>
    insertModLog.run(conv_id, customer_msg, mod_reply, Date.now()),
  getUnlearnedLogs: () => getUnlearnedLogs.all(),
  incStat: (field) => updateDayStat.run({
    day: today(),
    total_chats: field === 'total_chats' ? 1 : 0,
    bot_replied: field === 'bot_replied' ? 1 : 0,
    faq_hits: field === 'faq_hits' ? 1 : 0,
    ai_calls: field === 'ai_calls' ? 1 : 0,
  }),
};
