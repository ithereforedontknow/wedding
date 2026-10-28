import { forwardRef } from "react";
import { ChevronDown, Heart } from "lucide-react";
import KeepsakeCard from "./KeepsakeCard";

/**
 * The static portrait front cover: the first face of the keepsake card.
 * Purely presentational — scrolling/scrubbing choreography is added later.
 */
const FrontCover = forwardRef(function FrontCover({ wedding }, ref) {
  return (
    <KeepsakeCard
      ref={ref}
      className="cover-card flex flex-col items-center justify-center px-6 py-8 text-center sm:px-10"
    >
      <div className="flex w-full flex-col items-center gap-[clamp(0.4rem,1.6vh,1.25rem)]">
        <p className="text-[clamp(0.65rem,2.2vw,0.8rem)] font-semibold uppercase tracking-[0.2em] text-[#6f68b8]">
          Together with their families
        </p>

        <h1 className="font-script text-[clamp(2.4rem,10vw,5.5rem)] leading-[0.95] text-[#48435c]">
          <span className="block sm:inline">{wedding.partner1}</span>
          <span className="mx-1 font-serif-elegant text-[#7d77cc] sm:mx-2">&amp;</span>
          <span className="block sm:inline">{wedding.partner2}</span>
        </h1>

        {/* Heart divider */}
        <div className="flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#9792e3]/50 sm:w-16" />
          <Heart className="h-3.5 w-3.5 fill-[#61E786] text-[#61E786]" />
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#9792e3]/50 sm:w-16" />
        </div>

        <div className="font-body text-[#48435c]">
          <p className="text-[clamp(1rem,3.2vw,1.35rem)] font-semibold">
            {wedding.dateLabel}
          </p>
          <p className="text-[clamp(0.85rem,2.8vw,1.15rem)] font-medium leading-snug">
            {wedding.timeLabel} · {wedding.venue}
          </p>
          <p className="text-[clamp(0.7rem,2.4vw,0.95rem)] text-[#6f68b8]">
            {wedding.address}
          </p>
        </div>

        <p className="max-w-[36ch] font-serif-elegant text-[clamp(1rem,3vw,1.4rem)] italic leading-snug text-[#5A5766]">
          request the pleasure of your company at their marriage celebration.
        </p>

        <p className="text-[clamp(0.7rem,2.4vw,0.9rem)] text-[#6f68b8]">
          {wedding.dressCode}
        </p>

        <a
          href="#inside-card"
          aria-label="Open the invitation and read the details"
          className="mt-[clamp(0.25rem,1vh,0.75rem)] flex items-center gap-1.5 rounded-full border border-[#9792e3]/30 bg-white/60 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[#48435c] shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow"
        >
          Open Invitation
          <ChevronDown aria-hidden="true" className="h-4 w-4 animate-bounce text-[#61E786]" />
        </a>
      </div>
    </KeepsakeCard>
  );
});

export default FrontCover;
