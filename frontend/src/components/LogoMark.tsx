import { useId } from "react";

type LogoMarkProps = {
  size?: number;
  className?: string;
  /** `gradient` is the honey-to-crust badge; `mono` draws the glyph alone in `currentColor`. */
  variant?: "gradient" | "mono";
  title?: string;
};

// Static vector source for this mark lives in frontend/public/logo-mark.svg — keep both in sync.
const GRAIN = "M0 0C2.45-2.2 2.45-7.8 0-10C-2.45-7.8-2.45-2.2 0 0Z";
const GRAIN_ROWS = [32.5, 37.2, 41.9, 46.6];

export default function LogoMark({
  size = 40,
  className,
  variant = "gradient",
  title = "House of Bread London",
}: LogoMarkProps) {
  const gradientId = useId();
  const ink = variant === "gradient" ? "#FAF6EF" : "currentColor";

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={className}
    >
      {variant === "gradient" && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#D9A441" />
              <stop offset="1" stopColor="#8B5E34" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="32" fill={`url(#${gradientId})`} />
        </>
      )}
      <g fill="none" stroke={ink} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 29 32 13 49 29" strokeWidth="4" />
        <path d="M43.5 15.5v8.3" strokeWidth="3.4" />
        <path d="M32 51V23" strokeWidth="2.3" />
      </g>
      <g fill={ink}>
        <path d={GRAIN} transform="translate(32 29.5)" />
        {GRAIN_ROWS.map((y) => (
          <g key={y}>
            <path d={GRAIN} transform={`translate(32 ${y}) rotate(-33)`} />
            <path d={GRAIN} transform={`translate(32 ${y}) rotate(33)`} />
          </g>
        ))}
      </g>
    </svg>
  );
}
