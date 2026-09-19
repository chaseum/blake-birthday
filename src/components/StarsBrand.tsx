type BrandImageProps = {
  className?: string;
  decorative?: boolean;
  alt?: string;
};

/**
 * Official Dallas Stars-hosted image assets.
 * Keeping these centralized makes it easy to swap to local licensed assets later.
 */
export const STARS_ASSETS = {
  primaryLogo: "https://media.d3.nhle.com/image/private/fl_attachment/prd/b8powq7njs5rpnbzlfgf",
  victorBadge:
    "https://media.d3.nhle.com/image/private/t_w_720/f_png/prd/wwh7vccj8wbdudtkemle.png",
} as const;

export function StarsLogo({
  className = "",
  decorative = false,
  alt = "Dallas Stars",
}: BrandImageProps) {
  return (
    <img
      className={className}
      src={STARS_ASSETS.primaryLogo}
      alt={decorative ? "" : alt}
      aria-hidden={decorative || undefined}
      draggable={false}
    />
  );
}

export function VictorBadge({
  className = "",
  decorative = false,
  alt = "Victor E. Green, Dallas Stars mascot",
}: BrandImageProps) {
  return (
    <img
      className={className}
      src={STARS_ASSETS.victorBadge}
      alt={decorative ? "" : alt}
      aria-hidden={decorative || undefined}
      draggable={false}
    />
  );
}
