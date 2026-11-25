'use client';

import type { ComponentProps } from 'react';

import { ModalLayer, OverlayItemContext } from '../../../../internal/overlay';
import { mergeEventHandlers } from '../../../../utils';
import { ScrollArea } from '../../../layout/scroll-area';
import { useInternalDrawerContext } from '../context';
import { useInternalDrawerMergedRef } from '../hooks/use-drawer-merged-ref';
import { useInternalDrawerNameWarning } from '../hooks/use-drawer-name-warning';

export type DrawerContentProps = ComponentProps<'div'>;

export function DrawerContent(props: DrawerContentProps) {
  const { drawer } = useInternalDrawerContext('Drawer.Content');
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
  const c = useInternalDrawerContext('Drawer.Content');
  const { drawer, styles, overlay } = c;
  const { ids, position, ending, open, content } = drawer;

  useInternalDrawerNameWarning(content, props);

  const labelledBy =
    props['aria-labelledby'] ??
    (props['aria-label'] === undefined && c.titled ? ids.title : undefined);

  const contentRef = useInternalDrawerMergedRef(ref, drawer.setContent);

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
          <OverlayItemContext value={null}>{children}</OverlayItemContext>
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
