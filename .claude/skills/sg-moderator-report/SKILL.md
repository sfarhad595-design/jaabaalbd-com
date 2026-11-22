---
name: sg-moderator-report
description: >-
  Daily performance report on Sunnah Gallery BD's page moderators and customer
  service: how many comments came in, how many got an answer, how fast, which
  are still waiting, reply quality (polite, correct price, no customer data in
  public), and, when replies are signed, a per-moderator scorecard. Use for the
  scheduled evening report and whenever the owner asks "মডারেটররা কেমন কাজ
  করছে", "আজকের রিপোর্ট", "কত কমেন্টের উত্তর বাকি", "কে ভালো কাজ করছে".
---

# Moderator report

Read `sg-shop-brain` first. Needs the Facebook connection.

## What Facebook can and cannot tell us

Replies made from the page all show as the page, so Facebook does not say which
moderator wrote which reply. Two ways to get per-person numbers — suggest the
first to the owner once:

1. **Signed replies**: each moderator ends replies with a short tag, e.g. `-R`
   for রিমা, `-S` for সাদিয়া. Write the tag → name list into `shop.md` under
   `## Moderators`. The report then counts per person.
2. Without tags: report the team as a whole.

Inbox (Messenger) speed is not included unless the app has `pages_messaging`
and `read_page_mailboxes`-style access added later.

## Each run (for the last 24 hours, Bangladesh time)

1. Fetch posts and comments as in `sg-comment-replies` step 1, plus the page's
   own replies (`from.id == page_id`) with their `created_time`.
2. Per customer comment work out: answered? by page or by the automation (the
   log says which replies the automation made) · first-reply time · signed by
   whom.
3. Check the quality of moderator replies (not the automation's):
   - price/size matches the website and `shop.md`
   - polite, Bangla, not copy-paste identical many times
   - no phone number, address or order details in public
   - complaints moved to inbox, not argued in public
4. Write the report:
   ```
   🧾 আজকের রিপোর্ট (২২ নভেম্বর)
   কমেন্ট ১২৪ · উত্তর ১১৮ (৯৫%) · গড় উত্তরের সময় ১৮ মিনিট
   ⏳ ১ ঘণ্টার বেশি অপেক্ষায়: ৬ টা  → লিংক
   👤 রিমা: ৫২ উত্তর · গড় ১২ মি · ভুল দাম ০
   👤 সাদিয়া: ৩১ উত্তর · গড় ৪১ মি · ১টা উত্তরে ফোন নম্বর পাবলিক ⚠️
   🤖 অটোমেটিক: ৩৫ উত্তর
   ✅ ভালো: … ⚠️ ঠিক করতে হবে: …
   ```
   Numbers first, at most 10 lines, then up to 3 concrete suggestions.
   Fair to people: a slow hour at 3 a.m. is not a failure — count speed only
   for comments posted between 9:00 and 23:00 unless the owner sets other hours.
5. Save the numbers as one log line (`skill: sg-moderator-report`) so weekly
   trends can be shown; commit + push. Every Friday add a one-line week-on-week
   comparison.
