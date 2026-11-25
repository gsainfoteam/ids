'use client';

import { useRef, type KeyboardEvent } from 'react';

export function useInternalSurfaceTriggerSpace() {
  const spaceWentDownHere = useRef(false);

  return {
    onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
      if (event.key === ' ') spaceWentDownHere.current = true;
    },
    onKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
      if (event.key !== ' ') return;
      if (!spaceWentDownHere.current) event.preventDefault();
      spaceWentDownHere.current = false;
    },
    onBlur() {
      spaceWentDownHere.current = false;
    },
  };
}
