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
      aria-hidden
    >
      {/* Cabin */}
      <rect x="28" y="8" width="18" height="16" rx="1.5" fill="#2f6f9e" />
      <rect x="31" y="11" width="5" height="5" rx="0.5" fill="#f4f7fa" />
      <rect x="38" y="11" width="5" height="5" rx="0.5" fill="#f4f7fa" />
      {/* Boiler */}
      <rect x="8" y="14" width="22" height="10" rx="5" fill="#3a8fb7" />
      {/* Smokestack */}
      <rect x="12" y="4" width="5" height="10" rx="1" fill="#2f6b3a" />
      <ellipse cx="14.5" cy="4" rx="3.5" ry="1.5" fill="#5fa84a" />
      {/* Cowcatcher */}
      <path d="M8 24 L2 30 L8 30 Z" fill="#5fa84a" />
      {/* Buffer */}
      <rect x="46" y="18" width="6" height="3" rx="1" fill="#2f6b3a" />
      {/* Domes */}
      <ellipse cx="22" cy="14" rx="3" ry="2.5" fill="#2f6f9e" />
      {/* Wheels */}
      <circle cx="14" cy="28" r="5" fill="#1a2e3b" stroke="#3a8fb7" strokeWidth="1.2" />
      <circle cx="14" cy="28" r="2" fill="#f4f7fa" />
      <circle cx="28" cy="28" r="5" fill="#1a2e3b" stroke="#3a8fb7" strokeWidth="1.2" />
      <circle cx="28" cy="28" r="2" fill="#f4f7fa" />
      <circle cx="40" cy="29" r="3.5" fill="#1a2e3b" stroke="#3a8fb7" strokeWidth="1" />
      <circle cx="40" cy="29" r="1.4" fill="#f4f7fa" />
      {/* Coupling rod */}
      <rect x="14" y="27" width="14" height="1.5" rx="0.5" fill="#5fa84a" />
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
      aria-hidden
    >
      {/* Body */}
      <rect x="4" y="8" width="40" height="14" rx="2" fill="#5fa84a" />
      <rect x="4" y="8" width="40" height="4" rx="1" fill="#2f6b3a" />
      {/* Windows */}
      <rect x="9" y="14" width="6" height="5" rx="0.5" fill="#f4f7fa" />
      <rect x="18" y="14" width="6" height="5" rx="0.5" fill="#f4f7fa" />
      <rect x="27" y="14" width="6" height="5" rx="0.5" fill="#f4f7fa" />
      <rect x="36" y="14" width="4" height="5" rx="0.5" fill="#f4f7fa" />
      {/* Couplers */}
      <rect x="0" y="14" width="5" height="2.5" rx="1" fill="#2f6f9e" />
      <rect x="43" y="14" width="5" height="2.5" rx="1" fill="#2f6f9e" />
      {/* Wheels */}
      <circle cx="14" cy="26" r="4" fill="#1a2e3b" stroke="#3a8fb7" strokeWidth="1" />
      <circle cx="14" cy="26" r="1.5" fill="#f4f7fa" />
      <circle cx="34" cy="26" r="4" fill="#1a2e3b" stroke="#3a8fb7" strokeWidth="1" />
      <circle cx="34" cy="26" r="1.5" fill="#f4f7fa" />
    </svg>
  );
}
