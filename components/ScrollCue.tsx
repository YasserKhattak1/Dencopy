'use client';

import { useEffect, useState } from 'react';

/**
 * Den-blue chevron that bounces slowly at the bottom of the viewport,
 * cueing the user to scroll down to the video and newsletter.
 * Fades out the moment the user begins scrolling.
 */
export default function ScrollCue() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function onScroll() {
      setHidden(window.scrollY > 80);
    }
    // Initialize in case the page loads already scrolled.
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function onClick() {
    const target =
      document.getElementById('video') ||
      document.querySelector('.video');
    if (target && 'scrollIntoView' in target) {
      (target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
    }
  }

  return (
    <div
      className={`scroll-cue-wrap${hidden ? ' is-hidden' : ''}`}
      aria-hidden={hidden}
    >
      <button
        type="button"
        className="scroll-cue"
        onClick={onClick}
        aria-label="Scroll down"
      >
        <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" focusable="false">
          <path
            d="M6 10l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>
    </div>
  );
}
