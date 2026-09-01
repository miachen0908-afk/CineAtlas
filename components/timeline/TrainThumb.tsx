type TrainThumbProps = {
  className?: string;
};

/** Side-view steam locomotive for the start of the year range. */
export function LocomotiveThumb({ className }: TrainThumbProps) {
  return (
    <svg
      viewBox="0 0 56 36"
      width="56"
      height="36"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Cabin */}
      <rect x="28" y="8" width="18" height="16" rx="1.5" />
      <rect x="31" y="11" width="5" height="5" rx="0.5" opacity="0.72" />
      <rect x="38" y="11" width="5" height="5" rx="0.5" opacity="0.72" />
      {/* Boiler */}
      <rect x="8" y="14" width="22" height="10" rx="5" />
      {/* Smokestack */}
      <rect x="12" y="4" width="5" height="10" rx="1" />
      <ellipse cx="14.5" cy="4" rx="3.5" ry="1.5" />
      {/* Cowcatcher */}
      <path d="M8 24 L2 30 L8 30 Z" />
      {/* Buffer */}
      <rect x="46" y="18" width="6" height="3" rx="1" />
      {/* Domes */}
      <ellipse cx="22" cy="14" rx="3" ry="2.5" />
      {/* Wheels */}
      <circle cx="14" cy="28" r="5" />
      <circle cx="14" cy="28" r="2" opacity="0.72" />
      <circle cx="28" cy="28" r="5" />
      <circle cx="28" cy="28" r="2" opacity="0.72" />
      <circle cx="40" cy="29" r="3.5" />
      <circle cx="40" cy="29" r="1.4" opacity="0.72" />
      {/* Coupling rod */}
      <path d="M14 27.5 H28" opacity="0.78" />
    </svg>
  );
}

/** Passenger carriage for the end of the year range. */
export function CarriageThumb({ className }: TrainThumbProps) {
  return (
    <svg
      viewBox="0 0 48 32"
      width="48"
      height="32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Body */}
      <rect x="4" y="8" width="40" height="14" rx="2" />
      <path d="M5 12 H43" opacity="0.68" />
      {/* Windows */}
      <rect x="9" y="14" width="6" height="5" rx="0.5" opacity="0.72" />
      <rect x="18" y="14" width="6" height="5" rx="0.5" opacity="0.72" />
      <rect x="27" y="14" width="6" height="5" rx="0.5" opacity="0.72" />
      <rect x="36" y="14" width="4" height="5" rx="0.5" opacity="0.72" />
      {/* Couplers */}
      <path d="M0 15.25 H4 M44 15.25 H48" opacity="0.72" />
      {/* Wheels */}
      <circle cx="14" cy="26" r="4" />
      <circle cx="14" cy="26" r="1.5" opacity="0.72" />
      <circle cx="34" cy="26" r="4" />
      <circle cx="34" cy="26" r="1.5" opacity="0.72" />
    </svg>
  );
}
