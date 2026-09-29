import { use, useEffect, type ComponentProps } from 'react';

import { ScrollAreaContext, ScrollbarContext } from './context';
import { scrollAreaStyle } from './style';
import { mergeProps, part } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

export type ScrollAreaThumbProps = ComponentProps<'div'> & { asChild?: boolean };

export function ScrollAreaThumb({ asChild, children, className, ...props }: ScrollAreaThumbProps) {
  const c = use(ScrollAreaContext);
  const axis = use(ScrollbarContext);

  useEffect(() => {
    if (isDevelopment && (!c || !axis))
      console.warn(
        '[IDS] ScrollArea.Thumb is drawn only inside <ScrollArea.Scrollbar>; it renders nothing here.',
      );
  }, [c, axis]);

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
