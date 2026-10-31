import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Sparkles,
  Download,
  CheckCircle2,
  X,
  Volume2,
  VolumeX
} from "lucide-react";
import Book from "./components/Book";
import { buildLeaves } from "./components/BookPages";
import { RsvpFormModal, WishModal } from "./components/BookModals";
import { WEDDING } from "./config";
import { getWeddingTimestamp, buildGoogleCalendarUrl, buildIcsContent, createPassCode } from "./lib/wedding";


// --- Google Fonts Injection & Custom Styles ---
const StyleInjector = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Quicksand:wght@300;400;500;600&display=swap');

    .font-script {
      font-family: 'Alex Brush', cursive;
    }
    .font-serif-elegant {
      font-family: 'Cormorant Garamond', Georgia, serif;
    }
    .font-body {
      font-family: 'Quicksand', sans-serif;
    }

    /* Soft watercolor paper backdrop pattern */
    .watercolor-canvas {
      background-color: #F4F1DE;
      background-image:
        radial-gradient(circle at 15% 20%, rgba(224, 122, 95, 0.12) 0%, transparent 40%),
        radial-gradient(circle at 85% 30%, rgba(242, 201, 76, 0.12) 0%, transparent 45%),
        radial-gradient(circle at 50% 80%, rgba(224, 122, 95, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 90%, rgba(242, 201, 76, 0.15) 0%, transparent 40%);
    }

    .watercolor-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(224, 122, 95, 0.25);
      box-shadow: none;
    }

    .brushstroke-border {
      position: relative;
      border-radius: 1.25rem;
    }

    /* Wax seal pulse */
    @keyframes pulse-subtle {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 4px 6px rgba(47, 79, 62, 0.2)); }
      50% { transform: scale(1.04); filter: drop-shadow(0 8px 12px rgba(224, 122, 95, 0.35)); }
    }
    .seal-pulse {
      animation: pulse-subtle 3s infinite ease-in-out;
    }

  `}</style>
);

// --- Watercolor Floral SVG Motifs --- (moved to src/components/BotanicalBranch.jsx)

// --- Floating Petal Canvas Component ---
const WatercolorPetalsCanvas = ({ active = true }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Soft watercolor palette (periwinkle, green, lilac, mint)
    const palette = [
      [224, 122, 95],
      [242, 201, 76],
      [47, 79, 62],
      [236, 168, 146]
    ];

    const petalCount = 28;
    const petals = [];

    const createPetal = (atTop = false) => {
      const size = 11 + Math.random() * 10;
      const [r, g, b] = palette[Math.floor(Math.random() * palette.length)];
      const alpha = 0.28 + Math.random() * 0.2;
      const petal = {
        x: Math.random() * canvas.width,
        y: atTop ? -size * 2 : Math.random() * canvas.height,
        size,
        aspect: 0.72 + Math.random() * 0.36,
        speedY: 0.35 + Math.random() * 0.65,
        speedX: Math.random() * 0.5 - 0.25,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.1,
        oscillationSpeed: 0.008 + Math.random() * 0.014,
        angle: Math.random() * Math.PI * 2,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 0.006 + Math.random() * 0.01,
        alpha
      };

      // Cache gradients per petal so the animation stays smooth
      petal.gradient = ctx.createLinearGradient(0, size, 0, -size);
      petal.gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.45})`);
      petal.gradient.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      petal.gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${alpha * 0.85})`);

      petal.glow = ctx.createRadialGradient(
        -size * 0.18,
        -size * 0.35,
        size * 0.05,
        0,
        0,
        size * 1.15
      );
      petal.glow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.38})`);
      petal.glow.addColorStop(1, "rgba(255, 255, 255, 0)");

      return petal;
    };

    for (let i = 0; i < petalCount; i++) {
      petals.push(createPetal());
    }

    const drawPetal = (p) => {
      const { size } = p;
      const cosFlip = Math.cos(p.flip);
      const width = p.aspect * (0.6 + Math.abs(cosFlip) * 0.4);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      // Flutter: squeeze the petal as it turns edge-on
      ctx.scale(cosFlip < 0 ? -width : width, 1);

      // Rounded petal with a tapered base
      ctx.beginPath();
      ctx.moveTo(0, size);
      ctx.bezierCurveTo(
        -size * 1.02,
        size * 0.42,
        -size * 0.98,
        -size * 0.68,
        -size * 0.32,
        -size * 0.94
      );
      ctx.bezierCurveTo(
        -size * 0.12,
        -size * 1.04,
        size * 0.12,
        -size * 1.04,
        size * 0.32,
        -size * 0.94
      );
      ctx.bezierCurveTo(
        size * 0.98,
        -size * 0.68,
        size * 1.02,
        size * 0.42,
        0,
        size
      );
      ctx.closePath();

      ctx.fillStyle = p.gradient;
      ctx.fill();

      // Soft watercolor bloom inside the petal
      ctx.save();
      ctx.clip();
      ctx.fillStyle = p.glow;
      ctx.fillRect(-size * 1.2, -size * 1.2, size * 2.4, size * 2.4);
      ctx.restore();

      // Faint center vein
      ctx.beginPath();
      ctx.moveTo(0, size * 0.55);
      ctx.quadraticCurveTo(size * 0.08, -size * 0.15, 0, -size * 0.82);
      ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.4})`;
      ctx.lineWidth = Math.max(0.5, size * 0.055);
      ctx.stroke();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach((p) => {
        p.angle += p.oscillationSpeed;
        p.flip += p.flipSpeed;
        p.y += p.speedY;
        p.x += Math.sin(p.angle) * 0.7 + p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height + p.size * 2) {
          Object.assign(p, createPetal(true));
        }
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.x < -20) p.x = canvas.width + 20;

        drawPetal(p);
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
};

// --- Countdown Badge Component ---
const WEDDING_TIMESTAMP = getWeddingTimestamp(WEDDING.date);

const CountdownBadge = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const updateCountdown = () => {
      const difference = targetDate - Date.now();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="mt-8 max-w-md mx-auto rounded-2xl border border-[#E07A5F]/25 bg-white/50 p-4 sm:p-5">
      <h3 className="text-[10px] uppercase tracking-widest text-[#2F4F3E]/75 font-semibold mb-4">
        Counting Down to Forever
      </h3>
      <div className="grid grid-cols-4 gap-3 text-center">
        {[
          { label: "Days", val: timeLeft.days },
          { label: "Hours", val: timeLeft.hours },
          { label: "Minutes", val: timeLeft.minutes },
          { label: "Seconds", val: timeLeft.seconds }
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center rounded-xl border border-[#E07A5F]/20 bg-white/60 p-2 sm:p-3"
          >
            <span className="text-xl sm:text-2xl font-serif-elegant font-bold text-[#2F4F3E]">
              {String(item.val).padStart(2, "0")}
            </span>
            <span className="text-[9px] tracking-wider uppercase font-semibold text-[#2F4F3E]/75 mt-1">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Envelope opening timings (ms). The CSS transitions in index.css are
// tuned to match these phase durations.
const ENVELOPE_TIMING = {
  unsealing: 3000,
  revealing: 900,
  reduced: 120
};

// --- Main App Component ---
export default function WeddingApp() {
  // Envelope opening phases: sealed -> unsealing -> revealing -> opened
  const [phase, setPhase] = useState("sealed");
  const isSealed = phase === "sealed";
  const isUnsealing = phase === "unsealing";
  const isRevealing = phase === "revealing";
  const isOpened = phase === "opened";
  const prefersReducedMotion = useRef(false);
  const envelopeOpening = isUnsealing || isRevealing;

  // Audio atmosphere simulation toggle
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const ambienceRef = useRef(null);

  // Refs for focus management: the RSVP submit button regains focus
  // when the pass modal closes; the modal close button takes focus on open.
  const rsvpSubmitRef = useRef(null);
  const passCloseButtonRef = useRef(null);

  // Book control: bookControl.current?.goToPage("rsvp") jumps the book to a page
  // (cover, story, letter, schedule, countdown, gallery, gifts, guestbook, rsvp, end).
  const bookControl = useRef(null);

  // The RSVP form and the guestbook form open as modals over the book.
  const [showRsvpForm, setShowRsvpForm] = useState(false);
  const [showWishForm, setShowWishForm] = useState(false);

  // Track reduced-motion preference for a shorter opening sequence
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mediaQuery.matches;

    const handleChange = (event) => {
      prefersReducedMotion.current = event.matches;
    };

    mediaQuery.addEventListener?.("change", handleChange);
    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, []);

  // Advance the envelope sequence automatically
  useEffect(() => {
    if (phase !== "unsealing" && phase !== "revealing") return;

    const reduced = prefersReducedMotion.current;
    const delay = reduced ? ENVELOPE_TIMING.reduced : ENVELOPE_TIMING[phase];

    const timer = setTimeout(() => {
      setPhase((current) =>
        current === "unsealing" ? "revealing" : current === "revealing" ? "opened" : current
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [phase]);

  // Keep the page behind the sealed envelope from scrolling
  useEffect(() => {
    if (isOpened) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpened]);

  // Handle Envelope Opening
  const handleOpenInvitation = () => {
    if (phase !== "sealed") return;
    window.scrollTo(0, 0);
    setPhase("unsealing");
  };

  // Guestbook & Wishes State
  const [wishes, setWishes] = useState([
    {
      id: 1,
      author: "Clara & James",
      message: "May your summer love forever bloom with joy, laughter, and endless adventure!",
      date: "Just now",
      color: "#F4F1DE"
    },
    {
      id: 2,
      author: "The Montgomery Family",
      message: "Counting down the days to celebrate the happiest chapter of your lives in Agoo!",
      date: "2 hours ago",
      color: "#FBE9E2"
    },
    {
      id: 3,
      author: "Sofia Lin",
      message: "To pure love, barefoot dancing under the stars, and a lifetime of summer sunsets. 💕",
      date: "Yesterday",
      color: "#FAF6E4"
    }
  ]);
  const [newAuthor, setNewAuthor] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedNoteWash, setSelectedNoteWash] = useState("#F4F1DE");

  const handlePostWish = (e) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newMessage.trim()) return;
    setWishes([
      {
        id: Date.now(),
        author: newAuthor,
        message: newMessage,
        date: "Just now",
        color: selectedNoteWash
      },
      ...wishes
    ]);
    setNewAuthor("");
    setNewMessage("");
    setShowWishForm(false);
  };

  // RSVP Form States
  const [rsvpData, setRsvpData] = useState({
    fullName: "",
    email: "",
    attending: "attending",
    guestCount: "1",
    mealChoice: WEDDING.mealOptions[0],
    dietary: "",
    songRequest: ""
  });
  const [passCode, setPassCode] = useState("");
  const [showPassModal, setShowPassModal] = useState(false);

  const handleRsvpSubmit = (event) => {
    event.preventDefault();
    setPassCode(createPassCode());
    setShowRsvpForm(false);
    setShowPassModal(true);
  };

  // Focus management for the pass modal: focus the close button when the
  // modal opens, handle Escape while it is open, and return focus to the
  // RSVP submit button only when an opened modal closes.
  // The cleanup of the open state doubles as the focus-return handler, so
  // nothing steals focus on initial mount.
  useEffect(() => {
    if (!showPassModal) return;

    passCloseButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowPassModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      rsvpSubmitRef.current?.focus();
    };
  }, [showPassModal]);

  // Play or pause the looping ambience track when the toggle changes.
  useEffect(() => {
    const audio = ambienceRef.current;
    if (!audio) return;

    if (isPlayingMusic) {
      audio.volume = 0.35;
      audio.play().catch(() => setIsPlayingMusic(false));
    } else {
      audio.pause();
    }
  }, [isPlayingMusic]);

  // Google Calendar Link Generator
  const generateGoogleCalendarUrl = () => {
    return buildGoogleCalendarUrl(WEDDING);
  };

  // Generate .ICS File
  const handleDownloadICS = () => {
    const icsContent = buildIcsContent(WEDDING, { uid: `${Date.now()}@enjelaineanderwin.com` });

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${WEDDING.partner1}-${WEDDING.partner2}-Wedding.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen watercolor-canvas font-body text-[#2F4F3E]/85 selection:bg-[#E07A5F] selection:text-white relative isolate overflow-x-clip">
      <StyleInjector />
      <WatercolorPetalsCanvas active={isRevealing || isOpened} />

      {/* Looping background ambience track */}
      <audio
        ref={ambienceRef}
        src="/theshire.mp3"
        loop
        preload="none"
      />

      {/* Background Ambience Audio Toggle Button */}
      <div className="fixed top-5 right-5 z-40">
        <button
          onClick={() => setIsPlayingMusic((playing) => !playing)}
          aria-label="Toggle background ambience"
          aria-pressed={isPlayingMusic}
          className="flex items-center gap-2 px-3 py-2 rounded-full watercolor-card border border-[#E07A5F]/40 text-[#2F4F3E] hover:bg-white transition-all text-xs font-medium"
        >
          {isPlayingMusic ? (
            <>
              <Volume2 className="w-4 h-4 text-[#E07A5F]" />
              <span className="hidden sm:inline">The Shire</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-[#2F4F3E]/85" />
              <span className="hidden sm:inline">Play Ambience</span>
            </>
          )}
        </button>
      </div>

      {/* =========================================================================
          1. INTERACTIVE ENVELOPE & WAX SEAL UNVEILING MODAL (FIRST IMPRESSION)
      ========================================================================= */}
      {!isOpened && (
        <section
          className={`envelope-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F4F1DE]/95 ${
            isRevealing ? "is-revealing" : ""
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invitation-title"
        >
          <div
            className={`envelope-stage-shell relative w-full max-w-lg ${
              isRevealing ? "is-revealing" : ""
            }`}
          >
            {/* Romantic Intro Caption */}
            <div
              className={`envelope-caption text-center mb-6 ${
                envelopeOpening ? "is-leaving" : ""
              }`}
            >
              <span className="text-[#2F4F3E]/75 uppercase tracking-widest text-xs font-semibold">
                You Are Cordially Invited
              </span>
              <h2
                id="invitation-title"
                className="text-4xl md:text-5xl font-script text-[#2F4F3E] mt-1"
              >
                {WEDDING.partner1} &amp; {WEDDING.partner2}
              </h2>
              <p className="text-xs font-light text-[#2F4F3E]/85 mt-1 font-serif-elegant italic">
                {WEDDING.dateLabel} • {WEDDING.address}
              </p>
            </div>

            {/* Envelope */}
            <div className="envelope-stage relative mx-auto w-full max-w-md aspect-[5/4]">
              {/* Envelope back panel */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FBF9EE] via-[#F4F1DE] to-[#F4F1DE] border border-[#E07A5F]/30 shadow-2xl" />

              {/* Envelope top flap */}
              <div
                className={`envelope-flap absolute inset-x-0 top-0 h-[58%] ${
                  envelopeOpening ? "is-open" : ""
                }`}
              >
                <div
                  className="envelope-flap-face absolute inset-0"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    background:
                      "linear-gradient(165deg, #FDFBF3 0%, #F4F1DE 55%, #EFEBD2 100%)",
                    filter: "drop-shadow(0 5px 7px rgba(47, 79, 62, 0.13))"
                  }}
                />
                <div
                  className="envelope-flap-face absolute inset-0 opacity-70"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(224,122,95,0.06) 55%, rgba(242,201,76,0.14) 100%)"
                  }}
                />
                <div
                  className="envelope-flap-lining absolute inset-0"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    background:
                      "radial-gradient(circle at 28% 18%, rgba(224, 122, 95, 0.2) 0%, transparent 55%), linear-gradient(165deg, #FBE9E2 0%, #EFEBD2 55%, #E3DEBD 100%)",
                    filter: "drop-shadow(0 5px 7px rgba(47, 79, 62, 0.13))"
                  }}
                />
              </div>

              {/* Invitation letter tucked inside */}
              <div
                className={`envelope-letter absolute inset-x-5 top-5 bottom-7 rounded-xl border border-[#E07A5F]/25 bg-[#fffdf8] shadow-lg overflow-hidden ${
                  envelopeOpening ? "is-out" : ""
                }`}
              >
                <div className="h-full m-1.5 sm:m-2 p-4 sm:p-6 rounded-lg border border-dashed border-[#E07A5F]/35 text-center flex flex-col items-center justify-center">
                  <span className="font-serif-elegant italic text-[10px] sm:text-sm text-[#2F4F3E]/70 block mb-1.5 sm:mb-2">
                    A Midsummer Celebration of Love
                  </span>
                  <p className="text-lg sm:text-2xl font-serif-elegant font-normal text-[#2F4F3E] leading-snug">
                    Will you join us in the garden under the stars?
                  </p>
                  <div className="mt-3 sm:mt-5 flex items-center gap-2 text-[#E07A5F]">
                    <span className="h-px w-6 sm:w-8 bg-[#E07A5F]/40" />
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                    <span className="h-px w-6 sm:w-8 bg-[#E07A5F]/40" />
                  </div>
                  <span className="mt-1 sm:mt-2 font-script text-2xl sm:text-3xl text-[#2F4F3E]">E & E</span>
                </div>
              </div>

              {/* Envelope front pocket */}
              <div className="absolute inset-x-0 bottom-0 top-[42%] overflow-hidden rounded-b-2xl">
                <div
                  className="absolute inset-0 bg-gradient-to-b from-[#F1EEDA] to-[#E8E3C6]"
                  style={{
                    clipPath: "polygon(0 14%, 50% 0, 100% 14%, 100% 100%, 0 100%)"
                  }}
                />
                <div
                  className="absolute inset-0 opacity-70"
                  style={{
                    clipPath: "polygon(0 14%, 50% 0, 100% 14%, 100% 100%, 0 100%)",
                    backgroundImage:
                      "linear-gradient(135deg, transparent 49.4%, rgba(224,122,95,0.22) 50%, transparent 50.6%), linear-gradient(225deg, transparent 49.4%, rgba(224,122,95,0.22) 50%, transparent 50.6%)"
                  }}
                />
              </div>

              {/* Wax seal + unseal prompt */}
              <div className="absolute inset-x-0 top-[44%] flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleOpenInvitation}
                  disabled={!isSealed}
                  className={`envelope-seal group relative flex flex-col items-center focus:outline-none ${
                    envelopeOpening ? "is-broken" : ""
                  }`}
                  aria-label="Break seal and open invitation"
                >
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#2F4F3E] via-[#3C6350] to-[#E07A5F] p-1 cursor-pointer shadow-lg hover:shadow-2xl transition-all flex items-center justify-center ${
                      isSealed ? "seal-pulse" : ""
                    }`}
                  >
                    <div className="w-full h-full rounded-full border border-dashed border-[#F4F1DE]/50 flex flex-col items-center justify-center text-[#F4F1DE]">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-[#E07A5F] text-[#E07A5F] mb-0.5 group-hover:scale-125 transition-transform" />
                      <span className="font-serif-elegant text-[10px] sm:text-xs tracking-wider uppercase font-semibold">
                        E & E
                      </span>
                    </div>
                  </div>
                </button>
                <span
                  className={`mt-2 text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-[#2F4F3E] flex items-center gap-1.5 transition-opacity duration-300 ${
                    isSealed ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <span>Click to Unseal</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          2. THE BOOK (FRONT COVER -> SPREADS -> BACK COVER, DRIVEN BY SCROLL)
      ========================================================================= */}
      <Book
        wedding={WEDDING}
        controlRef={bookControl}
        leaves={buildLeaves({
          wedding: WEDDING,
          countdown: <CountdownBadge targetDate={WEDDING_TIMESTAMP} />,
          wishes,
          googleCalendarUrl: generateGoogleCalendarUrl(),
          onDownloadICS: handleDownloadICS,
          onOpenRsvp: () => setShowRsvpForm(true),
          onOpenWish: () => setShowWishForm(true),
          onOpenRegistry: () => alert("Honeymoon registry link opened! Thank you for your generosity."),
          rsvpButtonRef: rsvpSubmitRef,
        })}
      />

      {/* RSVP and guestbook forms (opened from the book's pages) */}
      <RsvpFormModal
        open={showRsvpForm}
        onClose={() => setShowRsvpForm(false)}
        data={rsvpData}
        setData={setRsvpData}
        onSubmit={handleRsvpSubmit}
      />
      <WishModal
        open={showWishForm}
        onClose={() => setShowWishForm(false)}
        author={newAuthor}
        setAuthor={setNewAuthor}
        message={newMessage}
        setMessage={setNewMessage}
        wash={selectedNoteWash}
        setWash={setSelectedNoteWash}
        onSubmit={handlePostWish}
      />

      {/* =========================================================================
          8. RSVP CONFIRMATION MODAL & DIGITAL EVENT PASS
      ========================================================================= */}
      {showPassModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pass-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F4F3E]/50 backdrop-blur-sm animate-fade-in"
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#E07A5F]/40 shadow-2xl overflow-hidden">
            <button
              ref={passCloseButtonRef}
              onClick={() => setShowPassModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-[#2F4F3E]/85"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#F4F1DE] border border-[#F2C94C] flex items-center justify-center text-[#E07A5F] mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <span className="text-xs uppercase tracking-widest font-bold text-[#2F4F3E]/75">
                RSVP Received With Love
              </span>
              <h3 id="pass-modal-title" className="text-3xl font-script text-[#2F4F3E] mt-1">
                Thank You, {rsvpData.fullName || "Guest"}!
              </h3>
              <p className="text-xs text-[#2F4F3E]/85 mt-2 font-serif-elegant italic text-base">
                {rsvpData.attending === "attending"
                  ? "We have reserved your seat in our summer garden celebration. Here is your digital guest pass:"
                  : "We are sad you cannot join us in person, but your love and warm wishes mean the world to us."}
              </p>
            </div>

            {/* Digital Wedding Pass Boarding Ticket */}
            {rsvpData.attending === "attending" && (
              <div className="mt-6 rounded-2xl bg-[#F4F1DE]/90 border border-dashed border-[#E07A5F] p-5 relative">
                <div className="flex justify-between items-center border-b border-[#E07A5F]/30 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#2F4F3E]/75">
                      Official Guest Pass
                    </span>
                    <h4 className="font-serif-elegant font-bold text-lg text-[#2F4F3E]">
                      {WEDDING.partner1} &amp; {WEDDING.partner2}&rsquo;s Wedding
                    </h4>
                  </div>
                  <Sparkles className="w-5 h-5 text-[#E07A5F]" />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 text-xs text-[#2F4F3E]/85">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-[#2F4F3E]/75">Guest</span>
                    <span className="font-semibold text-[#2F4F3E]">{rsvpData.fullName}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-[#2F4F3E]/75">Party Size</span>
                    <span className="font-semibold text-[#2F4F3E]">{rsvpData.guestCount} Guest(s)</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-[#2F4F3E]/75">Date</span>
                    <span className="font-semibold text-[#2F4F3E]">{WEDDING.dateLabel}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-[#2F4F3E]/75">Venue</span>
                    <span className="font-semibold text-[#2F4F3E]">{WEDDING.venue}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E07A5F]/30 flex justify-between items-center text-[10px] text-[#2F4F3E]">
                  <span>Entrée: {rsvpData.mealChoice}</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#E07A5F]/30 font-semibold">
                    #PASS-{passCode}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#F2C94C] text-[#2F4F3E] font-bold text-xs uppercase tracking-wider hover:bg-[#E6BB36] transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Save / Print Pass
              </button>
              <button
                onClick={() => setShowPassModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#2F4F3E]/20 text-[#2F4F3E] text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
