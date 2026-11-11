# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Thai beetle keepers, split roughly evenly between two groups: newcomers/beginners who need approachable, non-intimidating guidance, and serious collectors/breeders who need precise per-animal record-keeping (bloodlines, measurements, lineage) and fast access to detailed data. Neither group should feel the app is designed around the other. Launch market is Thailand first, with the brand deliberately built for an international audience as it grows ("Born from Thailand. Built for Beetle Keepers Worldwide.").

## Product Purpose

กว่าง (KWANG) is a community website for Thai beetle keepers, confirmed as the explicit direction on 2026-11-11 ("เว็ปนี้จะเป็น Community สำหรับคนเลี้ยงด้วง"). The site has five pillars, one of which is the beetle-recording app this repo was originally built around:

1. **กว่าง (KWANG)** — the personal record-keeping tool: record animals individually from egg through adulthood (species, sex, stage, weight, size, lineage/bloodline, housing, photos, notes), with automatic care reminders from stage-specific intervals. This pillar is built and working (currently gated behind a "coming soon" page, see Operating Context).
2. **บทความ (Articles)** — care knowledge/technique content. Not built; placeholder only.
3. **กระดานถาม-ตอบ (Forum/Q&A)** — discussion board. Not built; placeholder only.
4. **ตลาดซื้อขาย (Marketplace)** — buy/sell/trade between keepers. Not built; placeholder only.
5. **กิจกรรม (Events)** — contests, meetups, keeper gatherings. Not built; placeholder only.

Success means a keeper trusts the site as the one place for their collection, their questions, their trades, and their community — not scattered across notebooks, spreadsheets, and Facebook groups.

## Positioning

The mechanism a notebook, spreadsheet, or Facebook group cannot replicate: individual per-animal timelines, a real discussion/knowledge space, and a marketplace, unified under one community brand instead of three disconnected tools glued together after the fact. (The user's own framing, confirmed during init and reconfirmed when the site was repositioned from "an app with a marketing page" to "a community with the app as one feature," 2026-11-11.)

## Operating Context

- Site structure: `index.html` is the public community landing page (describes all 5 pillars). `app.html` is currently a "coming soon" placeholder — the public is not yet let into the KWANG record-keeping tool. The fully working app is preserved at `app-beta.html` (unlisted URL) for the owner's own continued testing until relaunch.
- Currently a client-only PWA: data lives in the visitor's own browser (IndexedDB), no shared backend yet. This is Phase 1.
- Inside the KWANG app itself, "Beetle World" (news feed, leaderboard, auction) and "Shop" exist in the UI but run on seeded/mock data — not yet connected across real users. **Undecided/unreconciled:** the new top-level site pillars "กระดานถาม-ตอบ" (Forum) and "ตลาดซื้อขาย" (Marketplace) describe similar concepts to these in-app mock sections; whether Beetle World/Shop eventually move out to become the real site-level Forum/Marketplace, or stay nested inside the KWANG app as a separate thing, has not been decided — flag this before building real forum/marketplace functionality.
- Deployed publicly at both `kwang-app.pages.dev` and the custom domain `liangduang.com` (registered via Cloudflare Registrar, 2026-11-11) via Cloudflare Pages, auto-deploying from GitHub (`Kajeawwan69/kwang-app`) on push.
- กว่าง (KWANG) is a sub-site of the user's real beetle-selling business, TWIN BEETLE / ผู้บ่าวขายด้วง (`D:\ปก\store`) — same owner, shares its public social channels (see Brand Commitments). The codebases and product features still stay separate: KWANG is not a storefront for TWIN BEETLE's inventory, and TWIN BEETLE's store logic is out of scope here.

## Capabilities and Constraints

- Phase 1 (current, working): record/edit/delete individual beetles through the full lifecycle (ไข่ → L1–L3 → ดักแด้ → ตัวเต็มวัย), auto-computed care-due reminders, a weather/location card (Open-Meteo + BigDataCloud reverse geocoding, no API key needed), local JSON export/import backup, installable PWA.
- Mock / not yet real: inside the KWANG app, Beetle World's community feed, leaderboard, and auction system, and the Shop (catalog, cart, orders) — all seeded demo data, not wired to a shared backend.
- Not built at all yet (not even mock data): the site-level Articles, Forum, and Events pillars. They exist only as teaser cards on the landing page, each honestly tagged "เร็วๆ นี้" — no pages, content, or functionality behind them.
- Undecided: timeline and scope for a real backend (accounts, cross-device sync, a genuine shared community/marketplace) — discussed as a future phase, not committed.
- Revenue: free indefinitely. No monetization (ads, premium tiers, transaction fees) planned right now — confirmed during init, so no design decision should assume ad space or paywalls.

## Brand Commitments

- Name: **กว่าง (KWANG)** — the Thai word for the beetle itself, romanized; company is **ZOOTRONIA**.
- Tagline: "RAISE • RECORD • BREED • TRADE • CONNECT". Slogan: "Born from Thailand. Built for Beetle Keepers Worldwide."
- Visual identity already established and in production: green `#17a75a` + gold `#ffc61a` + ink `#10160f` palette, Kanit font throughout, Phosphor Icons, a dark premium gradient hero band on the public landing page.
- Thai is the primary interface language; English appears in brand copy, taglines, and bilingual landing-page sections (not a fully translated app).
- Social channels shown on the landing page footer (TWIN BEETLE's, per the sub-site relationship above): Facebook `PhuBaoKhaiDuangBeetles`, TikTok `@twinbeetle`, Instagram `twin.beetle`, YouTube `@PhuBaoKhaiDuangBeetles`.

## Evidence on Hand

- No real user data, testimonials, or usage stats exist yet. A previous landing-page draft had a fabricated stat strip and fake community posts/usernames presented as real — this was identified and removed (2026-11-11) precisely because it read as fabricated. Do not reintroduce invented stats, testimonials, or example usernames presented as if real.
- No real beetle photography on hand. The current UI uses a consistent line-art beetle icon as the placeholder wherever a photo is absent.

## Product Principles

1. One record, one timeline per animal — never a shared-notebook feel.
2. Serve the beginner and the serious collector equally; neither experience is the afterthought.
3. Record-keeping, community, and marketplace are one ecosystem, not three bolted-together tools.
4. Free and accessible first; no monetization pressure shapes the design right now.
5. Thai-first voice with a deliberate international on-ramp — bilingual brand moments, not full translation.
