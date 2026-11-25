'use client';

import { useLayoutEffect, useRef } from 'react';

import { initialFocusTarget } from '../../overlay';

export function useInternalFieldPopupInitialFocus(
  popup: HTMLElement | null,
  drawer: boolean,
  initialFocusSelector: string | undefined,
) {
  const initialFocusDone = useRef(false);

  useLayoutEffect(() => {
    if (!popup) return;

    const sheetMissingFocus = drawer && !popup.contains(popup.ownerDocument.activeElement);
    if (initialFocusDone.current && !sheetMissingFocus) return;

    initialFocusDone.current = true;
    initialFocusTarget(popup, { selector: initialFocusSelector, holdsFocus: drawer })?.focus({
      preventScroll: true,
    });
  }, [popup, drawer, initialFocusSelector]);
}
