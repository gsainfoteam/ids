import type { SyntheticEvent } from 'react';

export const startsOnTheResizeHandle = (event: SyntheticEvent) =>
  event.target instanceof Element && event.target.closest('[data-resize-handle]') !== null;
