---
name: sg-daily-posts
description: >-
  Runs Sunnah Gallery BD's daily Facebook posting: picks the best unposted
  product photos from the owner's Google Drive folder, checks price and stock
  on sunnahgallerybd.com, makes the branded design, writes the Bangla caption
  and hashtags, and publishes to the page (or sends for approval in review
  mode). Use for the scheduled posting run and whenever the owner says "আজকের
  পোস্ট", "পোস্ট করো", "Drive থেকে পোস্ট দাও", "এই সপ্তাহের পোস্ট", "কী পোস্ট
  করবো", or drops new photos in Drive.
---

# Daily posts

Read `sg-shop-brain` first (config, facts, rules, log). Images are made with
`sunnah-gallery-design`.

## The Drive folder

`config.json → drive.posts_folder_name` (default "Sunnah Gallery Posts"). One
sub-folder per product, holding its photos and, ideally, a short `info` text or
Google Doc:

```
Sunnah Gallery Posts/
  Dubai Cherry Borka/      photo1.jpg photo2.jpg info.txt
  Nida Abaya Black/        ...
```

`info` lines the owner can write (all optional): `নাম:`, `দাম:`, `আগের দাম:`,
`অফার:`, `কাপড়:`, `সাইজ:`, `রং:`, `লিংক:`. Missing facts come from the
website product page; still missing → leave them out of the post rather than
guess. If the folder does not exist yet, tell the owner to create it with this
layout (one line), and stop.

Find the folder with the Google Drive search tool, store its id in
`config.json → drive.posts_folder_id` the first time.

## Each run

1. **What was posted.** Read `ops-log/*.jsonl` for `sg-daily-posts` entries; a
   product posted within `do_not_repeat_days` is skipped.
2. **Pick** `posts_per_day` products. Prefer, in order: new folders never
   posted · products on offer · best photo quality (sharp, well lit, whole
   garment visible, no other shop's watermark) · in stock on the website ·
   variety (not two black abayas in a row). Never post a photo with another
   brand's logo or watermark.
3. **Check the website** product page for live price and stock. Out of stock →
   skip it. Price differs from `info` → use the website and note it for the owner.
4. **Design** with `sunnah-gallery-design`: 1080x1350 portrait for feed (best
   on phones), 1080x1080 if the photo is square. Look at the PNG before using it.
5. **Caption** (Bangla, the voice in `shop.md`):
   ```
   <one-line hook — the feel of the product, not just the name>
   <2–3 short lines: কাপড়, কাজ, সাইজ/রং>
   💰 দাম: ৳২,২৫০ (আগে ৳২,৮০০)        ← only real numbers
   🚚 সারা বাংলাদেশে হোম ডেলিভারি       ← only if true in shop.md
   📩 অর্ডার করতে ইনবক্স / WhatsApp: <number from shop.md>
   🌐 sunnahgallerybd.com/<product link if known>
   #বোরকা #abaya #SunnahGalleryBD #<1–2 specific tags>
   ```
   No exaggeration, no fake urgency ("মাত্র ২টা বাকি") unless the website shows it.
6. **Publish**
   - `review` mode: send the owner the designs and captions together in one
     message, numbered, and ask "পোস্ট করবো? (সব / ১,৩ / বদলাও ...)". Post only
     what they approve.
   - `auto` mode, or after OK:
     `python3 -I <brain>/scripts/fb.py upload <page_id> post.png caption=@caption.txt`
     For a later time today add `published=false scheduled_publish_time=<unix>`
     (10 min – 30 days ahead), using `posting.times_bd`.
7. **Log** each post (product folder, fb post id, time) and commit + push.
8. **Report** in 2–3 lines: what went out / is scheduled, anything the owner
   should fix (missing price, blurry photos, folder empty soon).

## If something is missing

- No Facebook token yet → do steps 1–5, send the finished designs + captions to
  the owner to post by hand, and mention once that `sg-shop-brain` can connect
  the page so it posts by itself.
- Fewer than 3 unposted products left → say so in the report.
