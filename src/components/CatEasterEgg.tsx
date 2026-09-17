/** Where the cat sits: on the ice against the far boards, clear of the PLAY button and portrait crops. */
const CAT_SPOT = { x: 1165, y: 876 };

/** Sitting tabby, side-on; ~18 photo px tall (a quarter of a skater's height there, nudged up to be findable). */
function SittingCat() {
  return (
    <svg className="ice-cat__sprite" viewBox="0 0 22 18" aria-hidden="true">
      <ellipse cx="11" cy="17.2" rx="8.5" ry="1.1" fill="rgba(0,20,10,.5)" />
      <path className="ice-cat__tail" d="M14 15 Q20.5 15.5 19 8.5" stroke="#46544a" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M5.5 17 Q4.5 10 8 8.5 Q13.5 8 14.5 13 Q15 17 12.5 17 Z" fill="#56665b" />
      <path d="M9 10.5 Q11 10 12.5 11 M8.5 13 Q11 12.4 13.3 13.6" stroke="#3a463e" strokeWidth=".7" fill="none" />
      <circle cx="7.8" cy="6.4" r="3.3" fill="#56665b" />
      <path d="M5 4.6 L5.3 1.2 L7.4 3.4 Z M8.4 3.2 L10.5 1.2 L10.8 4.7 Z" fill="#56665b" />
      <circle cx="6.6" cy="6.1" r=".55" fill="#c8f0a0" />
      <circle cx="9" cy="6.1" r=".55" fill="#c8f0a0" />
      <path d="M7.4 7.6 L8.2 7.6 L7.8 8.1 Z" fill="#e7a3a3" />
    </svg>
  );
}

/** Front-facing cat face, used as the Meowdoku marker. */
export function CatFace({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9 L4.5 2.5 L10 6.5 Z M20 9 L19.5 2.5 L14 6.5 Z" fill="currentColor" />
      <ellipse cx="12" cy="13.5" rx="8.6" ry="7.6" fill="currentColor" />
      <ellipse cx="8.6" cy="12.6" rx="1.3" ry="1.7" fill="#fff" />
      <ellipse cx="15.4" cy="12.6" rx="1.3" ry="1.7" fill="#fff" />
      <circle cx="8.8" cy="13" r=".75" fill="#111" />
      <circle cx="15.6" cy="13" r=".75" fill="#111" />
      <path d="M11 15.6 H13 L12 16.8 Z" fill="#f29bb0" />
      <path d="M1.5 14.5 L6 15.2 M1.8 17.4 L6 16.4 M22.5 14.5 L18 15.2 M22.2 17.4 L18 16.4" stroke="#fff" strokeWidth=".6" opacity=".8" />
    </svg>
  );
}

export function CatEasterEgg({ onFind }: { onFind: () => void }) {
  return (
    <button
      className="ice-cat"
      style={{ left: CAT_SPOT.x, top: CAT_SPOT.y }}
      onClick={onFind}
      aria-label="A cat on the ice"
      title="🐾"
    >
      <SittingCat />
    </button>
  );
}
