'use client';

import { type ComponentProps, type RefObject } from 'react';

import { useInternalFieldPopup, type PopupAlign, type PopupSide } from './hooks/use-field-popup';
import { popupStyle } from './lib/styles';
import { ScrollArea } from '../../components/layout/scroll-area';
import { ModalLayer, type PopupPresentation } from '../overlay';

export type FieldPopupProps = ComponentProps<'div'> & {
  anchor: RefObject<HTMLElement | null>;
  onClose: (restoreFocus: boolean) => void;
  narrow?: PopupPresentation;
  preferredWidth?: number;
  matchWidth?: boolean;
  side?: PopupSide;
  align?: PopupAlign;
  offset?: number;
  maxHeight?: number;
  initialFocusSelector?: string;
  label?: string;
};

export function FieldPopup({
  anchor,
  onClose,
  narrow = 'popover',
  preferredWidth = 240,
  matchWidth = false,
  side = 'bottom',
  align = 'start',
  offset = 4,
  maxHeight = 360,
  initialFocusSelector,
  label,
  className,
  style,
  children,
  ...props
}: FieldPopupProps) {
  const { popup, setPopup, drawer, presentation, layer, anchored, stacked } = useInternalFieldPopup(
    {
      anchor,
      onClose,
      narrow,
      preferredWidth,
      matchWidth,
      side,
      align,
      offset,
      maxHeight,
      initialFocusSelector,
    },
  );

  const styles = popupStyle({ presentation });
  const role = props.role ?? (drawer ? 'dialog' : undefined);
  const named = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined;

  return (
    <ModalLayer
      open={drawer}
      layer={layer}
      element={popup}
      contentRef={setPopup}
      backdrop={
        drawer && {
          'data-field-popup-backdrop': '',
          'data-stacked': stacked ? '' : undefined,
          className: styles.backdrop(),
        }
      }
      onBackdropClick={() => onClose(true)}
    >
      <ScrollArea asChild fade="y">
        <div
          {...props}
          popover="manual"
          role={role}
          aria-modal={drawer || undefined}
          aria-label={props['aria-label'] ?? (role && !named ? label : undefined)}
          tabIndex={props.tabIndex ?? (drawer ? -1 : undefined)}
          data-field-popup=""
          data-presentation={presentation}
          data-side={drawer ? undefined : anchored.side}
          className={styles.popup({ className })}
          style={{ ...style, ...(drawer ? undefined : anchored.floatingStyles), position: 'fixed' }}
        >
          <ScrollArea.Viewport className={styles.viewport()}>{children}</ScrollArea.Viewport>
        </div>
      </ScrollArea>
    </ModalLayer>
  );
}
