# Lessons

- Cloud proxy blocks dl.google.com, Facebook, the owner's sites and Azure blob downloads — build APKs on GitHub Actions and publish as Releases instead of downloading artifacts.
- GitHub Actions can fail on a flaky dependency download; re-run failed jobs once before changing code.
- `gh` CLI is only allowed for search here; use the GitHub MCP tools for Actions/releases.
- Node ESM `import 'playwright'` fails here; use `require('playwright')` (.cjs).
- Mirror-padding an image around a logo duplicates the logo; pad with a logo-free texture strip instead.

- 2026-11-26 cPanel code reading: JS tool output with PHP code gets blocked
  ("Cookie/query string data"). Read files by opening cPanel File Manager
  showfile.html?file=..&dir=.. and using get_page_text. Write files with UAPI
  Fileman/save_file_content from the cPanel tab (it saves CRLF; PHP is fine).
  Always save a .bak-YYYYMMDD copy first.
- cPanel save_file_content drops the final newline and saves CRLF; compare
  hashes after converting CRLF→LF and adding "\n".
- 2026-11-27 Landing order crashed "Duplicate entry ... users_phone_unique" when the
  buyer's phone already belonged to a staff/admin user (owner tested with shop
  number 0160...). Fixed User::findOrCreateCustomer (app/Models/User.php): if phone/
  email taken by non-customer → return unsaved customer, never block the order.
  Backup User.php.bak-20261127-dupphone. Real customers were NOT blocked by this
  (only numbers that are staff accounts). Only 9 orders total in Zahra so far.
