# XOTIJI — CLAUDE CODE WORKING RULES
Last updated: 2026-07-28

> How to work in this repo. For what to build, see [LAUNCH_V1.md](LAUNCH_V1.md). For why, see [VISION.md](VISION.md).

---

## 1. SESSION OPENING CHECKLIST

1. Read PROJECT_CONTEXT.md completely.
2. Read this file (INSTRUCTIONS.md).
3. If the task touches the roadmap or scope, read LAUNCH_V1.md (active sprint) and VISION.md (long-term, rarely relevant to a single task).
4. Do not assume anything not written in these files — if the repo state contradicts a doc, trust the repo and flag the doc as stale.

## 2. SESSION CLOSING CHECKLIST

1. Run `tsc --noEmit` in apps/frontend — zero errors required before any commit.
2. Update PROJECT_CONTEXT.md if the change added/removed a route, table, page, or component category.
3. Show the diff. Do not commit or push without explicit approval.
4. State clearly what was NOT done (deferred, blocked, out of scope) — don't let it go unmentioned.

---

## 3. WORKING RULES

- **Small audited steps, diff-only.** Show the diff before it's applied where possible; wait for approval before committing. Don't batch unrelated changes into one commit.
- **No auto-push.** Never push without the user explicitly asking for that push, in that session.
- **Language split:** Turkish for strategy discussion with the user, English for prompts, code, comments, and all user-facing content (UI strings, SEO copy, docs). This repo's product is English-primary (see VISION.md) even though working conversation may be Turkish.
- **Middleware at route level, not controller level.** `verifyJWT`/`optionalJWT` etc. are wired in `src/routes/*.js`, not inside controller functions. See apps/api/src/routes/ai.js for the pattern.
- **Raw pg queries only. No ORM.** Prisma was removed; do not reintroduce it or any other ORM.
- **PROJECT_CONTEXT.md update is part of Definition of Done** for every deliverable that changes routes, DB schema, or frontend pages — not a follow-up task.
- **CommonJS backend, TypeScript strict mode frontend.** No ESM syntax (`import`/`export`) in apps/api `.js` files. `tsc --noEmit` must pass with zero errors before every commit.
- **No new dependencies without discussion.** Ask before adding a package to either app's package.json.

---

## 4. STANDARD PROMPT FORMAT

When the user or a planning step defines a task for Claude Code to execute, structure it as:

```
CONTEXT: what currently exists, what's true about the repo right now
TASK: the single deliverable
REQUIREMENTS: concrete, testable asks
CONSTRAINTS: what NOT to touch, which existing patterns to follow
DoD CHECKLIST: bullet list, each item verifiable
OUTPUT: diff-only, no push
```

Keep tasks scoped to one deliverable. If a task naturally splits into independent pieces, split the prompt rather than bundling.

---

## 5. RED FLAGS — STOP AND ASK

Stop and ask the user before proceeding if a task would:

- Touch anything in the "OUT OF SCOPE FOR v1" list in LAUNCH_V1.md (MSZ Devrilmez Sistemi, NFT, AI Influencer Network, Learn-to-Build, native mobile app, real group native, live flight tracking, Travel DNA, visa constraint engine).
- Add a new external service or third-party API not already integrated.
- Add a new npm/pip dependency.
- Require a schema migration on a table already in production use (hotels, experiences, users, packages, face_swap_jobs).
- Involve pushing to `main`, force-pushing, or any destructive git operation.
- Require committing secrets, API keys, or `.env` contents.
- Ask for a refactor of core backend architecture (gateway, controller→service→repository chain) without an explicit product reason tied to LAUNCH_V1.md.
- Contradict something PROJECT_CONTEXT.md states as already done — verify against the actual repo before assuming the doc or the request is right.

---

## 6. FORBIDDEN DEPENDENCIES / PATTERNS

- No ORM (Prisma or otherwise) — raw `pg` only.
- No ESM syntax in apps/api backend files.
- No CSS frameworks/Tailwind in apps/frontend — inline styles is the established pattern (see PROJECT_CONTEXT.md §Frontend).
- No new page-routing library — the `useState<page>` pattern in App.tsx stays until a product reason forces a change.
- No auto-push, no `--no-verify`, no skipped hooks.
