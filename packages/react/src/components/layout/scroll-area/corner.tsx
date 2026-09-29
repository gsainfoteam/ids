import { type ComponentProps } from 'react';

import { useAreaContext } from './context';
import { scrollAreaStyle } from './style';

export type ScrollAreaCornerProps = Omit<ComponentProps<'div'>, 'children'>;

export function ScrollAreaCorner({ className, ...props }: ScrollAreaCornerProps) {
  const c = useAreaContext('ScrollArea.Corner');

  if (!c) return null;

  const styles = scrollAreaStyle({
    variant: c.variant,
    vertical: c.placements.y,
    horizontal: c.placements.x,
  });

  return (
    <div
      {...props}
      aria-hidden="true"
      data-scroll-area-corner=""
      hidden={c.area.cornerShown ? undefined : true}
      className={styles.corner({ className })}
    />
  );
}

ScrollAreaCorner.displayName = 'ScrollArea.Corner';
