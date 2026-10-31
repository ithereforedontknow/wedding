import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
// Phone address bars showing/hiding fire resize events; don't rebuild the book for those.
ScrollTrigger.config({ ignoreMobileResize: true });

// All timing lives here, in "scroll units" (0-100 = the whole scroll range).
// Change the numbers below to retime the book; nothing else needs to move.
function planFlips(count, mobile) {
  // Mobile: one page at a time. Every page except the last flips away.
  if (mobile) {
    const flips = Math.max(count - 1, 1);
    const step = 88 / flips;
    return Array.from({ length: flips }, (_, i) => ({
      at: 6 + i * step,
      dur: step * 0.8,
    }));
  }

  // Desktop: first leaf = cover opens, last leaf = back cover closes,
  // the leaves in between are the spreads (with reading time between flips).
  const middle = Math.max(count - 2, 0);
  const step = middle ? 54 / middle : 0;
  return [
    { at: 8, dur: 16, recenter: "open" },
    ...Array.from({ length: middle }, (_, i) => ({ at: 32 + i * step, dur: 10 })),
    { at: 90, dur: 10, recenter: "close" },
  ];
}

// "Rest points": the scroll position of each readable state of the book
// (closed cover, each open spread, closed back cover). Dots and arrow keys jump between these.
export function planStops(count, mobile) {
  const flips = planFlips(count, mobile);
  return [
    0,
    ...flips.map((flip, i) => {
      const next = flips[i + 1];
      return next ? (flip.at + flip.dur + next.at) / 2 : 100;
    }),
  ];
}

const nearestStop = (stops, unit) =>
  stops.reduce((best, stop, i) => (Math.abs(stop - unit) < Math.abs(stops[best] - unit) ? i : best), 0);

export function useBookTimeline({ scrollRef, bookRef, count, mobile, disabled = false }) {
  const stops = useMemo(() => planStops(count, mobile), [count, mobile]);
  const [activeStop, setActiveStop] = useState(0);
  const triggerRef = useRef(null);

  useLayoutEffect(() => {
    if (disabled) return undefined;
    const scroller = scrollRef.current;
    const book = bookRef.current;
    if (!scroller || !book) return undefined;

    const ctx = gsap.context(() => {
      const leaves = gsap.utils.toArray(".book-leaf", book);
      const n = leaves.length;
      const flips = planFlips(n, mobile);
      const stopList = planStops(n, mobile);
      const edgeRight = book.querySelector(".book-edge--right");
      const edgeLeft = book.querySelector(".book-edge--left");
      const ground = book.querySelector(".book-ground");

      // Unflipped leaves stack front-to-back; the closed book is shifted left
      // by half the book width (25%) so the cover sits centered on screen.
      gsap.set(leaves, { rotationY: 0, opacity: 1, willChange: "auto", zIndex: (i) => n - i });
      gsap.set(book, { xPercent: mobile ? 0 : -25 });

      if (!mobile) {
        // Paper-stack edges and the ground shadow only exist on the spread layout.
        // The ground shadow covers only the visible half while the book is closed.
        gsap.set(edgeRight, { scaleX: 1 });
        gsap.set(edgeLeft, { scaleX: 0 });
        gsap.set(ground, { xPercent: 25, scaleX: 0.5 });
      }

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut", force3D: true },
        scrollTrigger: {
          trigger: scroller,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => setActiveStop(nearestStop(stopList, self.progress * 100)),
        },
      });

      triggerRef.current = tl.scrollTrigger;

      flips.forEach((flip, i) => {
        const leaf = leaves[i];
        if (!leaf) return;
        const half = flip.dur / 2;

        // Only the leaf that is about to turn gets its own GPU layer, and only
        // for the duration of its turn (the 100 cap keeps the timeline at 100 units).
        tl.set(leaf, { willChange: "transform" }, Math.max(flip.at - 3, 0));
        tl.set(leaf, { willChange: "auto" }, Math.min(flip.at + flip.dur + 3, 100));

        tl.to(leaf, { rotationY: -180, duration: flip.dur }, flip.at);

        // Curl shading: the front face darkens as it lifts away, the back face
        // brightens as it lands.
        const frontShade = leaf.querySelector(".book-face--front .book-shade");
        const backShade = leaf.querySelector(".book-face--back .book-shade");
        if (frontShade) {
          tl.fromTo(frontShade, { opacity: 0 }, { opacity: 0.45, duration: half, ease: "power1.in" }, flip.at);
        }
        if (backShade) {
          tl.fromTo(backShade, { opacity: 0.45 }, { opacity: 0, duration: half, ease: "power1.out" }, flip.at + half);
        }

        if (mobile) {
          // The page swings off to the left and fades at the end of the turn.
          tl.to(leaf, { opacity: 0, duration: flip.dur * 0.3, ease: "none" }, flip.at + flip.dur * 0.7);
          return;
        }

        // Halfway through the turn the leaf lands on the left stack.
        tl.set(leaf, { zIndex: i + 1 }, flip.at + half);

        // Lift toward the viewer with a slight bend, then settle.
        tl.to(leaf, { z: 50, skewY: -1.5, duration: half, ease: "sine.out" }, flip.at);
        tl.to(leaf, { z: 0, skewY: 0, duration: half, ease: "sine.in" }, flip.at + half);

        // Paper thickness: the right stack thins, the left stack grows.
        tl.to(edgeRight, { scaleX: (n - i - 1) / n, duration: flip.dur, ease: "none" }, flip.at);
        tl.to(edgeLeft, { scaleX: (i + 1) / n, duration: flip.dur, ease: "none" }, flip.at);

        if (flip.recenter) {
          const opening = flip.recenter === "open";
          tl.to(book, { xPercent: opening ? 0 : 25, duration: flip.dur }, flip.at);
          tl.to(ground, { xPercent: opening ? 0 : -25, scaleX: opening ? 1 : 0.5, duration: flip.dur }, flip.at);
        }
      });

      // Pad the timeline to exactly 100 units so scroll maps 1:1 to the plan above.
      tl.to({}, { duration: 0 }, 100);

      setActiveStop(nearestStop(stopList, (tl.scrollTrigger?.progress ?? 0) * 100));
    }, scroller);

    return () => {
      triggerRef.current = null;
      ctx.revert();
    };
  }, [scrollRef, bookRef, count, mobile, disabled]);

  // Scroll to a rest point (0 = closed cover, last = closed back cover).
  const goToStop = useCallback(
    (index) => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const i = Math.max(0, Math.min(stops.length - 1, index));
      const top = trigger.start + (trigger.end - trigger.start) * (stops[i] / 100);
      window.scrollTo({ top, behavior: "smooth" });
    },
    [stops]
  );

  return { stops, activeStop, goToStop };
}
