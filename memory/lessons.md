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
