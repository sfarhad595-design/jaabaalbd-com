---
name: sg-shop-brain
description: >-
  Shared memory and settings for every Sunnah Gallery BD automation: shop facts
  (products, delivery, payment, sizes, voice), config (Facebook page and ad
  account ids, review/auto mode, posting times, ad targets), the Facebook Graph
  API helper and the activity log. Read it first whenever doing anything for
  the shop — posting, replying to comments, ads, moderator reports — and when
  the owner gives new shop information ("delivery charge is now...", "we have
  a new product", "set posting time to..."), "ডেলিভারি চার্জ/দাম বদলেছে",
  or asks to set up the Facebook connection.
---

# Sunnah Gallery BD — shop brain

The owner sells borka and modest wear and wants the shop's Facebook run for
them: daily posts, comment replies, ads, and a daily moderator report. They
talk in Bangla and want short answers. The four skills that do the work are
`sg-daily-posts`, `sg-comment-replies`, `sg-ads-manager`, `sg-moderator-report`;
the look of every image comes from `sunnah-gallery-design`.

## Files

| file | what |
| --- | --- |
| `shop.md` | facts customers ask about, and the voice. Lines with FILL ME are unknown. |
| `config.json` | ids, mode, times, ad targets. No secrets ever. |
| `scripts/fb.py` | Graph API client (get / all / post / upload). Run with `python3 -I`. |
| `<repo>/ops-log/` | what was done, one JSON line per action, one file per month |

## Rules every skill follows

1. **Mode.** `config.json` → `mode`:
   - `review` (start here): prepare everything, show the owner, act only after
     they say OK. Group things so the owner approves in one message.
   - `auto`: act, then send a short report. Switch only when the owner says so.
   Even in `auto`, always ask first before: pausing or deleting anything,
   raising total ad spend by more than the configured limit, replying to a
   complaint, or anything about money/refunds.
2. **Facts.** Only facts from `shop.md`, the website, or the owner. Unknown →
   say so and add it to the owner's list. Never invent prices, stock,
   delivery promises or discounts.
3. **Privacy.** Never write a customer's phone, address or order details in a
   public comment, report or log. Never put tokens in files, chat or commits.
4. **Log.** After every action append one line to
   `ops-log/YYYY-MM.jsonl` in the repo, then commit and push:
   `{"t":"2026-11-22T20:30:00+06:00","skill":"sg-daily-posts","action":"posted","id":"<fb id>","note":"দুবাই চেরি বোরকা"}`
   The log is how the next run knows what was already posted/answered, because
   each scheduled run starts on a fresh machine.
5. **Language.** Customer-facing text in Bangla. Reports to the owner: Bangla,
   short, numbers first, at most one screen.
6. **Time.** Bangladesh time (UTC+6) in everything the owner reads.

## Facebook connection (one-time setup, ~20 minutes, phone is fine)

Needed for posting, comments, moderator report and ads. Walk the owner through
it step by step, one step per message, in Bangla:

1. developers.facebook.com → log in with the Facebook account that is admin of
   the page → **My Apps → Create App** → type **Business** → name "SG Assistant".
2. Add products: **Facebook Login for Business** (and **Marketing API** for ads).
3. **Tools → Graph API Explorer** → select the app → **Get Page Access Token** →
   tick: `pages_show_list`, `pages_read_engagement`, `pages_read_user_content`,
   `pages_manage_posts`, `pages_manage_engagement`, `read_insights`,
   `ads_read`, `ads_management`, `business_management` → choose the page.
4. Make the token long-lived: **Tools → Access Token Debugger** → paste →
   **Extend Access Token**. Then get the page token from
   `me/accounts` with that long-lived user token (page tokens made this way do
   not expire).
5. The owner must **not paste the token in chat**. Call the credential tool
   (`request_credential`) for host `graph.facebook.com`, type bearer — the owner
   pastes it into that secure form. The proxy then adds it to every request.
6. Test: `python3 -I scripts/fb.py get me fields=id,name` → write the returned
   id into `config.json` → `facebook.page_id`. For ads:
   `fb.py get me/adaccounts fields=id,name,currency` (with a user token that has
   ads permissions) → `facebook.ad_account_id` (looks like `act_123...`).

If a call fails with code 190 the token expired or was revoked: ask for a new
one the same way. The app can stay in development mode — it only acts on the
owner's own page.

## When the owner gives new facts

Update `shop.md` (remove the FILL ME) or `config.json`, commit, push, and
confirm in one line. Do not ask again for something already written there.
