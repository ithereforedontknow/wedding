import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart,
  Calendar,
  Send,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  UtensilsCrossed,
  Wine,
  Music,
  X,
  Volume2,
  VolumeX
} from "lucide-react";
import { BotanicalBranch } from "./components/BotanicalBranch";
import FrontCover from "./components/FrontCover";
import { SectionHeading } from "./components/SectionHeading";
import { Reveal } from "./components/Reveal";
import { WEDDING } from "./config";
import { getWeddingTimestamp, buildGoogleCalendarUrl, buildIcsContent } from "./lib/wedding";
import { useScrollProgress } from "./hooks/useScrollProgress";

// Timeline icon map for the schedule entries (keys match WEDDING.schedule icons)
const SCHEDULE_ICONS = {
  sparkles: Sparkles,
  heart: Heart,
  wine: Wine,
  utensils: UtensilsCrossed,
  music: Music,
};

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
      background-color: #EDFFEC;
      background-image:
        radial-gradient(circle at 15% 20%, rgba(151, 146, 227, 0.12) 0%, transparent 40%),
        radial-gradient(circle at 85% 30%, rgba(97, 231, 134, 0.12) 0%, transparent 45%),
        radial-gradient(circle at 50% 80%, rgba(151, 146, 227, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 90%, rgba(97, 231, 134, 0.15) 0%, transparent 40%);
    }

    .watercolor-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(151, 146, 227, 0.25);
      box-shadow: 0 10px 30px -10px rgba(72, 67, 92, 0.08);
    }

    .brushstroke-border {
      position: relative;
      border-radius: 1.25rem;
    }

    /* Wax seal pulse */
    @keyframes pulse-subtle {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 4px 6px rgba(72, 67, 92, 0.2)); }
      50% { transform: scale(1.04); filter: drop-shadow(0 8px 12px rgba(151, 146, 227, 0.35)); }
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
      [151, 146, 227],
      [97, 231, 134],
      [200, 195, 255],
      [180, 245, 205]
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
    <div className="mt-8 max-w-md mx-auto rounded-2xl border border-[#7d77cc]/25 bg-white/50 p-4 sm:p-5">
      <h3 className="text-[10px] uppercase tracking-widest text-[#6f68b8] font-semibold mb-4">
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
            className="flex flex-col items-center justify-center rounded-xl border border-[#9792e3]/20 bg-white/60 p-2 sm:p-3"
          >
            <span className="text-xl sm:text-2xl font-serif-elegant font-bold text-[#48435c]">
              {String(item.val).padStart(2, "0")}
            </span>
            <span className="text-[9px] tracking-wider uppercase font-semibold text-[#6f68b8] mt-1">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
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

  // Scroll-scrubbed cover lift refs
  const coverSpacerRef = useRef(null);
  const coverPinRef = useRef(null);
  const coverShadowRef = useRef(null);
  const coverRef = useRef(null);
  const insideRef = useRef(null);

  // Keep the lifted cover inert so it never blocks the inside content.
  const handleCoverProgress = useCallback((progress) => {
    if (coverRef.current) coverRef.current.inert = progress > 0.98;
  }, []);

  useScrollProgress(coverSpacerRef, {
    targetRef: coverShadowRef,
    pinRef: coverPinRef,
    variable: "--cover-progress",
    onProgress: handleCoverProgress,
  });

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
    const delay = phase === "unsealing" ? (reduced ? 120 : 1150) : (reduced ? 120 : 550);

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
      author: "Julian & Clara Vance",
      message: "May your summer love forever bloom with joy, laughter, and endless adventure!",
      date: "Just now",
      color: "#EDFFEC"
    },
    {
      id: 2,
      author: "The Montgomery Family",
      message: "Counting down the days to celebrate the happiest chapter of your lives in Sonoma!",
      date: "2 hours ago",
      color: "#f6f3ff"
    },
    {
      id: 3,
      author: "Sofia Lin",
      message: "To pure love, barefoot dancing in the vineyards, and a lifetime of summer sunsets. 💕",
      date: "Yesterday",
      color: "#eefbee"
    }
  ]);
  const [newAuthor, setNewAuthor] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedNoteWash, setSelectedNoteWash] = useState("#EDFFEC");

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
  };

  // RSVP Form States
  const [rsvpData, setRsvpData] = useState({
    fullName: "",
    email: "",
    attending: "attending",
    guestCount: "1",
    mealChoice: "Salmon with Summer Dill Velouté",
    dietary: "",
    songRequest: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setShowPassModal(true);
  };

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
    link.setAttribute("download", "Enjelaine-Erwin-Wedding.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen watercolor-canvas font-body text-[#5A5766] selection:bg-[#9792e3] selection:text-white relative isolate overflow-x-clip">
      <StyleInjector />
      <WatercolorPetalsCanvas active={isRevealing || isOpened} />

      {/* Background Ambience Audio Toggle Button */}
      <div className="fixed top-5 right-5 z-40">
        <button
          onClick={() => setIsPlayingMusic(!isPlayingMusic)}
          aria-label="Toggle background ambience"
          className="flex items-center gap-2 px-3 py-2 rounded-full watercolor-card border border-[#9792e3]/40 text-[#48435c] hover:bg-white transition-all shadow-sm text-xs font-medium"
        >
          {isPlayingMusic ? (
            <>
              <Volume2 className="w-4 h-4 text-[#61E786]" />
              <span className="hidden sm:inline">Acoustic Strings</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-[#5A5766]" />
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
          className={`envelope-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#EDFFEC]/95 ${
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
              <span className="text-[#6f68b8] uppercase tracking-widest text-xs font-semibold">
                You Are Cordially Invited
              </span>
              <h2
                id="invitation-title"
                className="text-4xl md:text-5xl font-script text-[#48435c] mt-1"
              >
                {WEDDING.partner1} &amp; {WEDDING.partner2}
              </h2>
              <p className="text-xs font-light text-[#5A5766] mt-1 font-serif-elegant italic">
                {WEDDING.dateLabel} • {WEDDING.address}
              </p>
            </div>

            {/* Envelope */}
            <div className="envelope-stage relative mx-auto w-full max-w-md aspect-[5/4]">
              {/* Envelope back panel */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#f8fffa] via-[#f2fbf4] to-[#EDFFEC] border border-[#9792e3]/30 shadow-2xl" />

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
                      "linear-gradient(165deg, #fbfffc 0%, #f2fbf4 55%, #e6f9eb 100%)",
                    filter: "drop-shadow(0 5px 7px rgba(72, 67, 92, 0.13))"
                  }}
                />
                <div
                  className="envelope-flap-face absolute inset-0 opacity-70"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(151,146,227,0.06) 55%, rgba(97,231,134,0.14) 100%)"
                  }}
                />
                <div
                  className="envelope-flap-lining absolute inset-0"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    background:
                      "radial-gradient(circle at 28% 18%, rgba(151, 146, 227, 0.2) 0%, transparent 55%), linear-gradient(165deg, #f4f0ff 0%, #eaf8ef 55%, #dcefe3 100%)",
                    filter: "drop-shadow(0 5px 7px rgba(72, 67, 92, 0.13))"
                  }}
                />
              </div>

              {/* Invitation letter tucked inside */}
              <div
                className={`envelope-letter absolute inset-x-5 top-5 bottom-7 rounded-xl border border-[#9792e3]/25 bg-[#fffdf8] shadow-lg overflow-hidden ${
                  envelopeOpening ? "is-out" : ""
                }`}
              >
                <div className="h-full m-1.5 sm:m-2 p-4 sm:p-6 rounded-lg border border-dashed border-[#9792e3]/35 text-center flex flex-col items-center justify-center">
                  <span className="font-serif-elegant italic text-[10px] sm:text-sm text-[#9792e3] block mb-1.5 sm:mb-2">
                    A Midsummer Celebration of Love
                  </span>
                  <p className="text-lg sm:text-2xl font-serif-elegant font-normal text-[#48435c] leading-snug">
                    Will you join us in the garden under the stars?
                  </p>
                  <div className="mt-3 sm:mt-5 flex items-center gap-2 text-[#61E786]">
                    <span className="h-px w-6 sm:w-8 bg-[#9792e3]/40" />
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                    <span className="h-px w-6 sm:w-8 bg-[#9792e3]/40" />
                  </div>
                  <span className="mt-1 sm:mt-2 font-script text-2xl sm:text-3xl text-[#48435c]">E & E</span>
                </div>
              </div>

              {/* Envelope front pocket */}
              <div className="absolute inset-x-0 bottom-0 top-[42%] overflow-hidden rounded-b-2xl">
                <div
                  className="absolute inset-0 bg-gradient-to-b from-[#eefcf2] to-[#e0f6e7]"
                  style={{
                    clipPath: "polygon(0 14%, 50% 0, 100% 14%, 100% 100%, 0 100%)"
                  }}
                />
                <div
                  className="absolute inset-0 opacity-70"
                  style={{
                    clipPath: "polygon(0 14%, 50% 0, 100% 14%, 100% 100%, 0 100%)",
                    backgroundImage:
                      "linear-gradient(135deg, transparent 49.4%, rgba(151,146,227,0.22) 50%, transparent 50.6%), linear-gradient(225deg, transparent 49.4%, rgba(151,146,227,0.22) 50%, transparent 50.6%)"
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
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#48435c] via-[#5c5675] to-[#9792e3] p-1 cursor-pointer shadow-lg hover:shadow-2xl transition-all flex items-center justify-center ${
                      isSealed ? "seal-pulse" : ""
                    }`}
                  >
                    <div className="w-full h-full rounded-full border border-dashed border-[#EDFFEC]/50 flex flex-col items-center justify-center text-[#EDFFEC]">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-[#61E786] text-[#61E786] mb-0.5 group-hover:scale-125 transition-transform" />
                      <span className="font-serif-elegant text-[10px] sm:text-xs tracking-wider uppercase font-semibold">
                        E & E
                      </span>
                    </div>
                  </div>
                </button>
                <span
                  className={`mt-2 text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-[#48435c] flex items-center gap-1.5 transition-opacity duration-300 ${
                    isSealed ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <span>Click to Unseal</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#61E786]" />
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          2. FRONT COVER (SCROLL-SCRUBBED PORTRAIT KEEPSAKE CARD)
      ========================================================================= */}
      <section ref={coverSpacerRef} className="cover-spacer relative z-20">
        <div ref={coverPinRef} className="cover-pin">
          <div ref={coverShadowRef} className="cover-shadow">
            <FrontCover ref={coverRef} wedding={WEDDING} />
          </div>
        </div>
      </section>

      {/* =========================================================================
          2b. INSIDE CARD SURFACE (OPENING BAND + SECTIONS)
      ========================================================================= */}
      <main id="inside-card" ref={insideRef} className="inside-card relative z-10 mx-auto">
        <div className="inside-paper">
          <div className="space-y-20">
            {/* Opening band */}
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
                <a
                  href="#rsvp-section"
                  className="px-8 py-3 rounded-full bg-[#61E786] text-[#48435c] font-semibold text-sm hover:bg-[#52d475] shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-current text-[#48435c]" />
                  RSVP Now
                </a>
                <a
                  href="#timeline-section"
                  className="px-8 py-3 rounded-full watercolor-card text-[#48435c] font-semibold text-sm hover:bg-white shadow-sm hover:shadow transition-all"
                >
                  View Day Schedule
                </a>
              </div>
              <CountdownBadge targetDate={WEDDING_TIMESTAMP} />
            </Reveal>

            {/* 3. OUR STORY & LOVE NOTES */}
            <Reveal as="section" id="story-section">
              <div className="watercolor-card rounded-3xl p-8 sm:p-12 relative overflow-hidden">
                <BotanicalBranch className="absolute -bottom-8 -left-6 w-36 opacity-30" />

                <SectionHeading eyebrow="Chapter One" title="Our Summer Story" />
                <p className="mx-auto mt-6 max-w-2xl text-center font-serif-elegant text-lg italic leading-relaxed text-[#5A5766] sm:text-xl">
                  "We met under the dappled shade of a botanical garden in July, sharing a love for chilled lemonade, warm guitar songs, and wandering gravel trails. Seven summers later, Erwin knelt in that very orchard at golden hour. We couldn’t imagine stepping into this lifetime together without our closest family and friends."
                </p>
              </div>
            </Reveal>

            {/* 4. EVENT SCHEDULE & TIMELINE + CALENDAR SYNC */}
            <Reveal as="section" id="timeline-section">
              <SectionHeading
                eyebrow="The Day of Joy"
                title="Order of Events"
                description={`${WEDDING.dateLabel} • ${WEDDING.venue}`}
              />

              {/* Timeline Items */}
              <div className="relative mx-auto mt-10 max-w-xl space-y-8">
                <div className="relative border-l-2 border-[#9792e3]/30 pl-6">
                  {WEDDING.schedule.map((item) => {
                    const Icon = SCHEDULE_ICONS[item.icon] ?? Sparkles;
                    return (
                      <div key={item.time} className="relative pb-8 last:pb-0">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[33px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#61E786] bg-[#EDFFEC]">
                          <Icon className="h-3 w-3 text-[#48435c]" aria-hidden="true" />
                        </div>

                        {/* Content */}
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#6f68b8]">
                            {item.time}
                          </span>
                          <h3 className="font-serif-elegant text-lg font-semibold text-[#48435c]">
                            {item.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-[#5A5766]">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sync to Calendar Bar */}
              <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[#9792e3]/25 bg-white/50 p-5 text-center">
                <p className="text-xs font-semibold text-[#48435c] uppercase tracking-wider mb-3">
                  Add to your personal schedule
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href={generateGoogleCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-[#48435c] text-white text-xs font-medium hover:bg-[#5c5675] transition-colors flex items-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#61E786]" />
                    Google Calendar
                  </a>
                  <button
                    onClick={handleDownloadICS}
                    className="px-4 py-2 rounded-full border border-[#48435c]/30 text-[#48435c] text-xs font-medium hover:bg-white transition-colors flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-[#9792e3]" />
                    Apple / Outlook (.ics)
                  </button>
                </div>
              </div>
            </Reveal>

            {/* 5. A NOTE ON GIFTS */}
            <Reveal as="section" className="text-center">
              <div className="mx-auto max-w-md rounded-3xl border border-dashed border-[#9792e3]/40 bg-white/50 p-6 shadow-sm">
                <Heart className="w-6 h-6 text-[#9792e3] mx-auto mb-2" />
                <h3 className="font-serif-elegant font-bold text-lg text-[#48435c]">
                  A Note on Gifts
                </h3>
                <p className="text-xs text-[#5A5766] mt-1 leading-relaxed">
                  Your presence and warm blessing is the greatest gift of all. If you wish to celebrate with a gift, we have established a honeymoon adventure fund.
                </p>
                <button
                  onClick={() => alert("Honeymoon registry link opened! Thank you for your generosity.")}
                  className="mt-4 text-sm font-semibold text-[#48435c] underline decoration-[#9792e3]/60 underline-offset-4 hover:decoration-[#9792e3] hover:text-[#6f68b8] transition-all"
                >
                  View Honeyfund Registry
                </button>
              </div>
            </Reveal>

            {/* 6. VIRTUAL WISH & GUESTBOOK CANVAS WALL */}
            <Reveal as="section" className="mx-auto max-w-5xl">
              <div className="text-center mb-10">
                <span className="text-xs font-semibold tracking-widest uppercase text-[#9792e3]">
                  Warm Blessings
                </span>
                <h2 className="text-4xl md:text-5xl font-script text-[#48435c] mt-1">
                  Watercolor Guestbook Wall
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#5A5766] mt-2">
                  Pin your sweet wishes, blessings, or favorite memories for Enjelaine and Erwin.
                </p>
              </div>

              {/* Input Form Card */}
              <form
                onSubmit={handlePostWish}
                className="watercolor-card rounded-3xl p-6 max-w-xl mx-auto mb-10 border border-[#9792e3]/30 shadow-md"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#48435c] mb-1">
                      Your Name(s)
                    </label>
                    <input
                      type="text"
                      required
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="e.g., Aunt Sophia & Uncle David"
                      className="w-full px-4 py-2 text-sm rounded-xl bg-white/80 border border-[#9792e3]/30 focus:outline-none focus:ring-2 focus:ring-[#9792e3] text-[#48435c]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#48435c] mb-1">
                      Your Blessing or Note
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Write a warm note for the newlyweds..."
                      className="w-full px-4 py-2 text-sm rounded-xl bg-white/80 border border-[#9792e3]/30 focus:outline-none focus:ring-2 focus:ring-[#9792e3] text-[#48435c]"
                    />
                  </div>

                  {/* Note Wash Color Picker */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-[#5A5766] font-medium">Watercolor Wash:</span>
                    <div className="flex gap-2">
                      {[
                        { name: "Honeydew", hex: "#EDFFEC" },
                        { name: "Soft Lilac", hex: "#f3f0ff" },
                        { name: "Cream Paper", hex: "#ffffff" }
                      ].map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => setSelectedNoteWash(color.hex)}
                          style={{ backgroundColor: color.hex }}
                          aria-label={`Select ${color.name} background`}
                          className={`w-6 h-6 rounded-full border transition-all ${
                            selectedNoteWash === color.hex
                              ? "border-[#48435c] scale-110 shadow-sm"
                              : "border-[#9792e3]/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#61E786] text-[#48435c] font-semibold text-xs tracking-wider uppercase hover:bg-[#52d475] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Pin Note to Canvas Wall
                  </button>
                </div>
              </form>

              {/* Guestbook Canvas Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {wishes.map((wish) => (
                  <div
                    key={wish.id}
                    style={{ backgroundColor: wish.color }}
                    className="relative p-6 rounded-2xl border border-[#9792e3]/30 shadow-sm transform hover:-translate-y-1 transition-all"
                  >
                    {/* Decorative Push-Pin / Wax Drop */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#9792e3] shadow-sm border border-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>

                    <p className="text-xs sm:text-sm font-serif-elegant italic text-[#48435c] leading-relaxed pt-2">
                      "{wish.message}"
                    </p>
                    <div className="mt-4 pt-3 border-t border-[#9792e3]/20 flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-[#48435c]">{wish.author}</span>
                      <span className="text-[#9792e3]">{wish.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* 7. INTERACTIVE RSVP FORM */}
            <Reveal as="section" id="rsvp-section" className="mx-auto max-w-2xl">
              <div className="watercolor-card rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-[#9792e3]/40 shadow-xl">
                <BotanicalBranch className="absolute -top-6 -right-6 w-36 rotate-45 opacity-40" />

                <div className="text-center mb-8">
                  <span className="text-xs font-semibold tracking-widest uppercase text-[#9792e3]">
                    Kindly Respond By {WEDDING.rsvpDeadline}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-script text-[#48435c] mt-1">
                    RSVP
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-[#5A5766] mt-2">
                    We can't wait to share our special summer day with you!
                  </p>
                </div>

                <form onSubmit={handleRsvpSubmit} className="space-y-6 relative z-10">
                  {/* Attendance Choice */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#48435c] mb-2">
                      Will you be attending? *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setRsvpData({ ...rsvpData, attending: "attending" })}
                        className={`py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                          rsvpData.attending === "attending"
                            ? "bg-[#61E786] border-[#61E786] text-[#48435c] shadow-sm"
                            : "bg-white/80 border-[#9792e3]/30 text-[#5A5766] hover:bg-white"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Joyfully Accepts
                      </button>
                      <button
                        type="button"
                        onClick={() => setRsvpData({ ...rsvpData, attending: "declining" })}
                        className={`py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                          rsvpData.attending === "declining"
                            ? "bg-[#48435c] border-[#48435c] text-white shadow-sm"
                            : "bg-white/80 border-[#9792e3]/30 text-[#5A5766] hover:bg-white"
                        }`}
                      >
                        Regretfully Declines
                      </button>
                    </div>
                  </div>

                  {/* Guest Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#48435c] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={rsvpData.fullName}
                        onChange={(e) => setRsvpData({ ...rsvpData, fullName: e.target.value })}
                        placeholder="Enjelaine Cabilatazan"
                        className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/80 border border-[#9792e3]/30 focus:outline-none focus:ring-2 focus:ring-[#9792e3] text-[#48435c]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#48435c] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={rsvpData.email}
                        onChange={(e) => setRsvpData({ ...rsvpData, email: e.target.value })}
                        placeholder="enjelaine@example.com"
                        className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/80 border border-[#9792e3]/30 focus:outline-none focus:ring-2 focus:ring-[#9792e3] text-[#48435c]"
                      />
                    </div>
                  </div>

                  {rsvpData.attending === "attending" && (
                    <>
                      {/* Guest Count & Meal Selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[#48435c] mb-1">
                            Total Attending Guests
                          </label>
                          <select
                            value={rsvpData.guestCount}
                            onChange={(e) => setRsvpData({ ...rsvpData, guestCount: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/80 border border-[#9792e3]/30 focus:outline-none focus:ring-2 focus:ring-[#9792e3] text-[#48435c]"
                          >
                            <option value="1">1 Person (Just Me)</option>
                            <option value="2">2 Persons (+ Plus One)</option>
                            <option value="3">3 Persons (Family)</option>
                            <option value="4">4 Persons (Family)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[#48435c] mb-1">
                            Entrée Preference
                          </label>
                          <select
                            value={rsvpData.mealChoice}
                            onChange={(e) => setRsvpData({ ...rsvpData, mealChoice: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/80 border border-[#9792e3]/30 focus:outline-none focus:ring-2 focus:ring-[#9792e3] text-[#48435c]"
                          >
                            <option value="Salmon with Summer Dill Velouté">
                              Wild Salmon with Summer Dill Velouté
                            </option>
                            <option value="Prime Tenderloin with Morel Sauce">
                              Prime Tenderloin with Morel Demi-Glace
                            </option>
                            <option value="Summer Truffle & Morel Risotto (Vegan/GF)">
                              Summer Truffle & Morel Risotto (Vegan / GF)
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* Dietary restrictions */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#48435c] mb-1">
                          Dietary Allergies or Restrictions
                        </label>
                        <input
                          type="text"
                          value={rsvpData.dietary}
                          onChange={(e) => setRsvpData({ ...rsvpData, dietary: e.target.value })}
                          placeholder="e.g., Gluten-free, nut allergy, vegetarian"
                          className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/80 border border-[#9792e3]/30 focus:outline-none focus:ring-2 focus:ring-[#9792e3] text-[#48435c]"
                        />
                      </div>

                      {/* Song request */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#48435c] mb-1">
                          Song That Will Get You on the Dance Floor
                        </label>
                        <input
                          type="text"
                          value={rsvpData.songRequest}
                          onChange={(e) => setRsvpData({ ...rsvpData, songRequest: e.target.value })}
                          placeholder="e.g., Fleetwood Mac - You Make Loving Fun"
                          className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/80 border border-[#9792e3]/30 focus:outline-none focus:ring-2 focus:ring-[#9792e3] text-[#48435c]"
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#61E786] text-[#48435c] font-bold text-sm tracking-widest uppercase hover:bg-[#52d475] shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Confirm RSVP Response
                  </button>
                </form>
        </div>
            </Reveal>
          </div>
        </div>
      </main>

      {/* =========================================================================
          8. RSVP CONFIRMATION MODAL & DIGITAL EVENT PASS
      ========================================================================= */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#48435c]/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#9792e3]/40 shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowPassModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-[#5A5766]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#EDFFEC] border border-[#61E786] flex items-center justify-center text-[#61E786] mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <span className="text-xs uppercase tracking-widest font-bold text-[#9792e3]">
                RSVP Received With Love
              </span>
              <h3 className="text-3xl font-script text-[#48435c] mt-1">
                Thank You, {rsvpData.fullName || "Guest"}!
              </h3>
              <p className="text-xs text-[#5A5766] mt-2 font-serif-elegant italic text-base">
                {rsvpData.attending === "attending"
                  ? "We have reserved your seat in our summer garden celebration. Here is your digital guest pass:"
                  : "We are sad you cannot join us in person, but your love and warm wishes mean the world to us."}
              </p>
            </div>

            {/* Digital Wedding Pass Boarding Ticket */}
            {rsvpData.attending === "attending" && (
              <div className="mt-6 rounded-2xl bg-[#EDFFEC]/90 border border-dashed border-[#9792e3] p-5 relative">
                <div className="flex justify-between items-center border-b border-[#9792e3]/30 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#9792e3]">
                      Official Guest Pass
                    </span>
                    <h4 className="font-serif-elegant font-bold text-lg text-[#48435c]">
                      Enjelaine & Erwin’s Wedding
                    </h4>
                  </div>
                  <Sparkles className="w-5 h-5 text-[#61E786]" />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 text-xs text-[#5A5766]">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-[#9792e3]">Guest</span>
                    <span className="font-semibold text-[#48435c]">{rsvpData.fullName}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-[#9792e3]">Party Size</span>
                    <span className="font-semibold text-[#48435c]">{rsvpData.guestCount} Guest(s)</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-[#9792e3]">Date</span>
                    <span className="font-semibold text-[#48435c]">July 17, 2027</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-[#9792e3]">Venue</span>
                    <span className="font-semibold text-[#48435c]">Sonoma, CA</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#9792e3]/30 flex justify-between items-center text-[10px] text-[#48435c]">
                  <span>Entrée: {rsvpData.mealChoice.split("with")[0]}</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#9792e3]/30 font-semibold">
                    #PASS-{Math.floor(1000 + Math.random() * 9000)}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#61E786] text-[#48435c] font-bold text-xs uppercase tracking-wider hover:bg-[#52d475] transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Save / Print Pass
              </button>
              <button
                onClick={() => setShowPassModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#48435c]/20 text-[#48435c] text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          9. FOOTER
      ========================================================================= */}
      <footer className="relative z-20 overflow-hidden px-4 pb-10 pt-6 sm:pb-16 sm:pt-10">
        {/* Soft watercolor bloom behind the keepsake card */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_65%,rgba(97,231,134,0.14),rgba(151,146,227,0.08)_45%,transparent_72%)]" />

        <div className="relative mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#9792e3]/30 bg-gradient-to-b from-white/80 via-white/70 to-[#f8fffa]/80 px-6 py-10 text-center shadow-[0_24px_70px_-40px_rgba(72,67,92,0.35)] backdrop-blur-md sm:px-10 sm:py-12 md:py-14">
            {/* Inset stationery frame */}
            <div className="pointer-events-none absolute inset-2 rounded-[1.6rem] border border-dashed border-[#9792e3]/30" />

            {/* Botanical corners */}
            <BotanicalBranch className="absolute -bottom-9 -left-9 w-32 rotate-12 opacity-25 sm:w-44" />
            <BotanicalBranch className="absolute -bottom-9 -right-9 w-32 -rotate-12 scale-x-[-1] opacity-25 sm:w-44" />

            <div className="relative">
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#9792e3]/50 sm:w-16" />
                <Heart className="h-3.5 w-3.5 fill-[#61E786] text-[#61E786]" />
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#9792e3]/50 sm:w-16" />
              </div>

              <h3 className="mt-4 font-script text-[clamp(2.1rem,10.5vw,3rem)] leading-tight text-[#48435c] sm:text-6xl md:text-7xl">
                Enjelaine{" "}
                <span className="font-serif-elegant font-light text-[#9792e3]">&</span>{" "}
                Erwin
              </h3>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
