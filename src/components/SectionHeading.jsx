import { Heart } from "lucide-react";

export function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="text-center">
      <span className="text-xs font-semibold uppercase tracking-widest text-[#6f68b8]">
        {eyebrow}
      </span>
      <h2 className="mt-1 font-script text-4xl text-[#48435c] md:text-5xl">{title}</h2>
      {description && (
        <p className="mt-2 text-sm font-medium text-[#5A5766]">{description}</p>
      )}
      <div className="mt-5 flex items-center justify-center gap-3">
        <span className="h-px w-10 bg-[#9792e3]/40" />
        <Heart className="h-3.5 w-3.5 fill-[#61E786] text-[#61E786]" />
        <span className="h-px w-10 bg-[#9792e3]/40" />
      </div>
    </div>
  );
}
