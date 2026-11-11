# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Thai beetle keepers, split roughly evenly between two groups: newcomers/beginners who need approachable, non-intimidating guidance, and serious collectors/breeders who need precise per-animal record-keeping (bloodlines, measurements, lineage) and fast access to detailed data. Neither group should feel the app is designed around the other. Launch market is Thailand first, with the brand deliberately built for an international audience as it grows ("Born from Thailand. Built for Beetle Keepers Worldwide.").

## Product Purpose

KWANG lets a beetle keeper record their animals individually from egg through adulthood (species, sex, stage, weight, size, lineage/bloodline, housing, photos, notes), tracks care reminders automatically from stage-specific intervals, and brings record-keeping, a community (news feed, leaderboards), and a marketplace (shop, auctions) together in one app instead of scattered across notebooks, spreadsheets, and Facebook groups. Success means a keeper trusts KWANG as the one place to track their collection and finds other keepers and listings there too.

## Positioning

The mechanism a notebook, spreadsheet, or Facebook group cannot replicate: individual per-animal timelines, community stats/leaderboards, and a marketplace, unified in one app and one data model — not three disconnected tools glued together after the fact. (The user's own framing, confirmed during init.)

## Operating Context

- Currently a client-only PWA: data lives in the visitor's own browser (IndexedDB), no shared backend yet. This is Phase 1.
- Community features (Beetle World: news feed, leaderboard, auction) and the Shop exist in the UI but run on seeded/mock data this phase — not yet connected across real users.
- Deployed publicly at kwang-app.pages.dev via Cloudflare Pages, auto-deploying from GitHub (`Kajeawwan69/kwang-app`) on push.
- A separate, unrelated real e-commerce project (`D:\ปก\store`, brand "ผู้บ่าวขายด้วง / TWIN BEETLE") is the user's actual beetle-selling business. It is explicitly out of scope for KWANG — KWANG stays the beetle-keeping community app, not a storefront for that business, even though both are beetle-related and share the user as owner.

## Capabilities and Constraints

- Phase 1 (current, working): record/edit/delete individual beetles through the full lifecycle (ไข่ → L1–L3 → ดักแด้ → ตัวเต็มวัย), auto-computed care-due reminders, a weather/location card (Open-Meteo + BigDataCloud reverse geocoding, no API key needed), local JSON export/import backup, installable PWA.
- Mock / not yet real: Beetle World's community feed, leaderboard, and auction system; the Shop (catalog, cart, orders). All seeded demo data — explicitly not wired to a shared backend yet.
- Undecided: timeline and scope for a real backend (accounts, cross-device sync, a genuine shared community/marketplace) — discussed as a future phase, not committed.
- Revenue: free indefinitely. No monetization (ads, premium tiers, transaction fees) planned right now — confirmed during init, so no design decision should assume ad space or paywalls.

## Brand Commitments

- Name: **กว่าง (KWANG)** — the Thai word for the beetle itself, romanized; company is **ZOOTRONIA**.
- Tagline: "RAISE • RECORD • BREED • TRADE • CONNECT". Slogan: "Born from Thailand. Built for Beetle Keepers Worldwide."
- Visual identity already established and in production: green `#17a75a` + gold `#ffc61a` + ink `#10160f` palette, Kanit font throughout, Phosphor Icons, a dark premium gradient hero band on the public landing page.
- Thai is the primary interface language; English appears in brand copy, taglines, and bilingual landing-page sections (not a fully translated app).

## Evidence on Hand

- No real user data, testimonials, or usage stats exist yet. The landing page's stat strip (e.g. "[1,240] ผู้เลี้ยงที่ใช้งาน") is explicitly bracketed placeholder copy, not real — must not be treated as evidence, quoted as fact, or carried forward as if real.
- No real beetle photography on hand. The current UI uses a consistent line-art beetle icon as the placeholder wherever a photo is absent.

## Product Principles

1. One record, one timeline per animal — never a shared-notebook feel.
2. Serve the beginner and the serious collector equally; neither experience is the afterthought.
3. Record-keeping, community, and marketplace are one ecosystem, not three bolted-together tools.
4. Free and accessible first; no monetization pressure shapes the design right now.
5. Thai-first voice with a deliberate international on-ramp — bilingual brand moments, not full translation.
