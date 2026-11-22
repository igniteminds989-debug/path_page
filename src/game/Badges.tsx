import type { BadgeImageId } from "./data/lessons";

interface BadgeProps {
  id: BadgeImageId;
  size?: number;
  className?: string;
}

export function Badge({ id, size = 64, className }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="badge"
    >
      <defs>
        <radialGradient id={`pa-badge-shine-${id}`} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#fff6d8" />
          <stop offset="45%" stopColor="oklch(0.88 0.2 126)" />
          <stop offset="100%" stopColor="oklch(0.62 0.18 140)" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#pa-badge-shine-${id})`} stroke="oklch(0.54 0.2 145)" strokeWidth="3" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="oklch(0.92 0.07 92)" strokeWidth="1.2" strokeOpacity="0.55" />
      <g transform="translate(32 33)" fill="oklch(0.25 0.05 151)" stroke="oklch(0.25 0.05 151)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        {renderIcon(id)}
      </g>
    </svg>
  );
}

function renderIcon(id: BadgeImageId) {
  switch (id) {
    case "voice-spark":
      return (
        <path d="M-9 -4 L-3 -4 L4 -10 L4 10 L-3 4 L-9 4 Z" fill="oklch(0.25 0.05 151)" />
      );
    case "box-keeper":
      return (
        <path d="M-10 -3 L0 -9 L10 -3 L10 8 L0 12 L-10 8 Z M0 -9 L0 12 M-10 -3 L0 3 L10 -3" fill="none" stroke="oklch(0.25 0.05 151)" strokeWidth="2" />
      );
    case "lightning-count":
      return <path d="M2 -11 L-7 3 L-1 3 L-3 11 L8 -3 L1 -3 Z" fill="oklch(0.25 0.05 151)" />;
    case "scroll-reader":
      return (
        <g fill="none" stroke="oklch(0.25 0.05 151)" strokeWidth="2">
          <path d="M-9 -9 L7 -9 L7 9 L-9 9 Z" />
          <path d="M-5 -3 L5 -3 M-5 1 L5 1 M-5 5 L3 5" />
        </g>
      );
    default:
      return null;
  }
}
