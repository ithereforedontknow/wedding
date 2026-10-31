import React, { useCallback, useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import FrontCover from "./FrontCover";
import { useBookTimeline } from "../hooks/useBookTimeline";
import "./book.css";

const MOBILE_QUERY = "(max-width: 767px)";
// No page-turn choreography for reduced motion or very short screens:
// the pages are simply stacked vertically instead.
const FALLBACK_QUERY = "(prefers-reduced-motion: reduce), (max-height: 560px)";

// Reading order of the default pages, and the rest point each one belongs to.
const PAGE_NAMES = ["cover", "story", "letter", "schedule", "countdown", "gallery", "gifts", "guestbook", "rsvp", "end"];
const SPREAD_STOP = { cover: 0, story: 1, letter: 1, schedule: 2, countdown: 2, gallery: 3, gifts: 3, guestbook: 4, rsvp: 4, end: 5 };
const SPREAD_LABELS = ["Front cover", "Story and letter", "Schedule and countdown", "Gallery and gifts", "Guestbook and RSVP", "Back cover"];

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

// Temporary page used when no real content is passed in.
const Placeholder = ({ label }) => (
  <div className="book-page">
    <div className="text-center">
      <p className="font-serif-elegant text-2xl italic text-[#2F4F3E]">{label}</p>
    </div>
  </div>
);

// Closing face of the book: same look as the footer keepsake card.
export const BackCover = ({ wedding }) => (
  <div className="book-page book-page--cover">
    <div className="text-center">
      <div className="flex items-center justify-center gap-3">
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#E07A5F]/50 sm:w-16" />
        <Heart className="h-3.5 w-3.5 fill-[#E07A5F] text-[#E07A5F]" />
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#E07A5F]/50 sm:w-16" />
      </div>
      <h3 className="mt-4 font-script leading-[1.05] text-[#2F4F3E] text-[clamp(2.4rem,16cqw,4.25rem)]">
        {wedding.partner1}
        <span className="block font-serif-elegant text-[0.4em] font-light leading-tight text-[#E07A5F]">&amp;</span>
        {wedding.partner2}
      </h3>
    </div>
  </div>
);

// One leaf = a sheet of paper: `front` is the right-hand page, `back` is the
// left-hand page of the next spread.
function defaultLeaves(wedding) {
  return [
    { front: <FrontCover wedding={wedding} />, back: <Placeholder label="Our Summer Story" /> },
    { front: <Placeholder label="A Letter From Us" />, back: <Placeholder label="Order of Events" /> },
    { front: <Placeholder label="Countdown + Calendar" />, back: <Placeholder label="Gallery" /> },
    { front: <Placeholder label="A Note on Gifts" />, back: <Placeholder label="Guestbook" /> },
    { front: <Placeholder label="RSVP" />, back: <BackCover wedding={wedding} /> },
  ];
}

// `controlRef` (optional): after mount, controlRef.current.goToPage("rsvp") scrolls
// the book to that page. Names: cover, story, letter, schedule, countdown,
// gallery, gifts, guestbook, rsvp, end.
export default function Book({ wedding, leaves, controlRef }) {
  const scrollRef = useRef(null);
  const bookRef = useRef(null);
  const activeRef = useRef(0);
  const mobile = useMediaQuery(MOBILE_QUERY);
  const fallback = useMediaQuery(FALLBACK_QUERY);

  const source = leaves ?? defaultLeaves(wedding);
  const pages = source.flatMap((leaf) => [leaf.front, leaf.back]);
  // Mobile shows one page at a time, so every page becomes its own leaf.
  const sheets = mobile ? pages.map((page) => ({ front: page })) : source;

  const { stops, activeStop, goToStop } = useBookTimeline({
    scrollRef,
    bookRef,
    count: sheets.length,
    mobile,
    disabled: fallback,
  });
  activeRef.current = activeStop;

  // Only the pages you can currently see are focusable / readable by assistive tech.
  useEffect(() => {
    const book = bookRef.current;
    if (!book || fallback) return;
    book.querySelectorAll(".book-face").forEach((face) => {
      const sheet = Number(face.dataset.sheet);
      const visible = mobile
        ? sheet === activeStop
        : face.dataset.side === "front"
          ? sheet === activeStop
          : sheet === activeStop - 1;
      face.inert = !visible;
    });
  });

  // Move one rest point forward (+1) or back (-1). Rapid gestures build on the
  // last target instead of the (still scrolling) current page, so two quick swipes go two pages.
  const lastStep = useRef({ target: 0, at: 0 });
  const step = useCallback(
    (dir) => {
      const now = performance.now();
      const base = now - lastStep.current.at < 900 ? lastStep.current.target : activeRef.current;
      const next = Math.max(0, Math.min(stops.length - 1, base + dir));
      if (next === base) return;
      lastStep.current = { target: next, at: now };
      goToStop(next);
    },
    [goToStop, stops.length]
  );

  // Swipe (touch), drag (mouse / pen) and horizontal trackpad scroll turn the page.
  // Left = next page, right = previous page. Vertical scrolling is untouched.
  useEffect(() => {
    const root = scrollRef.current;
    if (fallback || !root) return undefined;

    const ignore = (target) =>
      document.querySelector('[role="dialog"]') || target?.closest?.("input, textarea, select, [contenteditable='true']");

    let start = null;
    let swallowClickUntil = 0;

    const onDown = (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (ignore(event.target)) return;
      start = { x: event.clientX, y: event.clientY, type: event.pointerType, id: event.pointerId };
    };

    const onMove = (event) => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      // A mouse drag that is clearly horizontal must not select text while it happens.
      if (start.type === "mouse" && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
        window.getSelection?.()?.removeAllRanges();
      }
    };

    const onUp = (event) => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      const needed = start.type === "mouse" ? 80 : 50;
      start = null;
      if (Math.abs(dx) < needed || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      swallowClickUntil = performance.now() + 60; // the drag must not also "click" a button
      step(dx < 0 ? 1 : -1);
    };

    const onCancel = () => {
      start = null;
    };

    const onClickCapture = (event) => {
      if (performance.now() < swallowClickUntil) {
        event.stopPropagation();
        event.preventDefault();
      }
    };

    // Two-finger horizontal swipe on a trackpad (or a tilt wheel)
    let wheelSum = 0;
    let wheelTimer = 0;
    let wheelLockedUntil = 0;
    const onWheel = (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      if (ignore(event.target) || performance.now() < wheelLockedUntil) return;
      wheelSum += event.deltaX;
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => (wheelSum = 0), 160);
      if (Math.abs(wheelSum) > 90) {
        step(wheelSum > 0 ? 1 : -1);
        wheelSum = 0;
        wheelLockedUntil = performance.now() + 700;
      }
    };

    root.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    root.addEventListener("click", onClickCapture, true);
    root.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      clearTimeout(wheelTimer);
      root.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      root.removeEventListener("click", onClickCapture, true);
      root.removeEventListener("wheel", onWheel);
    };
  }, [fallback, step]);

  // Arrow keys / Page Up / Page Down move between rest points.
  useEffect(() => {
    if (fallback) return undefined;

    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (event.target.closest?.("input, textarea, select, [contenteditable='true']")) return;

      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        step(-1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fallback, step]);

  // Let the rest of the app jump to a page by name.
  useEffect(() => {
    if (!controlRef) return undefined;
    controlRef.current = {
      goToPage: (name) => {
        if (fallback) {
          document.getElementById(`book-page-${name}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        const index = mobile ? PAGE_NAMES.indexOf(name) : SPREAD_STOP[name];
        if (index !== undefined && index >= 0) goToStop(index);
      },
    };
    return () => {
      controlRef.current = null;
    };
  }, [controlRef, fallback, mobile, goToStop]);

  if (fallback) {
    return (
      <section className="book-fallback relative z-20" aria-label="Wedding invitation">
        {pages.map((page, i) => (
          <div key={i} id={`book-page-${PAGE_NAMES[i] ?? i}`} className="book-fallback-item">
            {page}
          </div>
        ))}
      </section>
    );
  }

  const stopLabel = (i) => (!mobile && stops.length === SPREAD_LABELS.length ? SPREAD_LABELS[i] : `Page ${i + 1}`);

  return (
    <section ref={scrollRef} className="book-scroll relative z-20" aria-label="Wedding invitation">
      <div className="book-stage">
        <div ref={bookRef} className="book">
          <div className="book-ground" aria-hidden="true" />
          <div className="book-edge book-edge--left" aria-hidden="true" />
          <div className="book-edge book-edge--right" aria-hidden="true" />
          {sheets.map((sheet, i) => (
            <div key={i} className="book-leaf">
              <div className="book-face book-face--front" data-sheet={i} data-side="front">
                {sheet.front}
                <span className="book-shade" aria-hidden="true" />
              </div>
              {sheet.back && (
                <div className="book-face book-face--back" data-sheet={i} data-side="back">
                  {sheet.back}
                  <span className="book-shade" aria-hidden="true" />
                </div>
              )}
            </div>
          ))}
        </div>

        <nav className="book-dots" aria-label="Invitation pages">
          {stops.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to ${stopLabel(i)}`}
              aria-current={i === activeStop ? "step" : undefined}
              onClick={() => goToStop(i)}
              className={`book-dot${i === activeStop ? " is-active" : ""}`}
            />
          ))}
        </nav>
      </div>
    </section>
  );
}
