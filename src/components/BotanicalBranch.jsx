// --- Watercolor Floral SVG Motifs ---
export const BotanicalBranch = ({ className = "" }) => (
  <svg
    viewBox="0 0 200 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none ${className}`}
  >
    <path
      d="M10,110 Q80,70 180,20"
      stroke="#9792e3"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.45"
    />
    {/* Leaves */}
    <path d="M40,90 Q45,70 65,75 Q55,95 40,90 Z" fill="#61E786" opacity="0.45" />
    <path d="M85,68 Q100,50 115,62 Q95,80 85,68 Z" fill="#9792e3" opacity="0.4" />
    <path d="M125,48 Q145,30 155,48 Q135,62 125,48 Z" fill="#61E786" opacity="0.45" />
    <path d="M165,28 Q185,10 190,26 Q175,38 165,28 Z" fill="#9792e3" opacity="0.5" />
    {/* Delicate Watercolor Blossoms */}
    <circle cx="65" cy="72" r="5" fill="#9792e3" opacity="0.6" />
    <circle cx="115" cy="58" r="6" fill="#EDFFEC" stroke="#9792e3" strokeWidth="1" opacity="0.85" />
    <circle cx="155" cy="42" r="5" fill="#61E786" opacity="0.6" />
  </svg>
);
