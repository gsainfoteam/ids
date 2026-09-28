import { useLayoutEffect, useRef, type ComponentProps, type RefObject } from 'react';

import {
  autoUpdate,
  computePosition,
  flip,
  limitShift,
  offset as offsetBy,
  shift,
  size,
} from '@floating-ui/react-dom';
import { clamp } from 'es-toolkit';
import { createFocusTrap } from 'focus-trap';
import { RemoveScroll } from 'react-remove-scroll';
import { tabbable } from 'tabbable';

import { isTopPopup, registerPopup } from './layer';
import { popupStyle } from './styles';
import { isNodeFromAnyWindow } from '../../utils';
import { useDrawerPresentation, type PopupPresentation } from '../overlay/sheet-viewport';
import { raiseInTopLayer, showInTopLayer } from '../overlay/top-layer';

export { FieldPopupHeader } from './header';
export { useDrawerPresentation, type PopupPresentation } from '../overlay/sheet-viewport';

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

const VIEWPORT_MARGIN = 8;

function blurWhileReactStillListens(popup: HTMLElement) {
  const focused = popup.ownerDocument.activeElement;
  const view = popup.ownerDocument.defaultView;
  if (view && focused instanceof view.HTMLElement && popup.contains(focused)) focused.blur();
}
const MIN_HEIGHT = 120;
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
  const popup = useRef<HTMLDivElement>(null);
  const clickableBackdrop = useRef<HTMLDivElement>(null);
  const drawer = useDrawerPresentation(mobileVariant);
  const presentation: PopupPresentation = drawer ? 'drawer' : 'popover';
  const close = useRef(onClose);
  const initialFocusDone = useRef(false);

  useLayoutEffect(() => {
    close.current = onClose;
  });

  useLayoutEffect(() => {
    const node = popup.current;
    if (!node) return;
    if (drawer && clickableBackdrop.current) showInTopLayer(clickableBackdrop.current);
    raiseInTopLayer(node);
    return registerPopup(node);
  }, [drawer]);

  useLayoutEffect(() => {
    const node = popup.current,
      trigger = anchor.current;
    if (!node || !drawer) return;
    const trap = createFocusTrap(node, {
      initialFocus: false,
      delayInitialFocus: false,
      fallbackFocus: node,
      escapeDeactivates: false,
      allowOutsideClick: true,
      returnFocusOnDeactivate: false,
      preventScroll: true,
      document: node.ownerDocument,
    });
    trap.activate();
    const releaseBeforeTrapPullsFocusBack = (event: FocusEvent) => {
      const returningToTrigger =
        isNodeFromAnyWindow(event.target) && trigger?.contains(event.target);
      if (returningToTrigger) trap.deactivate();
    };
    const win = node.ownerDocument.defaultView!;
    win.addEventListener('focusin', releaseBeforeTrapPullsFocusBack, true);
    return () => {
      win.removeEventListener('focusin', releaseBeforeTrapPullsFocusBack, true);
      trap.deactivate();
    };
  }, [anchor, drawer]);

  useLayoutEffect(() => {
    const node = popup.current,
      reference = anchor.current;
    if (!node || !reference || drawer) return;
    const doc = node.ownerDocument;
    let landedSide: PopupSide = side;
    let active = true;
    node.dataset.side = side;
    const undoPopoverUaInset = { right: 'auto', bottom: 'auto' };
    const capHeightBeforeFirstFlip = { maxHeight: `${maxHeight}px` };
    Object.assign(node.style, undoPopoverUaInset, capHeightBeforeFirstFlip);
    const update = () => {
      const oppositeSide: PopupSide = landedSide === 'bottom' ? 'top' : 'bottom';
      void computePosition(reference, node, {
        strategy: 'fixed',
        placement: `${landedSide}-${align}`,
        middleware: [
          offsetBy(offset),
          flip({
            padding: VIEWPORT_MARGIN,
            crossAxis: false,
            fallbackPlacements: [`${oppositeSide}-${align}`],
          }),
          size({
            padding: VIEWPORT_MARGIN,
            apply({ availableHeight, rects }) {
              const anchorWidth = rects.reference.width;
              const viewport = doc.documentElement.clientWidth || doc.defaultView!.innerWidth;
              const width = matchWidth ? anchorWidth : Math.max(anchorWidth, preferredWidth);
              node.style.setProperty('--anchor-width', `${anchorWidth}px`);
              Object.assign(node.style, {
                width: `${Math.min(width, viewport - VIEWPORT_MARGIN * 2)}px`,
                maxHeight: `${clamp(availableHeight, Math.min(MIN_HEIGHT, maxHeight), maxHeight)}px`,
              });
            },
          }),
          shift({ padding: VIEWPORT_MARGIN, crossAxis: true, limiter: limitShift() }),
        ],
      }).then(({ x, y, placement }) => {
        if (!active) return;
        landedSide = placement.startsWith('top') ? 'top' : 'bottom';
        node.dataset.side = landedSide;
        Object.assign(node.style, { left: `${x}px`, top: `${y}px` });
        onPlacementLanded(node);
      });
    };
    const stop = autoUpdate(reference, node, update);
    return () => {
      active = false;
      stop();
    };
  }, [anchor, drawer, side, align, offset, matchWidth, preferredWidth, maxHeight]);

  useLayoutEffect(() => {
    const node = popup.current;
    if (!node || !drawer) return;
    const win = node.ownerDocument.defaultView!;
    const place = () => {
      const visual = win.visualViewport;
      const coveredByKeyboard = visual
        ? Math.max(0, win.innerHeight - visual.height - visual.offsetTop)
        : 0;
      delete node.dataset.side;
      Object.assign(node.style, {
        top: 'auto',
        left: `${VIEWPORT_MARGIN}px`,
        right: `${VIEWPORT_MARGIN}px`,
        width: 'auto',
        bottom: `calc(max(${VIEWPORT_MARGIN}px, env(safe-area-inset-bottom)) + ${coveredByKeyboard}px)`,
        maxHeight: `${Math.min(DRAWER_MAX_HEIGHT, (visual?.height ?? win.innerHeight) * 0.7)}px`,
      });
      onPlacementLanded(node);
    };
    place();
    win.addEventListener('resize', place);
    win.visualViewport?.addEventListener('resize', place);
    win.visualViewport?.addEventListener('scroll', place);
    return () => {
      win.removeEventListener('resize', place);
      win.visualViewport?.removeEventListener('resize', place);
      win.visualViewport?.removeEventListener('scroll', place);
    };
  }, [drawer]);

  useLayoutEffect(() => {
    const node = popup.current,
      trigger = anchor.current;
    if (!node || !trigger) return;
    const doc = node.ownerDocument;
    const outside = (target: EventTarget | null) =>
      !isNodeFromAnyWindow(target) || (!node.contains(target) && !trigger.contains(target));
    const closesOnBackdropClickInstead = drawer;
    let closedByOutsidePress = false;
    const onPointerDown = (event: PointerEvent) => {
      if (closesOnBackdropClickInstead) return;
      closedByOutsidePress = outside(event.target);
      if (!closedByOutsidePress) return;
      blurWhileReactStillListens(node);
      close.current(false);
    };
    const onFocusIn = (event: FocusEvent) => {
      if (!drawer && !closedByOutsidePress && outside(event.target)) close.current(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      closedByOutsidePress = false;
      if (event.key !== 'Escape') return;
      if (event.defaultPrevented || event.isComposing || !isTopPopup(node)) return;
      event.preventDefault();
      close.current(true);
    };

    doc.addEventListener('pointerdown', onPointerDown);
    doc.addEventListener('focusin', onFocusIn);
    doc.addEventListener('keydown', onKeyDown);
    return () => {
      doc.removeEventListener('pointerdown', onPointerDown);
      doc.removeEventListener('focusin', onFocusIn);
      doc.removeEventListener('keydown', onKeyDown);
    };
  }, [anchor, drawer]);

  useLayoutEffect(() => {
    const node = popup.current;
    if (!node) return;
    const sheetMissingFocus = drawer && !node.contains(node.ownerDocument.activeElement);
    if (initialFocusDone.current && !sheetMissingFocus) return;
    initialFocusDone.current = true;
    const target =
      (initialFocusSelector ? node.querySelector<HTMLElement>(initialFocusSelector) : null) ??
      node.querySelector<HTMLElement>('[data-popup-autofocus]') ??
      (drawer ? (tabbable(node)[0] ?? node) : null);
    target?.focus({ preventScroll: true });
  }, [drawer, initialFocusSelector]);

  const styles = popupStyle({ presentation });
  const role = props.role ?? (drawer ? 'dialog' : undefined);
  const named = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined;
  return (
    <>
      {drawer && (
        <div
          ref={clickableBackdrop}
          popover="manual"
          aria-hidden="true"
          data-field-popup-backdrop=""
          className={styles.backdrop()}
          onClick={() => close.current(true)}
        />
      )}
      <RemoveScroll ref={popup} enabled={drawer} allowPinchZoom forwardProps>
        <div
          {...props}
          popover="manual"
          role={role}
          aria-modal={drawer || undefined}
          aria-label={props['aria-label'] ?? (role && !named ? label : undefined)}
          tabIndex={props.tabIndex ?? (drawer ? -1 : undefined)}
          data-field-popup=""
          data-presentation={presentation}
          className={styles.popup({ className })}
          style={{ ...style, position: 'fixed' }}
        >
          {children}
        </div>
      </RemoveScroll>
    </>
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
