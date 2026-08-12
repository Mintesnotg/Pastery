export function BreadSlice({ className = "mx-auto mt-6 h-8 text-honey w-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 32" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M4 8h72v8c-8 8-16 8-24 6-6-1.5-12-1.5-18 0-6 1.5-14 1.5-20 0C10 14 8 12 4 8z" opacity="0.35" />
      <path d="M10 6c0-3 3-5 7-5h46c4 0 7 2 7 5 6 8 6 20 0 24h-60C4 26 4 14 10 6z" />
      <rect x="14" y="14" width="52" height="14" rx="2" fill="#faf6ef" />
      <circle cx="30" cy="21" r="2" fill="#d9a441" />
      <circle cx="50" cy="21" r="2" fill="#d9a441" />
    </svg>
  );
}
