'use client';

import { use, useCallback, type ComponentProps, type ReactNode } from 'react';

import { PlacementContext, ScrollbarContext, useAreaContext } from './context';
import { axisOf } from './orientation';
import { scrollAreaStyle } from './style';
import { ScrollAreaThumb } from './thumb';
import { mergeProps, mergeRefs } from '../../../utils';

import type { ScrollArea } from '.';

export type ScrollAreaScrollbarProps = Omit<ComponentProps<'div'>, 'children'> & {
  orientation?: ScrollArea.ScrollbarOrientation;
  children?: ReactNode;
};

export function ScrollAreaScrollbar({
  orientation = 'vertical',
  children,
  className,
  ref,
  ...props
}: ScrollAreaScrollbarProps) {
  const c = useAreaContext('ScrollArea.Scrollbar');
  const placement = use(PlacementContext);
  const axis = axisOf(orientation);
  const registerBar = c?.area.registerBar;

  const register = useCallback(
    (node: HTMLDivElement | null) =>
      node && registerBar ? registerBar(axis, node, placement) : undefined,
    [registerBar, axis, placement],
  );

  if (!c) return null;

  const { area, variant, size } = c;
  const overflowing = area.overflow[axis];
  const active = area.hovering || area.scrolling || area.dragging !== null;
  const visible = variant === 'always' || (overflowing && (variant === 'auto' || active));
  const styles = scrollAreaStyle({ variant, size, axis, placement });

  return (
    <div
      {...mergeProps(props, area.scrollbarProps(axis))}
      ref={mergeRefs(ref, register)}
      aria-hidden="true"
      data-scroll-area-scrollbar=""
      data-orientation={orientation}
      data-placement={placement}
      data-visible={visible ? '' : undefined}
      data-overflow={overflowing ? '' : undefined}
      data-dragging={area.dragging === axis ? '' : undefined}
      className={styles.scrollbar({ className })}
    >
      <ScrollbarContext value={axis}>{children ?? <ScrollAreaThumb />}</ScrollbarContext>
    </div>
  );
}

ScrollAreaScrollbar.displayName = 'ScrollArea.Scrollbar';
