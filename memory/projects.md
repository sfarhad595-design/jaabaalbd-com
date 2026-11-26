# Projects built (newest first)

All code lives in this repo, branch `ccr-4cc3c4b3-t7cj6r`
(github.com/sfarhad595-design/jaabaalbd-com, public).

## Scheduled tasks
| name | when | id | does |
| --- | --- | --- | --- |
| সকালের রিমাইন্ডার | daily 08:47 BD | trig_01JrYskzW4HPwRzXW2Acr9G2 | reads memory/reminders.md + todo.md, sends a short Bangla push to the owner. Has no connectors (repo only). |

## Shop automation skills (2026-11-22)
`.claude/skills/`: sg-shop-brain, sg-daily-posts, sg-comment-replies,
sg-ads-manager, sg-moderator-report. Not running yet — waiting on Drive
folder choice, shop facts and the Facebook (Meta app) connection. Logs go to
`ops-log/YYYY-MM.jsonl`.

## Design skill (2026-11-22)
`.claude/skills/sunnah-gallery-design`: brand colours, logo files, Bangla
fonts, post 1080x1080 and story 1080x1920 templates, `scripts/render.cjs`
(HTML -> PNG with Playwright). Fonts to be replaced after the owner picks.

## Android apps (WebView), built by GitHub Actions, APK in Releases
| app | opens | folder | workflow | latest APK |
| --- | --- | --- | --- | --- |
| Zahra BD | https://zahrabd.shop/ | zahrabd-app | zahrabd-apk.yml | releases/download/zahrabd-v1.0-build2/ZahraBD.apk |
| Sunnah Gallery BD | https://sunnahgallerybd.com/ | sunnahgallery-app | sunnahgallery-apk.yml | releases/download/sunnahgallery-v1.1-build3/SunnahGalleryBD.apk (owner's logo as is) |
| SG Dashboard | https://sunnahgallerybd.com/dashboard | sgdashboard-app | sgdashboard-apk.yml | releases/download/sgdashboard-v1.0-build1/SGDashboard.apk |
Release URLs start with https://github.com/sfarhad595-design/jaabaalbd-com/.
All are debug-signed: reinstall needed when updating; a release keystore
would fix that (not done). Push to the app folder = new build + release.
The cloud session cannot reach dl.google.com, so APKs are only built on Actions.

## Other skills installed
- Replica pack (11 skills, `replica-*`) — clone/rebuild an app's features.
- From anthropics/skills: frontend-design, webapp-testing, web-artifacts-builder,
  mcp-builder, canvas-design, theme-factory, brand-guidelines, algorithmic-art,
  doc-coauthoring, internal-comms, slack-gif-creator, academy-guide,
  discernment-nudge. (docx/xlsx/pptx/pdf/skill-creator/claude-api are built in.)

## Zahra admin — simple moderator order form (2026-11-26)
OrderForm.php rewritten: phone/name/address only; product "ওয়েবসাইটে আছে/নেই";
product colours & sizes as buttons; ওড়না tick (+৳300, adds own item); flat ৳
discount; delivery ভিতরে/বাইরে/ফ্রি; customer note + office note; payment and
source/status in collapsed boxes. Backups: *.bak-20261126-simple (OrderForm,
CreateOrder, EditOrder). Tested create + edit page render; no test order saved.
- 2026-11-26 added "📋 মেসেজ পেস্ট করুন" box at top of the order form
  (Steadfast-style): parsePaste() in OrderForm.php pulls name / phone /
  address from pasted text (labels or no labels, Bangla digits ok, skips
  greetings and product/colour/size lines). Fills on blur or "বসিয়ে দিন".
  No AI/API cost — plain rules. Product is not auto-filled (owner said not needed).
- 2026-11-26 paste box now also fills products: parseProducts() in OrderForm.php
  matches product name (Bangla→English map: সাকিনা/মানহা/জারা, colour words),
  colour from product's colour list, size from product's sizes, qty ("২টা"),
  ওড়না → with_orna. Several colours/sizes → one item each. Tested live
  (Sakina 2 colours + orna, Manha Merun Pink). New Bangla product names need
  adding to the $map in parseProducts().
