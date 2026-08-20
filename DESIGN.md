---
name: Smart Document Workflow
description: Paper docket for upload, extraction, and human review — navy ink, cool bond, seal gold.
colors:
  ink: "#0f1c2e"
  ink-muted: "#3d4f63"
  ink-subtle: "#4a5d73"
  paper: "#f3f5f8"
  surface: "#ffffff"
  accent: "#e8a317"
  accent-hover: "#d49210"
  accent-ink: "#7a4e00"
  border: "#c9d1dc"
  ring: "#8a5a00"
  danger: "#9f1239"
  danger-soft: "#fff1f4"
  success: "#065f46"
  success-soft: "#ecfdf5"
  warn: "#92400e"
  warn-soft: "#fff7ed"
  info-soft: "#eef3f8"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.25rem, 8vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Source Sans 3, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Source Sans 3, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  md: "6px"
  xl: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  control: "44px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.ink}"
  button-secondary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    height: "44px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "44px"
  surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
  chip-default:
    backgroundColor: "{colors.info-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "2px 8px"
  chip-accent:
    backgroundColor: "rgba(232, 163, 23, 0.25)"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.md}"
    padding: "2px 8px"
  nav-item-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "44px"
---

# Design System: Smart Document Workflow

## Overview

**Creative North Star: "The Review Docket"**

The interface is a stamped case file, not a dashboard skin and not a dark-tech console. Cool bond paper is the field; docket navy is the ink; seal gold is the stamp you press when the work is ready. Density is operational: lists, fields, and queues scan first. Display type (Fraunces) is the heading on the form, not a marketing poster.

Personality is restrained and accountable. Gold is rare. Surfaces stay quiet paperwork. Press feedback is tactile (scale 0.97) without theatrical motion. Confirmed rejections: decorative AI purple glow, emoji-driven UI, color-only status, dark-tech skins, and two-axis grid overlays on operate screens.

**Key Characteristics:**
- Light paper canvas with white elevated surfaces
- Navy ink for text and selected navigation
- Seal gold reserved for primary action
- Fraunces for titles, Source Sans 3 for body and UI
- 44px minimum controls; 12px surfaces; 6px controls
- Hybrid depth: flat page, bordered card with a soft offset shadow

## Colors

A cool paper field, navy writing, and one gold seal. Semantic rose / emerald / amber exist only for danger, success, and warning — never as brand.

### Primary
- **Seal Gold** (`{colors.accent}`): Primary buttons and the marketing CTA. Hover darkens to `{colors.accent-hover}`. Text on gold is docket navy, not white.
- **Seal Gold Ink** (`{colors.accent-ink}`): Small gold *text* (unread, chip labels) where `{colors.accent}` would fail contrast.

### Neutral
- **Docket Navy** (`{colors.ink}`): Body text, secondary buttons, active nav.
- **Docket Navy Muted** (`{colors.ink-muted}`): Supporting copy; not placeholder-opacity navy.
- **Docket Navy Subtle** (`{colors.ink-subtle}`): Section labels and placeholders.
- **Cool Bond** (`{colors.paper}`): Page background for portals.
- **Filing White** (`{colors.surface}`): Elevated cards, inputs, dialogs.
- **Docket Rule** (`{colors.border}`): 1px separators and control outlines.
- **Focus Brass** (`{colors.ring}`): Focus rings; darker than seal gold so the ring meets 3:1.

### Named Rules
**The Rare Seal Rule.** Seal gold is the primary action, not atmosphere. Do not flood screens with gold fills, gold text, or gold borders.

**The Contrast-Not-Opacity Rule.** Muted text uses `{colors.ink-muted}` or `{colors.ink-subtle}`. Do not fade `{colors.ink}` with alpha for body or labels.

## Typography

**Display Font:** Fraunces (fallback Georgia, serif)
**Body Font:** Source Sans 3 (fallback ui-sans-serif, system-ui, sans-serif)

**Character:** Fraunces is the docket heading — slightly editorial, never poster-loud. Source Sans 3 is the clerk’s hand: readable, tabular-friendly, unstyled.

### Hierarchy
- **Display** (Fraunces, clamp 2.25–4.5rem, leading 1.05, tracking −0.03em): Marketing hero only.
- **Headline** (Fraunces, 1.75rem / 1.875rem at `md`, leading 1.15, tracking −0.03em): Portal page titles (`PageHeader`).
- **Title** (Fraunces, 1.5rem): Auth card titles, marketing subsection heads.
- **Body** (Source Sans 3, 1rem, leading 1.6): Default reading; measure 65ch on prose.
- **Label** (Source Sans 3, 0.875rem, weight 500): Form labels, nav, buttons. Section eyebrows use the same size, uppercase, wide tracking, `{colors.ink-subtle}` — they are metadata, not kickers above a hero.

### Named Rules
**The Form-Heading Rule.** Fraunces is for titles. Do not set body, tables, or chips in the display face.

**The Tracking Floor Rule.** Display tracking is −0.03em. Do not go tighter than −0.04em.

## Layout

Portals sit in a `max-w-6xl` column with `16px` page padding (`32px` from `md`). From `md`, chrome is `220px` side nav + main (`min-w-0`). Marketing prose is `max-w-3xl`; body measure `65ch`. Page headers group title + description tightly, with actions wrapping at the end.

Rhythm: `8 / 16 / 24 / 32`. Related rows share `12–16px`; distinct sections use `32px`. Controls are at least `44px` tall. Admin tables may scroll horizontally on small screens; the same list stacks as cards below `md`. Filenames clamp or truncate with a `title` tooltip; wrap with `overflow-wrap: anywhere` on titles.

## Elevation & Depth

Hybrid: the page is flat Cool Bond. Elevated work (lists, forms, dialogs, portal nav) uses Filing White, a 1px Docket Rule border, and one soft offset shadow. No zero-offset colored halo. Atmosphere gradients (gold/navy wash) are marketing and auth only.

### Shadow Vocabulary
- **Surface** (`box-shadow: 0 1px 2px rgb(15 28 46 / 0.04), 0 8px 24px rgb(15 28 46 / 0.06)`): Default `Surface`, portal nav, auth card, confirm dialog.
- **Input** (Tailwind `shadow-sm`): Fields only, quieter than Surface.
- **Overlay** (`background: rgb(15 28 46 / 0.40)`): Confirm-dialog scrim, not a shadow.

### Named Rules
**The Flat-Page Rule.** The canvas stays flat. Shadow appears on elevated paperwork, not on the viewport background.

**The One Elevation Rule.** Border *or* shadow may suffice; the incumbent Surface uses both once. Do not stack a second large halo.

## Shapes

Controls are gently squared (`6px` / `rounded-md`). Paperwork containers are slightly softer (`12px` / `rounded-xl`). Pills are not the default. Borders are 1px `{colors.border}` unless a semantic callout (warn at 25% alpha). Focus is a 2px `{colors.ring}` outline with 3px offset (or the matching ring utility on controls).

## Components

### Buttons
Tactile but restrained: 44px minimum, `6px` corners, 150ms color/transform, press scale 0.97.

- **Shape:** Gently squared (`6px`)
- **Primary:** Seal gold fill, docket navy type (`button-primary`)
- **Secondary:** Docket navy fill, cool bond type
- **Outline:** White fill, 1px docket rule, navy type
- **Ghost:** Transparent, navy type, 4% navy wash on hover
- **Danger:** `{colors.danger}` fill, white type
- **Hover / Focus:** Darken gold / navy; `2px` focus ring in `{colors.ring}` with paper offset. Disabled at 50% opacity, no pointer.

### Chips
Status chips (`Badge` / `StatusChip`): `6px` corners, `2px 8px` padding, 12px medium type, wide tracking. Variants: default (`info-soft` + ink), accent (gold wash + accent-ink), success, warn, danger, muted (paper + ink-muted). Always include a text label; color is not the only cue.

### Cards / Containers
`Surface`: `12px` corners, white, 1px border, surface shadow. Internal padding typically `16px` (`24px` on auth). Divided lists use `divide` on `{colors.border}`, not nested cards.

### Inputs / Fields
White field, 1px border, `6px` corners, 44px height, `8px 12px` padding. Placeholder `{colors.ink-subtle}`. Focus: 2px `{colors.ring}`. Invalid: `{colors.danger}` border. Disabled: 50% opacity.

### Navigation
Portal: white `Surface` rail; items 44px; idle `{colors.ink-muted}`; current page docket navy fill + paper type (`aria-current`). Marketing: horizontal links from `md`; disclosure menu below. Skip link is navy on paper, revealed on focus.

### Confirm dialog
Centered `Surface` (`min(28rem, 100vw − 2rem)`), Fraunces title, muted description, outline Cancel + primary or danger Confirm. Overlay navy at 40%. Does not dismiss while busy.

### Low-confidence callout
Warn-soft fill, warn type, `12px` corners, `role="status"`. Not a colored left bar.

## Do's and Don'ts

### Do:
- **Do** put primary actions on Seal Gold with Docket Navy type.
- **Do** keep interactive targets at least 44px tall.
- **Do** pair every status color with a text label.
- **Do** wrap or clamp long filenames; never let them blow the layout.
- **Do** use `{colors.ink-muted}` for supporting copy instead of transparent navy.

### Don't:
- **Don't** use decorative AI purple glow, neon gradients, or dark-tech chrome.
- **Don't** drive UI with emoji or Unicode as an icon system.
- **Don't** communicate status by color alone.
- **Don't** put two-axis grid overlays on operate (portal) screens.
- **Don't** spend Seal Gold on large backgrounds or body text.
- **Don't** set body copy in Fraunces.
- **Don't** invent RAG, vector, or multi-agent chrome that the product does not have.
