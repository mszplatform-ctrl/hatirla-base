# XOTIJI — LAUNCH V1 (9-Week Sprint)
Last updated: 2026-08-17

> Active sprint plan. Supersedes the old Phase 4-7 roadmap (archived at docs/archive/POST_BETA_ROADMAP.md).
> Long-term identity: [VISION.md](VISION.md). Working rules: [INSTRUCTIONS.md](INSTRUCTIONS.md).

---

## GOAL

Ship a global, English-primary AI travel assistant with real affiliate monetization and launch it on Product Hunt.

- **Launch date:** Week 9 (late September 2026), Tuesday, 10:01 TR time.
  Extended from Week 5 to accommodate the 12-channel affiliate integration
  and quality bar for launch.
- **Target revenue:** $500–1500/month post-launch (stretch: $1–3K/month lifestyle
  target per founder's runway plan).
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
2. Trip Toolkit single-page experience (built in Week 4)
3. 6 languages day one of launch (built in Week 6)

---

## AFFILIATE CHANNELS

Launch V1 target: 12 active affiliate channels. 11 approved and link-ready,
1 (iVisa) pending review. Plus 10 Booking.com CJ regional programs in
approval pipeline.

### Active — link ready

| # | Channel      | Network        | Commission     | ID / Link marker                        | Notes |
|---|--------------|----------------|----------------|------------------------------------------|-------|
| 1 | GetYourGuide | Direct         | ~8%            | Partner ID `FKADAF3`                    | SEPA payment config escalated (Sanja, ticket 20506720) |
| 2 | SafetyWing   | Direct         | 10%            | Ambassador `26574648`                   | Travel insurance |
| 3 | Breeze eSIM  | Direct         | 20%            | `sca_ref=10856377.PkjRGu7WRR`           | Kept over Airalo (higher commission) |
| 4 | Aviasales    | Travelpayouts  | 40%            | `aviasales.tpx.li/wUELJcyH`             | Replaces Kiwi.com (40% vs 3%). `sub_id=xotiji_flight` |
| 5 | Klook        | Travelpayouts  | 2–5%           | `klook.tpx.li/1jnbuhqE`                 | Activities Asia. `sub_id=xotiji_activity_asia` |
| 6 | Welcome Pickups | Travelpayouts | 8–9%         | `tpx.li/yZiTB7Fw`                       | Airport transfer. `sub_id=xotiji_transfer` |
| 7 | Radical Storage | Travelpayouts | 8%           | `radicalstorage.tpx.li/PU6PL52z`        | Luggage storage. `sub_id=xotiji_luggage` |
| 8 | AirHelp      | Travelpayouts  | 15–16%         | `airhelp.tpx.li/bcGRwYRZ`               | **Deferred to v1.1**. `sub_id=xotiji_compensation` |
| 9 | DiscoverCars | Direct         | 70% base       | `discovercars.com/?a_aid=xotiji`        | 80% bonus tier pending (Ilina OOO until Aug 20). 365-day cookie |
| 10 | Booking.com Brazil | CJ Affiliate | ~4% stays  | `tkqlhce.com/click-101850450-17288448`  | Advertiser `7854073` |
| 11 | Booking.com LATAM  | CJ Affiliate | ~4% stays  | `jdoqocy.com/click-101850450-17288992`  | Advertiser `7864342` |

### Pending approval — build integration behind flag

- **10 Booking.com CJ regional programs**: APAC, Australia, BENELUX, CEE, DACH,
  France, Italy, MEA, North America, Spain & Portugal, UK. 1–14 day review.
  CJ Publisher ID `8033579`, Property ID `101850450`.
- **iVisa** (direct): 20% commission, 365-day cookie, first-click attribution.
  Pending review.

### Locked (waitlist) — Travelpayouts programs

Booking.com, DiscoverCars, Omio, 12Go, Trip.com, Viator, etc.
Require 3-month traffic proof — resurface post-launch on data reading day (Week 13).

### One-partner-per-category rule

Preserve decision engine identity (not aggregator positioning): one active
partner per category. Rail Europe and Ferryhopper deferred to v1.5 backlog.
Abracadabra NYC (CJ) declined — outside travel vertical.

Note: Booking.com approval (2–8 weeks) can outlast the sprint. For any pending
region, build the integration behind a flag/placeholder — do not block work
on approval landing.

---

## WEEK-BY-WEEK

### Week 0 — Doc sync & applications — DONE
- Docs trilogy synced.
- Affiliate applications submitted across 12 channels.
- Payoneer USD approved and configured across 5 platforms.

### Weeks 1–3 — Affiliate wiring (4 sub-deliverables)

Sequential, one deliverable per session, each with the show-diff-before-push gate.

- **Deliverable 1.1 — Foundation + GetYourGuide + Booking.com regional routing**
  - `apps/frontend/src/config/affiliates.ts` structure
  - GetYourGuide link builder (Partner ID `FKADAF3`)
  - Booking.com regional geo-routing (Brazil + LATAM active, 10 pending behind flag)
  - Integrate into first card component as proof
- **Deliverable 1.2 — Booking.com regional expansion** (as CJ approvals land)
- **Deliverable 1.3 — Aviasales + DiscoverCars cards** (with `sub_id` channel tracking)
- **Deliverable 1.4 — Remaining 5 partners**: Welcome Pickups, Radical Storage,
  Breeze eSIM, SafetyWing, iVisa (if approved by then)

### Week 4 — Trip Toolkit + header revamp

**Deliverables:**
- Compose result renders as a full-page Trip Toolkit: single scroll containing
  itinerary, hotels, activities, eSIM, insurance, flight search, share —
  replacing the current modal-based result view
- Header revamp: auth menu moved up/prominent, SEO title/description switched
  to English
- Flight search panel (Aviasales affiliate deep link)

**Acceptance criteria:** after compose, user lands on one scrollable page with
every monetization surface visible without opening a separate modal; header
shows working auth entry point; page `<title>`/meta description are in English.

**Must-have:** single-page Trip Toolkit layout, header auth menu.

### Week 5 — Chat-first input

**Deliverables:**
- Chat-style UI on the home page (`"3 days Rome, 2 people"` free-text style input)
- Frontend-side parser that maps free text into the existing compose request
  shape (city, days, party size) — backend compose endpoint and schema unchanged
- Fallback to the existing city/hotel/experience picker if parsing is ambiguous

**Acceptance criteria:** typing a natural-language trip request produces the
same compose result as manually selecting city/hotel/experience; ambiguous
input falls back gracefully, never a dead end.

**Must-have.** UI/parsing layer only — no backend NLP service, no new AI call.

### Week 6 — SEO + i18n expansion

**Deliverables:**
- 20–30 SEO landing pages in English (Astro static, route pattern
  `/trips/{city}-{days}-days`)
- Frontend i18n expanded to ES, DE, AR, PT (gateway already resolves these
  langs; frontend `i18n.ts` currently only implements tr/en)
- Currency detection (display prices in user's likely local currency,
  informational — not a payment feature)

**Acceptance criteria:** 20+ landing pages live and indexable; language switcher
offers all 6 languages with real translated content (not English fallback);
currency shown matches browser locale/geolocation on first load.

**Must-have:** landing pages, 6-language i18n. **Nice-to-have:** currency
detection can ship as a fixed-list dropdown if auto-detect slips.

### Week 7 — City expansion 8 → 30

**Deliverables:**
- Cities expanded 8 → 30, global mix (e.g. Rio, Tokyo, NYC, Paris, Dubai,
  Bangkok, Barcelona, Bali, Istanbul, and others spanning all continents
  except Antarctica)

**Acceptance criteria:** 30 cities have real hotel/experience seed data
(not placeholders).

### Week 8 — Launch materials + rehearsal

**Deliverables:**
- Product Hunt tagline, gallery, first comment, hunter outreach
- Full end-to-end rehearsal on staging
- Space Selfie load test

### Week 9 — LAUNCH

- **Tuesday, 10:01 TR time.**
- All 12 affiliate channels live (iVisa if approved by then, else placeholder).
- 30 cities, 6 languages.
- Product Hunt listing live and complete.

**Must-have, hard deadline.**

## CRITICAL PATH (must-have only, in order)

Week 0 docs/apps → Weeks 1–3 affiliate wiring (Deliverables 1.1 → 1.4) →
Week 4 Trip Toolkit → Week 5 chat input → Week 6 landing pages + 6-lang i18n
→ Week 7 city expansion → Week 8 rehearsal → Week 9 launch.

Anything marked nice-to-have above may slip a week or be cut without moving
the launch date. iVisa and remaining 10 Booking.com CJ regions are the most
likely candidates to slip past v1 given external approval timelines.

## NON-LAUNCH BACKLOG (must be done, but not launch-blocking)

- **Node.js 20 → 24 migration** — Vercel deprecation deadline: October 1, 2026.
  Must ship before launch if launch date > Oct 1; otherwise post-launch priority.
- **Payoneer EUR/GBP receiving accounts** — available to apply; needed if any
  affiliate insists on non-USD payout.
- **GetYourGuide SEPA payment** — waiting on Sanja escalation (ticket 20506720).
- **DiscoverCars 80% bonus tier** — Ilina Beskina follow-up when back from OOO (Aug 20).
- **Docs update: PROJECT_CONTEXT.md + LAUNCH_V1.md sync after every deliverable** (DoD rule).

---

## OUT OF SCOPE FOR v1

MSZ Devrilmez Sistemi, NFT, AI Influencer Network, Learn-to-Build, native mobile app, real group native, live flight tracking, Travel DNA, visa constraint engine. These are v2/v3 candidates — see VISION.md. Do not implement any of these during Launch V1 even if a prompt seems to invite it; flag it back to the user instead (see INSTRUCTIONS.md "red flags").

---

## WEEK 13 — DATA READING DAY (post-launch, ~4 weeks after Week 9 launch)

Not part of the 9-week build sprint — a scheduled checkpoint after launch has had time to generate real usage data.

**Deliverables:**
- Pull affiliate click/conversion data across all 5 channels
- Pull Product Hunt referral traffic vs. SEO landing page traffic vs. direct
- Identify which of the 30 cities and which languages are actually converting
- Decide v1.5 priorities based on real data, not assumption

This day feeds directly into VISION.md's v1.5 milestone ("post-launch data reading, affiliate conversion tuning, city/content expansion driven by real demand").
