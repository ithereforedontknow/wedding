import React from "react";

// Section heading used on the book pages.
// Props: eyebrow (small caps label), title (script heading), description (optional line), className (optional).
export function SectionHeading({ eyebrow, title, description, className = "" }) {
  return (
    <div className={`text-center ${className}`}>
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-widest text-[#2F4F3E]/75">{eyebrow}</span>
      )}
      <h2 className="mt-1 font-script text-4xl leading-tight text-[#2F4F3E] md:text-5xl">{title}</h2>
      {description && <p className="mt-2 text-sm font-medium text-[#2F4F3E]/85">{description}</p>}
    </div>
  );
}
