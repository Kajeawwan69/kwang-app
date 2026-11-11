---
name: กว่าง (KWANG)
description: Global Beetle Community & Marketplace by ZOOTRONIA
colors:
  fresh-leaf-green: "#17a75a"
  fresh-leaf-green-100: "#eafaf0"
  fresh-leaf-green-200: "#c8f2da"
  fresh-leaf-green-300: "#9ae8bd"
  fresh-leaf-green-400: "#62dc99"
  fresh-leaf-green-600: "#14874a"
  fresh-leaf-green-700: "#0e5c33"
  fresh-leaf-green-soft: "#eef8f1"
  beetle-wing-amber: "#ffc61a"
  beetle-wing-amber-500: "#f0b400"
  beetle-wing-amber-600: "#c98f00"
  beetle-wing-amber-700: "#9a6f00"
  beetle-wing-amber-tint: "#fff3c4"
  beetle-wing-amber-text: "#6d4f00"
  ink: "#10160f"
  ink-text: "#ffffff"
  ink-muted: "#9fb2a5"
  bg: "#f6f8f3"
  surface: "#ffffff"
  surface-2: "#f2f7ec"
  surface-2b: "#e9f0e2"
  text: "#10160f"
  text-2: "#23302a"
  text-3: "#2f3f36"
  muted: "#45564c"
  muted-2: "#62736a"
  muted-3: "#77877d"
  line: "rgba(18,48,28,0.16)"
  line-soft: "rgba(18,48,28,0.12)"
  danger: "#c0392b"
  danger-soft: "#fbe5de"
typography:
  heading:
    fontFamily: "Kanit, system-ui, sans-serif"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "Kanit, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  numeral:
    fontFamily: "Kanit, system-ui, sans-serif"
    fontFeature: "tnum"
    letterSpacing: "-0.01em"
rounded:
  sm: "9px"
  md: "13px"
  lg: "15px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "9px"
  md: "14px"
  lg: "20px"
components:
  button-primary:
    backgroundColor: "{colors.fresh-leaf-green}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.fresh-leaf-green-600}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.sm}"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "15px"
  pill-stage-adult:
    backgroundColor: "{colors.fresh-leaf-green}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
  pill-stage-larva:
    backgroundColor: "{colors.beetle-wing-amber}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
---

# Design System: กว่าง (KWANG)

## Overview

**Creative North Star: "สมุดบันทึกผู้เพาะยามค่ำคืน" (The Keeper's Night Ledger)**

Beetle keeping happens after dark — checking on larvae, weighing a grub under a desk lamp, watching a stag beetle finally emerge. KWANG's system carries that nocturnal-collector mood as a *named metaphor*, not a literal dark theme: the product surface itself stays bright, warm, and welcoming, true to the confirmed brief ("สดใส มิตรกับทุกคน เข้าถึงง่าย" — bright, friendly to everyone, approachable). The "night ledger" shows up instead as deliberate ink-black-and-amber bands — the stat strip, the hero, the leaderboard trophy card — pressed into an otherwise light, paper-like world. Those dark bands are the lamp glow in an otherwise sunlit room, not the room itself.

The palette does double duty as literal beetle anatomy: **Fresh Leaf Green** is the forest the keeper collects in; **Beetle Wing Amber** is lifted straight from a rhinoceros beetle's elytra catching the light. Components feel soft and social — closer to a messaging app than a spreadsheet — because the audience splits evenly between first-time keepers who must never feel intimidated and serious breeders who live in this app daily. Typography stays to a single family (Kanit) at a disciplined two weights; the system earns its personality from color and the ink/amber contrast, not from typographic noise.

**Key Characteristics:**
- One typeface, two weights — regular for reading, medium (never bold) for emphasis
- Light, paper-bright surfaces everywhere except deliberate ink+amber accent bands
- Flat at rest; a soft lift is the *only* signal of interactivity, never present passively
- Amber is a spotlight, not a wash — it marks the one thing that matters on a card, never floods a surface
- Rounded, friendly geometry throughout; no sharp corners, no hard edges

## Colors

A light, green-tinted paper ground carries the everyday screens; a near-black "ink" ground with a single amber accent carries the handful of moments that deserve weight (stats, the hero, leaderboard rank).

### Primary
- **Fresh Leaf Green** (`#17a75a`): the one accent on everyday surfaces — primary buttons, links, active nav state, the "adult" stage badge, focus rings. Confirmed descriptive name, chosen with the user.

### Secondary
- **Beetle Wing Amber** (`#ffc61a`): reserved for the ink-ground bands and for marking the single most important value on a card (due-today card, rank #1, FAB "add"). Confirmed descriptive name — the color is lifted directly from a rhinoceros beetle's elytra.

### Neutral
- **Ink** (`#10160f`): the "night" ground — stat band, hero band, sidebar-on-desktop wash, leaderboard trophy card. Also doubles as primary body text color on light surfaces.
- **Paper** (`#f6f8f3` bg / `#ffffff` surface / `#f2f7ec` surface-2): the everyday ground. A radial green-and-amber wash (`rgba(23,167,90,.10)` top-left, `rgba(255,198,26,.16)` top-right, both to transparent) sits behind every page — the only place color touches the paper ground outside components.
- **Text ramp** (`#10160f` → `#23302a` → `#2f3f36` → `#45564c` → `#62736a` → `#77877d`): darkest for headings down to lightest for timestamps/footnotes, six steps, no jumps.
- **Line** (`rgba(18,48,28,.16)` / `.12` soft variant): every border and divider — always this green-tinted black, never pure gray.
- **Danger** (`#c0392b` / `#fbe5de` soft): delete actions and out-of-stock states only.

### Named Rules
**The Lamp-Not-The-Room Rule.** Ink-ground (dark) sections exist only where a page genuinely needs a moment of weight — a stat band, the public hero, a leaderboard's trophy card. They are never the default background of a screen. If a new surface reaches for the ink ground to feel "premium," that's the wrong tool; reach for amber accenting on the light ground instead.

**The Spotlight Rule.** Amber marks exactly one thing per card or band: the due-today bell, the FAB, rank #1, the "L3" stage badge's text-on-dark. It never becomes a background fill across more than a badge or a 2px bottom border.

## Typography

**Display Font:** Kanit (with system-ui, -apple-system, "Segoe UI", sans-serif fallback)
**Body Font:** Kanit (same stack)

**Character:** One typeface for everything, Thai and Latin both — it reads as considered rather than default precisely because there's no second face to blame a mismatch on. Weight tops out at 500; nothing in the system is bold.

### Hierarchy
- **Heading / h1** (500, 1.35rem, letter-spacing -0.005em): page titles.
- **Section heading / h2** (400, 1rem, muted `--text-3`): card and section labels — deliberately *not* bolder than body text; hierarchy comes from the muted color and the surrounding card, not weight.
- **Body** (400, 16px, line-height 1.6): default reading size everywhere, including form inputs — never smaller than 16px in an input, or mobile browsers auto-zoom on focus.
- **Micro-label** (11px, letter-spacing 0.1em, uppercase-style tracking, `--muted`): the green-rule-prefixed group labels in forms ("ข้อมูลตัวสัตว์", "การวัด").
- **Numeral** (`font-variant-numeric: tabular-nums`, letter-spacing -0.01em): every stat, price, and measurement — the `.num` utility class, applied without exception so columns of numbers align.

### Named Rules
**The One Face Rule.** Kanit is the only typeface in the system, display and body alike. A second face is never the fix for a hierarchy problem — color, size, and the green micro-rule prefix are.

## Layout

Mobile is the primary surface: a fixed bottom tab bar (5 slots, the center "add" action raised into a circular FAB) with content scrolling beneath it, `16px` side padding, `max-width: 1160px` centered. At `900px` and above the shell becomes a `224px` fixed left sidebar plus a fluid content column (`#app { grid-template-columns: 224px 1fr }`); the bottom tab bar and FAB disappear entirely rather than persisting alongside the sidebar. Content density stays dense-but-breathable: card padding `15-16px`, section gaps `12-14px`, form field gaps `12px`. A secondary floating icon button (the shop shortcut) sits fixed in a screen corner on mobile only, sized to clear any primary action underneath it.

Grids reflow by content type, not by a single global breakpoint: product and auction cards use `repeat(auto-fill, minmax(...))` so card count adapts to width; data-dense views (the beetle list) swap from stacked rows on mobile to a true table on desktop at the same `900px` line as the shell.

## Elevation & Depth

Flat at rest, lifted only on interaction — confirmed directly with the user. Nothing carries a resting shadow except the handful of ink-ground bands, whose shadow reads as weight rather than hover state. A card or row's shadow is the *only* signal, besides the cursor, that it is interactive; a non-interactive card never gets the hover treatment.

### Shadow Vocabulary
- **Hairline** (`0 1px 2px rgba(16,22,15,.04)`): resting state for every card, row, and table container. Barely there — it separates from the paper ground without implying interactivity.
- **Lift** (`0 10px 24px rgba(16,22,15,.10)` + `translateY(-1px)` to `-2px`): hover state for any clickable card or row (beetle rows, product cards, auction cards). The only shadow that changes on interaction.
- **Weight** (`0 8px 20px rgba(16,22,15,.22-.26)`): resting shadow reserved for the FAB and the ink-ground bands — the exception to flat-at-rest, because these are the system's deliberate "lamp" moments.
- **Overlay** (`0 18px 44px rgba(16,22,15,.28)`): modal dialogs only.

### Named Rules
**The Flat-At-Rest Rule.** Shadows appear only as a response to hover/focus, or on the small set of elements that are always-raised by design (FAB, ink bands, modals). A static card never ships with a resting lift shadow.

## Shapes

Rounded and friendly throughout; nothing in the system has a sharp corner. Cards and rows: `13px`. Small buttons and nav items: `9px`. Larger surfaces — the stat band, hero imagery, the modal dialog: `14-15px`. Badges, chips, and the FAB: fully round (`999px` / circular). Borders are a single hairline (`1px solid var(--line)`) in the green-tinted neutral, never a heavier accent border on a rounded element — a thick accent border fights a rounded corner instead of framing it.

## Components

### Buttons
- **Shape:** `9px` radius (`11px` for the full-width `.btn.block` variant), `10px 16px` padding.
- **Primary:** Fresh Leaf Green fill, white text; hover deepens to `#14874a`.
- **Ink:** solid ink fill, white text — used for secondary-but-prominent actions (cart icon, role toggles when selected).
- **Ghost / default:** white surface, hairline border, text-colored label; hover border shifts to green.
- **Gold:** amber fill, ink text — reserved for the single highest-urgency action on a card (place a bid, add to cart from a product sheet).
- **Press state:** every button nudges `translateY(1px)` on `:active` — the one motion cue the whole system allows itself.

### Chips
- **Style:** white surface, hairline border, `9-999px` radius depending on context (filter chips vs. picker pills).
- **Selected state:** solid ink fill, white text, a small `0 2px 6px rgba(16,22,15,.16)` lift — used for stage filters, sex/origin pickers in the add form, and world/shop tab switches.

### Stage & Status Badges
- **Style:** fully round pill, `4px 9px` padding, `.68-.75rem` text.
- **Color-coded by meaning:** egg (`#c3d2c6` on ink text), larva stages climb from pale amber to `beetle-wing-amber-600` as they mature, pupa is `fresh-leaf-green-400`, adult is the full Fresh Leaf Green with white text — the badge color itself narrates life-stage progress.

### Cards / Containers
- **Corner Style:** `13px` (see Shapes).
- **Background:** white surface on the paper ground; the one exception is the ink-ground "stat band" and "due-today" amber-wash cards, which invert to carry a different kind of attention.
- **Shadow Strategy:** hairline at rest, lift on hover if clickable (see Elevation).
- **Border:** `1px solid var(--line-soft)`.
- **Internal Padding:** `15-16px`.

### Inputs / Fields
- **Style:** white surface, hairline border, `10px` radius, `16px` font size without exception (prevents mobile auto-zoom).
- **Focus:** `2px solid` green outline, 1px offset, border shifts to green — never the browser default ring.
- **Label:** small (`.78rem`), medium weight, muted color, sits above the field.

### Navigation
- **Mobile:** fixed bottom bar, 5 even columns, white ground, hairline top border. The center "add" action breaks the row — a `52px` circle in ink-and-amber, raised `-22px` above the bar, with its own `0 8px 20px` shadow. Inactive tabs are muted gray; active is Fresh Leaf Green.
- **Desktop (≥900px):** the bar becomes a `224px` sticky left sidebar on a faint green-tinted gradient wash, items laid out as rows with icon + label, active item gets a white pill background and a `3px` amber left border. The brand lockup (ink-and-amber mark + wordmark) appears only in this sidebar, never on mobile.
- **Secondary shortcut:** a small (`34px`) rounded-square icon button fixed to a screen corner on mobile, ink-and-amber, for the one destination that doesn't fit the five-slot bar.

## Do's and Don'ts

### Do:
- **Do** keep every input, select, and textarea at `16px` font size minimum — anything smaller triggers mobile auto-zoom on focus.
- **Do** use the green-tinted neutral (`rgba(18,48,28,…)`) for every border and divider, never a plain gray.
- **Do** let the stage/status badge color itself communicate meaning (egg → larva → pupa → adult reads as a visible gradient from pale to full green).
- **Do** reserve ink-ground bands for moments that earn weight — stats, the public hero, a leaderboard.

### Don't:
- **Don't** put a thick accent border on a rounded card — pick one language (soft hairline border, or a flat accent edge on a square element) rather than fighting the corner radius.
- **Don't** give a static, non-interactive card a resting lift shadow; lift means "you can click this."
- **Don't** flood a surface with Beetle Wing Amber — it marks one thing per view, never a background wash beyond a badge or a thin rule.
- **Don't** introduce a second typeface; hierarchy comes from color, size, and the micro-rule prefix, not a display face.
