---
name: sg-comment-replies
description: >-
  Answers comments on Sunnah Gallery BD's Facebook page posts in Bangla: price
  and size questions, "ইনবক্স প্লিজ", order intent, delivery questions,
  compliments, complaints, and hides spam — using the shop facts and live
  website prices. Use for the scheduled comment run and whenever the owner
  says "কমেন্টের রিপ্লাই দাও", "কমেন্ট চেক করো", "কে কী কমেন্ট করেছে",
  "উত্তর বাকি আছে কোনগুলো", or asks about comments on a post.
---

# Comment replies

Read `sg-shop-brain` first. Needs the Facebook connection (page token).

## Each run

1. **Fetch** recent posts with their comments:
   ```
   python3 -I <brain>/scripts/fb.py all <page_id>/feed \
     fields='id,message,created_time,permalink_url,comments.limit(100).filter(stream){id,from{id,name},message,created_time,parent{id},comment_count,is_hidden}' \
     since=<unix time of 7 days ago> limit=25
   ```
   A comment is **answered** when a later comment in the same thread is from the
   page (`from.id == page_id`) or the log already has a reply to it.
2. **Sort** each unanswered comment into one kind and act:

   | kind | examples | action |
   | --- | --- | --- |
   | price | "দাম কত", "price?", "pp" | reply with the price from the website for that post's product + how to order |
   | size / colour / fabric | "৫৪ সাইজ আছে?", "অন্য কালার?" | answer from the website; unknown → "ইনবক্সে বিস্তারিত জানাচ্ছি" and list it for the owner |
   | order intent | "নিবো", "অর্ডার করতে চাই", "ইনবক্স" | thank them, ask them to message the page / WhatsApp with name, address, size — never ask for those in public |
   | delivery / payment | "ঢাকার বাইরে দেন?", "ক্যাশ অন ডেলিভারি?" | answer from `shop.md` |
   | praise | "মাশাআল্লাহ সুন্দর" | short warm thanks ("জাযাকাল্লাহু খাইরান 🤍") |
   | complaint / problem | late, wrong item, bad quality | **never auto-reply**. Owner list, marked urgent. In review the owner writes or approves the reply. |
   | spam / scam / other shop's ad / abuse | links, "work from home", competitor promo, insults | hide it (`fb.py post <comment_id> is_hidden=true`) if `comments.hide_spam`; log it. Never reply. |
   | unclear / a tag of a friend only | "@Name" alone | skip |

3. **Write** each reply: 1–2 lines, Bangla, the voice in `shop.md`, start with
   the person's first name if it is clearly a name. Vary the wording — dozens
   of identical replies look like a bot and Facebook may limit them. No customer
   data in public. Never promise what `shop.md`/website do not say.
4. **Send**
   - `review` mode: one message to the owner with every proposed reply
     (comment → reply), numbered; post what they approve.
   - `auto` mode: post them, but complaints and anything about refunds/money
     still go to the owner first.
   - Reply: `fb.py post <comment_id>/comments message=@reply.txt`
     (reply to the top-level comment id so it lands in the thread).
5. **Log** each reply/hide (comment id, kind, reply id — no customer text
   beyond a few words) and commit + push.
6. **Report** in a few lines: how many answered, hidden, waiting for the
   owner (with links to the urgent ones).

## Limits to respect

- Do not reply to comments older than 7 days unless asked.
- At most ~60 replies per run; Facebook rate-limits fast bursts.
- Messenger/inbox is not read by this skill (needs extra Meta permissions);
  if the owner wants it later, `pages_messaging` must be added to the app.
