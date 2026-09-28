import { useLayoutEffect, useRef, useState, type ComponentProps, type RefObject } from 'react';

import { popupStyle } from './styles';
import { ScrollArea } from '../../components/layout/scroll-area';
import {
  coveredByKeyboard,
  initialFocusTarget,
  ModalLayer,
  onViewportChange,
  raiseWhatStaysAboveLayers,
  showInTopLayer,
  useAnchored,
  useDrawerPresentation,
  useLayer,
  visibleHeight,
  VIEWPORT_MARGIN,
  type PopupPresentation,
} from '../overlay';

export { FieldPopupHeader } from './header';
export { useDrawerPresentation, type PopupPresentation } from '../overlay';

export type PopupSide = 'top' | 'bottom';
export type PopupAlign = 'start' | 'end';

export type FieldPopupProps = ComponentProps<'div'> & {
  anchor: RefObject<HTMLElement | null>;
  onClose: (restoreFocus: boolean) => void;
  mobileVariant?: PopupPresentation;
  preferredWidth?: number;
  matchWidth?: boolean;
  side?: PopupSide;
  align?: PopupAlign;
  offset?: number;
  maxHeight?: number;
  initialFocusSelector?: string;
  label?: string;
};

const DRAWER_MAX_HEIGHT = 520;

const firstPlacementLanded = new WeakSet<HTMLElement>();
const recenterAfterFirstPlacement = new WeakMap<HTMLElement, HTMLElement>();

export function FieldPopup({
  anchor,
  onClose,
  mobileVariant = 'popover',
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
  const [popup, setPopup] = useState<HTMLElement | null>(null);
  const drawer = useDrawerPresentation(mobileVariant);
  const presentation: PopupPresentation = drawer ? 'drawer' : 'popover';
  const initialFocusDone = useRef(false);

  const layer = useLayer(true, {
    kind: drawer ? 'modal' : 'popup',
    element: () => popup,
    anchor: () => anchor.current,
    onDismiss: (reason) => onClose(reason === 'escape-key'),
  });

  const anchored = useAnchored({
    open: true,
    reference: anchor,
    floating: popup,
    positioned: !drawer,
    side,
    align,
    sideOffset: offset,
    width: matchWidth ? 'anchor' : preferredWidth,
    maxHeight,
  });

  useLayoutEffect(() => {
    if (!popup || drawer) return;

    showInTopLayer(popup);
    raiseWhatStaysAboveLayers();
  }, [popup, drawer]);

  useLayoutEffect(() => {
    if (popup && !drawer && anchored.isPositioned) onPlacementLanded(popup);
  }, [popup, drawer, anchored.isPositioned]);

  useLayoutEffect(() => {
    if (!popup || !drawer) return;

    const win = popup.ownerDocument.defaultView!;
    const place = () => {
      Object.assign(popup.style, {
        top: 'auto',
        left: `${VIEWPORT_MARGIN}px`,
        right: `${VIEWPORT_MARGIN}px`,
        width: 'auto',
        bottom: `calc(max(${VIEWPORT_MARGIN}px, env(safe-area-inset-bottom)) + ${coveredByKeyboard(win)}px)`,
        maxHeight: `${Math.min(DRAWER_MAX_HEIGHT, visibleHeight(win) * 0.7)}px`,
      });

      onPlacementLanded(popup);
    };

    place();
    return onViewportChange(win, place);
  }, [popup, drawer]);

  useLayoutEffect(() => {
    if (!popup) return;

    const sheetMissingFocus = drawer && !popup.contains(popup.ownerDocument.activeElement);
    if (initialFocusDone.current && !sheetMissingFocus) return;

    initialFocusDone.current = true;
    initialFocusTarget(popup, { selector: initialFocusSelector, holdsFocus: drawer })?.focus({
      preventScroll: true,
    });
  }, [popup, drawer, initialFocusSelector]);

  const styles = popupStyle({ presentation });
  const role = props.role ?? (drawer ? 'dialog' : undefined);
  const named = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined;

  return (
    <ModalLayer
      open={drawer}
      layer={layer}
      element={popup}
      contentRef={setPopup}
      backdrop={drawer && { 'data-field-popup-backdrop': '', className: styles.backdrop() }}
      onBackdropClick={() => onClose(true)}
    >
      <ScrollArea asChild>
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

function onPlacementLanded(node: HTMLElement) {
  firstPlacementLanded.add(node);

  const option = recenterAfterFirstPlacement.get(node);
  if (!option) return;

  recenterAfterFirstPlacement.delete(node);
  if (node.contains(option)) scrollWithinPopup(option, node, true);
}

function scrollParent(option: HTMLElement, popup: HTMLElement) {
  const view = popup.ownerDocument.defaultView;

  for (let node = option.parentElement; node && node !== popup; node = node.parentElement) {
    const overflow = view?.getComputedStyle(node).overflowY;
    if (overflow === 'auto' || overflow === 'scroll') return node;
  }

  return popup;
}

function scrollWithinPopup(option: HTMLElement, popup: HTMLElement, center: boolean) {
  const scroller = scrollParent(option, popup);
  const view = scroller.clientHeight,
    from = scroller.scrollTop;

  let top: number, height: number;
  const unscaledOffsetsApply = option.offsetParent === scroller;
  if (unscaledOffsetsApply) {
    top = option.offsetTop;
    height = option.offsetHeight;
  } else {
    const bounds = scroller.getBoundingClientRect(),
      rect = option.getBoundingClientRect();
    top = from + rect.top - bounds.top - scroller.clientTop;
    height = rect.bottom - rect.top;
  }

  if (center) scroller.scrollTop = top - (view - height) / 2;
  else if (top < from) scroller.scrollTop = top;
  else if (top + height > from + view) scroller.scrollTop = top + height - view;
}

export function revealPopupOption(
  option: HTMLElement | null | undefined,
  { center = false }: { center?: boolean } = {},
) {
  const popup = option?.closest<HTMLElement>('[data-field-popup]');
  if (!option || !popup) return;

  if (center && !firstPlacementLanded.has(popup)) recenterAfterFirstPlacement.set(popup, option);
  scrollWithinPopup(option, popup, center);
}
