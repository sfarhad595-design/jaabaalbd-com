# Map of sites, folders and accounts (no secrets here, ever)

## Websites
- sunnahgallerybd.com — custom-built site (owner says they have the code; not
  shared yet). Admin at /dashboard. Unreachable from the cloud session (proxy).
- zahrabd.shop — live again (checked 2026-11-26). Laravel + Filament app.
  cPanel host tista.bd.svlogins.com:2083 (owner logs in; never store password).
  Code: /home2/zahrabds/laravel_app. Admin panel: zahrabd.shop/zahraadmin
  (also /dashboard). Orders form: app/Filament/Resources/Orders/Schemas/OrderForm.php,
  save logic in Orders/Pages/CreateOrder.php + EditOrder.php.
  Landing pages: LandingPageController.php + resources/views/landing/*.
  Matching orna (ওড়না/হিজাব) = extra OrderItem "ম্যাচিং ওড়না/হিজাব" ৳300.

## Google Drive (owner's), Sunnah Gallery folders found 2026-11-22
| folder | id |
| --- | --- |
| Sunnah gallery 2026 | 1EUBq-FxVynrlcJnxocbjZHtmqqRtyA_F |
| Sunnah gallery 2026 0.1 | 1m8eW4XfJObACvFkMWKZ3aiUA0btBBQCt |
| sunnah gallery broka | 13lRjRAGdDgHWOjT_7RJXGj2wPEeautG3 |
| sunnahgallerybd.com | 1Vg4trShPxPsRqwTgsMUW2culoE_gX7aO |
| SUNNAH GALLERY WHATPASS | 1artdKxR2QEDZIjS6xHTjiYLe6s3w2Io5 |
| sunnah360.com | 1aocwBPdcpZuH6wayoafuqtrV5OIRu2vx |
Which one holds post photos: not decided yet. Contents not mapped yet —
when mapped, list sub-folders/products here so Drive is not searched again.

## Connected in the cloud session
Google Drive, Gmail, Google Calendar/Sheets, Canva, Adobe, Figma, Orshot.
Not connected: Facebook (needs Meta app + page token), WhatsApp, Telegram.
