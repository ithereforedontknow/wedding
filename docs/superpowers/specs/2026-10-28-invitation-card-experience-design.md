# Invitation Card Experience — Design

**Date:** 2026-10-28
**Status:** Approved
**Scope:** Single-page wedding invitation (`src/App.jsx`, `src/index.css`)

## Intent

Make the site feel like one physical, portrait invitation card rather than a sequence of web sections.

The existing envelope intro remains the arrival moment. After the envelope opens, the guest sees the front cover of the invitation. Scrolling pins that cover and lifts it away to reveal the inside. The existing story, timeline, venue guide, guestbook, and RSVP become pages inside the card. At the end, the back cover rises and closes over the inside, leaving the names-only keepsake back.

The watercolor page, petals, typography, palette, and existing content stay. This is a structural and motion redesign, not a new identity.

## Experience Sequence

1. **Envelope intro** — existing sealed envelope, wax seal, flap, letter, crossfade. No change to its role.
2. **Front cover** — a tall portrait card centered on the watercolor page. Names, invitation line, date, time, venue, and an “Open Invitation” scroll cue.
3. **Opening** — the front cover is pinned while the guest scrolls. It lifts up and slightly back in 3D, revealing the inside card underneath. Scroll position drives the lift directly.
4. **Inside** — one continuous paper surface. Chapter One is the first inside page, followed by Order of Events, the gifts note, Watercolor Guestbook, and RSVP.
5. **Closing** — after the RSVP content, the back cover rises from below and covers the inside as the guest scrolls the final distance. The page ends on the names-only back cover.

## Goals

- The page reads as a physical portrait invitation card, not a stack of floating cards.
- The front cover, inside, and back cover feel like the same object.
- The opening and closing are scroll-scrubbed and reversible.
- Inner sections reveal once, quietly, without competing with the cover motion.
- The envelope intro, existing content, and primary RSVP task remain intact.
- Mobile and reduced-motion paths are intentionally designed, not fallbacks that break the metaphor.

## Non-goals

- No new backend, auth, payment, or RSVP persistence.
- No new content sections or fabricated wedding details.
- No change to the envelope-opening story.
- No full visual rebrand: same fonts, palette, watercolor language, and keepsake style.
- No scroll-jacking; the page must still scroll natively.

## Anti-goals

- A long white page with a decorative card border painted on top.
- Motion that hides content, traps focus, or makes the RSVP unreachable.
- A literal 3D book that requires two-page spreads the content cannot support.
- Scroll effects on every element.

## Approaches Considered

1. **Custom scroll hook + CSS transforms + sticky (chosen).** `position: sticky` pins the covers; a small `requestAnimationFrame` hook maps scroll progress to CSS custom properties; `IntersectionObserver` handles one-time section reveals. No new dependency, full control, works in the browsers already used for testing.
2. **GSAP ScrollTrigger.** More precise pinning and scrubbing with less custom math, but adds a new animation dependency and a second animation model for a single-page site.
3. **Framer Motion.** React-friendly `useScroll`/`useTransform`, good for inner reveals, but still needs sticky for pinning and adds a dependency without giving better control over the physical card lift.

The custom hook keeps the site lightweight and the effect is constrained enough that a full animation library does not earn its weight.

## Card Geometry

- Portrait card, centered horizontally.
- Desktop width: `min(92vw, 720px)`.
- Mobile width: `calc(100vw - 32px)`.
- Front cover height: `min(86vh, 900px)` on desktop; `min(82vh, 720px)` on mobile. It must fit the viewport while pinned.
- Inside card: same width, continuous paper surface, natural height.
- Back cover: same width and height as the front cover.
- Watercolor background and petals remain visible around the card.
- The card has a soft, offset shadow; no hard block shadow.

## Front Cover

Content, top to bottom:

- Small botanical sprig or a quiet “Together with their families” line.
- Names: **Enjelaine & Erwin** in Alex Brush, with the ampersand in Cormorant Garamond.
- Heart divider.
- Date and venue in Quicksand.
- Short invitation line from the current hero.
- A small “Open Invitation” cue with a downward chevron.

The front cover uses the footer keepsake language: frosted white/green paper, `rounded-[2rem]`, inset dashed periwinkle frame, botanical corners, heart divider, and a soft green/lavender bloom behind the card.

The countdown and the RSVP/Schedule buttons move inside so the cover stays card-like. The inside opening band carries the countdown and the two CTAs before Chapter One.

## Opening Choreography

- The cover lives in a tall scroll spacer (roughly `180vh` desktop, `150vh` mobile).
- A `sticky top-0 h-screen` wrapper holds the card front.
- Progress runs from 0 to 1 across `spacerHeight - viewportHeight`.
- Transform:
  - `translateY(calc(var(--cover-progress) * -112%))`
  - `rotateX(calc(var(--cover-progress) * -10deg))`
  - `scale(calc(1 - var(--cover-progress) * 0.03))`
  - transform origin: top center.
- A soft shadow under the card grows with progress, then fades as the card leaves.
- The inside card follows the spacer and is pulled up with `margin-top: -100svh` (the viewport height). At progress 0 its top edge sits near the bottom of the viewport behind the cover; at progress 1 it sits exactly at the viewport top. The cover stays above it (`z-20`), so the inside is revealed in place as the cover lifts rather than appearing after a blank gap.
- The spacer height and negative margin share a CSS variable so the handoff stays aligned on resize.
- At progress 1 the cover is off-screen and `pointer-events: none`; the inside is at the top of the viewport.
- Reversing the scroll lowers the cover back into place.

## Inside Card

One continuous paper surface, not separate floating cards.

- Inner padding: `px-6 sm:px-10 md:px-14`; section spacing `space-y-20`.
- Sections keep their existing headings, eyebrows, copy, and controls.
- Section headers use a small heart divider; sections are separated by generous paper space rather than card borders.
- The Venue & Guest Guide section is removed. The “A Note on Gifts” card remains as a small standalone block before RSVP.
- The RSVP form becomes an inset reply-card panel with a dashed periwinkle border, keeping the existing fields and controls.
- The guestbook form and note cards remain, softened to sit on the paper.
- The countdown and the two hero CTAs appear in a compact opening band before Chapter One.

## Back Cover

- Same portrait card and keepsake language as the front.
- Names only: **Enjelaine & Erwin** with the heart divider and botanical corners. No navigation, date, or closing copy.
- Closing choreography:
  - A final scroll spacer after the RSVP content.
  - The back cover starts below the viewport and rises as progress goes 0 → 1.
  - It covers the inside and finishes centered in the viewport.
  - Reversing the scroll lowers it again.
- The page ends on the back cover.

## Motion System

- Covers: scroll-scrubbed transforms via CSS variables. No React state updates on scroll.
- Inside sections: `IntersectionObserver` adds a visible class; one-time reveal with opacity and a 16–24px rise, 600–700ms, small stagger for grouped content.
- No reveal on every element; reveal section headers and content groups.
- Respect `prefers-reduced-motion: reduce`:
  - No pinning or 3D cover lift. Covers crossfade or simply scroll away.
  - Section reveals appear without movement.
  - The back cover appears normally at the end.
- The fixed petal canvas stays behind the card (`-z-10` with root `isolate`). Petals remain visible around the card, never over it.
- Petal animation should also respect reduced motion (static petals or no animation).

## Responsive Behavior

- Desktop: full pin and 3D lift; 720px card; inside sections single-column.
- Tablet: 720px or `min(90vw, 680px)`; slightly shorter pin.
- Mobile: full-width card minus 16px margins; shorter pin (roughly `140vh`); lift simplifies to translate plus a small rotate; reduced shadow/blur.
- Short landscape phones (`max-height: 560px`): disable the pin; the front cover scrolls away normally so the card content is not trapped in an unreadable viewport.
- The front cover must fit at 320×700, 390×844, 768×1024, 1440×1000, and 844×390. Use `clamp()` type sizes and compact spacing on short screens.

## Color and Accessibility

- Keep `#9792e3` for decorative borders, icons, and washes.
- Introduce a darker periwinkle ink for small text: `#6f68b8` (about 4.8:1 on white/card). Apply to eyebrows, metadata, pass labels, timestamps, and similar small text.
- Large display ampersand: use `#7d77cc` (about 3.9:1) or the darker ink.
- Placeholders: `#6f6b7a` (about 4.5:1 on the input background).
- Input borders: use a full-strength accessible periwinkle (roughly `#7d77cc`) so the field boundary meets 3:1 against the paper.
- Focus rings: 2px darker periwinkle, visible on paper and green surfaces.
- Add `aria-pressed` to the attendance buttons, guestbook swatches, and audio toggle.
- Venue tabs: proper tab semantics (`role="tablist"`, `role="tab"`, `aria-selected`, `role="tabpanel"`), visible focus, keyboard reachable.
- The front cover scroll cue is a real button/link with an accessible name.
- When the cover is fully lifted, it is removed from the focus order (`inert` or equivalent).
- The pass code must be generated once when the modal opens, not on every render.
- Section reveals must not remove content from the accessibility tree.

## Canonical Content

`src/config.js` is the source of truth for the invitation:

- **Date:** Saturday, April 10, 2027
- **Time:** 2:00 PM Philippine Time (UTC+8)
- **Venue:** Casa De Hufana
- **Address:** Agoo, La Union, Philippines
- **RSVP deadline:** March 1, 2027
- **Dress code:** Garden formal; warm summer colors, linen and florals welcome.

Every rendered reference — hero, envelope caption, countdown, timeline, pass, calendar file, and RSVP deadline — normalizes to these details. The existing July 17, Sonoma, June 10, PST, and “VANCEWED” references are placeholders and are removed or corrected.

The Venue & Guest Guide section is removed. The “A Note on Gifts” card is retained as a small standalone note before RSVP. The dress code appears as a quiet line on the front cover. No invented hotels, airports, shuttles, weather, or local businesses.

The timeline’s six events shift two hours earlier so the ceremony lands at 2:00 PM: 1:30 PM guest arrival, 2:00 PM ceremony, 2:45 PM aperitivo, 4:15 PM dinner, 6:00 PM dancing, 8:30 PM send-off. These are derived from the existing sequence; the couple can replace them with real times.

## Content Decisions Resolved

- **Ceremony time:** 2:00 PM. The timeline shifts two hours earlier as described above.
- **Guest Guide:** removed. The gifts note stays.
- **Front cover:** minimal, with countdown and CTAs inside.
- **Back cover:** names only.
- **Story copy:** “Julian knelt” becomes “Erwin knelt.”

No content decisions remain before implementation.

## Verification

- `npm run lint` and `npm run build`.
- Render at 1440×1000, 768×1024, 390×844, 320×700, and 844×390.
- Inspect cover progress at 0, 0.25, 0.5, 0.75, and 1; inside sections; back cover progress at 0, 0.5, and 1.
- Exercise envelope opening, scroll cue, guestbook swatches, RSVP form, pass modal, and audio toggle.
- Test keyboard focus order and visible focus on the cover cue, form controls, and modal.
- Test `prefers-reduced-motion: reduce` in Firefox.
- Compare against the incumbent screenshots for unchanged content and the approved card direction.
- Report actual viewports, states, and any remaining mismatches. No 1:1 claim without a same-size comparison.

## What Is Left to the Builder

- Exact easing curves and shadow values.
- Precise typographic scale inside the 720px card.
- The watercolor map illustration treatment.
- The compact opening band composition for the countdown and CTAs.
- Any minor spacing decisions needed to make the card fit the tested viewports.
