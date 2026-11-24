'use client';

import { useCallback, type ComponentProps } from 'react';

import { useInternalTranslate } from '../../../../internal/translate';
import { mergeRefs } from '../../../../utils';
import { useInternalDrawerContext } from '../context';

export type DrawerHandleProps = Omit<ComponentProps<'button'>, 'type' | 'children'>;

export function DrawerHandle({ ref, className, onClick, ...props }: DrawerHandleProps) {
  const t = useInternalTranslate();

  const { drawer, styles } = useInternalDrawerContext('Drawer.Handle');

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
      aria-label={t('common.resize')}
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
