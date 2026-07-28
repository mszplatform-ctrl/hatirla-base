# XOTIJI — LAUNCH V1 (5-Week Sprint)
Last updated: 2026-07-28

> Active sprint plan. Supersedes the old Phase 4-7 roadmap (archived at docs/archive/POST_BETA_ROADMAP.md).
> Long-term identity: [VISION.md](VISION.md). Working rules: [INSTRUCTIONS.md](INSTRUCTIONS.md).

---

## GOAL

Ship a global, English-primary AI travel assistant with real affiliate monetization and launch it on Product Hunt.

- **Launch date:** Week 5, Tuesday, 10:01 TR time.
- **Target revenue:** $500–1500/month post-launch.
- **Scope:** global (not Turkey-outbound). Multi-language: TR, EN, ES, DE, AR, PT.

---

## BASELINE (already done, entering Launch V1)

- Real AI compose (OpenAI gpt-4o-mini itinerary, persisted to `packages` table)
- Save/Return loop (My Trips — localStorage anonymous, DB for logged-in)
- Full auth system (JWT + bcrypt, packages linked to `user_id`)
- Space Selfie viral hook (8 cities × 8 eras, fal.ai, R2 storage, share links)
- 8 cities live, already a global mix (Istanbul, Paris, Rome, Barcelona, Berlin, Dubai, Tokyo, London)
- TR/EN i18n

See PROJECT_CONTEXT.md for the full current-state inventory.

---

## THE 3 PERMANENT DIFFERENTIATORS (do not remove during this sprint)

1. Space Selfie viral hook
2. Trip Toolkit single-page experience (built in Week 2)
3. 6 languages day one of launch (built in Week 4)

---

## AFFILIATE CHANNELS

| Channel | Commission | Approval time | Product |
|---|---|---|---|
| GetYourGuide | ~8% | Instant | Experiences/activities |
| Booking.com | 25-40% of their commission | 2-8 weeks | Hotels |
| Airalo | 8-10% | 24-48h | eSIM |
| SafetyWing | 10% | 1-3 days | Travel insurance |
| Kiwi.com | 1-3% | 1-2 weeks | Flight search |

Booking.com approval (2-8 weeks) can outlast the sprint — apply Week 0, do not block Week 1 work on approval landing. Build the integration behind a flag/placeholder if approval hasn't landed by the time the deep-link work starts.

---

## WEEK-BY-WEEK

### Week 0 — Doc sync & applications (this task)
**Deliverables:**
- PROJECT_CONTEXT.md, VISION.md, LAUNCH_V1.md, INSTRUCTIONS.md in sync with repo reality
- POST_BETA_ROADMAP.md archived
- .claude/settings.local.json gitignored
- Affiliate applications submitted: GetYourGuide, Booking.com, Airalo, SafetyWing, Kiwi.com

**Acceptance criteria:** docs describe the repo as it actually is (no stale "STUB"/"Phase 4 NEXT" language), all 5 affiliate applications submitted.

**Must-have.**

---

### Week 1 — Affiliate wiring
**Deliverables:**
- GetYourGuide deep links on experience cards (contextual, city/experience-aware)
- Booking.com deep links on hotel cards (if approved; else placeholder behind flag)
- eSIM CTA made destination-aware with live price (replace static Breeze CTA or extend it with Airalo)
- SafetyWing insurance banner (contextual, not intrusive — see VISION.md "what XOTIJI is not")

**Acceptance criteria:** clicking a hotel/experience card affiliate link opens the correct destination-specific deep link; eSIM CTA shows a real price for the selected city; insurance banner appears without disrupting the compose flow.

**Must-have:** GetYourGuide links, eSIM CTA. **Nice-to-have:** Booking.com (gated on approval), SafetyWing banner can slip to Week 2 if needed.

---

### Week 2 — Trip Toolkit + header revamp
**Deliverables:**
- Compose result renders as a full-page Trip Toolkit: single scroll containing itinerary, hotels, activities, eSIM, insurance, flight search, share — replacing the current modal-based result view
- Header revamp: auth menu moved up/prominent, SEO title/description switched to English
- Flight search panel (Kiwi.com affiliate, can be a search-box deep link rather than embedded results)

**Acceptance criteria:** after compose, user lands on one scrollable page with every monetization surface visible without opening a separate modal; header shows working auth entry point; page `<title>`/meta description are in English.

**Must-have:** single-page Trip Toolkit layout, header auth menu. **Nice-to-have:** embedded flight results (a deep-link box is sufficient for v1).

---

### Week 3 — Chat-first input
**Deliverables:**
- Chat-style UI on the home page ("3 days Rome, 2 people" free-text style input)
- Frontend-side parser that maps free text into the existing compose request shape (city, days, party size) — backend compose endpoint and schema unchanged
- Fallback to the existing city/hotel/experience picker if parsing is ambiguous

**Acceptance criteria:** typing a natural-language trip request produces the same compose result as manually selecting city/hotel/experience; ambiguous input falls back gracefully, never a dead end.

**Must-have.** Note: this is a UI/parsing layer only — no backend NLP service, no new AI call. Parsing happens client-side or via existing compose validation.

---

### Week 4 — SEO + i18n expansion
**Deliverables:**
- 20-30 SEO landing pages in English (Astro static site, route pattern `/trips/{city}-{days}-days`)
- Frontend i18n expanded to ES, DE, AR, PT (gateway already resolves these langs; frontend i18n.ts currently only implements tr/en)
- Currency detection (display prices in user's likely local currency, informational — not a payment feature)

**Acceptance criteria:** 20+ landing pages live and indexable; language switcher offers all 6 languages with real translated content (not English fallback); currency shown matches browser locale/geolocation on first load.

**Must-have:** landing pages, 6-language i18n. **Nice-to-have:** currency detection can ship as a fixed-list dropdown if auto-detect slips.

---

### Week 5 — City expansion + launch
**Deliverables:**
- Cities expanded 8 → 30, global mix (e.g. Rio, Tokyo, NYC, Paris, Dubai, Bangkok, Barcelona, Bali, Istanbul, and others spanning all continents except Antarctica)
- Product Hunt launch materials (tagline, gallery, first comment, hunter outreach)
- **LAUNCH DAY: Tuesday, 10:01 TR time**

**Acceptance criteria:** 30 cities have real hotel/experience seed data (not placeholders); Product Hunt listing is live and complete at launch time.

**Must-have, hard deadline.**

---

## CRITICAL PATH (must-have only, in order)

Week 0 docs/apps → Week 1 GetYourGuide + eSIM → Week 2 Trip Toolkit → Week 3 chat input → Week 4 landing pages + 6-lang i18n → Week 5 city expansion + launch.

Anything marked nice-to-have above may slip a week or be cut without moving the launch date. Booking.com and embedded flight search are the most likely candidates to slip past v1 given external approval timelines.

---

## OUT OF SCOPE FOR v1

MSZ Devrilmez Sistemi, NFT, AI Influencer Network, Learn-to-Build, native mobile app, real group native, live flight tracking, Travel DNA, visa constraint engine. These are v2/v3 candidates — see VISION.md. Do not implement any of these during Launch V1 even if a prompt seems to invite it; flag it back to the user instead (see INSTRUCTIONS.md "red flags").

---

## WEEK 9 — DATA READING DAY (post-launch, ~4 weeks after Week 5)

Not part of the 5-week build sprint — a scheduled checkpoint after launch has had time to generate real usage data.

**Deliverables:**
- Pull affiliate click/conversion data across all 5 channels
- Pull Product Hunt referral traffic vs. SEO landing page traffic vs. direct
- Identify which of the 30 cities and which languages are actually converting
- Decide v1.5 priorities based on real data, not assumption

This day feeds directly into VISION.md's v1.5 milestone ("post-launch data reading, affiliate conversion tuning, city/content expansion driven by real demand").
