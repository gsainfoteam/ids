import { useLayoutEffect, useRef, useState } from 'react';

export type PresenceOptions = {
  elements: () => ReadonlyArray<Element | null | undefined>;
  onExitComplete?: () => void;
};

function animationsOf(element: Element | null | undefined) {
  return element && typeof element.getAnimations === 'function' ? element.getAnimations() : [];
}

export function usePresence(open: boolean, options: PresenceOptions) {
  const latest = useRef(options);
  useLayoutEffect(() => {
    latest.current = options;
  });

  const [lastOpen, setLastOpen] = useState(open);
  const [ending, setEnding] = useState(false);
  if (lastOpen !== open) {
    setLastOpen(open);
    setEnding(!open);
  }

  useLayoutEffect(() => {
    if (!ending) return;
    let cancelled = false;
    const endingStyleFrame = requestAnimationFrame(() => {
      const animations = latest.current.elements().flatMap(animationsOf);
      void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
        if (cancelled) return;
        setEnding(false);
        latest.current.onExitComplete?.();
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(endingStyleFrame);
    };
  }, [ending]);

  return { mounted: open || ending, ending };
}
