import React, { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  MapPin,
  Music,
  Send,
  Sparkles,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import FrontCover from "./FrontCover";
import { BackCover } from "./Book";
import { BotanicalBranch } from "./BotanicalBranch";
import { SectionHeading } from "./SectionHeading";
import "./bookPages.css";

const SCHEDULE_ICONS = {
  sparkles: Sparkles,
  heart: Heart,
  wine: Wine,
  utensils: UtensilsCrossed,
  music: Music,
};

const WISHES_PER_PAGE = 4;

// Shared page shell: fixed paper frame, scrollable inside.
const Page = ({ children, decor }) => (
  <div className="book-page book-page--flow">
    {decor}
    <div className="book-page-scroll">
      <div className="page-body">{children}</div>
    </div>
  </div>
);

// ---------------------------------------------------------------- Spread 1
const StoryPage = () => (
  <Page decor={<BotanicalBranch className="pointer-events-none absolute -bottom-6 -left-4 w-32 opacity-30" />}>
    <SectionHeading eyebrow="Chapter One" title="Our Summer Story" />
    <p className="mt-6 text-center font-serif-elegant text-lg italic leading-relaxed text-[#5A5766]">
      "We met under the dappled shade of a botanical garden in July, sharing a love for chilled lemonade, warm guitar
      songs, and wandering gravel trails. Seven summers later, Erwin knelt in that very orchard at golden hour. We
      couldn’t imagine stepping into this lifetime together without our closest family and friends."
    </p>
  </Page>
);

const LetterPage = ({ wedding }) => {
  const { message } = wedding;
  return (
    <Page>
      <p className="font-serif-elegant text-xl italic text-[#48435c]">{message.greeting}</p>
      <div className="mt-4 space-y-3 font-serif-elegant text-[15px] leading-relaxed text-[#5A5766]">
        {message.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className="mt-5 font-serif-elegant italic text-[#5A5766]">{message.signoff}</p>
      <p className="mt-1 font-script text-4xl text-[#48435c]">{message.signature}</p>
    </Page>
  );
};

// ---------------------------------------------------------------- Spread 2
const SchedulePage = ({ wedding }) => (
  <Page>
    <SectionHeading
      eyebrow="The Day of Joy"
      title="Order of Events"
      description={`${wedding.dateLabel} • ${wedding.venue}`}
    />
    <div className="relative mt-8 border-l-2 border-[#9792e3]/30 pl-6">
      {wedding.schedule.map((item) => {
        const Icon = SCHEDULE_ICONS[item.icon] ?? Sparkles;
        return (
          <div key={item.time} className="relative pb-5 last:pb-0">
            <div className="absolute -left-[33px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#61E786] bg-[#EDFFEC]">
              <Icon className="h-3 w-3 text-[#48435c]" aria-hidden="true" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6f68b8]">{item.time}</span>
            <h3 className="font-serif-elegant text-lg font-semibold leading-tight text-[#48435c]">{item.title}</h3>
            <p className="text-sm leading-snug text-[#5A5766]">{item.note}</p>
          </div>
        );
      })}
    </div>
  </Page>
);

const CountdownCalendarPage = ({ wedding, countdown, googleCalendarUrl, onDownloadICS }) => (
  <Page>
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#6f68b8]">The Celebration</p>
      <h2 className="mt-1 font-script text-5xl text-[#48435c]">
        {wedding.partner1} &amp; {wedding.partner2}
      </h2>
      <p className="mt-2 text-sm font-medium text-[#5A5766]">
        {wedding.dateLabel} · {wedding.venue}
      </p>
      {countdown}
      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-[#9792e3]/25 bg-white/50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#48435c]">Add to your personal schedule</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#48435c] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#5c5675]"
          >
            <Calendar className="h-3.5 w-3.5 text-[#61E786]" />
            Google Calendar
          </a>
          <button
            type="button"
            onClick={onDownloadICS}
            className="flex items-center gap-2 rounded-full border border-[#48435c]/30 px-4 py-2 text-xs font-medium text-[#48435c] transition-colors hover:bg-white"
          >
            <Download className="h-3.5 w-3.5 text-[#9792e3]" />
            Apple / Outlook (.ics)
          </button>
        </div>
      </div>
    </div>
  </Page>
);

// ---------------------------------------------------------------- Spread 3
const PhotoFrame = ({ photo }) => (
  <figure>
    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#9792e3]/30 bg-[#f6f3ff]">
      {photo.src ? (
        <img src={photo.src} alt={photo.alt} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center border border-dashed border-[#9792e3]/40 text-[11px] text-[#6f68b8]">
          {photo.label}
        </div>
      )}
    </div>
    {photo.caption && (
      <figcaption className="mt-1 text-center font-serif-elegant text-xs italic text-[#5A5766]">{photo.caption}</figcaption>
    )}
  </figure>
);

const GalleryPage = ({ wedding }) => (
  <Page>
    <SectionHeading eyebrow="Moments" title="Our Gallery" />
    <div className="mt-6 grid grid-cols-2 gap-3">
      {wedding.gallery.map((photo) => (
        <PhotoFrame key={photo.label} photo={photo} />
      ))}
    </div>
  </Page>
);

const GiftsPage = ({ wedding, onOpenRegistry }) => (
  <Page>
    <div className="space-y-5 text-center">
      <div className="rounded-3xl border border-dashed border-[#9792e3]/40 bg-white/50 p-6 shadow-sm">
        <Heart className="mx-auto mb-2 h-6 w-6 text-[#9792e3]" />
        <h3 className="font-serif-elegant text-lg font-bold text-[#48435c]">A Note on Gifts</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#5A5766]">
          Your presence and warm blessing is the greatest gift of all. If you wish to celebrate with a gift, we have
          established a honeymoon adventure fund.
        </p>
        <button
          type="button"
          onClick={onOpenRegistry}
          className="mt-4 text-sm font-semibold text-[#48435c] underline decoration-[#9792e3]/60 underline-offset-4 transition-all hover:text-[#6f68b8] hover:decoration-[#9792e3]"
        >
          View Honeyfund Registry
        </button>
      </div>

      <div className="rounded-3xl border border-[#9792e3]/25 bg-white/50 p-5">
        <h3 className="font-serif-elegant text-lg font-bold text-[#48435c]">Dress Code</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#5A5766]">{wedding.dressCode}</p>
      </div>

      <a
        href={wedding.mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-[#48435c]/30 px-4 py-2 text-xs font-medium text-[#48435c] transition-colors hover:bg-white"
      >
        <MapPin className="h-3.5 w-3.5 text-[#9792e3]" />
        {wedding.venue}, {wedding.address}
      </a>
    </div>
  </Page>
);

// ---------------------------------------------------------------- Spread 4
const GuestbookPage = ({ wishes, onOpenWish }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const pageCount = Math.max(1, Math.ceil(wishes.length / WISHES_PER_PAGE));
  const current = Math.min(pageIndex, pageCount - 1);
  const visible = wishes.slice(current * WISHES_PER_PAGE, (current + 1) * WISHES_PER_PAGE);

  return (
    <Page>
      <SectionHeading eyebrow="Warm Blessings" title="Guestbook" />
      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={onOpenWish}
          className="inline-flex items-center gap-2 rounded-full bg-[#61E786] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#48435c] shadow-sm transition-all hover:bg-[#52d475]"
        >
          <Send className="h-3.5 w-3.5" />
          Leave a Blessing
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {visible.map((wish) => (
          <div
            key={wish.id}
            style={{ backgroundColor: wish.color }}
            className="relative rounded-2xl border border-[#9792e3]/30 p-4 pt-5 shadow-[0_12px_30px_-24px_rgba(72,67,92,0.4)]"
          >
            <div className="absolute -top-2 left-1/2 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border border-white bg-[#9792e3] shadow-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
            <p className="font-serif-elegant text-sm italic leading-relaxed text-[#48435c]">"{wish.message}"</p>
            <div className="mt-3 flex items-center justify-between border-t border-[#9792e3]/20 pt-2 text-[11px]">
              <span className="font-semibold text-[#48435c]">{wish.author}</span>
              <span className="text-[#6f68b8]">{wish.date}</span>
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-[#48435c]">
          <button
            type="button"
            aria-label="Previous notes"
            disabled={current === 0}
            onClick={() => setPageIndex(current - 1)}
            className="rounded-full border border-[#9792e3]/40 p-1.5 transition-colors hover:bg-white disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>
            {current + 1} / {pageCount}
          </span>
          <button
            type="button"
            aria-label="Next notes"
            disabled={current === pageCount - 1}
            onClick={() => setPageIndex(current + 1)}
            className="rounded-full border border-[#9792e3]/40 p-1.5 transition-colors hover:bg-white disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </Page>
  );
};

const RsvpPage = ({ wedding, onOpenRsvp, rsvpButtonRef }) => (
  <Page decor={<BotanicalBranch className="pointer-events-none absolute -right-6 -top-6 w-24 rotate-45 opacity-30" />}>
    <div className="text-center">
      <span className="text-xs font-semibold uppercase tracking-widest text-[#9792e3]">
        Kindly Respond By {wedding.rsvpDeadline}
      </span>
      <h2 className="mt-1 font-script text-6xl text-[#48435c]">RSVP</h2>
      <p className="mt-2 text-sm font-medium text-[#5A5766]">We can't wait to share our special summer day with you!</p>
      <p className="mt-1 font-serif-elegant text-sm italic text-[#5A5766]">
        {wedding.dateLabel} · {wedding.venue}
      </p>
      <button
        ref={rsvpButtonRef}
        type="button"
        onClick={onOpenRsvp}
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[#61E786] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#48435c] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#52d475] hover:shadow-xl"
      >
        <Send className="h-4 w-4" />
        Open Reply Card
      </button>
    </div>
  </Page>
);

// Leaf order: front = right-hand page, back = left-hand page of the next spread.
export function buildLeaves({
  wedding,
  countdown,
  wishes,
  googleCalendarUrl,
  onDownloadICS,
  onOpenRsvp,
  onOpenWish,
  onOpenRegistry,
  rsvpButtonRef,
}) {
  return [
    { front: <FrontCover wedding={wedding} />, back: <StoryPage /> },
    { front: <LetterPage wedding={wedding} />, back: <SchedulePage wedding={wedding} /> },
    {
      front: (
        <CountdownCalendarPage
          wedding={wedding}
          countdown={countdown}
          googleCalendarUrl={googleCalendarUrl}
          onDownloadICS={onDownloadICS}
        />
      ),
      back: <GalleryPage wedding={wedding} />,
    },
    {
      front: <GiftsPage wedding={wedding} onOpenRegistry={onOpenRegistry} />,
      back: <GuestbookPage wishes={wishes} onOpenWish={onOpenWish} />,
    },
    {
      front: <RsvpPage wedding={wedding} onOpenRsvp={onOpenRsvp} rsvpButtonRef={rsvpButtonRef} />,
      back: <BackCover wedding={wedding} />,
    },
  ];
}
