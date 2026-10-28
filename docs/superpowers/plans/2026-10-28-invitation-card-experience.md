# Invitation Card Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the wedding site into one scroll-driven portrait invitation card: envelope intro → front cover → lifting cover → continuous inside → rising names-only back cover.

**Architecture:** Keep `src/App.jsx` as the page composition. Focused components render the keepsake front/back covers and shared paper treatment. A `requestAnimationFrame` hook writes scroll progress to CSS variables for the cover lift and back-cover rise; `IntersectionObserver` adds one-time reveal classes inside. All wedding details come from `src/config.js`.

**Tech Stack:** React 19, Vite 8, Tailwind CSS 4, lucide-react, plain CSS transforms + `position: sticky`, Node built-in test runner (`node --test`).

**Spec:** `docs/superpowers/specs/2026-10-28-invitation-card-experience-design.md`

## Global Constraints

- Canonical invitation: **Saturday, April 10, 2027**, **2:00 PM Philippine Time (UTC+8)**, **Casa De Hufana**, **Agoo, La Union, Philippines**, RSVP by **March 1, 2027**.
- `src/config.js` is the only source of wedding data. No hard-coded date, time, venue, address, deadline, or names in `App.jsx` or components.
- No new runtime dependencies and do not add an animation library. Use the custom scroll hook, CSS transforms, and sticky positioning.
- Preserve the existing fonts, palette, watercolor language, envelope intro, and keepsake card style. This is not a rebrand.
- Remove the Venue & Guest Guide. Keep “A Note on Gifts” as a small note. Do not invent hotels, travel, weather, or local recommendations.
- No new backend, auth, payment, or RSVP persistence.
- Card geometry: desktop width `min(92vw, 720px)`, tablet `min(90vw, 680px)`, mobile `calc(100vw - 32px)`. Front/back cover height `min(86svh, 900px)` desktop and `min(82svh, 720px)` mobile.
- Covers are scroll-scrubbed and reversible. Inner sections reveal once. Do not scroll-jack; native scrolling must remain.
- Reduced motion: no pinning, no 3D lift, no reveal movement. Short landscape (`max-height: 560px`): no pinning; covers scroll normally.
- Accessibility: visible 2px `#6f68b8` focus rings, `aria-pressed` on toggles, proper labels, tab semantics are gone with the guide, cover is `inert` when fully lifted, pass code generated once per modal open.
- Testing: pure logic uses `node --test`; UI uses `npm run lint`, `npm run build`, and Firefox screenshots/manual scroll checks. There is no React component test harness and none is added.

## Review Focus

- **Short landscape and resize:** cover and back-cover math must not leave blank viewports or trap content when `innerHeight <= 560` or when the window is resized. Owned by Task 3 (`getScrollProgress` returns 0 when the scroll distance is not positive) and Task 8 (844×390 screenshot and resize check).
- **Reduced motion:** no pin, no 3D, all content visible, back cover appears normally at the end. Owned by Task 7 (Firefox `ui.prefersReducedMotion=1` check).
- **Canonical content drift:** no July 17, Sonoma, June 10, PST, VANCEWED, Willow Creek, or “Julian knelt” remains; countdown, calendar, pass, and RSVP deadline agree. Owned by Task 1 tests and Task 8 grep.
- **Focus order and inert cover:** tab must not enter a fully lifted cover; cover cue, forms, and modal remain reachable. Owned by Task 7 keyboard check.
- **Mobile RSVP reachability:** the closing cover must not block the RSVP before it is read, and the page must still scroll natively on touch. Owned by Task 6 and Task 8 mobile checks.

---

### Task 1: Canonical Content and Pure Helpers

**Files:**
- Modify: `src/config.js`
- Create: `src/lib/wedding.js`
- Create: `tests/wedding.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `WEDDING.durationHours`, `WEDDING.schedule[].desc`; `getWeddingTimestamp(dateISO)`, `formatIcsDate(date)`, `escapeIcsText(value)`, `buildGoogleCalendarUrl(wedding)`, `buildIcsContent(wedding, { uid, now })`, `createPassCode(random)`.

- [ ] **Step 1: Add the test script**

Add `"test": "node --test"` to the `scripts` block in `package.json`. Do not add dependencies.

- [ ] **Step 2: Write the failing tests**

Create `tests/wedding.test.js`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { WEDDING } from "../src/config.js";
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  createPassCode,
  escapeIcsText,
  formatIcsDate,
  getWeddingTimestamp,
} from "../src/lib/wedding.js";

test("canonical date is 2:00 PM Philippine time", () => {
  assert.equal(getWeddingTimestamp(WEDDING.date), Date.UTC(2027, 3, 10, 6, 0, 0));
  assert.equal(WEDDING.dateLabel, "Saturday, April 10, 2027");
  assert.equal(WEDDING.venue, "Casa De Hufana");
  assert.equal(WEDDING.address, "Agoo, La Union, Philippines");
  assert.equal(WEDDING.rsvpDeadline, "March 1, 2027");
});

test("schedule starts at 1:30 PM and the ceremony is 2:00 PM", () => {
  assert.equal(WEDDING.schedule.length, 6);
  assert.equal(WEDDING.schedule[0].time, "1:30 PM");
  assert.equal(WEDDING.schedule[1].time, "2:00 PM");
  assert.equal(WEDDING.schedule[5].time, "8:30 PM");
});

test("Google Calendar URL uses canonical UTC dates and location", () => {
  const url = buildGoogleCalendarUrl(WEDDING);
  assert.match(url, /dates=20270410T060000Z\/20270410T123000Z/);
  assert.match(url, /text=Enjelaine%20%26%20Erwin's%20Wedding/);
  assert.match(url, /location=Casa%20De%20Hufana%2C%20Agoo%2C%20La%20Union%2C%20Philippines/);
});

test("ICS uses CRLF, UTC dates, and escaped text", () => {
  const ics = buildIcsContent(WEDDING, {
    uid: "test@example.com",
    now: new Date("2026-10-28T00:00:00Z"),
  });
  assert.ok(ics.includes("\r\n"));
  assert.ok(ics.includes("UID:test@example.com"));
  assert.ok(ics.includes("DTSTAMP:20261028T000000Z"));
  assert.ok(ics.includes("DTSTART:20270410T060000Z"));
  assert.ok(ics.includes("DTEND:20270410T123000Z"));
  assert.ok(ics.includes("LOCATION:Casa De Hufana\\, Agoo\\, La Union\\, Philippines"));
});

test("ICS text escaping handles commas, semicolons, newlines, and backslashes", () => {
  assert.equal(escapeIcsText("a,b;c\nd\\e"), "a\\,b\\;c\\nd\\\\e");
});

test("pass code is a four-digit string generated from the supplied random source", () => {
  assert.equal(createPassCode(() => 0), "1000");
  assert.equal(createPassCode(() => 0.5), "5500");
});

test("ICS date formatting is UTC and second-precision", () => {
  assert.equal(formatIcsDate(new Date("2027-04-10T06:00:00Z")), "20270410T060000Z");
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL because `src/lib/wedding.js` does not exist or its exports are missing.

- [ ] **Step 4: Update `src/config.js`**

Add `durationHours: 6.5` after `dressCode`. Replace the `schedule` array with six entries. Keep the existing `mealOptions` values. Use these exact values:

```js
schedule: [
  { time: '1:30 PM', title: 'Guest Arrival', note: 'Welcome drinks in the garden', desc: 'Arrive, find your seat, and settle in with a welcome drink before the ceremony.', icon: 'sparkles' },
  { time: '2:00 PM', title: 'Ceremony', note: 'Garden vows', desc: 'Vows exchanged in the garden, surrounded by family and friends.', icon: 'heart' },
  { time: '2:45 PM', title: 'Aperitivo', note: 'Light bites and live music', desc: 'Light bites, cocktails, and golden-hour portraits on the lawn.', icon: 'wine' },
  { time: '4:15 PM', title: 'Dinner & Toasts', note: 'Dinner under the string lights', desc: 'A seated dinner accompanied by heartfelt toasts.', icon: 'utensils' },
  { time: '6:00 PM', title: 'Dancing', note: 'Celebrate into the night', desc: 'First dance, then dancing under the stars.', icon: 'music' },
  { time: '8:30 PM', title: 'Send-off', note: 'A sparkling farewell', desc: 'Wave goodbye as the newlyweds head into the night.', icon: 'sparkles' },
],
```

- [ ] **Step 5: Implement `src/lib/wedding.js`**

Implement the exported functions. Use `new Date(wedding.date)` for the start and `start.getTime() + wedding.durationHours * 60 * 60 * 1000` for the end. `formatIcsDate` must return `YYYYMMDDTHHMMSSZ`. `escapeIcsText` must escape backslashes first, then newlines, commas, and semicolons. `buildGoogleCalendarUrl` uses `encodeURIComponent` for text, details, and location, but leaves the `dates` value unencoded. `buildIcsContent` joins lines with `\r\n` and ends with `\r\n`. `createPassCode(random = Math.random)` returns `String(Math.floor(1000 + random() * 9000))`.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test`
Expected: all seven tests PASS.

- [ ] **Step 7: Run lint**

Run: `npm run lint`
Expected: only the three pre-existing warnings (`Share2`, `isSubmitted`, `Math.random` in `App.jsx`). Do not fix them in this task.

- [ ] **Step 8: Commit**

```bash
git add package.json src/config.js src/lib/wedding.js tests/wedding.test.js
git commit -m "feat: make wedding config canonical with tested calendar helpers"
```

---

### Task 2: Shared Keepsake Components and Static Front Cover

**Files:**
- Create: `src/components/BotanicalBranch.jsx`
- Create: `src/components/KeepsakeCard.jsx`
- Create: `src/components/FrontCover.jsx`
- Modify: `src/App.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `WEDDING`, `getWeddingTimestamp`.
- Produces: `BotanicalBranch({ className })`, `KeepsakeCard` (forwardRef, props `as`, `className`, `children`), `FrontCover` (forwardRef, props `wedding`). `FrontCover` renders a card with the class `cover-card` and links to `#inside-card`.

- [ ] **Step 1: Extract `BotanicalBranch`**

Move the existing component from `src/App.jsx` (the `// --- Watercolor Floral SVG Motifs ---` block) into `src/components/BotanicalBranch.jsx` unchanged, exported as `export const BotanicalBranch = ...`. Remove the local definition from `App.jsx` and import it.

- [ ] **Step 2: Create `KeepsakeCard`**

Create `src/components/KeepsakeCard.jsx` with a `forwardRef` component. It renders `Tag` with these classes and children:

```jsx
relative overflow-hidden rounded-[2rem] border border-[#9792e3]/30
bg-gradient-to-b from-white/80 via-white/70 to-[#f8fffa]/80
shadow-[0_24px_70px_-40px_rgba(72,67,92,0.35)] backdrop-blur-md
```

Inside it, render the inset dashed frame (`absolute inset-2 rounded-[1.6rem] border border-dashed border-[#9792e3]/35`) and two `BotanicalBranch` corners at the bottom left/right, matching the current footer treatment. Wrap children in `relative`.

- [ ] **Step 3: Create `FrontCover`**

Create `src/components/FrontCover.jsx` as a `forwardRef` component using `KeepsakeCard` with `className="cover-card flex flex-col items-center justify-center px-6 py-8 text-center sm:px-10"`. Content, top to bottom:

- Eyebrow: “Together with their families”, uppercase, tracking, `text-[#6f68b8]`.
- Names: `wedding.partner1` and `wedding.partner2` in `font-script`, with the ampersand in `font-serif-elegant` and `text-[#7d77cc]`. Stack the names vertically on mobile and place them in one row from `sm` upward. Use `text-[clamp(2.4rem,10vw,5.5rem)]` and `leading-[0.95]`.
- Heart divider: two gradient lines and a filled `Heart`.
- Date, time, venue, address: `wedding.dateLabel`, `wedding.timeLabel`, `wedding.venue`, `wedding.address`. Keep these in Quicksand (`font-body`), with `font-semibold` on the date; the address is a quiet `text-[#6f68b8]` line.
- Invitation line: “request the pleasure of your company at their marriage celebration.” in `font-serif-elegant italic`.
- Dress code: `wedding.dressCode` in a quiet `text-[#6f68b8]` line.
- Cue: `<a href="#inside-card" aria-label="Open the invitation and read the details">Open Invitation <ChevronDown aria-hidden="true" /></a>` with the chevron using `animate-bounce`.

Use `clamp()` for type sizes and `gap-[clamp(0.4rem,1.6vh,1.25rem)]` so the cover fits 320×700 and 844×390. The card must not scroll internally.

- [ ] **Step 4: Add card geometry CSS**

In `src/index.css`, add:

```css
:root {
  --card-width: min(92vw, 720px);
  --cover-height: min(86svh, 900px);
  --pin-height: 100svh;
}

@media (max-width: 1024px) {
  :root { --card-width: min(90vw, 680px); }
}

@media (max-width: 640px) {
  :root {
    --card-width: calc(100vw - 32px);
    --cover-height: min(82svh, 720px);
  }
}

.cover-card {
  width: var(--card-width);
  height: var(--cover-height);
  margin-inline: auto;
}
```

- [ ] **Step 5: Replace the hero with the static front cover**

In `src/App.jsx`, remove the entire old hero `<header>` (the `// 2. TOP HERO SECTION & COUNTDOWN` block). Render `<FrontCover wedding={WEDDING} />` centered in a normal-flow section. Move the countdown and the two hero CTAs into a temporary opening band immediately before Chapter One, with `id="inside-card"`, so the primary actions are never missing between tasks:

```jsx
<section id="inside-card" className="mx-auto max-w-xl px-4 py-16 text-center">
  <p className="text-xs font-semibold uppercase tracking-widest text-[#6f68b8]">The Celebration</p>
  <h2 className="mt-1 font-script text-4xl text-[#48435c] md:text-5xl">Enjelaine &amp; Erwin</h2>
  <p className="mt-2 text-sm font-medium text-[#5A5766]">
    Saturday, April 10, 2027 · Casa De Hufana · Agoo, La Union
  </p>
  <div className="mt-6 flex flex-wrap justify-center gap-3">
    <a href="#rsvp-section" className="...">RSVP Now</a>
    <a href="#timeline-section" className="...">View Day Schedule</a>
  </div>
  <CountdownBadge targetDate={WEDDING_TIMESTAMP} />
</section>
```

Use the existing button styling from the old hero. Define `const WEDDING_TIMESTAMP = getWeddingTimestamp(WEDDING.date);` and import `WEDDING` plus the helpers. Delete the old `const WEDDING_DATE = new Date(...)` constant and use `WEDDING_TIMESTAMP` for the countdown. Keep the old story, timeline, guest guide, guestbook, RSVP, modal, and footer in place for now.

- [ ] **Step 6: Build and lint**

Run: `npm run lint && npm run build`
Expected: lint shows only the pre-existing warnings; build succeeds.

- [ ] **Step 7: Visual check the static cover**

Start `npm run dev -- --host 127.0.0.1`. In a normal browser, click the wax seal to open the envelope, then take screenshots at 1440×1000 and 390×844. Expected: the front cover is a centered portrait keepsake card; names, date, time, venue, address, invitation line, dress code, and “Open Invitation” are all visible; nothing overflows the card; the cue scrolls to the opening band.

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx src/index.css src/components/BotanicalBranch.jsx src/components/KeepsakeCard.jsx src/components/FrontCover.jsx
git commit -m "feat: add keepsake front cover and shared card components"
```

---

### Task 3: Scroll-Scrubbed Cover Lift

**Files:**
- Create: `src/lib/scroll.js`
- Create: `src/hooks/useScrollProgress.js`
- Create: `tests/scroll.test.js`
- Modify: `src/App.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `FrontCover`, `WEDDING`.
- Produces: `clamp(value, min, max)`, `getScrollProgress({ scrollY, elementTop, elementHeight, viewportHeight })`; `useScrollProgress(spacerRef, { targetRef, pinRef, variable, onProgress })`.

- [ ] **Step 1: Write the failing scroll tests**

Create `tests/scroll.test.js`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { clamp, getScrollProgress } from "../src/lib/scroll.js";

test("clamp keeps progress in range", () => {
  assert.equal(clamp(-0.5), 0);
  assert.equal(clamp(0.5), 0.5);
  assert.equal(clamp(1.5), 1);
});

test("progress is 0 at the start and 1 at the end of the scrub distance", () => {
  const base = { elementTop: 0, elementHeight: 1800, viewportHeight: 1000 };
  assert.equal(getScrollProgress({ ...base, scrollY: 0 }), 0);
  assert.equal(getScrollProgress({ ...base, scrollY: 400 }), 0.5);
  assert.equal(getScrollProgress({ ...base, scrollY: 800 }), 1);
  assert.equal(getScrollProgress({ ...base, scrollY: 1200 }), 1);
  assert.equal(getScrollProgress({ ...base, scrollY: -100 }), 0);
});

test("progress is 0 when there is no positive scrub distance", () => {
  assert.equal(
    getScrollProgress({ scrollY: 500, elementTop: 0, elementHeight: 1000, viewportHeight: 1000 }),
    0
  );
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL because `src/lib/scroll.js` does not exist.

- [ ] **Step 3: Implement `src/lib/scroll.js`**

```js
export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function getScrollProgress({ scrollY, elementTop, elementHeight, viewportHeight }) {
  const distance = elementHeight - viewportHeight;
  if (distance <= 0) return 0;
  return clamp((scrollY - elementTop) / distance);
}
```

Run `npm test`; expected PASS.

- [ ] **Step 4: Implement `useScrollProgress`**

Create `src/hooks/useScrollProgress.js`. On mount, attach passive `scroll` and `resize` listeners plus a `prefers-reduced-motion` change listener. Throttle updates with `requestAnimationFrame`. In each update:

- If `matchMedia("(prefers-reduced-motion: reduce)").matches` or `window.innerHeight <= 560`, set the CSS variable to `0`, set `target.inert = false`, call `onProgress?.(0)`, and return.
- Otherwise read the spacer’s `getBoundingClientRect()`, compute `elementTop = rect.top + window.scrollY`, and use `pinRef?.current?.offsetHeight || window.innerHeight` as the viewport height. This keeps the math aligned with the sticky pin’s `100svh` height on mobile browsers.
- Call `getScrollProgress` with `window.scrollY`, `rect.height`, and that viewport height.
- Write the progress with `target.style.setProperty(variable, progress.toFixed(4))`.
- Set `target.inert = progress > 0.98`.
- Call `onProgress?.(progress)`.

Clean up all listeners and the pending frame. The effect depends on `[spacerRef, targetRef, pinRef, variable, onProgress]`.

- [ ] **Step 5: Wire the cover in `App.jsx`**

Add refs: `coverSpacerRef`, `coverPinRef`, `coverShadowRef`, `coverRef`, `insideRef`. Add a stable `handleCoverProgress` with `useCallback` that sets `coverRef.current.inert = progress > 0.98`. Call:

```js
useScrollProgress(coverSpacerRef, {
  targetRef: coverShadowRef,
  pinRef: coverPinRef,
  variable: "--cover-progress",
  onProgress: handleCoverProgress,
});
```

The hook writes the variable on the `.cover-shadow` wrapper so the card and the wrapper’s shadow both inherit it. The `onProgress` callback keeps the card itself inert when lifted. Attach `coverPinRef` to the `.cover-pin` wrapper.

Replace the static front cover section with:

```jsx
<section ref={coverSpacerRef} className="cover-spacer relative z-20">
  <div ref={coverPinRef} className="cover-pin">
    <div ref={coverShadowRef} className="cover-shadow">
      <FrontCover ref={coverRef} wedding={WEDDING} />
    </div>
  </div>
</section>
<main id="inside-card" ref={insideRef} className="inside-card relative z-10 mx-auto">
  <div className="inside-paper">
    {/* temporary: existing opening band and sections, unchanged */}
  </div>
</main>
```

Wrap the opening band and every existing section in the `inside-paper` div. Do not restructure the content yet. Remove the temporary `id="inside-card"` from the opening band; the `main` now owns that id. Also change the root wrapper’s `overflow-x-hidden` to `overflow-x-clip` (or remove it); `overflow-x-hidden` can create a scroll container and break `position: sticky`.

- [ ] **Step 6: Add opening choreography CSS**

In `src/index.css`:

```css
:root {
  --cover-scrub: 80svh;
}

.cover-spacer {
  position: relative;
  height: calc(var(--pin-height) + var(--cover-scrub));
}

.cover-pin {
  position: sticky;
  top: 0;
  display: flex;
  height: var(--pin-height);
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  pointer-events: none;
}

.cover-shadow {
  position: relative;
  isolation: isolate;
  perspective: 1400px;
  pointer-events: none;
}

.cover-shadow::before {
  content: "";
  position: absolute;
  inset: -15% -10%;
  z-index: 0;
  background: radial-gradient(
    ellipse at 50% 60%,
    rgba(97, 231, 134, 0.16),
    rgba(151, 146, 227, 0.1) 45%,
    transparent 72%
  );
  opacity: calc(1 - var(--cover-progress, 0));
  pointer-events: none;
}

.cover-shadow::after {
  content: "";
  position: absolute;
  left: 6%;
  right: 6%;
  bottom: -1.5rem;
  z-index: 0;
  height: 2.5rem;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(72, 67, 92, 0.28), transparent 70%);
  opacity: calc(min(var(--cover-progress, 0) * 2, 1 - var(--cover-progress, 0)) * 0.6);
  pointer-events: none;
}

.cover-card {
  position: relative;
  z-index: 1;
  width: var(--card-width);
  height: var(--cover-height);
  margin-inline: auto;
  transform-origin: top center;
  transform:
    translateY(calc(var(--cover-progress, 0) * -112%))
    rotateX(calc(var(--cover-progress, 0) * -10deg))
    scale(calc(1 - var(--cover-progress, 0) * 0.03));
  will-change: transform;
  backface-visibility: hidden;
  pointer-events: auto;
}

.inside-card {
  margin-top: calc(-1 * var(--pin-height));
  width: var(--card-width);
}

@media (max-width: 640px) {
  :root { --cover-scrub: 50svh; }
}
```

The `.cover-pin` must stay `pointer-events: none`; the card re-enables pointer events. This prevents the transparent sticky layer from blocking the inside after the cover lifts.

- [ ] **Step 7: Verify the opening**

Run: `npm test && npm run lint && npm run build`.
Expected: tests pass; lint only pre-existing warnings; build succeeds.

In the browser at 1440×1000 and 390×844:

- At scroll 0 the front cover is centered and the inside is behind/below it.
- At roughly 25%, 50%, and 75% the cover lifts up and back while the inside top rises into place.
- At 100% the cover is off-screen, the inside top is at the viewport top, and there is no blank watercolor viewport.
- Scrolling back up lowers the cover again.
- The inside RSVP link is clickable when the cover is fully lifted (the sticky layer is not intercepting).
- Resizing the window keeps the handoff aligned.

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx src/index.css src/lib/scroll.js src/hooks/useScrollProgress.js tests/scroll.test.js
git commit -m "feat: add scroll-scrubbed invitation cover lift"
```

---

### Task 4: Continuous Inside Card, Opening Band, Story, Timeline, and Gifts

**Files:**
- Create: `src/components/SectionHeading.jsx`
- Create: `src/components/Reveal.jsx`
- Modify: `src/App.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `WEDDING`, `WEDDING.schedule`, `WEDDING_TIMESTAMP`, `getWeddingTimestamp`, `buildGoogleCalendarUrl`, `buildIcsContent`, `CountdownBadge`.
- Produces: `SectionHeading({ eyebrow, title, description })`, `Reveal` (props `as`, `className`, `delay`, `children`, and any element props). The inside card is one `main#inside-card` with one `.inside-paper` surface and `space-y-20` sections.

- [ ] **Step 1: Create `SectionHeading`**

Create `src/components/SectionHeading.jsx`:

```jsx
import { Heart } from "lucide-react";

export function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="text-center">
      <span className="text-xs font-semibold uppercase tracking-widest text-[#6f68b8]">
        {eyebrow}
      </span>
      <h2 className="mt-1 font-script text-4xl text-[#48435c] md:text-5xl">{title}</h2>
      {description && (
        <p className="mt-2 text-sm font-medium text-[#5A5766]">{description}</p>
      )}
      <div className="mt-5 flex items-center justify-center gap-3">
        <span className="h-px w-10 bg-[#9792e3]/40" />
        <Heart className="h-3.5 w-3.5 fill-[#61E786] text-[#61E786]" />
        <span className="h-px w-10 bg-[#9792e3]/40" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `Reveal`**

Create `src/components/Reveal.jsx`:

```jsx
import { useEffect, useRef } from "react";

export function Reveal({ as: Tag = "div", className = "", delay = 0, style, children, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      element.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={{ "--reveal-delay": `${delay}ms`, ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 3: Add inside paper and reveal CSS**

In `src/index.css`:

```css
.inside-paper {
  position: relative;
  overflow: hidden;
  border-radius: 2rem;
  border: 1px solid rgba(151, 146, 227, 0.3);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 255, 250, 0.9) 55%, rgba(255, 255, 255, 0.94));
  box-shadow: 0 30px 80px -50px rgba(72, 67, 92, 0.4);
  backdrop-filter: blur(10px);
  padding: 3.5rem 1.5rem;
}

.inside-paper::before {
  content: "";
  position: absolute;
  inset: 0.75rem;
  border: 1px dashed rgba(151, 146, 227, 0.22);
  border-radius: 1.5rem;
  pointer-events: none;
}

.inside-paper > * {
  position: relative;
  z-index: 1;
}

.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 650ms ease-out,
    transform 650ms cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--reveal-delay, 0ms);
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (min-width: 640px) {
  .inside-paper { padding: 5rem 2.5rem; }
}

@media (min-width: 768px) {
  .inside-paper { padding: 5rem 3.5rem; }
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 4: Rebuild the inside shell and opening band**

In `src/App.jsx`, replace the temporary `inside-paper` contents with:

```jsx
<div className="inside-paper">
  <div className="space-y-20">
    <Reveal className="text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#6f68b8]">
        The Celebration
      </p>
      <h2 className="mt-1 font-script text-4xl text-[#48435c] md:text-5xl">
        {WEDDING.partner1} &amp; {WEDDING.partner2}
      </h2>
      <p className="mt-2 text-sm font-medium text-[#5A5766]">
        {WEDDING.dateLabel} · {WEDDING.venue} · {WEDDING.address}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a href="#rsvp-section" className="...">RSVP Now</a>
        <a href="#timeline-section" className="...">View Day Schedule</a>
      </div>
      <CountdownBadge targetDate={WEDDING_TIMESTAMP} />
    </Reveal>

    <Reveal as="section" id="story-section">
      <SectionHeading eyebrow="Chapter One" title="Our Summer Story" />
      <p className="mx-auto mt-6 max-w-2xl text-center font-serif-elegant text-lg italic leading-relaxed text-[#5A5766] sm:text-xl">
        "We met under the dappled shade of a botanical garden in July, sharing a love for chilled lemonade, warm guitar songs, and wandering gravel trails. Seven summers later, Erwin knelt in that very orchard at golden hour. We couldn’t imagine stepping into this lifetime together without our closest family and friends."
      </p>
    </Reveal>

    <Reveal as="section" id="timeline-section">
      <SectionHeading
        eyebrow="The Day of Joy"
        title="Order of Events"
        description={`${WEDDING.dateLabel} • ${WEDDING.venue}`}
      />
      {/* timeline list and calendar bar */}
    </Reveal>

    <Reveal as="section">
      {/* A Note on Gifts */}
    </Reveal>
  </div>
</div>
```

Use the existing RSVP/Schedule button classes from the old hero for the opening band. Update the envelope caption to use `WEDDING.partner1`, `WEDDING.partner2`, `WEDDING.dateLabel`, and `WEDDING.address` so no July/Sonoma or hard-coded name remains there. Change the envelope caption’s small uppercase label from `#9792e3` to `#6f68b8`. Keep the existing guestbook and RSVP sections after the gifts note, wrapped in `Reveal`.

- [ ] **Step 5: Rebuild the timeline from config**

Add an icon map near the top of `App.jsx`:

```js
const SCHEDULE_ICONS = {
  sparkles: Sparkles,
  heart: Heart,
  wine: Wine,
  utensils: UtensilsCrossed,
  music: Music,
};
```

Import `Wine` and `Music` from `lucide-react`. Render `WEDDING.schedule.map` as a single-column vertical timeline: `border-l-2 border-[#9792e3]/30 pl-6`, a dot at `-left-[33px]`, the time in `text-xs font-semibold uppercase tracking-wider text-[#6f68b8]`, the title in `font-serif-elegant text-lg font-semibold text-[#48435c]`, and `item.desc` in `text-sm leading-relaxed text-[#5A5766]`. Do not use the old left time column or `sm:ml-32`/`md:ml-40` offsets.

Keep the calendar sync bar as a small inset panel (`rounded-2xl border border-[#9792e3]/25 bg-white/50 p-5`) with the same Google Calendar and `.ics` buttons. Update `generateGoogleCalendarUrl` to `return buildGoogleCalendarUrl(WEDDING);`. Update `handleDownloadICS` to use `buildIcsContent(WEDDING, { uid: \`${Date.now()}@enjelaineanderwin.com\` })`.

- [ ] **Step 6: Restyle the countdown for the paper**

Update `CountdownBadge` in `src/App.jsx`:

- Remove the floating card look (`mt-14`, `shadow-md`, `bg-white/70`, `backdrop-blur-md`).
- Use `mt-8 max-w-md mx-auto rounded-2xl border border-[#7d77cc]/25 bg-white/50 p-4 sm:p-5`.
- Heading: `text-[10px] uppercase tracking-widest text-[#6f68b8] font-semibold`.
- Grid cells: `rounded-xl border border-[#9792e3]/20 bg-white/60 p-2 sm:p-3`.
- Numbers: `text-xl sm:text-2xl font-serif-elegant font-bold text-[#48435c]`.
- Labels: `text-[9px] tracking-wider uppercase font-semibold text-[#6f68b8]`.

- [ ] **Step 7: Remove the Venue & Guest Guide and the gifts placement**

Delete the entire `// 5. INTERACTIVE VENUE, TRAVEL GUIDE & WEATHER FORECAST` section. Remove `activeTravelTab` state and the imports `Car`, `Hotel`, `Compass`, `Sun`, `Wind`, `Droplets`. Keep the “A Note on Gifts” content as a small centered note inside a `max-w-md` dashed-border panel before the guestbook. Keep the existing note text and the existing “View Honeyfund Registry” button, restyled as a quiet text button.

- [ ] **Step 8: Verify the inside**

Run: `npm test && npm run lint && npm run build`.
Expected: tests pass; lint only pre-existing warnings; build succeeds.

Browser check at 1440×1000 and 390×844:

- Chapter One, Order of Events, the gifts note, guestbook, and RSVP are all on one continuous paper surface.
- The opening band shows the countdown and both CTAs.
- The timeline is single-column and readable at 390px.
- The guide is gone.
- Section headings and content groups fade/rise once as they enter.
- No section is hidden from the accessibility tree.

- [ ] **Step 9: Commit**

```bash
git add src/App.jsx src/index.css src/components/SectionHeading.jsx src/components/Reveal.jsx
git commit -m "feat: turn the inside into one continuous invitation card"
```

---

### Task 5: Guestbook, RSVP Reply Card, and Accessible Pass Modal

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `WEDDING.mealOptions`, `WEDDING.rsvpDeadline`, `WEDDING.dateLabel`, `WEDDING.venue`, `createPassCode`.
- Produces: a `passCode` state string; `handleRsvpSubmit` generates the code once and opens the modal. All form controls have `id`/`htmlFor`, and attendance buttons and swatches expose `aria-pressed`.

- [ ] **Step 1: Clean up imports and the seed guestbook wishes**

Remove the unused `Share2` import now; later steps remove the other warnings. Keep the three seed wishes, but remove the Sonoma placeholders:

- “Julian & Clara Vance” → “Clara & James”.
- “Counting down the days to celebrate the happiest chapter of your lives in Sonoma!” → “…in Agoo!”
- “To pure love, barefoot dancing in the vineyards, and a lifetime of summer sunsets. 💕” → “To pure love, barefoot dancing under the stars, and a lifetime of summer sunsets. 💕”

- [ ] **Step 2: Make the guestbook form accessible and on-paper**

- Add `id="guestbook-name"` and `htmlFor="guestbook-name"` to the name field; same for `guestbook-message`.
- Add `className="field ..."` to the input and textarea, removing the old `border-[#9792e3]/30` border class. Keep the padding/text classes.
- Add `aria-pressed={selectedNoteWash === color.hex}` to each wash swatch.
- Change the guestbook intro copy to use `WEDDING.partner1` and `WEDDING.partner2` instead of hard-coded names.
- Change the wish timestamps from `text-[#9792e3]` to `text-[#6f68b8]`.
- Change the note grid to `grid-cols-1 sm:grid-cols-2` so it does not cram three columns into the 720px card.
- Soften the note card shadow to `shadow-[0_12px_30px_-24px_rgba(72,67,92,0.4)]`.

- [ ] **Step 3: Make the RSVP form an inset reply card**

- Replace the outer `watercolor-card rounded-3xl ... shadow-xl` panel with `rounded-[1.5rem] border border-dashed border-[#7d77cc]/50 bg-white/60 p-6 sm:p-8`.
- Keep the botanical corner if it does not crowd the fields; otherwise remove it.
- Eyebrow: `Kindly Respond By ${WEDDING.rsvpDeadline}`.
- Add `id`/`htmlFor` pairs for `rsvp-name`, `rsvp-email`, `rsvp-guest-count`, `rsvp-meal`, `rsvp-dietary`, `rsvp-song`.
- Change the full-name placeholder to “Your full name” and the email placeholder to “you@example.com” so the couple’s names are not used as demo input.
- Add `role="group" aria-labelledby="attendance-label"` around the attendance buttons and `id="attendance-label"` on the question label.
- Add `aria-pressed={rsvpData.attending === "attending"}` and `aria-pressed={rsvpData.attending === "declining"}`.
- Replace the hard-coded meal select with `WEDDING.mealOptions.map((option) => <option key={option} value={option}>{option}</option>)`.
- Change the initial `mealChoice` to `WEDDING.mealOptions[0]`.
- Use `className="field ..."` on every input and select.
- Keep the existing submit button and required fields.

- [ ] **Step 4: Generate the pass code once per modal open**

Remove the `isSubmitted` state and its setter. Add `const [passCode, setPassCode] = useState("");`. In `handleRsvpSubmit`:

```js
const handleRsvpSubmit = (event) => {
  event.preventDefault();
  setPassCode(createPassCode());
  setShowPassModal(true);
};
```

Render `#PASS-{passCode}` instead of calling `Math.random()` in render. Update the pass date to `WEDDING.dateLabel`, the venue to `WEDDING.venue`, and the pass title to `${WEDDING.partner1} & ${WEDDING.partner2}'s Wedding`. Render the entrée as `rsvpData.mealChoice` (no `.split("with")`).

- [ ] **Step 5: Make the pass modal accessible**

- Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby="pass-modal-title"` to the modal container.
- Add `id="pass-modal-title"` to the “Thank You” heading.
- Add a `closeButtonRef` and focus the close button when the modal opens.
- Add an effect that closes on `Escape` while the modal is open.
- Add `aria-pressed={isPlayingMusic}` to the ambience toggle.
- Change the pass modal’s small labels and the “RSVP Received With Love” eyebrow from `text-[#9792e3]` to `text-[#6f68b8]`; keep `#9792e3` for decorative borders and icons.
- Keep the existing close, print, and done buttons.

- [ ] **Step 6: Add field, placeholder, and focus CSS**

In `src/index.css`:

```css
.field {
  border: 1px solid #7d77cc;
  background: rgba(255, 255, 255, 0.8);
  color: #48435c;
}

.field::placeholder {
  color: #6f6b7a;
  opacity: 1;
}

.field:focus-visible {
  outline: 2px solid #6f68b8;
  outline-offset: 2px;
}

:where(a, button, input, select, textarea):focus-visible {
  outline: 2px solid #6f68b8;
  outline-offset: 3px;
}
```

- [ ] **Step 7: Verify the reply flow**

Run: `npm test && npm run lint && npm run build`.
Expected: tests pass; lint has no warnings from `Share2`, `isSubmitted`, or `Math.random`; build succeeds.

Browser check:

- Submit the RSVP; the pass opens with a four-digit code.
- The code does not change while the modal stays open.
- Escape closes the modal and focus returns to the page.
- Tab order reaches the close button, print button, and done button.
- The pass date reads “Saturday, April 10, 2027” and the venue reads “Casa De Hufana”.
- The guestbook swatches and attendance buttons expose pressed state.

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx src/index.css
git commit -m "feat: add accessible RSVP reply card and stable guest pass"
```

---

### Task 6: Names-Only Back Cover and Closing Choreography

**Files:**
- Create: `src/components/BackCover.jsx`
- Modify: `src/App.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `KeepsakeCard`, `WEDDING`, `useScrollProgress`.
- Produces: `BackCover` (forwardRef, props `wedding`) rendering a `footer` with class `back-card`. The page ends on this card.

- [ ] **Step 1: Create `BackCover`**

Create `src/components/BackCover.jsx` as a `forwardRef` component:

```jsx
import { forwardRef } from "react";
import { Heart } from "lucide-react";
import { KeepsakeCard } from "./KeepsakeCard";

export const BackCover = forwardRef(function BackCover({ wedding }, ref) {
  return (
    <KeepsakeCard
      ref={ref}
      as="footer"
      className="back-card flex flex-col items-center justify-center px-6 py-10 text-center"
    >
      <div className="flex items-center justify-center gap-3">
        <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#9792e3]/50 sm:w-20" />
        <Heart className="h-4 w-4 fill-[#61E786] text-[#61E786]" />
        <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#9792e3]/50 sm:w-20" />
      </div>
      <p className="mt-5 font-script text-[clamp(2.2rem,9vw,5rem)] leading-tight text-[#48435c]">
        <span className="block sm:inline">{wedding.partner1}</span>{" "}
        <span className="mx-1 inline-block font-serif-elegant text-[0.5em] font-light text-[#7d77cc]">&amp;</span>{" "}
        <span className="block sm:inline">{wedding.partner2}</span>
      </p>
    </KeepsakeCard>
  );
});
```

No date, navigation, or closing copy.

- [ ] **Step 2: Wire the back cover in `App.jsx`**

Add `backSpacerRef`, `backPinRef`, and `backRef`. Call:

```js
useScrollProgress(backSpacerRef, {
  targetRef: backRef,
  pinRef: backPinRef,
  variable: "--back-progress",
});
```

Replace the old footer with:

```jsx
<section ref={backSpacerRef} className="back-spacer relative z-30">
  <div ref={backPinRef} className="back-pin">
    <BackCover ref={backRef} wedding={WEDDING} />
  </div>
</section>
```

Remove the old footer markup entirely.

- [ ] **Step 3: Add closing CSS**

In `src/index.css`:

```css
:root {
  --back-overlap: 100svh;
}

.back-spacer {
  position: relative;
  z-index: 30;
  height: calc(var(--pin-height) + var(--back-overlap));
  margin-top: calc(-1 * var(--back-overlap));
}

.back-pin {
  position: sticky;
  top: 0;
  display: flex;
  height: var(--pin-height);
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  pointer-events: none;
}

.back-card {
  width: var(--card-width);
  height: var(--cover-height);
  margin-inline: auto;
  transform: translateY(calc((1 - var(--back-progress, 0)) * 100svh));
  will-change: transform;
  pointer-events: auto;
}

@media (max-width: 640px) {
  :root { --back-overlap: 80svh; }
}
```

The negative margin overlaps the final inside viewport so the back cover rises over the inside rather than after a blank gap. The spacer is `pin height + overlap` (`200svh` desktop, `180svh` mobile), so the page ends exactly when the inside has scrolled fully above the viewport.

- [ ] **Step 4: Verify the closing**

Run: `npm test && npm run lint && npm run build`.
Expected: tests pass; lint only pre-existing warnings; build succeeds.

Browser check at 1440×1000 and 390×844:

- At the start of the final spacer the inside is still visible and the back cover is below the viewport.
- Scrolling forward raises the back cover over the inside.
- At the end the back cover is centered, the inside is fully above the viewport, and the page stops there.
- Scrolling back lowers the back cover and returns to the RSVP/guestbook.
- The back cover shows only the names and heart divider.
- The back pin does not intercept clicks before the cover rises.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/index.css src/components/BackCover.jsx
git commit -m "feat: close the invitation with a names-only back cover"
```

---

### Task 7: Reduced Motion, Short Landscape, and Accessibility Polish

**Files:**
- Create: `src/hooks/useReducedMotion.js`
- Modify: `src/App.jsx`
- Modify: `src/components/FrontCover.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: all prior components and hooks.
- Produces: `useReducedMotion()` returning a boolean; static petal rendering; CSS fallbacks for reduced motion and `max-height: 560px`; final focus and label behavior.

- [ ] **Step 1: Add `useReducedMotion`**

Create `src/hooks/useReducedMotion.js`:

```js
import { useEffect, useState } from "react";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event) => setReduced(event.matches);
    media.addEventListener?.("change", handleChange);
    return () => media.removeEventListener?.("change", handleChange);
  }, []);

  return reduced;
}
```

- [ ] **Step 2: Make petals static under reduced motion**

In `WatercolorPetalsCanvas`, call `const reducedMotion = useReducedMotion();`. Add `reducedMotion` to the effect dependencies. After creating the petals, if reduced motion is on:

- Draw every petal once with `drawPetal`.
- Add a resize handler that resizes the canvas and redraws.
- Do not call `requestAnimationFrame`.
- Return the resize cleanup.

The animated path stays as it is.

- [ ] **Step 3: Use the hook for the envelope timing**

In `App.jsx`, replace the `prefersReducedMotion` ref and its `matchMedia` effect with `const reducedMotion = useReducedMotion();`. Use `reducedMotion` in the envelope delay calculation and add it to that effect’s dependency array.

- [ ] **Step 4: Add reduced-motion CSS**

In `src/index.css`:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }

  .cover-spacer { height: auto; }

  .cover-pin {
    position: static;
    height: auto;
    padding: 2rem 1rem;
  }

  .cover-card {
    height: auto;
    min-height: var(--cover-height);
    transform: none !important;
  }

  .inside-card { margin-top: 0; }

  .back-spacer {
    height: auto;
    margin-top: 0;
  }

  .back-pin {
    position: static;
    height: auto;
    padding: 2rem 1rem;
  }

  .back-card {
    height: auto;
    min-height: var(--cover-height);
    transform: none !important;
  }

  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .seal-pulse,
  .animate-bounce,
  .animate-spin-slow {
    animation: none;
  }
}
```

- [ ] **Step 5: Add short-landscape CSS**

In `src/index.css`:

```css
@media (max-height: 560px) {
  .cover-spacer { height: auto; }

  .cover-pin {
    position: static;
    height: auto;
    padding: 1.5rem 1rem;
  }

  .cover-card {
    height: auto;
    min-height: min(82svh, 720px);
    transform: none !important;
  }

  .inside-card { margin-top: 0; }

  .back-spacer {
    height: auto;
    margin-top: 0;
  }

  .back-pin {
    position: static;
    height: auto;
    padding: 1.5rem 1rem;
  }

  .back-card {
    height: auto;
    min-height: min(82svh, 720px);
    transform: none !important;
  }
}
```

Place this after the reduced-motion block so short landscape wins when both apply.

- [ ] **Step 6: Finish the accessibility details**

- Confirm the front-cover cue is an `<a>` with an accessible name and a visible focus ring.
- Confirm the cover card becomes `inert` at progress > 0.98 and loses `inert` when scrolling back.
- Confirm every input/select/textarea has an associated label.
- Confirm the ambience toggle has `aria-pressed`.
- Confirm the guestbook swatches and attendance buttons have `aria-pressed`.
- Remove any imports left unused by the guide removal (`Share2`, `Car`, `Hotel`, `Compass`, `Sun`, `Wind`, `Droplets`, `Coffee`, `Trees`, `MapPin`, `Clock` if unused).
- Run `npm run lint`; expected zero warnings.

- [ ] **Step 7: Verify reduced motion and keyboard behavior**

Run: `npm test && npm run lint && npm run build`.
Expected: all pass; lint zero warnings.

Reduced-motion check in Firefox:

```bash
mkdir -p /tmp/opencode/ff-reduced
printf 'user_pref("ui.prefersReducedMotion", 1);\n' > /tmp/opencode/ff-reduced/user.js
firefox --headless --profile /tmp/opencode/ff-reduced \
  --window-size=1440,1000 \
  --screenshot=/tmp/opencode/card-reduced.png \
  http://127.0.0.1:5174/
```

Expected: the front cover appears in normal flow, the inside follows without a pinned blank viewport, section content is visible without movement, and the back cover appears normally at the end.

Keyboard check:

- Tab from the top reaches “Open Invitation”.
- Activate it; the page scrolls to the inside opening band.
- After the cover is fully lifted, Tab does not enter the cover.
- Tab reaches the RSVP fields, guestbook controls, and pass modal controls with a visible focus ring.
- Escape closes the pass modal.

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx src/index.css src/hooks/useReducedMotion.js src/components/FrontCover.jsx
git commit -m "feat: add reduced-motion and short-viewport invitation fallbacks"
```

---

### Task 8: Final Verification and Content Sweep

**Files:**
- Fixups only, in the files above.
- No new features.

- [ ] **Step 1: Run the full automated checks**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: tests pass, lint reports zero warnings, build succeeds.

- [ ] **Step 2: Sweep for placeholder content**

Run:

```bash
rg -n "July 17|Sonoma|June 10|PST|VANCEWED|Julian knelt|Willow Creek|MacArthur|SFO|STS|wisteria|vineyard" src
```

Expected: no matches. The story’s “in July” and “summer” language may remain; those are story copy, not the wedding date. If any match appears, replace it with canonical content from `src/config.js` or remove the placeholder.

Run:

```bash
rg -n "April 10, 2027|2:00|Casa De Hufana|Agoo, La Union|March 1, 2027" src
```

Expected: `src/config.js` contains the canonical values; rendered components read them from `WEDDING` rather than duplicating them. Inspect `rg -n "Enjelaine|Erwin" src`: the only allowed hard-coded occurrences are the story prose (“Erwin knelt”), the `E & E` monogram, and `src/config.js`. The envelope caption, guestbook intro, pass title, front cover, and back cover must read the names from `WEDDING`.

- [ ] **Step 3: Capture the required viewports**

Start the dev server:

```bash
npm run dev -- --host 127.0.0.1
```

Use Firefox headless screenshots at:

```bash
firefox --headless --window-size=1440,1000 --screenshot=/tmp/opencode/card-1440.png http://127.0.0.1:5174/
firefox --headless --window-size=768,1024  --screenshot=/tmp/opencode/card-768.png  http://127.0.0.1:5174/
firefox --headless --window-size=390,844  --screenshot=/tmp/opencode/card-390.png  http://127.0.0.1:5174/
firefox --headless --window-size=320,700  --screenshot=/tmp/opencode/card-320.png  http://127.0.0.1:5174/
firefox --headless --window-size=844,390  --screenshot=/tmp/opencode/card-844x390.png http://127.0.0.1:5174/
```

The first screen is the envelope by design, so these commands capture the arrival state. Open the seal in a normal browser to inspect the card states at the same viewports. Expected: the envelope fits; after opening, the front cover fits each viewport, no content is clipped, the cue is visible, and the card is centered with watercolor around it. At 844×390 the pin is disabled and the cover scrolls normally.

- [ ] **Step 4: Inspect scroll states**

In a normal browser at 1440×1000 and 390×844:

- Cover progress 0, 0.25, 0.5, 0.75, 1: the cover lifts smoothly, the inside top arrives at the viewport top at 1, and reversing restores the cover.
- Inside sections: each reveals once; no repeated reveal on scroll back.
- Back cover progress 0, 0.5, 1: the back cover rises over the inside, finishes centered, and the page ends there.
- Envelope: seal, flap, letter, crossfade still work.
- Scroll cue, RSVP form, guestbook, pass modal, and audio toggle all work.

- [ ] **Step 5: Check mobile, keyboard, and reduced motion**

- At 320×700 and 390×844, the RSVP is reachable, the back cover does not block it prematurely, and the page scrolls natively.
- Tab through the cover cue, opening band, forms, guestbook, RSVP, and modal; focus is visible and the lifted cover is skipped.
- Repeat the reduced-motion Firefox check from Task 7.
- Confirm petals remain behind the card (`-z-10` with the root `isolate`) and never cover the card.

- [ ] **Step 6: Compare and report**

Compare against the incumbent screenshots in `/tmp/opencode` for unchanged content and the approved card direction. Report the actual viewports and scroll states inspected, plus any remaining mismatches. Do not claim a 1:1 match without a same-size comparison.

- [ ] **Step 7: Commit any final fixes and the documents**

```bash
git add src tests package.json
git commit -m "fix: polish invitation card responsive and accessibility details"
git add docs/superpowers
git commit -m "docs: add invitation card design and implementation plan"
```

If there are no code fixes, skip the first commit and say so. Commit the design and plan documents if they are still untracked.

---

## Plan Self-Review

- **Spec coverage:** envelope (unchanged), front cover (Task 2), opening scrub (Task 3), continuous inside and reveals (Task 4), guestbook/RSVP/pass (Task 5), back cover (Task 6), reduced motion/responsive/accessibility (Task 7), verification (Task 8).
- **Canonical content:** every rendered date/time/venue/deadline comes from `src/config.js`; the placeholder sweep is explicit.
- **Type consistency:** `useScrollProgress(spacerRef, { targetRef, pinRef, variable, onProgress })`, `getScrollProgress({ scrollY, elementTop, elementHeight, viewportHeight })`, `FrontCover`/`BackCover`/`KeepsakeCard` forwardRefs, and `SectionHeading`/`Reveal` props are used consistently across tasks.
- **Review focus:** short landscape/resize, reduced motion, canonical drift, focus/inert, and mobile RSVP reachability each have an owning task and a verification step.
- **Proportion:** UI tasks describe structure, exact copy, class names, and CSS values; they do not transcribe full component bodies except where the interface or copy must be exact.
