'use client';

import {
  isValidElement,
  useEffect,
  useLayoutEffect,
  type ComponentProps,
  type ReactNode,
} from 'react';

import { PopoverArrow } from './arrow';
import { usePopoverContext } from './context';
import { DEFAULT_PLACEMENT } from './use-popover';
import { ModalLayer, OverlayItemContext } from '../../../internal/overlay';
import { elementTypeOf, flattenFragments } from '../../../utils';
import { ScrollArea } from '../../layout/scroll-area';

import type { Popover } from '.';

export type PopoverContentProps = ComponentProps<'div'> & {
  side?: Popover.Side;
  align?: Popover.Align;
  sideOffset?: number;
  alignOffset?: number;
  anchor?: Popover.Anchor;
  initialFocus?: string;
};

export function PopoverContent({
  side = DEFAULT_PLACEMENT.side,
  align = DEFAULT_PLACEMENT.align,
  sideOffset = DEFAULT_PLACEMENT.sideOffset,
  alignOffset = DEFAULT_PLACEMENT.alignOffset,
  anchor,
  initialFocus,
  ...props
}: PopoverContentProps) {
  const { popover } = usePopoverContext('Popover.Content');
  const { setPlacement, mountContent } = popover;
  const anchored = anchor !== undefined;

  useLayoutEffect(() => {
    setPlacement({ side, align, sideOffset, alignOffset, anchor, initialFocus });
  }, [setPlacement, side, align, sideOffset, alignOffset, anchor, initialFocus]);

  useEffect(() => mountContent(anchored), [mountContent, anchored]);

  if (!popover.mounted) return null;

  return <PopoverPopup {...props} />;
}

PopoverContent.displayName = 'Popover.Content';

const isArrow = (node: ReactNode) => isValidElement(node) && elementTypeOf(node) === PopoverArrow;

type PopupProps = Omit<
  PopoverContentProps,
  'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor' | 'initialFocus'
>;

function PopoverPopup({ className, style, children, ...props }: PopupProps) {
  const c = usePopoverContext('Popover.Content');
  const { popover, styles } = c;
  const { ids, anchored, open, ending, modal } = popover;

  const labelledBy =
    props['aria-labelledby'] ??
    (props['aria-label'] === undefined && c.titled ? ids.title : undefined);

  const parts = flattenFragments(children);
  const arrowsThatStickOut = parts.filter(isArrow);
  const content = parts.filter((node) => !isArrow(node));

  return (
    <ModalLayer
      open={modal && open}
      layer={popover.layer}
      element={popover.content}
      contentRef={popover.setContent}
      context={anchored.context}
      backdrop={
        modal && {
          ref: popover.setBackdrop,
          'data-popover-backdrop': '',
          className: styles.backdrop(),
        }
      }
      onBackdropClick={() => popover.setOpen(false)}
    >
      <div
        {...props}
        popover="manual"
        id={ids.content}
        role="dialog"
        aria-modal={modal || undefined}
        aria-labelledby={labelledBy}
        aria-describedby={props['aria-describedby'] ?? (c.described ? ids.description : undefined)}
        tabIndex={-1}
        data-popover-content=""
        data-open={open ? '' : undefined}
        data-ending-style={ending ? '' : undefined}
        data-side={anchored.side}
        data-align={anchored.align}
        className={styles.content({ className })}
        style={{ ...style, ...anchored.floatingStyles }}
      >
        <OverlayItemContext value={null}>
          {arrowsThatStickOut}
          <ScrollArea className={styles.scrollArea()}>
            <ScrollArea.Viewport className={styles.viewport()}>{content}</ScrollArea.Viewport>
          </ScrollArea>
        </OverlayItemContext>
      </div>
    </ModalLayer>
  );
}
