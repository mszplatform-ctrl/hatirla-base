# XOTIJI — POST-BETA ROADMAP (v1)
Last updated: March 2026

## CURRENT STATE (BASELINE)
- Beta live ✅
- Space Selfie ✅
- AI suggestions ✅
- Compose = ❌ STUB (static response, no OpenAI call)
- Packages = ❌ in-memory (lost on restart)
- User system = ❌ not built
- Growth loop = ⚠️ weak

---

## PHASE 1 — COMPOSE / PACKAGE FLOW
**Goal:** Real AI itinerary + persistent package storage

**Tasks:**
- /api/ai/compose → real OpenAI call, generate day-by-day itinerary
- Prompt design for itinerary (days, activities, tips)
- Move packages from in-memory to PostgreSQL (packages table exists)
- GET /api/ai/packages/:id endpoint
- Basic validation + error handling

**Not now:** user auth, complex personalization, UI redesign

**Done when:** compose returns real data, package persists in DB after restart

---

## PHASE 2 — SAVE / RETURN LOOP
**Goal:** User can return to their package (retention starts)

**Tasks:**
- Save package (anonymous via localStorage + id is fine)
- Reopen package by id
- Basic "my trips" view
- Share → package link

**Not now:** full user profile, dashboard, social system

**Done when:** user can return and see their package

---

## PHASE 3 — USER SYSTEM (LIGHT)
**Goal:** User identity + persistence

**Tasks:**
- Activate users table with routes
- Simple auth (email or magic link)
- Link saved packages to user
- Link Space Selfie history to user

**Not now:** social feed, complex permissions, admin panel

**Done when:** user logs in, sees their history

---

## PHASE 4 — SHARE & GROWTH ENGINE
**Goal:** Viral loop

**Tasks:**
- Space Selfie share card improvement
- Package share link (trip identity)
- Referral system (ref param tracking)
- Expand analytics events
- Travel Reel Generator (optional but high impact)

**Not now:** paid ads, SEO deep optimization

**Done when:** user shares content, brings new users

---

## PHASE 5 — DATA & AI LOGGING
**Goal:** Measure what works

**Tasks:**
- Activate ai_logs table
- Activate suggestions table
- Log which prompts produce which results
- Basic dashboard

**Not now:** ML training pipeline, big data infra

**Done when:** AI behavior is measurable

---

## PHASE 6 — CONTENT EXPANSION
**Goal:** More cities, more experiences

**Tasks:**
- Expand cities (8 → 20+)
- Diversify experiences
- Activate flights table (basic)

**Not now:** full OTA, booking engine

**Done when:** user has more meaningful choices

---

## PHASE 7 — GLOBALIZATION
**Goal:** Global reach

**Tasks:**
- Expand i18n (ar, es, de, ru — gateway already supports 6 langs)
- Currency handling
- Regional pricing
- Localized suggestions

**Done when:** usable in multiple countries

---

## PHASE 8 — MSZ PRO
**Goal:** Real multi-agent AI layer

**Tasks:**
- Multi-agent orchestration
- Deeper personalization
- Private infra (Hetzner + Ollama — already planned)

**Not now:** DO NOT start before Phase 1–4 are complete

**Done when:** system is genuinely intelligent

---

## FINAL PRODUCT DEFINITION

XOTIJI is complete when:
- Space Selfie → acquisition hook (done)
- Compose → real AI itinerary (Phase 1)
- Packages → DB + save/resume (Phase 1-2)
- User → history + identity (Phase 3)
- Share → viral loop (Phase 4)
- AI → measurable + improving (Phase 5)
- Content → sufficient breadth (Phase 6)
- Global → multi-language (Phase 7)

---

## PRIORITY RULES

**Move UP:**
- Improves compose or retention
- Increases shareability
- Generates revenue
- Fixes something broken in production

**Move DOWN:**
- User-invisible
- Pure technical elegance
- Adds new architecture layer
- Early optimization

**Hard rule: Phase 1 must be complete before anything else starts.**
