# XOTIJI — PROJECT CONTEXT FILE
Last updated: 2026-07-28 | Base repo: hatirla-base

> Read this file at the start of every session before making any changes.
> See also: [docs/VISION.md](docs/VISION.md) (long-term identity) and [docs/LAUNCH_V1.md](docs/LAUNCH_V1.md) (active sprint plan).

---

## CURRENT STATUS

- **Phase 1 (Compose / Package Flow) — DONE**
- **Phase 2 (Save / Return Loop) — DONE**
- **Phase 3 (User System) — DONE**
- **Launch V1 (5-week sprint) — ACTIVE.** See docs/LAUNCH_V1.md for week-by-week plan.

XOTIJI has real AI compose (OpenAI-generated itineraries persisted to Postgres), a save/return loop (My Trips), and a full auth system (JWT + bcrypt, packages linked to user accounts). The old Phase 4-7 roadmap (POST_BETA_ROADMAP.md, archived) has been replaced by Launch V1, a focused push toward a global Product Hunt launch.

---

## 1. IDENTITY

XOTIJI is an AI-native travel platform. The name derives from Zazaca for "Kendi Güneşi" (One's Own Sun). Manifesto: "Toward the Sun / Transfer the Signal / Be Your Own Sun."

XOTIJI is not a booking app or a search engine. It is a **decision engine** — it reduces cognitive load, understands user intent, and produces shareable, personalized travel experiences.

Current focus: **global**, not Turkey-outbound. English-primary with 6-language support (TR, EN, ES, DE, AR, PT planned — see docs/LAUNCH_V1.md Week 4). Long-term identity and scope are defined in docs/VISION.md.

---

## 2. STACK

| Layer | Technology | Host |
|---|---|---|
| Frontend | React + TypeScript + Vite | Vercel |
| Backend | Node.js + Express | Render |
| Database | Neon PostgreSQL (pg Pool, SSL) | Neon |
| AI — Image | fal.ai flux-pro/kontext | fal.ai |
| AI — Text | OpenAI gpt-4o-mini | OpenAI |
| Image storage | Cloudflare R2 (xotiji-shares, 24h TTL) | Cloudflare |
| Share pages | Cloudflare Worker (xotiji-share) | Cloudflare |
| DNS | Cloudflare | Cloudflare |
| Analytics | Google Analytics (G-C4BR4K86D9) | Google |
| eSIM affiliate | Breeze eSIM (sca_ref=10856377.PkjRGu7WRR) — being evaluated against Airalo, see LAUNCH_V1 | Breeze |

---

## 3. REPOSITORY STRUCTURE

Monorepo: hatirla-base
- apps/frontend — React/TS SPA
- apps/api — Node/Express backend
  - apps/api/index.js — server entry, mounts `./gateway` at `/api`
  - apps/api/gateway/index.js — request ID, language resolver, rate limiting, route mounting, error handler
  - apps/api/src/routes — ai.js, auth.js, data.js, user.js (mock stub, unmounted), proxy.js, share.routes.js
  - apps/api/controllers/ai/ai.controller.js — compose, packages, suggestions, face-swap handlers
  - apps/api/services/ai/ai.service.js — OpenAI calls (compose + suggestions) with deterministic fallback
  - apps/api/services/r2.service.js — Cloudflare R2 upload for Space Selfie
  - apps/api/data — faceSwapJob.repository.js, package.repository.js, user.repository.js (raw pg queries)
  - apps/api/middleware — auth.middleware.js (verifyJWT/optionalJWT), errorHandler.js, logger.js
  - apps/api/src/gateway/error.js — AppError + error codes
  - apps/api/src/validation — compose.schema.js (Zod)
  - apps/api/db — schema.sql + seed.js
- apps/frontend/src/App.tsx — SPA shell, `useState<page>` router (no router library), data hooks
- apps/frontend/src/i18n.ts — inline translations, `t(key)`, TR default / EN fallback
- apps/frontend/src/components/{layout,city,hotel,experience,ai,common,pages}/
- apps/frontend/src/hooks — useAI.ts, useAuth.ts, useCities.ts, useCityDetails.ts
- apps/frontend/src/MSZCore.ts — client-side AI interpretation layer (pre-compose scoring)
- docs/ — VISION.md, LAUNCH_V1.md, INSTRUCTIONS.md, archive/POST_BETA_ROADMAP.md

---

## 4. ACTIVE API ROUTES

All routes mount under /api via the gateway.
Gateway middleware: X-Request-Id, language resolution (tr/en/ar/es/de/ru → defaults tr), rate limiting (100 req/15min general, 50 AI, 300 status polling), centralized error handler → `{ success: false, error: { code, message } }`.

### Root
- GET / — health check
- GET /api/health — uptime, timestamp, NODE_ENV, resolved language

### Auth (/api/auth)
- POST /api/auth/register — bcrypt hash, creates user, returns JWT (7d expiry)
- POST /api/auth/login — verifies credentials, returns JWT

### Data (/api/data)
- GET /api/data/cities — distinct cities from hotels+experiences tables, with counts
- GET /api/data/hotels?city=&country= — hotels filtered, TR/EN translated by `req.lang`, ordered by rating DESC
- GET /api/data/experiences?city=&country= — same pattern as hotels

### AI (/api/ai)
- GET /api/ai — sanity check, lists available endpoints
- GET /api/ai/suggestions?lang= — top 5 hotels + top 8 experiences → gpt-4o-mini → 3 {title, description, score} suggestions. Deterministic fallback if OpenAI fails.
- POST /api/ai/compose — `optionalJWT` (attaches userId if token present). Validates with Zod, calls OpenAI gpt-4o-mini for a real day-by-day itinerary, persists to `packages` table. Deterministic fallback if OpenAI fails.
- GET /api/ai/packages — all packages (admin/debug)
- GET /api/ai/packages/:id — single package by id, used by My Trips reopen flow
- GET /api/ai/my-packages — `verifyJWT` required, packages owned by the authenticated user
- POST /api/ai/face-swap — accepts {photo: dataURI, cityId}, submits to fal.ai queue async, returns {jobId}
- GET /api/ai/face-swap/status/:jobId — polls fal.ai, on completion uploads to R2, returns {status, imageUrl, shareUrl}

### User (/api/user) — NOT MOUNTED
- `src/routes/user.js` is a hardcoded mock stub (`?email=mock@user.com`). Commented out in gateway/index.js. Superseded by /api/auth + /api/ai/my-packages. Candidate for deletion — not part of Launch V1 scope.

### Share
- GET /api/share/:id — validates id ([a-zA-Z0-9_-]{1,100}), serves OG HTML page for Space Selfie share

### Proxy
- GET /api/proxy-image?url= — proxies images from *.fal.media, *.fal.ai, *.storage.googleapis.com only

---

## 5. DATABASE TABLES

### Active tables (queried at runtime)
- **hotels** — id, name, name_tr, description, description_tr, city, country, rating, price_per_night, amenities, images, location
- **experiences** — id, title, title_tr, description, description_tr, city, country, category, rating, price, duration_hours, images, location
- **face_swap_jobs** — job_id, fal_request_id, status (processing/done/error), image_url, share_url, error, created_at. TTL cleanup every 10min, deletes rows older than 24h.
- **users** — id, email, password_hash, name, created_at. Queried by auth routes + optionalJWT/verifyJWT.
- **packages** — id, items, total_price, user_id (nullable, FK to users), currency, status, itinerary, language, created_at. Written by compose, read by packages/:id and my-packages.

### Schema exists but NOT active
- admin_users — no routes yet
- flights — no routes yet (planned Launch V1 Week 2, "flight search" panel in Trip Toolkit)
- referrals — no routes yet
- suggestions — no routes yet (persisting AI suggestions for analysis)
- ai_logs — no routes yet (logging all AI calls)

---

## 6. FRONTEND PAGES & COMPONENTS

SPA with `useState<page>` router in App.tsx (`"home"|"privacy"|"terms"|"contact"|"spaceSelfie"|"mytrips"|"auth"`), navigation via `handleNavigate(to)` passed as `onNavigate` prop. No URL routing except `?ref=spaceselfie`.

### Pages (apps/frontend/src/components/pages/)
- home (App.tsx root render, not a separate page file) — city list → hotel/experience selection → AI compose → eSIM CTA
- SpaceSelfie.tsx — full Space Selfie flow (upload → era selection → fal.ai → result → share)
- AuthPage.tsx — login/register UI, token stored in localStorage
- MyTrips.tsx — DB panel for logged-in users (via /api/ai/my-packages), localStorage panel for anonymous users
- PrivacyPolicy.tsx, TermsOfService.tsx, Contact.tsx — static bilingual pages
- CinematicIntro.tsx, CinematicSequence.tsx — first-visit intro animation

### Key components
- layout/HeroSection.tsx, layout/Header.tsx, layout/Footer.tsx
- city/CityList.tsx, city/CityCard.tsx
- hotel/HotelList.tsx, hotel/HotelCard.tsx
- experience/ExperienceList.tsx, experience/ExperienceCard.tsx
- ai/AIPackageModal.tsx — displays composed package + AI/MSZ comment
- ai/AILoadingIndicator.tsx — spinner during compose
- common/Modal.tsx, common/PWAInstallBanner.tsx
- CookieConsent.tsx, LanguageSwitcher.tsx, ErrorBoundary.tsx

### MSZCore.ts
Client-side singleton. `analyzeBeforeCompose(items)` scores selection (hotels×0.4 + experiences×0.4 + count×0.2) and returns a short i18n string shown in AIPackageModal as `mszComment` when the API doesn't return `aiComment`.

---

## 7. WHAT AI CURRENTLY DOES

### A. Travel Suggestions (GET /api/ai/suggestions)
Queries top 5 hotels + top 8 experiences from DB. Builds prompt. Calls gpt-4o-mini. Returns 3 {title, description, score} objects. Deterministic fallback if OpenAI fails.

### B. Package Compose (POST /api/ai/compose)
Validates input (Zod), calls OpenAI gpt-4o-mini for a real day-by-day itinerary, calculates total price, persists to `packages` table (linked to `user_id` if authenticated via optionalJWT). Deterministic fallback if OpenAI fails.

### C. Space Selfie / Face Swap
Accepts {photo: dataURI, cityId}. 16 scenes (8 cities + 8 time stops), 3 prompt variants each (48 total). Submits to fal-ai/flux-pro/kontext queue async. Polls status. On completion: uploads to R2, persists shareUrl = xotiji.app/s/{shareId}. Share buttons: Save, Instagram, TikTok, X, WhatsApp.

### D. MSZ Lite (client-side only)
`analyzeBeforeCompose` scores selection 0–1, returns one of 3 i18n strings. Not an API call.

---

## 8. SPACE SELFIE — 8 TIME STOPS

Stone Age → Ancient World → Medieval → 1920s → Present (2026) → Future (2200) → Alien World → End of Time

---

## 9. CURRENT CITIES (8, expanding to 30 in Launch V1 Week 5)

Istanbul, Paris, Rome, Barcelona, Berlin, Dubai, Tokyo, London — already a global mix, not Turkey-centric. Week 5 expands to a broader global set (Rio, NYC, Bangkok, Bali, etc.) per docs/LAUNCH_V1.md.

---

## 10. COMPLETED FEATURES

- Space Selfie (fal.ai async polling, PostgreSQL job storage, 24h TTL)
- Share infrastructure (R2 bucket, shares.xotiji.app custom domain, Cloudflare Worker, OG meta tags)
- Watermark system (proxy endpoint bakes xotiji.app watermark into downloaded images)
- City / Hotel / Experience flow
- AI suggestions with fallback
- AI compose — real OpenAI itinerary, persisted to Postgres
- Save / Return loop — My Trips (localStorage for anonymous, DB for logged-in)
- User system — JWT auth (register/login), bcrypt, packages linked to userId
- MSZ Lite client-side scoring
- eSIM affiliate CTA (Breeze)
- Google Analytics (custom events: teleport_start, teleport_complete, space_selfie_start, space_selfie_complete, share_click)
- i18n TR/EN with language switcher
- Cinematic intro
- Cookie consent banner (bilingual)
- PWA support with sun icon
- SEO: meta tags, robots.txt, sitemap.xml, og-image.png, Google Search Console
- Legal pages: Privacy Policy, Terms of Service, Contact
- Mobile responsive

---

## 11. LAUNCH V1 — ACTIVE PLAN

Full week-by-week plan: **docs/LAUNCH_V1.md**
Long-term vision beyond v1: **docs/VISION.md**
Working rules for this repo: **docs/INSTRUCTIONS.md**

Summary: 5-week sprint targeting a Product Hunt launch (Week 5, Tuesday 10:01 TR time). Adds real affiliate monetization (GetYourGuide, Booking.com, Airalo eSIM, SafetyWing, Kiwi.com), a single-page Trip Toolkit result, chat-first input, English SEO landing pages, and 5 new languages (ES, DE, AR, PT + existing TR/EN). Target: $500-1500/month post-launch.

Old Phase 4-7 roadmap (Share & Growth, Data & Logging, Content Expansion, MSZ Pro, Global Scale) is archived at docs/archive/POST_BETA_ROADMAP.md — superseded by Launch V1, but its later phases (ai_logs, referrals, flights) may resurface as backlog after v1 ships.

---

## 12. CODING PRINCIPLES

- CommonJS throughout backend (no ESM syntax in .js files)
- Raw pg queries only — no Prisma, no ORM
- All env vars via process.env — no hardcoded secrets
- Unified error response: `{ success: false, error: { code, message } }`
- Controller → Service → Repository chain
- AI must have deterministic fallback — never block user flow
- Middleware (verifyJWT/optionalJWT) applied at route level, not controller level
- TypeScript strict mode in frontend, zero errors required — run `tsc --noEmit` before every push
- logger.ts in frontend — console.error only in DEV
- No new architecture layers or dependencies without discussion

Full working rules (prompt format, red flags, session checklist): **docs/INSTRUCTIONS.md**

---

## 13. ARCHITECTURE PRINCIPLES

- Core backend is locked — no unsolicited refactors
- No new external services without explicit decision
- Mobile-first always
- Space Selfie is the primary acquisition hook
- Compose flow → Trip Toolkit is the primary retention and monetization hook (Launch V1 Week 2)
- All shareable outputs must have watermark
- Affiliate links must be contextual, not intrusive (see docs/LAUNCH_V1.md)

---

## 14. PRODUCT CONSTRAINTS

- NOT a full OTA — no complex booking UI
- AI must not block flows — always fallback
- No paid ads pre-launch — growth via shareability + SEO
- Global scope, English-primary — see docs/VISION.md for what's in/out of v1
- eSIM/insurance/activity affiliate links are contextual monetization, not a side feature

---

## 15. HOW TO USE THIS FILE

At the start of every Claude/AI session:
1. Read this file, docs/LAUNCH_V1.md, and docs/INSTRUCTIONS.md
2. Do not assume anything not written here
3. Do not suggest changes to core backend architecture
4. Ask before adding new dependencies
5. Always run `tsc --noEmit` before pushing — zero errors required
6. Update this file's Definition of Done for any deliverable that changes routes, tables, or pages
