import React from "react";
import { Heart } from "lucide-react";

// Front cover of the invitation. It uses the same paper as the back cover
// (.book-page), so it fits the card exactly.
//
// COUPLE ILLUSTRATION
// Put your SVG in /public (for example /public/couple.svg) and add this to WEDDING in config:
//   coupleIllustration: { src: '/couple.svg', alt: 'Enjelaine and Erwin' },
// Until `src` is set, a dashed placeholder frame is shown in its place.
export default function FrontCover({ wedding }) {
  const art = wedding.coupleIllustration;

  return (
    <div className="book-page book-page--cover">
      <div className="flex h-full w-full min-h-0 flex-col items-center justify-between gap-3 text-center">
        {/* Illustration slot: takes whatever height the text below leaves over */}
        <div className="flex min-h-[7rem] w-full flex-1 items-center justify-center">
          {art?.src ? (
            <img
              src={art.src}
              alt={art.alt ?? `${wedding.partner1} and ${wedding.partner2}`}
              className="max-h-70 max-w-70 object-contain"
              draggable="false"
            />
          ) : (
            <div
              className="flex h-full max-h-[22rem] w-full max-w-[18rem] flex-col items-center justify-center gap-1 border border-dashed border-[#2F4F3E]/35 bg-[#F4F1DE]/60 px-4 text-[#2F4F3E]/70"
              role="img"
              aria-label="Couple illustration placeholder"
            >
              <span className="font-serif-elegant text-base italic sm:text-lg">Couple illustration</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest sm:text-xs">SVG goes here</span>
            </div>
          )}
        </div>

        <div className="w-full shrink-0">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#E07A5F]/60 sm:w-14" />
            <Heart className="h-3.5 w-3.5 fill-[#E07A5F] text-[#E07A5F]" aria-hidden="true" />
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#E07A5F]/60 sm:w-14" />
          </div>

          <h1 className="mt-3 font-script leading-[1.05] text-[#2F4F3E] text-[clamp(2.4rem,16cqw,4.25rem)]">
            {wedding.partner2}
            <span className="block font-serif-elegant text-[0.4em] font-light leading-tight text-[#E07A5F]">&amp;</span>
            {wedding.partner1}
          </h1>

          <p className="mt-3 font-serif-elegant font-semibold uppercase tracking-[0.18em] text-[#2F4F3E] text-[clamp(0.72rem,3.4cqw,0.95rem)]">
            {wedding.dateLabel}
          </p>
          <p className="mt-1 font-serif-elegant italic text-[#2F4F3E]/80 text-[clamp(0.85rem,4cqw,1.05rem)]">
            {wedding.venue}
            {wedding.address ? ` · ${wedding.address}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
