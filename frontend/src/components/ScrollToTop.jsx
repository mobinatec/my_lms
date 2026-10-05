import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Keeps route navigation predictable: every new page opens at its top.
 * Hash links remain supported and are scrolled into view after the route renders.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (hash) {
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (target) {
          target.scrollIntoView({ block: 'start', behavior: 'auto' });
          return;
        }
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, search, hash]);

  return null;
}
