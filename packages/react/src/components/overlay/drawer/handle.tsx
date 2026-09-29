import { useCallback, type ComponentProps } from 'react';

import { useDrawerContext } from './context';
import { messages } from '../../../internal/messages';
import { mergeRefs } from '../../../utils';

export type DrawerHandleProps = Omit<ComponentProps<'button'>, 'type' | 'children'>;

export function DrawerHandle({ ref, className, onClick, ...props }: DrawerHandleProps) {
  const { drawer, styles } = useDrawerContext('Drawer.Handle');

  const { setHandle } = drawer;
  const handleRef = useCallback(
    (node: HTMLElement | null) => mergeRefs(ref, setHandle)(node),
    [ref, setHandle],
  );

  if (!drawer.drag.cycles)
    return (
      <div
        {...(props as ComponentProps<'div'>)}
        ref={handleRef}
        aria-hidden="true"
        data-drawer-handle=""
        className={styles.handle({ className })}
      />
    );

  return (
    <button
      type="button"
      aria-label={messages.drawer.handle}
      aria-controls={drawer.ids.content}
      {...props}
      ref={handleRef}
      data-drawer-handle=""
      className={styles.handle({ className })}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) drawer.drag.cycleSnapPoint();
      }}
    />
  );
}

DrawerHandle.displayName = 'Drawer.Handle';
