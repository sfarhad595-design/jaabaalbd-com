---
name: sg-ads-manager
description: >-
  Checks Sunnah Gallery BD's Facebook/Instagram ads every day: spend, results,
  cost per message or purchase, frequency and fatigue per ad set; raises budget
  on what works, lowers it on what wastes money, flags ads to pause or refresh,
  and reports in plain Bangla. Budget changes need the owner's OK in review
  mode and are always capped. Use for the scheduled ads run and whenever the
  owner asks "অ্যাড কেমন চলছে", "বাজেট বাড়াবো?", "কোন অ্যাড ভালো", "টাকা
  নষ্ট হচ্ছে কিনা", "boost", "Ads Manager চেক করো".
---

# Ads manager

Read `sg-shop-brain` first. Needs the Facebook connection with `ads_read`
(to look) and `ads_management` (to change), and `facebook.ad_account_id`.

## Before the first run

`ads.target_cost_per_result` in `config.json` is the most the owner is happy to
pay for one result (default result: a new message conversation; change
`result_type` to `offsite_conversion.fb_pixel_purchase` if the website pixel
records purchases). If it is empty, ask the owner once: "একটা মেসেজ/অর্ডার
পেতে সর্বোচ্চ কত টাকা খরচ ঠিক আছে?" Until it is set, only report — never change budgets.

## Each run

1. **Pull** yesterday and the last 7 days per ad set:
   ```
   fb.py all <act_id>/insights level=adset date_preset=last_7d time_increment=1 \
     fields=adset_id,adset_name,campaign_name,spend,impressions,reach,frequency,clicks,ctr,cpm,actions,cost_per_action_type
   fb.py all <act_id>/adsets fields=id,name,status,effective_status,daily_budget,lifetime_budget,created_time
   ```
   Budgets are in the account's smallest unit (BDT × 100 → `50000` = ৳500).
2. **Judge** each active ad set (skip ones with less than `min_days_of_data`
   days or less than `min_spend_before_judging` spent — too early):
   - cost per result ≤ 0.8 × target and steady → **raise** budget
     by up to `max_daily_change_percent`
   - cost per result ≥ 1.3 × target for 3+ days → **lower** by up to the same %
   - spend ≥ 2 × target and zero results → **recommend pause** (never pause alone)
   - frequency > 3 and CTR falling 3 days in a row → **creative tired**: suggest a
     new design from `sg-daily-posts` / `sunnah-gallery-design`
   - learning phase / just edited (< 3 days) → leave it alone
   Change one thing per ad set per day. Total account daily budget may not
   rise more than `max_daily_change_percent` in a day.
3. **Act**
   - `review` mode: send the plan (ad set → now → proposed → why, in one line
     each) and wait for OK.
   - `auto` mode or after OK: `fb.py post <adset_id> daily_budget=<new minor units>`.
     Pausing (`status=PAUSED`) only with the owner's explicit OK, in any mode.
4. **Log** every change (ad set id, old → new budget, reason) and commit + push.
5. **Report** (Bangla, short):
   ```
   📊 গতকাল: খরচ ৳১,২৪০ · মেসেজ ৩১ · প্রতি মেসেজ ৳৪০ (লক্ষ্য ৳৫০) ✅
   ⬆️ "Eid Abaya" বাজেট ৳৫০০ → ৳৬০০ (সস্তায় মেসেজ আনছে)
   ⬇️ "Niqab Set" ৳৪০০ → ৳৩২০ (প্রতি মেসেজ ৳৯০)
   ⚠️ "Black Borka" অ্যাডটা পুরনো হয়ে গেছে — নতুন ছবি দরকার
   ```

## Never

- Create new campaigns or change targeting, placements or the payment method
  without the owner asking for that specific thing.
- Judge on one day of data, or on clicks alone.
- Show a total spend you did not read from the API.
