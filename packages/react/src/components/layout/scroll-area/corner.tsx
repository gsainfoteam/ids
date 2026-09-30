'use client';

import { Children, useCallback, type ComponentProps } from 'react';

import { useAreaContext } from './context';
import { scrollAreaStyle } from './style';
import { mergeRefs } from '../../../utils';

export type ScrollAreaCornerProps = ComponentProps<'div'>;

export function ScrollAreaCorner({ className, children, ref, ...props }: ScrollAreaCornerProps) {
  const c = useAreaContext('ScrollArea.Corner');
  const occupied = Children.count(children) > 0;

  const registerCorner = c?.area.registerCorner;
  const vertical = c?.placements.y;
  const horizontal = c?.placements.x;
  const register = useCallback(
    (node: HTMLDivElement | null) =>
      node && occupied && registerCorner && vertical && horizontal
        ? registerCorner(node, { x: horizontal, y: vertical })
        : undefined,
    [occupied, registerCorner, vertical, horizontal],
  );

  if (!c) return null;

  const styles = scrollAreaStyle({
    variant: c.variant,
    vertical: c.placements.y,
    horizontal: c.placements.x,
    occupied,
  });

  if (occupied)
    return (
      <div
        {...props}
        ref={mergeRefs(ref, register)}
        data-scroll-area-corner=""
        data-occupied=""
        className={styles.corner({ className })}
      >
        {children}
      </div>
    );

  return (
    <div
      {...props}
      ref={ref}
      aria-hidden="true"
      data-scroll-area-corner=""
      hidden={c.area.cornerShown ? undefined : true}
      className={styles.corner({ className })}
    />
  );
}

ScrollAreaCorner.displayName = 'ScrollArea.Corner';
