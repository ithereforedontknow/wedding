import React, { useEffect, useRef } from "react";
import { CheckCircle2, Send, X } from "lucide-react";
import { WEDDING } from "../config";

// Escape closes the modal; focus returns to whatever opened it.
function useModalBehavior(open, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;
    const onKey = (event) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open]);
}

const ModalShell = ({ open, onClose, labelId, children }) => {
  useModalBehavior(open, onClose);
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-[#48435c]/50 p-4 backdrop-blur-sm"
    >
      <div className="relative max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#9792e3]/40 bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#5A5766] hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wider text-[#48435c]";

// ------------------------------------------------------------------ RSVP
export function RsvpFormModal({ open, onClose, data, setData, onSubmit }) {
  return (
    <ModalShell open={open} onClose={onClose} labelId="rsvp-modal-title">
      <div className="mb-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#9792e3]">
          Kindly Respond By {WEDDING.rsvpDeadline}
        </span>
        <h2 id="rsvp-modal-title" className="mt-1 font-script text-5xl text-[#48435c]">
          RSVP
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div role="group" aria-labelledby="attendance-label">
          <label id="attendance-label" className={`${labelClass} mb-2`}>
            Will you be attending? *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setData({ ...data, attending: "attending" })}
              aria-pressed={data.attending === "attending"}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all ${
                data.attending === "attending"
                  ? "border-[#61E786] bg-[#61E786] text-[#48435c] shadow-sm"
                  : "border-[#9792e3]/30 bg-white/80 text-[#5A5766] hover:bg-white"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Joyfully Accepts
            </button>
            <button
              type="button"
              onClick={() => setData({ ...data, attending: "declining" })}
              aria-pressed={data.attending === "declining"}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all ${
                data.attending === "declining"
                  ? "border-[#48435c] bg-[#48435c] text-white shadow-sm"
                  : "border-[#9792e3]/30 bg-white/80 text-[#5A5766] hover:bg-white"
              }`}
            >
              Regretfully Declines
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rsvp-name" className={labelClass}>
              Full Name *
            </label>
            <input
              id="rsvp-name"
              type="text"
              required
              autoFocus
              value={data.fullName}
              onChange={(e) => setData({ ...data, fullName: e.target.value })}
              placeholder="Your full name"
              className="field w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="rsvp-email" className={labelClass}>
              Email Address *
            </label>
            <input
              id="rsvp-email"
              type="email"
              required
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              placeholder="you@example.com"
              className="field w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
        </div>

        {data.attending === "attending" && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rsvp-guest-count" className={labelClass}>
                  Total Attending Guests
                </label>
                <select
                  id="rsvp-guest-count"
                  value={data.guestCount}
                  onChange={(e) => setData({ ...data, guestCount: e.target.value })}
                  className="field w-full rounded-xl px-4 py-2.5 text-sm"
                >
                  <option value="1">1 Person (Just Me)</option>
                  <option value="2">2 Persons (+ Plus One)</option>
                  <option value="3">3 Persons (Family)</option>
                  <option value="4">4 Persons (Family)</option>
                </select>
              </div>
              <div>
                <label htmlFor="rsvp-meal" className={labelClass}>
                  Entrée Preference
                </label>
                <select
                  id="rsvp-meal"
                  value={data.mealChoice}
                  onChange={(e) => setData({ ...data, mealChoice: e.target.value })}
                  className="field w-full rounded-xl px-4 py-2.5 text-sm"
                >
                  {WEDDING.mealOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="rsvp-dietary" className={labelClass}>
                Dietary Allergies or Restrictions
              </label>
              <input
                id="rsvp-dietary"
                type="text"
                value={data.dietary}
                onChange={(e) => setData({ ...data, dietary: e.target.value })}
                placeholder="e.g., Gluten-free, nut allergy, vegetarian"
                className="field w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label htmlFor="rsvp-song" className={labelClass}>
                Song That Will Get You on the Dance Floor
              </label>
              <input
                id="rsvp-song"
                type="text"
                value={data.songRequest}
                onChange={(e) => setData({ ...data, songRequest: e.target.value })}
                placeholder="e.g., Fleetwood Mac - You Make Loving Fun"
                className="field w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#61E786] py-4 text-sm font-bold uppercase tracking-widest text-[#48435c] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#52d475] hover:shadow-xl"
        >
          <Send className="h-4 w-4" />
          Confirm RSVP Response
        </button>
      </form>
    </ModalShell>
  );
}

// ------------------------------------------------------------- Guestbook
const WASHES = [
  { name: "Honeydew", hex: "#EDFFEC" },
  { name: "Soft Lilac", hex: "#f3f0ff" },
  { name: "Cream Paper", hex: "#ffffff" },
];

export function WishModal({ open, onClose, author, setAuthor, message, setMessage, wash, setWash, onSubmit }) {
  return (
    <ModalShell open={open} onClose={onClose} labelId="wish-modal-title">
      <div className="mb-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#9792e3]">Warm Blessings</span>
        <h2 id="wish-modal-title" className="mt-1 font-script text-5xl text-[#48435c]">
          Leave a Blessing
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="guestbook-name" className={labelClass}>
            Your Name(s)
          </label>
          <input
            id="guestbook-name"
            type="text"
            required
            autoFocus
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g., Aunt Sophia & Uncle David"
            className="field w-full rounded-xl px-4 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="guestbook-message" className={labelClass}>
            Your Blessing or Note
          </label>
          <textarea
            id="guestbook-message"
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a warm note for the newlyweds..."
            className="field w-full rounded-xl px-4 py-2 text-sm"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-medium text-[#5A5766]">Watercolor Wash:</span>
          <div role="group" aria-label="Watercolor wash color" className="flex gap-2">
            {WASHES.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => setWash(color.hex)}
                style={{ backgroundColor: color.hex }}
                aria-label={`Select ${color.name} background`}
                aria-pressed={wash === color.hex}
                className={`h-6 w-6 rounded-full border transition-all ${
                  wash === color.hex ? "scale-110 border-[#48435c] shadow-sm" : "border-[#9792e3]/40"
                }`}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#61E786] py-2.5 text-xs font-semibold uppercase tracking-wider text-[#48435c] shadow-sm transition-all hover:bg-[#52d475]"
        >
          <Send className="h-3.5 w-3.5" />
          Pin Note to the Wall
        </button>
      </form>
    </ModalShell>
  );
}
