# XOTIJI — PROJECT CONTEXT FILE
Last updated: March 2026 | Base repo: hatirla-base

> Read this file at the start of every session before making any changes.

---

## 1. IDENTITY

XOTIJI is an AI-native travel platform. The name derives from Zazaca for "Kendi Güneşi" (One's Own Sun). Manifesto: "Toward the Sun / Transfer the Signal / Be Your Own Sun."

XOTIJI is not a booking app or a search engine. It is a **decision engine** — it reduces cognitive load, understands user intent, and produces shareable, personalized travel experiences.

Current state: **Beta launched.** Shared with friends and family. Core features active.

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
| eSIM affiliate | Breeze eSIM (sca_ref=10856377.PkjRGu7WRR) | Breeze |

---

## 3. REPOSITORY STRUCTURE

Monorepo: hatirla-base
- apps/frontend — React/TS SPA
- apps/api — Node/Express backend
- apps/api/db — schema.sql + seed.js
- apps/api/src/gateway — gateway index, error codes, middleware
- apps/api/src/controllers — ai.controller.js
- apps/api/src/services — ai.service.js, r2.service.js
- apps/api/src/repositories — faceSwapJob.repository.js, package.repository.js (in-memory)
- apps/api/src/routes — share.routes.js, proxy.js
- apps/api/middleware — errorHandler.js, logger.js, rateLimiter.js
- apps/frontend/src/components — all UI components
- apps/frontend/src/pages — SpaceSelfie.tsx, CinematicIntro.tsx, static pages
- apps/frontend/src/hooks — useAI.ts, useCities.ts, useCityDetails.ts
- apps/frontend/src/utils — logger.ts
- apps/frontend/src/MSZCore.ts — client-side AI interpretation layer

---

## 4. ACTIVE API ROUTES

All routes mount under /api via the gateway.
Gateway middleware: X-Request-Id, language resolution (tr/en/ar/es/de/ru → defaults tr), rate limiting (100 req/15min general, 50 AI, 300 polling), centralized error handler → { success: false, error: { code, message } }

### Root
- GET / — health check
- GET /api/health — uptime, timestamp, NODE_ENV, resolved language

### Data (/api/data)
- GET /api/data/cities — distinct cities from hotels+experiences tables, with counts
- GET /api/data/hotels?city=&lang= — hotels filtered by city, TR/EN translated, ordered by rating DESC
- GET /api/data/experiences?city=&lang= — same pattern as hotels

### AI (/api/ai)
- GET /api/ai — sanity check, lists available endpoints
- GET /api/ai/suggestions?lang= — top 5 hotels + top 8 experiences → gpt-4o-mini → 3 {title, description, score} suggestions. Deterministic fallback if OpenAI fails.
- POST /api/ai/compose — validates with Zod, calculates totalPrice, writes to in-memory package store. **STUB: itinerary is static, no OpenAI call here yet.**
- GET /api/ai/packages — returns all packages from in-memory store (wiped on restart)
- POST /api/ai/face-swap — accepts {photo: dataURI, cityId}, submits to fal.ai queue async, returns {jobId}
- GET /api/ai/face-swap/status/:jobId — polls fal.ai, on completion uploads to R2, returns {status, imageUrl, shareUrl}

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

### Schema exists but NOT active (Phase 2+)
- users — no routes yet
- admin_users — no routes yet
- flights — no routes yet
- referrals — no routes yet
- packages — no routes (compose uses in-memory store instead)
- suggestions — no routes yet
- ai_logs — no routes yet

---

## 6. FRONTEND PAGES & COMPONENTS

SPA with useState<page> router. No URL changes except ?ref=spaceselfie.

### Pages
- home — default, city list → hotel/experience selection → AI compose → eSIM CTA
- spaceSelfie — full Space Selfie flow (upload → era selection → fal.ai → result → share)
- privacy, terms, contact — static bilingual pages

### Key components
- CinematicIntro.tsx — first-visit typing animation ("XOTIJI. // toward the sun")
- HeroSection.tsx — hero with Space Selfie CTA
- CityList.tsx / CityCard.tsx — city grid
- HotelList.tsx / HotelCard.tsx — hotel selection with checkboxes
- ExperienceList.tsx / ExperienceCard.tsx — experience selection
- AIPackageModal.tsx — displays composed package + MSZ comment
- AILoadingIndicator.tsx — spinner during compose
- SpaceSelfie.tsx (855 lines) — full Space Selfie feature
- CookieConsent.tsx — bilingual cookie banner
- LanguageSwitcher.tsx — TR/EN toggle, persists to localStorage
- ErrorBoundary.tsx — React error boundary
- PWAInstallBanner.tsx — "Add to Home Screen" prompt

### MSZCore.ts
Client-side singleton. analyzeBeforeCompose(items) scores selection (hotels×0.4 + experiences×0.4 + count×0.2) and returns short i18n string shown in AIPackageModal as mszComment when API doesn't return aiComment (which currently never happens — compose is a stub).

---

## 7. WHAT AI CURRENTLY DOES

### A. Travel Suggestions (GET /api/ai/suggestions)
Queries top 5 hotels + top 8 experiences from DB. Builds prompt. Calls gpt-4o-mini. Returns 3 {title, description, score} objects. Has deterministic fallback.

### B. Package Compose (POST /api/ai/compose)
**STUB.** Validates input, calculates price, saves to in-memory store. Returns static itinerary placeholder "Hazırlanıyor...". No OpenAI call. Packages lost on server restart.

### C. Space Selfie / Face Swap
Accepts {photo: dataURI, cityId}. 16 scenes (8 cities + 8 time stops), 3 prompt variants each (48 total). Submits to fal-ai/flux-pro/kontext queue async. Polls status. On completion: uploads to R2, persists shareUrl = xotiji.app/s/{shareId}. Share buttons: Save, Instagram, TikTok, X, WhatsApp.

### D. MSZ Lite (client-side only)
analyzeBeforeCompose scores selection 0–1, returns one of 3 i18n strings. Not an API call.

---

## 8. SPACE SELFIE — 8 TIME STOPS

Stone Age → Ancient World → Medieval → 1920s → Present (2026) → Future (2200) → Alien World → End of Time

---

## 9. COMPLETED FEATURES (BETA)

- Space Selfie (fal.ai async polling, PostgreSQL job storage, 24h TTL)
- Share infrastructure (R2 bucket, shares.xotiji.app custom domain, Cloudflare Worker, OG meta tags)
- Watermark system (proxy endpoint bakes xotiji.app watermark into downloaded images)
- City / Hotel / Experience flow
- AI suggestions with fallback
- AI compose (stub — needs real OpenAI integration)
- MSZ Lite client-side scoring
- eSIM affiliate CTA (Breeze)
- Google Analytics (6 custom events: teleport_start, teleport_complete, space_selfie_start, space_selfie_complete, share_click, teleport_start)
- i18n TR/EN with language switcher
- Cinematic intro
- Cookie consent banner (bilingual)
- PWA support with sun icon
- SEO: meta tags, robots.txt, sitemap.xml, og-image.png, Google Search Console
- Legal pages: Privacy Policy, Terms of Service, Contact
- Mobile responsive
- ?ref=spaceselfie auto-opens Space Selfie after intro
- Technical debt cleanup: 18 issues resolved (ESM/CJS fix, XSS patch, AppError fix, PrismaClient removed, mock stubs disabled, Tailwind removed, MagicMirror.tsx deleted, dead routes deleted, axios removed, logger utility added, DB TTL aligned to 24h, .env.example files created)

---

## 10. POST-BETA ROADMAP

### Phase 1 — Compose / Package Flow (NEXT)
- Make /api/ai/compose real: add OpenAI call, generate actual itinerary (days, activities, tips)
- Move packages from in-memory to DB (packages table exists)
- Save / Resume — user can save a package and return to it
- eSIM contextual trigger — auto-offer when destination is international

### Phase 2 — User System
- Auth (users table exists, no routes yet)
- Profile with saved packages and Space Selfie history
- Return user experience

### Phase 3 — Share & Growth
- Space Selfie → share card / trip identity
- Travel Reel Generator
- Referral system (referrals table exists)
- Contest / badge system

### Phase 4 — Data & Logging
- ai_logs table active — track all AI calls
- suggestions table active — persist and analyze suggestions
- Analytics dashboarding

### Phase 5 — Expand Content
- More cities (currently 8)
- Flight data (flights table exists)
- Local guide content

### Phase 6 — MSZ Pro
- Multi-agent orchestration (deferred, infrastructure phase)
- Hetzner VPS + Ollama + n8n (deferred)

### Phase 7 — Global Scale
- Additional languages (ar, es, de, ru — gateway supports 6, frontend only TR/EN)
- Regional pricing
- Performance optimization

---

## 11. CODING PRINCIPLES

- CommonJS throughout backend (no ESM syntax in .js files)
- Raw pg queries only — no Prisma, no ORM
- All env vars via process.env — no hardcoded secrets
- Unified error response: { success: false, error: { code, message } }
- Controller → Service → Repository chain
- AI must have deterministic fallback — never block user flow
- Auth is disabled for beta — no user sessions
- TypeScript strict mode in frontend, zero errors required
- logger.ts in frontend — console.error only in DEV
- No new architecture layers without discussion

---

## 12. ARCHITECTURE PRINCIPLES

- Core backend is locked — no unsolicited refactors
- ai.interface.js (or equivalent) is the single AI entry point
- No new external services without explicit decision
- Mobile-first always
- Space Selfie is the primary acquisition hook
- Compose flow is the primary retention and monetization hook
- All shareable outputs must have watermark
- packages table is the target for compose persistence (currently in-memory)

---

## 13. PRODUCT CONSTRAINTS

- NOT a full OTA — no complex booking UI
- AI must not block flows — always fallback
- No paid ads — growth via shareability only
- Beta = invite only, no public launch until Phase 1 compose is real
- eSIM is contextual monetization, not a side feature

---

## 14. DECISION RULES

Move UP in priority if it:
- Increases virality or shareability
- Makes a stub real (especially compose)
- Adds retention (save/return)
- Generates affiliate revenue (eSIM contextual)
- Fixes something broken in production

Move DOWN in priority if it:
- Is invisible to users
- Adds new architecture without product justification
- Requires new external service not already integrated
- Is a "nice to have" without clear user impact

---

## 15. HOW TO USE THIS FILE

At the start of every Claude/AI session:
1. Read this file completely
2. Do not assume anything not written here
3. Do not suggest changes to core backend architecture
4. Ask before adding new dependencies
5. TypeScript must pass with zero errors before every push
6. Always run tsc --noEmit before pushing
