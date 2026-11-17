'use client';

import { useRef, type FocusEvent, type KeyboardEvent, type RefObject } from 'react';

import { keyHandler } from '../../../internal/keys';

const FOCUSED_BY_KEYBOARD_CHART_SURFACE = 'svg.recharts-surface:focus-visible';
const RECHARTS_WRAPPER = '.recharts-wrapper';

function leaveTheChartAsRechartsHearsIt(frame: HTMLElement) {
  const wrapper = frame.querySelector(RECHARTS_WRAPPER);
  if (!wrapper?.matches(':hover')) return false;

  wrapper.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: frame }));
  return true;
}

export function useKeysOverARestingPointer(frameRef: RefObject<HTMLDivElement | null>) {
  const pointerHandedOver = useRef(false);

  const handTheTooltipToTheKeys = () => {
    const frame = frameRef.current;
    if (frame && !pointerHandedOver.current)
      pointerHandedOver.current = leaveTheChartAsRechartsHearsIt(frame);
    return false;
  };

  return {
    onFocus: (event: FocusEvent<HTMLDivElement>) => {
      if (event.target.matches(FOCUSED_BY_KEYBOARD_CHART_SURFACE)) handTheTooltipToTheKeys();
    },
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      keyHandler<HTMLDivElement>({
        ArrowLeft: handTheTooltipToTheKeys,
        ArrowRight: handTheTooltipToTheKeys,
        Enter: handTheTooltipToTheKeys,
      })(event);
    },
    onMouseMove: () => {
      pointerHandedOver.current = false;
    },
  };
}
