---
name: sg-memory
description: >-
  Long-term memory for this owner and their shops, kept as small files in the
  repo's memory/ folder so nothing has to be looked up, asked or read twice,
  and so work costs fewer tokens. Use at the start of any task (read the index,
  open only the file needed), after any task that taught something lasting
  (save it), whenever the owner says "মনে রাখো", "ভুলে যেও না", "আগে বলেছিলাম",
  "আমি কী বলেছিলাম", "remember", or asks what was done before, and once a
  month to tidy the memory.
---

# Memory

Claude starts every session blank. This folder is the only memory, so it must
be correct, small and easy to search. `CLAUDE.md` at the repo root points every
session here.

## Layout

```
CLAUDE.md            loaded automatically every session — keep under ~40 lines
memory/INDEX.md      one line per memory file — read this first, always
memory/owner.md      how the owner works, likes, dislikes
memory/projects.md   what was built, where, links
memory/sites.md      MAP of websites, Drive folders, accounts, ids (no secrets)
memory/decisions.md  decisions with dates, so they are never re-asked
memory/todo.md       open items
memory/lessons.md    mistakes and their fixes
memory/<topic>.md    add more when a topic grows (products.md, moderators.md ...)
ops-log/*.jsonl      raw action log of the automations (not read by default)
```

## Reading (cheap)

1. Read `memory/INDEX.md`. Open only the file(s) the task needs.
2. Search before opening big files: `grep -n "keyword" memory/*.md`.
3. If a map in `sites.md` covers what you need (folder ids, page structure,
   product list), **use the map instead of browsing again**. Re-check only if
   the entry's date is old for its kind (prices/stock: 1 day; Drive folder
   contents: 7 days; site structure, ids: until it breaks) or the owner says
   it changed.

## Writing (after every task)

Save only what will matter later. One short line each, with the date:

| what happened | where |
| --- | --- |
| owner stated a preference / like / dislike | owner.md |
| owner decided something ("start in review mode") | decisions.md |
| something was built, published, a link was made | projects.md |
| a site, folder, account, id was looked up / mapped | sites.md (the map) |
| something is now waiting on someone | todo.md (tick it when done) |
| a mistake happened and was fixed | lessons.md |
| shop facts (price, delivery, sizes) | `sg-shop-brain/shop.md`, not here |

Rules:
- Write facts, not chat. "2026-11-22 delivery inside Dhaka ৳70" — not the conversation.
- Correct, don't append contradictions: when something changes, edit the old
  line and add "(changed YYYY-MM-DD)".
- Never store passwords, tokens, API keys, customer phone numbers, addresses
  or order details. Orders and product catalogues belong in the website / a
  Google Sheet; memory keeps only *where* they are.
- Update the `updated` date in INDEX.md for the file you changed.
- Commit and push memory changes in the same turn
  (`git add CLAUDE.md memory && git commit -m "memory: ..." && git push`),
  otherwise the next session will not see them.

## Saving tokens (the owner pays per use)

- Answer short; the owner asked for that.
- Do not reread files, sites or folders already mapped; trust the map.
- Repeat work → turn it into a script in the relevant skill (a script costs no
  tokens to "think"), and note the script in `projects.md`.
- Scheduled runs: read only `CLAUDE.md`, `INDEX.md`, the one skill and the
  config they need; report in a few lines.
- Batch questions to the owner into one message.

## Monthly tidy (or when INDEX.md says a file is > ~150 lines)

Merge duplicates, delete what is no longer true, move finished todos to the
relevant file as one line, split a big file into topics and list them in
INDEX.md. Keep `CLAUDE.md` short — it is read in every session.

## Learning from the work

When the owner corrects something ("এভাবে না, এভাবে"), save the rule in the
skill that did the work (e.g. caption style → `sg-daily-posts`), not only in
memory, so the improvement is used automatically next time. Log it in
lessons.md in one line.
