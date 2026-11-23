---
name: sunnah-gallery-design
description: >-
  Makes product and promo images for Sunnah Gallery BD (sunnahgallerybd.com),
  a Bangladeshi borka / abaya / modest-wear shop: Facebook and Instagram posts,
  stories, ad creatives, offer and sale banners, new-collection posts and
  page covers, in the shop's own brand (black calligraphy logo, ivory and gold,
  Bangla type). Use whenever the owner asks for a design, post, picture,
  banner, ad, story, poster or "ছবি / ডিজাইন / পোস্ট / ব্যানার / অফার" for the
  shop or a product, sends product photos to turn into posts, or asks for a
  week of posts.
---

# Sunnah Gallery BD — design

The owner sells borka, abaya, hijab and modest wear in Bangladesh and posts
mostly to Facebook. They talk in Bangla; reply in Bangla. Every design must
look like the same shop made it.

## What is in this folder

```
assets/brand.css        colours, fonts (@font-face), base styles — link it from every design
assets/logo-black.png   logo, transparent, for light backgrounds   (default)
assets/logo-white.png   logo, transparent, for dark photos
assets/logo-gold.png    logo in gold, for premium / Eid designs
assets/logo-original.jpg  the logo exactly as the owner supplied it
assets/fonts/           Hind Siliguri (text) + Noto Serif Bengali (headlines), OFL
templates/post-square.html   1080x1080 product post
templates/story.html         1080x1920 story / reel cover
scripts/render.cjs      HTML -> PNG at an exact size (Playwright)
examples/               what the templates look like with sample data
```

The logo file is small (230x431 px of ink). Keep it under about 200 px tall in
a design, and ask the owner for a bigger/vector logo if a design needs it larger.

## The brand

| role | value | use |
| --- | --- | --- |
| ink | `#121212` | headlines, logo, price |
| ivory | `#F5F1EA` | main background |
| sand | `#E7DFD2` | photo backdrop, panels |
| gold | `#B08D57` | thin lines, frames, small accents |
| offer | `#7A1F2B` | discount badge only |
| muted | `#6B645B` | details, old price, website |

- Headlines: Noto Serif Bengali 700–800. Everything else: Hind Siliguri.
- Calm, modest, premium. Lots of ivory space, thin gold lines, an arch shape
  around the product photo. No neon, no clutter, no more than one badge.
- Price in Bangla numerals with the taka sign: `৳২,২৫০`. Old price struck
  through next to it. Offer as `২০% ছাড়`.
- The colours were chosen from the black logo; if the owner gives brand colours,
  change them once in `brand.css`.

## Shop details to put on designs

- Name: Sunnah Gallery BD — website: sunnahgallerybd.com
- WhatsApp / phone: **not given yet** — ask the owner once, then write it here
  and stop asking.
- Facebook page name: **not given yet** — same.

## How to make a design

1. **Get the facts.** Product name, price (and old price if on offer), the
   offer, 1–2 lines of details (fabric, work, sizes, colours), and where it
   will be posted. If the owner sent only a photo and a price, write the rest
   yourself in plain Bangla and show it to them.
2. **Use their real product photo.** Never generate a borka with AI for a
   product post: AI changes the cut, embroidery and colour, and customers then
   get something different from what they saw. AI images (Canva / Adobe
   connectors) are only for backgrounds, mood and seasonal banners with no
   specific product in them.
   - Busy background in the photo: remove it with the Adobe or Canva
     background-removal tool, then place the cut-out on `--sand`.
   - Photo too small for the frame: Adobe generative expand, or crop tighter.
3. **Build the HTML.** Copy the nearest template into a working folder, replace
   `__ASSETS__` with the absolute path of this skill's `assets` folder, fill the
   `{{...}}` fields, delete the badge when there is no offer. Change layout
   freely for other formats, but keep the fonts, colours and logo.
4. **Render:** `node <skill>/scripts/render.cjs design.html out.png 1080 1080`.
   Fix every `WARNING` it prints (missing image, text overflowing its box).
5. **Look at the PNG yourself** before sending: Bangla spelled right and not
   broken, price right, nothing cut off, logo visible on the background.
6. **Send** the PNG to the owner. Offer the other size (post ↔ story) in one line.

## Sizes

| where | px |
| --- | --- |
| Facebook / Instagram post | 1080x1080 |
| Facebook portrait post / ad (best reach on phones) | 1080x1350 |
| Story, reel cover, WhatsApp status | 1080x1920 — keep text out of the top 250 px and bottom 300 px |
| Facebook page cover | 1640x624 (keep the middle 1200x500 important; phones crop the sides) |
| Website banner | ask for the size the site uses |

## Writing on designs

- Short. A headline of 2–5 words, one detail line, the price, the contact.
- Facebook ads: keep text to roughly a fifth of the image or reach drops.
- Bangla words the owner uses are better than formal ones: "অর্ডার করতে
  WhatsApp করুন", "স্টক সীমিত", "ক্যাশ অন ডেলিভারি", "সারা বাংলাদেশে হোম ডেলিভারি".
- Never invent claims (free delivery, 100% original, ratings) the owner has not
  confirmed.

## A week of posts

When asked for several posts, vary the layout (product post, detail close-up,
offer post, customer-question post, new-arrival story) but keep the brand
identical, and give each its own short Facebook caption in Bangla with 3–5
hashtags (#বোরকা #abaya #SunnahGalleryBD ...).

## Reference designs (competitor analysis)

The owner collected 20+ reference images from Glam Touch and Hisra brands.
Full analysis: `references/DESIGN-ANALYSIS.md`. Key lessons:

**Background (priority order):**
1. Monochromatic — hijab color as background (most premium look)
2. Warm neutral — ivory/beige/cream (our brand default)
3. Lifestyle/real setting (relatable, engagement posts)
4. Dark dramatic — maroon/navy (special/limited drops)

**Photo count → layout:**
- 1 photo: hero shot, product center, text below or right
- 2 photos: front+back OR 2 colors side by side
- 3-4 photos: collage with 1 large + 2-3 detail shots
- 5 photos: all colors line-up on flat background

**Text placement rules (from references):**
- Brand logo → top-left
- Product name (italic script) → center or bottom-center
- Bangla tagline → bottom 30% of image
- Never place text over model's face
- Large faded decorative text in background layer is trendy
- Max 1 accent color; keep it simple

**Font style (CRITICAL):**
- Product name: Cormorant Garamond italic 300 weight, HUGE (150-200px) — THE hero element
  - `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap')`
  - Fallback: `Georgia, 'Times New Roman', serif` with `font-style: italic`
  - **Never use bold Bangla as the main product name**
- Bangla product name: secondary, 30-40px, 60-70% opacity, below English
- Bangla captions: bold modern, mixed sizes for emphasis
- Background decorative: product name huge (280-350px), 12-15% opacity — clearly visible
- Casual posts: handwritten style

**Color contrast:**
- Light bg → dark text + gold accent
- Dark bg → white text + yellow/gold accent
- Max 1 accent color per design

**Reference folder:** `references/glam-touch/` (17 images) + `references/hisra/` (3 images)
Add new references there and update `references/DESIGN-ANALYSIS.md`.
