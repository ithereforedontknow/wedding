import { forwardRef } from "react";
import { BotanicalBranch } from "./BotanicalBranch";

/**
 * Shared keepsake paper card: gradient paper, inset dashed stationery
 * frame, and soft botanical corners. Renders `as` any element type.
 */
const KeepsakeCard = forwardRef(function KeepsakeCard(
  { as: Tag = "div", className = "", children, ...rest },
  ref
) {
  return (
    <Tag
      ref={ref}
      className={`relative overflow-hidden rounded-[2rem] border border-[#9792e3]/30 bg-gradient-to-b from-white/80 via-white/70 to-[#f8fffa]/80 shadow-[0_24px_70px_-40px_rgba(72,67,92,0.35)] backdrop-blur-md ${className}`}
      {...rest}
    >
      {/* Inset stationery frame */}
      <div className="pointer-events-none absolute inset-2 rounded-[1.6rem] border border-dashed border-[#9792e3]/35" />

      {/* Botanical corners */}
      <BotanicalBranch className="pointer-events-none absolute -bottom-9 -left-9 w-32 rotate-12 opacity-25 sm:w-44" />
      <BotanicalBranch className="pointer-events-none absolute -bottom-9 -right-9 w-32 -rotate-12 scale-x-[-1] opacity-25 sm:w-44" />

      <div className="relative">{children}</div>
    </Tag>
  );
});

export default KeepsakeCard;
