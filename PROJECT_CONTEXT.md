# XOTIJI — PROJECT CONTEXT FILE
> Last updated: March 2026 | Base repo: hatirla-base
> This file is the single source of truth for product and system understanding.

## 1. Identity
- **Project name:** XOTIJI (xotiji.app)
- **Legacy name:** Hatırla / hatirla-base
- **Core identity:** AI-native travel platform
- **Primary entry hook:** Space Selfie (viral front door)
- **Long-term type:** Personalized AI travel assistant + discovery + content + monetization

## 2. Stack
- Frontend: React + TypeScript (Vercel) — apps/frontend
- Backend: Node.js + Express (Render) — apps/api
- Database: Neon PostgreSQL
- AI: fal.ai (flux-pro/kontext for Space Selfie), OpenAI gpt-4o-mini (AI suggestions)
- Storage: Cloudflare R2 (xotiji-shares bucket, 24h auto-delete)
- Share page: Cloudflare Worker (xotiji-share) → xotiji.app/s/:id
- i18n: Full TR/EN parity across all modules
- Monorepo: hatirla-base, branch: main

## 3. Core product loop
viral entry → curiosity → destination discovery → AI suggestions → package composition → shareable output → referral → return usage → personalization

## 4. MSZ Lite (AI interpretation layer)
MSZ Lite is a lightweight AI interpretation layer embedded inside the AI service layer.
- Input: city + hotel + experiences + limited user context
- Process: normalize → prompt → AI call (or deterministic fallback) → short insight
- Output: 1-2 sentence contextual interpretation shown in UI before/during compose
- Constraints: stateless, low latency, non-blocking, optional (system works without it)
- Location in code: ai.service.js / compose flow
- NOT a microservice, NOT a full agent system — an implicit enhancer layer

MSZ Pro (future): multi-agent, memory tree, user profiling, orchestrator, AI Analyst/Researcher/Vision

## 5. Beta positioning
Beta = viral + functional proof. Goal: validate that users come, create/share, engage with travel layer, return.

**What beta IS:** Space Selfie, lightweight AI content, invite-only, existing travel package flow as depth proof
**What beta IS NOT:** full OTA, multi-agent system, full monetization, heavy orchestration

## 6. Current completed features
- Space Selfie (fal.ai flux-pro/kontext, R2 upload, share page with OG tags)
- Share page: xotiji.app/s/:id via Cloudflare Worker
- City / hotel / experience discovery flow
- AI package composer (composePackage)
- MSZ Lite insight layer
- Mock recommendation layer
- eSIM affiliate (Breeze eSIM)
- Cookie consent banner (TR/EN)
- Full i18n TR/EN
- Privacy Policy / Terms / Contact pages
- Google Analytics
- Cinematic intro screen
- Cloudflare DNS + R2 custom domain (shares.xotiji.app)

## 7. Post-beta roadmap
- **Phase 1:** Telemetry + analytics, funnel measurement, retention
- **Phase 2:** Local preference engine, lightweight personalization
- **Phase 3:** Agent Registry + Orchestrator (only when justified by data)
- **Phase 4:** Monetization readiness (affiliate/redirect infrastructure, premium AI)
- **Phase 5:** Real travel API layer (flights, hotels, experiences)
- **Phase 6:** Full XOTIJI identity (personal travel assistant, local guide network, gamification)
- **Phase 7:** MSZ Pro (AI Analyst, Travel Researcher, Vision, memory tree)

## 8. Decision rule
If a feature improves virality, clarity, retention or monetization readiness → moves up.
If it is architecturally impressive but invisible to beta users → moves down.

## 9. Coding principles
- CommonJS throughout (no ESM in api)
- Raw pg queries (no Prisma — PrismaClient import in index.js is unused, safe to remove)
- Environment variables via process.env (never hardcode)
- Error handling centralized
- Rate limiting configured
- CORS locked down
- All endpoints currently open (auth middleware intentionally disabled for beta)

## 10. Known technical debt (non-blocking for beta)
- 6 dead route files in apps/api/routes/ (auth, reel, referral, share, users) — safe to delete post-beta
- PrismaClient imported but never used in index.js
- axios in frontend package.json but never imported
- No .env.example files
- console.log in production code (13 instances)
- /api/user is a hardcoded mock stub
- Package repository is in-memory (not persisted)

## 11. Architecture principles
- Core backend is LOCKED and must not be refactored without explicit instruction.
- ai.interface.js is the single entry point for all AI calls — do not bypass it.
- MSZ Lite is embedded and must remain lightweight (no heavy abstraction).
- Do not introduce new layers (orchestrators, agents, services) before real usage justifies it.
- Prefer simple, explicit flows over complex abstractions.
- The system must remain debuggable without AI.
- Do not suggest architectural changes unless directly asked.

## 12. Product constraints
- The product must remain minimal and mobile-first.
- Space Selfie is the primary entry — do not dilute it.
- Avoid adding features that do not directly improve virality, clarity, or shareability.
- Do not turn the product into a complex booking UI during beta.
- Every new feature must pass the decision rule in section 8.

## 13. AI usage philosophy
- AI should enhance decisions, not replace user control.
- Keep outputs short, clear, and actionable.
- Avoid long AI-generated texts in UI.
- Always provide deterministic fallback when AI fails.
- AI must not block core flows.

## 14. Growth model
Growth is driven by:
- shareable outputs (Space Selfie, reels)
- referral loops
- social visibility
- light gamification

Not driven by:
- paid ads
- SEO-heavy pages
- traditional funnels

The product should feel like content, not a tool.
