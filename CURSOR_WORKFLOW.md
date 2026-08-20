# AI Design Workflow

Standard AI-assisted frontend workflow for **Smart Document Workflow**. Use this so features stay functional, on-brand, and consistent with [DESIGN.md](./DESIGN.md) (The Review Docket) and [PRODUCT.md](./PRODUCT.md).

One design system only: navy ink, cool bond paper, seal gold. Do not mix in a second visual language.

---

## Philosophy

- Build functional features first.
- Polish interactions second.
- Refine visual quality last.
- Never let multiple design systems compete.

Ship a working flow before motion, spacing, or a visual pass. If a change would fight [DESIGN.md](./DESIGN.md), stop and follow the docket — do not invent a parallel look.

---

## When to use Emil Skills

Use **Emil** (`emil-design-eng`) for how the UI *behaves*:

- Motion
- Micro-interactions
- UX flow
- Animation reviews
- Component usability
- Interaction improvements

Press feedback stays tactile (scale `0.97`, ~150ms). Operate screens stay quiet — no theatrical motion.

---

## When to use Impeccable

Use **Impeccable** for whether the UI *holds together*:

- UI audits
- Typography
- Spacing
- Layout
- Accessibility
- Design system consistency
- [DESIGN.md](./DESIGN.md) compliance
- UX writing
- Production polish

Impeccable is the clerk: measure, contrast, 44px targets, labels with status, copy that names the action.

---

## When to use TasteSkill

Use **TasteSkill** (`design-taste-frontend`) for whether the UI *looks like this product*:

- Premium visual refinement
- Landing pages
- Dashboard redesign (only when explicitly requested)
- Visual hierarchy
- Anti-generic UI
- Final design pass

TasteSkill is the last visual pass, not a license to restyle the app. Marketing may carry more atmosphere; portals stay operational paperwork.

---

## Recommended Order

1. **Build feature** — working UI, existing components, tokens, and architecture.
2. **Emil review** — motion, press, focus, flow, interrupt behavior.
3. **Impeccable critique** — type, space, a11y, copy, DESIGN.md.
4. **TasteSkill refinement** — hierarchy and anti-generic polish, still on-token.
5. **Manual review** — keyboard, mobile, long filenames, empty/error states.
6. **Commit** — only after the feature still works and still looks like the docket.

Skip a step when the change does not need it (e.g. a copy-only fix does not need Emil). Do not reverse the order so a visual pass lands before the feature works.

**Calibration.** Before TasteSkill-driven work across the app, run Emil → Impeccable → TasteSkill on **one** page (the Marketing Landing) and confirm they complement each other under Decision Authority. Do not roll the three skills across every surface until that pass holds.

---

## Rules

- Don't redesign unless requested.
- Respect [DESIGN.md](./DESIGN.md).
- Preserve existing architecture (Next.js App Router shells, ShadCN/Radix, Tailwind tokens).
- Prefer incremental improvements.
- Accessibility and responsiveness are mandatory.

Also: Fraunces for titles only; Source Sans 3 for body and UI; seal gold for primary actions, not atmosphere; status always includes a text label.

---

## Decision Authority

When recommendations conflict, higher items win:

1. [PRODUCT.md](./PRODUCT.md) — product requirements
2. [DESIGN.md](./DESIGN.md) — visual system
3. [CURSOR_WORKFLOW.md](./CURSOR_WORKFLOW.md) — AI workflow
4. Emil Skills
5. Impeccable
6. TasteSkill

The AI must never violate a higher-priority document to satisfy a lower-priority skill. That keeps the three skill packs from pulling in different directions.

---

## Do Not

- Don't rewrite an entire page for a minor interaction or spacing fix.
- Don't replace established design tokens, fonts, or radii with one-off values.
- Don't introduce a new UI library, icon set, or animation library without approval.
- Don't run TasteSkill as a full redesign of a portal unless that was the ask.
- Don't let Emil, Impeccable, and TasteSkill each apply a different visual system.
- Don't add decorative AI purple glow, neon gradients, dark-tech chrome, emoji-as-icons, or two-axis grid overlays on operate screens.
- Don't communicate status by color alone, or spend seal gold on large backgrounds and body text.
- Don't invent RAG, vector, or multi-agent chrome the product does not have.

---

## Example prompts

Copy, then point the agent at the relevant files. Always mention: *incremental, DESIGN.md, no redesign unless asked.*

### Emil Skills

1. Review press and hover on primary/secondary buttons in `components/ui/button.tsx`. Keep 44px height, 150ms color/transform, press scale 0.97. No extra bounce or glow.
2. Improve the upload dropzone states (idle, dragover, uploading, error) without theatrical motion. Keyboard and screen-reader announcements must still work.
3. Audit `confirm-dialog.tsx` enter/exit and busy behavior. It must not dismiss while submitting. Overlay stays navy at 40%.
4. Trace the user flow login → upload → document detail review. Flag dead ends, missing focus, and interrupts (navigate away while processing).
5. Review field-edit usability on document review: save, validation, low-confidence callout. Prefer clearer affordances over new animation.
6. Check portal nav (`portal-shell`) for current-page indication (`aria-current`), 44px items, and a quiet selected-state change — no layout jump.
7. Review `status-chip` / filter interaction: chips are not buttons by default; keep 6px corners and a text label with every color.
8. Motion audit of marketing vs portals: atmosphere is allowed on marketing/auth only. Strip decorative motion from operate screens.
9. Improve focus order and skip-link behavior for the admin pending-approvals table, including horizontal scroll on small screens.
10. Critique micro-copy timing: when should inline errors appear vs. after submit? Don't redesign the form layout.

### Impeccable

1. Audit this screen against [DESIGN.md](./DESIGN.md): type roles (Fraunces titles, Source Sans 3 body), 8/16/24/32 rhythm, 44px controls.
2. Check contrast: supporting copy uses `ink-muted` / `ink-subtle`, not faded `ink`. Focus ring is `ring` (brass), 2px with offset.
3. Spacing pass on the document list and page header: related rows 12–16px, distinct sections 32px. Don't restyle cards.
4. Accessibility audit: keyboard paths for login, upload, review, approve; status + text label; skip link; no color-only meaning.
5. Filename and title overflow: clamp/truncate with `title` tooltip; `overflow-wrap: anywhere` on titles. Don't let names blow the layout.
6. DESIGN.md compliance for `Surface`: white, 1px border, one surface shadow, 12px radius. No second halo, no grid overlay.
7. UX writing pass: empty, error, and low-confidence states. Voice is operational and accountable — name the action and the failure. No emoji.
8. Layout check: portals `max-w-6xl`, 16px padding (32px from `md`), 220px nav + `min-w-0` main. Admin tables may scroll horizontally below `md`.
9. Form polish: labels 0.875rem medium, placeholders `ink-subtle`, invalid border `danger`, disabled 50% opacity. Keep existing RHF + Zod.
10. Production pass on auth: 24px inner padding on the card, Fraunces title, outline Cancel / gold or danger Confirm where dialogs apply.

### TasteSkill

1. Final visual pass on the marketing landing. Creative north star is "The Review Docket" — paper field, navy ink, rare gold CTA. Not generic SaaS, not dark-tech.
2. Anti-generic audit of Features / Pricing / About. Remove anything that reads as AI-purple, neon, or emoji-driven. Keep Fraunces for subsection heads only.
3. Visual hierarchy on the user dashboard: queues and lists scan first; gold is the primary action only. Incremental, no redesign.
4. Refine the marketing hero: Display Fraunces (clamp 2.25–4.5rem, tracking −0.03em). Do not set body in Fraunces; do not flood gold.
5. Auth screens may use a quiet gold/navy atmosphere wash. Keep the card as filing-white paperwork with one elevation.
6. Dashboard preview (illustrative): make it look like a stamped case file, and do not present it as live customer data.
7. Admin pending queue: operational density, not a dashboard skin. Hierarchy through type and space, not extra color.
8. Document detail: make the review form the hero of the page; metadata stays secondary (`ink-subtle` eyebrows). No new components unless needed.
9. After Emil + Impeccable, do a last anti-generic pass on this PR only. Preserve tokens, radii, and component APIs.
10. Compare marketing vs portal: portals stay flat cool bond + elevated white surfaces. Do not carry marketing gradients onto operate screens.
