'use client';

import { useCallback, useEffect, type ComponentProps } from 'react';

import { DrawerClose } from './close';
import { useDrawerContext } from './context';
import { ModalLayer, OverlayItemContext } from '../../../internal/overlay';
import { mergeEventHandlers, mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { ScrollArea } from '../../layout/scroll-area';

export type DrawerContentProps = ComponentProps<'div'>;

export function DrawerContent(props: DrawerContentProps) {
  const { drawer } = useDrawerContext('Drawer.Content');
  if (!drawer.mounted) return null;
  return <DrawerPopup {...props} />;
}

function DrawerPopup({
  className,
  style,
  ref,
  onPointerDown,
  children,
  ...props
}: DrawerContentProps) {
  const c = useDrawerContext('Drawer.Content');
  const { drawer, styles, overlay } = c;
  const { ids, position, ending, open, content } = drawer;

  useEffect(() => {
    if (!isDevelopment || !content) return;

    const named =
      content.hasAttribute('aria-label') ||
      !!props['aria-labelledby'] ||
      !!content.querySelector('[data-drawer-title]');

    if (!named)
      console.warn(
        '[IDS] Drawer: add Drawer.Title, or aria-label on Drawer.Content, so screen readers can name the drawer.',
      );
  }, [content, props]);

  const labelledBy =
    props['aria-labelledby'] ??
    (props['aria-label'] === undefined && c.titled ? ids.title : undefined);

  const { setContent } = drawer;
  const contentRef = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(ref, setContent)(node),
    [ref, setContent],
  );

  const sheet = (
    <ScrollArea asChild>
      <div
        {...props}
        ref={c.modal ? undefined : contentRef}
        popover="manual"
        id={ids.content}
        role={c.role}
        aria-modal={c.modal ? 'true' : undefined}
        aria-labelledby={labelledBy}
        aria-describedby={props['aria-describedby'] ?? (c.described ? ids.description : undefined)}
        tabIndex={-1}
        data-drawer-content=""
        data-side={c.side}
        data-open={open ? '' : undefined}
        data-ending-style={ending ? '' : undefined}
        data-nested-open={position.covered ? '' : undefined}
        className={styles.content({ className })}
        style={style}
        onPointerDown={mergeEventHandlers(onPointerDown, drawer.drag.onPointerDown)}
      >
        <ScrollArea.Viewport className={styles.viewport()}>
          <OverlayItemContext value={null}>
            {children}
            {!c.hideClose && <DrawerClose className={styles.close()} />}
          </OverlayItemContext>
        </ScrollArea.Viewport>
      </div>
    </ScrollArea>
  );

  if (!c.modal) return sheet;
  return (
    <ModalLayer
      open={open}
      layer={drawer.layer}
      element={content}
      contentRef={contentRef}
      backdrop={{
        ...overlay,
        ref: drawer.setBackdrop,
        'data-drawer-backdrop': '',
        'data-side': c.side,
        'data-stacked': position.modalsBelow > 0 ? '' : undefined,
        'data-ending-style': ending ? '' : undefined,
        className: styles.backdrop({ className: overlay?.className }),
      }}
      onBackdropClick={() => {
        if (c.dismissible) drawer.setOpen(false);
      }}
    >
      {sheet}
    </ModalLayer>
  );
}

DrawerContent.displayName = 'Drawer.Content';
