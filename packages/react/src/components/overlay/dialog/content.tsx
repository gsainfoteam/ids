'use client';

import { isValidElement, useEffect, type ComponentProps, type ReactNode } from 'react';

import { DialogClose } from './close';
import { useDialogContext } from './context';
import { DialogFooter } from './footer';
import { ModalLayer, OverlayItemContext } from '../../../internal/overlay';
import { elementTypeOf, flattenFragments } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { ScrollArea } from '../../layout/scroll-area';

export type DialogContentProps = ComponentProps<'div'>;

export function DialogContent(props: DialogContentProps) {
  const { dialog } = useDialogContext('Dialog.Content');

  if (!dialog.mounted) return null;
  return <DialogPopup {...props} />;
}

DialogContent.displayName = 'Dialog.Content';

const isFooter = (node: ReactNode) => isValidElement(node) && elementTypeOf(node) === DialogFooter;

function splitOffTheFooter(children: ReactNode) {
  const parts = flattenFragments(children);
  let footerStart = parts.length;
  while (footerStart > 0 && isFooter(parts[footerStart - 1])) footerStart -= 1;
  return { body: parts.slice(0, footerStart), footer: parts.slice(footerStart) };
}

function DialogPopup({ className, style, children, ...props }: DialogContentProps) {
  const c = useDialogContext('Dialog.Content');
  const { dialog, styles, overlay } = c;
  const { ids, position, ending, open, content } = dialog;

  useEffect(() => {
    if (!isDevelopment || !content) return;

    const named =
      content.hasAttribute('aria-label') ||
      !!props['aria-labelledby'] ||
      !!content.querySelector('[data-dialog-title]');

    if (!named)
      console.warn(
        '[IDS] Dialog: add Dialog.Title, or aria-label on Dialog.Content, so screen readers can name the dialog.',
      );
  }, [content, props]);

  const { body, footer } = splitOffTheFooter(children);

  const labelledBy =
    props['aria-labelledby'] ??
    (props['aria-label'] === undefined && c.titled ? ids.title : undefined);

  return (
    <ModalLayer
      open={open}
      layer={dialog.layer}
      element={content}
      contentRef={dialog.setContent}
      backdrop={{
        ...overlay,
        ref: dialog.setBackdrop,
        'data-dialog-backdrop': '',
        'data-stacked': position.modalsBelow > 0 ? '' : undefined,
        'data-ending-style': ending ? '' : undefined,
        className: styles.backdrop({ className: overlay?.className }),
      }}
      onBackdropClick={() => {
        if (c.dismissible) dialog.setOpen(false);
      }}
    >
      <div
        {...props}
        popover="manual"
        id={ids.content}
        role={c.role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={props['aria-describedby'] ?? (c.described ? ids.description : undefined)}
        tabIndex={-1}
        data-dialog-content=""
        data-open={open ? '' : undefined}
        data-ending-style={ending ? '' : undefined}
        data-nested-open={position.covered ? '' : undefined}
        className={styles.content({ className })}
        style={style}
      >
        <OverlayItemContext value={null}>
          <ScrollArea asChild>
            <div data-dialog-body="" className={styles.body()}>
              <ScrollArea.Viewport className={styles.viewport()}>{body}</ScrollArea.Viewport>
            </div>
          </ScrollArea>
          {footer}
          {!c.hideClose && <DialogClose className={styles.close()} />}
        </OverlayItemContext>
      </div>
    </ModalLayer>
  );
}
