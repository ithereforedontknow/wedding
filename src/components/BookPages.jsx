import React, { useEffect, useState } from "react";
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
const WISHES_PER_PAGE_MOBILE = 2;

// Phones get fewer guestbook notes per page so the page does not need to scroll.
function useIsNarrow() {
  const query = "(max-width: 767px)";
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (event) => setNarrow(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return narrow;
}

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
    <p className="mt-6 text-center font-serif-elegant text-base italic leading-relaxed sm:text-lg text-[#2F4F3E]/85">
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
      <p className="font-serif-elegant text-xl italic text-[#2F4F3E]">{message.greeting}</p>
      <div className="mt-4 space-y-3 font-serif-elegant text-sm leading-relaxed sm:text-[15px] text-[#2F4F3E]/85">
        {message.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className="mt-5 font-serif-elegant italic text-[#2F4F3E]/85">{message.signoff}</p>
      <p className="mt-1 font-script text-4xl text-[#2F4F3E]">{message.signature}</p>
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
    <div className="relative mt-5 border-l-2 sm:mt-8 border-[#E07A5F]/30 pl-6">
      {wedding.schedule.map((item) => {
        const Icon = SCHEDULE_ICONS[item.icon] ?? Sparkles;
        return (
          <div key={item.time} className="relative pb-3 last:pb-0 sm:pb-5">
            <div className="absolute -left-[33px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#F2C94C] bg-[#F4F1DE]">
              <Icon className="h-3 w-3 text-[#2F4F3E]" aria-hidden="true" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2F4F3E]/75">{item.time}</span>
            <h3 className="font-serif-elegant text-lg font-semibold leading-tight text-[#2F4F3E]">{item.title}</h3>
            <p className="text-sm leading-snug text-[#2F4F3E]/85">{item.note}</p>
          </div>
        );
      })}
    </div>
  </Page>
);

const CountdownCalendarPage = ({ wedding, countdown, googleCalendarUrl, onDownloadICS }) => (
  <Page>
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#2F4F3E]/75">The Celebration</p>
      <h2 className="mt-1 font-script text-4xl text-[#2F4F3E] sm:text-5xl">
        {wedding.partner1} &amp; {wedding.partner2}
      </h2>
      <p className="mt-2 text-sm font-medium text-[#2F4F3E]/85">
        {wedding.dateLabel} · {wedding.venue}
      </p>
      {countdown}
      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-[#E07A5F]/25 bg-white/50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#2F4F3E]">Add to your personal schedule</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#2F4F3E] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#3C6350]"
          >
            <Calendar className="h-3.5 w-3.5 text-[#E07A5F]" />
            Google Calendar
          </a>
          <button
            type="button"
            onClick={onDownloadICS}
            className="flex items-center gap-2 rounded-full border border-[#2F4F3E]/30 px-4 py-2 text-xs font-medium text-[#2F4F3E] transition-colors hover:bg-white"
          >
            <Download className="h-3.5 w-3.5 text-[#E07A5F]" />
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
    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#E07A5F]/30 bg-[#FBE9E2]">
      {photo.src ? (
        <img src={photo.src} alt={photo.alt} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center border border-dashed border-[#E07A5F]/40 text-[11px] text-[#2F4F3E]/75">
          {photo.label}
        </div>
      )}
    </div>
    {photo.caption && (
      <figcaption className="mt-1 text-center font-serif-elegant text-xs italic text-[#2F4F3E]/85">{photo.caption}</figcaption>
    )}
  </figure>
);

const GalleryPage = ({ wedding }) => (
  <Page>
    <SectionHeading eyebrow="Moments" title="Our Gallery" />
    <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
      {wedding.gallery.map((photo) => (
        <PhotoFrame key={photo.label} photo={photo} />
      ))}
    </div>
  </Page>
);

const GiftsPage = ({ wedding, onOpenRegistry }) => (
  <Page>
    <div className="space-y-5 text-center">
      <div className="rounded-3xl border border-dashed border-[#E07A5F]/40 bg-white/50 p-6 shadow-sm">
        <Heart className="mx-auto mb-2 h-6 w-6 text-[#E07A5F]" />
        <h3 className="font-serif-elegant text-lg font-bold text-[#2F4F3E]">A Note on Gifts</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#2F4F3E]/85">
          Your presence and warm blessing is the greatest gift of all. If you wish to celebrate with a gift, we have
          established a honeymoon adventure fund.
        </p>
        <button
          type="button"
          onClick={onOpenRegistry}
          className="mt-4 text-sm font-semibold text-[#2F4F3E] underline decoration-[#E07A5F]/60 underline-offset-4 transition-all hover:text-[#E07A5F] hover:decoration-[#E07A5F]"
        >
          View Honeyfund Registry
        </button>
      </div>

      <div className="rounded-3xl border border-[#E07A5F]/25 bg-white/50 p-5">
        <h3 className="font-serif-elegant text-lg font-bold text-[#2F4F3E]">Dress Code</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#2F4F3E]/85">{wedding.dressCode}</p>
      </div>

      <a
        href={wedding.mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-[#2F4F3E]/30 px-4 py-2 text-xs font-medium text-[#2F4F3E] transition-colors hover:bg-white"
      >
        <MapPin className="h-3.5 w-3.5 text-[#E07A5F]" />
        {wedding.venue}, {wedding.address}
      </a>
    </div>
  </Page>
);

// ---------------------------------------------------------------- Spread 4
const GuestbookPage = ({ wishes, onOpenWish }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const perPage = useIsNarrow() ? WISHES_PER_PAGE_MOBILE : WISHES_PER_PAGE;
  const pageCount = Math.max(1, Math.ceil(wishes.length / perPage));
  const current = Math.min(pageIndex, pageCount - 1);
  const visible = wishes.slice(current * perPage, (current + 1) * perPage);

  return (
    <Page>
      <SectionHeading eyebrow="Warm Blessings" title="Guestbook" />
      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={onOpenWish}
          className="inline-flex items-center gap-2 rounded-full bg-[#F2C94C] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#2F4F3E] shadow-sm transition-all hover:bg-[#E6BB36]"
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
            className="relative rounded-2xl border border-[#E07A5F]/30 p-4 pt-5 shadow-[0_12px_30px_-24px_rgba(47,79,62,0.4)]"
          >
            <div className="absolute -top-2 left-1/2 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border border-white bg-[#E07A5F] shadow-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
            <p className="font-serif-elegant text-sm italic leading-relaxed text-[#2F4F3E]">"{wish.message}"</p>
            <div className="mt-3 flex items-center justify-between border-t border-[#E07A5F]/20 pt-2 text-[11px]">
              <span className="font-semibold text-[#2F4F3E]">{wish.author}</span>
              <span className="text-[#2F4F3E]/75">{wish.date}</span>
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-[#2F4F3E]">
          <button
            type="button"
            aria-label="Previous notes"
            disabled={current === 0}
            onClick={() => setPageIndex(current - 1)}
            className="rounded-full border border-[#E07A5F]/40 p-1.5 transition-colors hover:bg-white disabled:opacity-40"
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
            className="rounded-full border border-[#E07A5F]/40 p-1.5 transition-colors hover:bg-white disabled:opacity-40"
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
      <span className="text-xs font-semibold uppercase tracking-widest text-[#2F4F3E]/70">
        Kindly Respond By {wedding.rsvpDeadline}
      </span>
      <h2 className="mt-1 font-script text-5xl text-[#2F4F3E] sm:text-6xl">RSVP</h2>
      <p className="mt-2 text-sm font-medium text-[#2F4F3E]/85">We can't wait to share our special summer day with you!</p>
      <p className="mt-1 font-serif-elegant text-sm italic text-[#2F4F3E]/85">
        {wedding.dateLabel} · {wedding.venue}
      </p>
      <button
        ref={rsvpButtonRef}
        type="button"
        onClick={onOpenRsvp}
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[#F2C94C] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#2F4F3E] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#E6BB36] hover:shadow-xl"
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
