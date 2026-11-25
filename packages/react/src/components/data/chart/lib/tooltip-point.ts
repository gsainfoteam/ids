import type { RefObject } from 'react';

export const pointIn = (frameRef: RefObject<HTMLDivElement | null>, x: number, y: number) => ({
  getBoundingClientRect: () => {
    const frame = frameRef.current?.getBoundingClientRect();
    return DOMRect.fromRect({ x: (frame?.left ?? 0) + x, y: (frame?.top ?? 0) + y });
  },
});
