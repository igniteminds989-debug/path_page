import type { BadgeImageId } from "./data/lessons";

interface BadgeProps {
  id: BadgeImageId;
  size?: number;
  className?: string;
}

const badgeImages: Record<BadgeImageId, string> = {
  "voice-spark": "/assets/stone-spell.png",
  "box-keeper": "/assets/stone-bite.png",
  "lightning-count": "/assets/stone-tail.png",
  "scroll-reader": "/assets/stone-wind.png",
};

export function Badge({ id, size = 64, className }: BadgeProps) {
  return (
    <img
      src={badgeImages[id]}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="power stone badge"
      draggable={false}
    />
  );
}
