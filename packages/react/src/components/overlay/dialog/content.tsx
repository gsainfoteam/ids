import { useEffect, type ComponentProps } from 'react';

import { DialogClose } from './close';
import { useDialogContext } from './context';
import { ModalLayer, OverlayItemContext } from '../../../internal/overlay';
import { isDevelopment } from '../../../utils/dev';
import { ScrollArea } from '../../layout/scroll-area';

export type DialogContentProps = ComponentProps<'div'>;

export function DialogContent(props: DialogContentProps) {
  const { dialog } = useDialogContext('Dialog.Content');

  if (!dialog.mounted) return null;
  return <DialogPopup {...props} />;
}

DialogContent.displayName = 'Dialog.Content';

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
      <ScrollArea asChild>
        <div
          {...props}
          popover="manual"
          id={ids.content}
          role={c.role}
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={
            props['aria-describedby'] ?? (c.described ? ids.description : undefined)
          }
          tabIndex={-1}
          data-dialog-content=""
          data-open={open ? '' : undefined}
          data-ending-style={ending ? '' : undefined}
          data-nested-open={position.covered ? '' : undefined}
          className={styles.content({ className })}
          style={style}
        >
          <ScrollArea.Viewport className={styles.viewport()}>
            <OverlayItemContext value={null}>
              {children}
              {!c.hideClose && <DialogClose className={styles.close()} />}
            </OverlayItemContext>
          </ScrollArea.Viewport>
        </div>
      </ScrollArea>
    </ModalLayer>
  );
}
