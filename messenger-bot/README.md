# Sunnah Gallery Messenger Bot

Sunnah Gallery BD Facebook Messenger-এর ২৪/৭ bot।

## কী করে

- প্রতি ৬০ সেকেন্ডে Messenger inbox check করে
- মডারেটর ৩ মিনিটে উত্তর না দিলে bot উত্তর দেয়
- FAQ matching (০ AI token), AI reply শুধু জটিল প্রশ্নে
- প্রতিরাতে মডারেটরের উত্তর থেকে শেখে

---

## প্রথমবার Setup (laptop-এ)

### ১. Clone করুন

```bash
git clone https://github.com/sfarhad595-design/jaabaalbd-com.git
cd jaabaalbd-com/messenger-bot
```

### ২. Node.js install (না থাকলে)

```bash
# Windows: https://nodejs.org/en/download থেকে download করুন
# Mac: brew install node
```

### ৩. Dependencies install

```bash
npm install
```

### ৪. .env file বানান

```bash
cp .env.example .env
# .env ফাইল খুলে FB_PAGE_TOKEN এবং ANTHROPIC_API_KEY দিন
```

#### FB_PAGE_TOKEN কীভাবে পাবেন:

1. [business.facebook.com](https://business.facebook.com) → Business Settings
2. **System Users** → **Add** → Name: `Bot`, Role: **Admin**
3. **Grant Assets** → Sunnah Gallery Page + Ad Account assign করুন
4. App `3053850578318596`-ও assign করুন
5. **Generate Token** → Expiry: **Never**
6. Token কপি করে `.env`-এ `FB_PAGE_TOKEN=` এর পরে paste করুন

#### ANTHROPIC_API_KEY:

1. [console.anthropic.com](https://console.anthropic.com) → Settings → API Keys
2. নতুন key বানান
3. Billing → Usage Limits → $20/month limit সেট করুন
4. Key `.env`-এ `ANTHROPIC_API_KEY=` এর পরে paste করুন

#### OWNER_FB_USER_ID (optional — নিজের Messenger-এ alert পেতে):

আপনার Facebook user ID: [findmyfbid.in](https://findmyfbid.in) থেকে বের করুন।

### ৫. Test run

```bash
node index.js
```

কোনো error না থাকলে terminal-এ দেখবেন:
```
Sunnah Gallery Messenger Bot
Page ID: 103646049252710
Started: ...
```

### ৬. PM2 দিয়ে ২৪/৭ চালান

```bash
# PM2 install (একবারই লাগবে)
npm install -g pm2

# Bot চালু করুন
pm2 start ecosystem.config.js

# Laptop restart হলেও auto-start হবে
pm2 save
pm2 startup  # কমান্ড দেখাবে, সেটা copy করে run করুন

# Status দেখুন
pm2 status

# Log দেখুন
pm2 logs sgbd-bot
```

### Mac-এ laptop ঘুম থেকে prevent করতে

```bash
caffeinate -d &
```

---

## Kill Switch

যেকোনো সময় bot বন্ধ করতে:

```bash
touch PAUSE
```

চালু করতে:

```bash
rm PAUSE
```

---

## FAQ আপডেট

`faq.json` ফাইল সরাসরি edit করুন। Bot পরের tick থেকে নতুন rules ব্যবহার করবে।

---

## ফাইল স্ট্রাকচার

```
messenger-bot/
  index.js          - main entry
  watcher.js        - 60s polling loop
  replier.js        - FAQ + AI reply
  learner.js        - nightly learning
  db.js             - SQLite state
  faq.json          - FAQ rules (edit this)
  .env              - secrets (never commit)
  ecosystem.config.js - PM2 config
  bot.db            - local database (auto-created)
  learn.jsonl       - moderator reply log
  PAUSE             - kill switch (create to pause)
```
