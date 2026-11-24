'use client';

import {
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

import { DialogClose, type DialogCloseProps } from './close';
import { useInternalDialogContext } from '../context';
import { DialogFooter } from './footer';
import { DialogHeader } from './header';
import { ModalLayer, OverlayItemContext } from '../../../../internal/overlay';
import { elementTypeOf, flattenFragments } from '../../../../utils';
import { ScrollArea } from '../../../layout/scroll-area';
import { useInternalDialogNameWarning } from '../hooks/use-dialog-name-warning';

export type DialogContentProps = ComponentProps<'div'>;

export function DialogContent(props: DialogContentProps) {
  const { dialog } = useInternalDialogContext('Dialog.Content');

  if (!dialog.mounted) return null;
  return <DialogPopup {...props} />;
}

DialogContent.displayName = 'Dialog.Content';

const isFooter = (node: ReactNode) => isValidElement(node) && elementTypeOf(node) === DialogFooter;

const isCornerClose = (node: ReactNode): node is ReactElement<DialogCloseProps> =>
  isValidElement<DialogCloseProps>(node) &&
  elementTypeOf(node) === DialogClose &&
  node.props.children == null &&
  !node.props.asChild;

const PARTS_THAT_HOLD_A_CLOSE = new Set<unknown>([DialogHeader, DialogFooter]);

function writesAClose(children: ReactNode): boolean {
  return flattenFragments(children).some((node) => {
    if (!isValidElement<{ children?: ReactNode }>(node)) return false;
    const type = elementTypeOf(node);
    if (type === DialogClose) return true;
    const searchable = typeof type === 'string' || PARTS_THAT_HOLD_A_CLOSE.has(type);
    return searchable && writesAClose(node.props.children);
  });
}

function splitOffTheFooter(children: ReactNode) {
  const parts = flattenFragments(children);
  const corner = parts.filter(isCornerClose);
  const rest = parts.filter((node) => !isCornerClose(node));
  let footerStart = rest.length;
  while (footerStart > 0 && isFooter(rest[footerStart - 1])) footerStart -= 1;
  return {
    body: rest.slice(0, footerStart),
    footer: rest.slice(footerStart),
    corner: corner.length ? corner : writesAClose(rest) ? [] : [<DialogClose key="close" />],
  };
}

function DialogPopup({ className, style, children, ...props }: DialogContentProps) {
  const c = useInternalDialogContext('Dialog.Content');
  const { dialog, styles, overlay } = c;
  const { ids, position, ending, open, content } = dialog;

  useInternalDialogNameWarning(content, props);

  const { body, footer, corner } = splitOffTheFooter(children);

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
            <div data-dialog-body="" className={styles.body({ footed: footer.length > 0 })}>
              <ScrollArea.Viewport className={styles.viewport()}>{body}</ScrollArea.Viewport>
            </div>
          </ScrollArea>
          {footer}
          {corner.map((close) =>
            cloneElement(close, { className: styles.close({ className: close.props.className }) }),
          )}
        </OverlayItemContext>
      </div>
    </ModalLayer>
  );
}
