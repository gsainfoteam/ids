'use client';

import { use, type ComponentProps } from 'react';

import { mergeProps, part } from '../../../../utils';
import { ScrollAreaContext, ScrollbarContext } from '../context';
import { useInternalScrollAreaThumbWarning } from '../hooks/use-scroll-area-thumb-warning';
import { scrollAreaStyle } from '../style';

export type ScrollAreaThumbProps = ComponentProps<'div'> & { asChild?: boolean };

export function ScrollAreaThumb({ asChild, children, className, ...props }: ScrollAreaThumbProps) {
  const c = use(ScrollAreaContext);
  const axis = use(ScrollbarContext);

  useInternalScrollAreaThumbWarning(c, axis);

  if (!c || !axis) return null;

  const styles = scrollAreaStyle({ variant: c.variant, size: c.size, axis });

  return part(
    'div',
    asChild,
    children,
    mergeProps(props, {
      'data-scroll-area-thumb': '',
      hidden: c.area.overflow[axis] ? undefined : true,
      className: styles.thumb({ className }),
    }),
  );
}

ScrollAreaThumb.displayName = 'ScrollArea.Thumb';
