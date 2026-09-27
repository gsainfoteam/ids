import { useLayoutEffect, useRef, type ComponentProps, type RefObject } from 'react';

import {
  autoUpdate,
  computePosition,
  flip,
  offset as offsetBy,
  shift,
  size,
} from '@floating-ui/react-dom';
import { clamp } from 'es-toolkit';
import { createFocusTrap } from 'focus-trap';
import { RemoveScroll } from 'react-remove-scroll';
import { tabbable } from 'tabbable';

import {
  isTopPopup,
  registerPopup,
  showInTopLayer,
  supportsPopover,
  useDrawerPresentation,
  type PopupPresentation,
} from './layer';
import { popupStyle } from './styles';

export { flattenParts, part, resolveState } from './parts';
export { fieldListbox, fieldTrigger, type FieldTriggerVariant } from './styles';
export { useDrawerPresentation, type PopupPresentation } from './layer';

export type PopupSide = 'top' | 'bottom';
export type PopupAlign = 'start' | 'end';

export type FieldPopupProps = ComponentProps<'div'> & {
  anchor: RefObject<HTMLElement | null>;
  // true when focus should go back to the trigger: Escape, a drawer's backdrop, a presentation
  // switch. An outside click on a popover passes false, since focus follows the click.
  onClose: (restoreFocus: boolean) => void;
  mobileVariant?: PopupPresentation;
  // The minimum width; the popup is never narrower than its anchor unless `matchWidth`.
  preferredWidth?: number;
  matchWidth?: boolean;
  side?: PopupSide;
  align?: PopupAlign;
  offset?: number;
  maxHeight?: number;
  initialFocusSelector?: string;
  // Names the drawer's dialog when neither aria-label nor aria-labelledby is given.
  label?: string;
};

const VIEWPORT_MARGIN = 8;

// Duck-typed rather than `instanceof Node`, which fails across frames and where the DOM
// constructors are not globals.
const isNode = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && 'nodeType' in value;
const MIN_HEIGHT = 120;
const DRAWER_MAX_HEIGHT = 520;

// Placement is asynchronous and can still shrink a popup after it opens, so centering an option
// on open is repeated once the first placement lands.
const placed = new WeakSet<HTMLElement>();
const pendingCenter = new WeakMap<HTMLElement, HTMLElement>();

/**
 * Internal field popup. The native top layer keeps the inherited IDS theme and escapes clipping.
 * On small screens a `drawer` popup is a modal bottom sheet: a dimmed backdrop, focus held
 * inside, the page scroll locked.
 */
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
  const backdrop = useRef<HTMLDivElement>(null);
  const drawer = useDrawerPresentation(mobileVariant);
  const presentation: PopupPresentation = drawer ? 'drawer' : 'popover';
  const close = useRef(onClose);
  const focused = useRef(false);

  useLayoutEffect(() => {
    close.current = onClose;
  });

  useLayoutEffect(() => {
    const node = popup.current;
    if (!node) return;
    const doc = node.ownerDocument;
    if (drawer && backdrop.current) showInTopLayer(backdrop.current);
    // The top layer stacks in the order elements were shown, so a popup that was already open
    // when it became a drawer is shown again to sit above its backdrop, keeping its focus.
    const active = doc.activeElement as HTMLElement | null;
    if (supportsPopover(node) && node.matches(':popover-open')) node.hidePopover();
    showInTopLayer(node);
    if (active && node.contains(active) && doc.activeElement !== active)
      active.focus({ preventScroll: true });
    return registerPopup(node);
  }, [drawer]);

  // A drawer is modal, so focus stays inside it.
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
    // A field that closes its sheet sends focus back to its own trigger, which the trap would
    // pull back inside before the sheet unmounts. The window hears focusin before the trap's
    // listener on the document does, so the trap lets go first.
    const release = (event: FocusEvent) => {
      if (isNode(event.target) && trigger?.contains(event.target)) trap.deactivate();
    };
    const win = node.ownerDocument.defaultView!;
    win.addEventListener('focusin', release, true);
    return () => {
      win.removeEventListener('focusin', release, true);
      trap.deactivate();
    };
  }, [anchor, drawer]);

  // A popover follows its anchor. It keeps the side it opened on while its content still fits
  // there, so a list that shrinks while it is filtered does not jump across the trigger, which is
  // why the side it landed on is fed back in as the placement it prefers.
  useLayoutEffect(() => {
    const node = popup.current,
      reference = anchor.current;
    if (!node || !reference || drawer) return;
    const doc = node.ownerDocument;
    let current: PopupSide = side;
    let active = true;
    node.dataset.side = side;
    // The UA's `inset: 0` for popovers would otherwise over-constrain the box, and in RTL the
    // browser then drops `left` rather than `right`. The height starts at its cap so the first
    // flip weighs the height the popup will have, not the full length of a long list.
    Object.assign(node.style, { right: 'auto', bottom: 'auto', maxHeight: `${maxHeight}px` });
    const update = () => {
      const other: PopupSide = current === 'bottom' ? 'top' : 'bottom';
      void computePosition(reference, node, {
        strategy: 'fixed',
        placement: `${current}-${align}`,
        middleware: [
          offsetBy(offset),
          flip({
            padding: VIEWPORT_MARGIN,
            crossAxis: false,
            fallbackPlacements: [`${other}-${align}`],
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
          // A popup too tall for either side still stays on screen, over the trigger if it must.
          shift({ padding: VIEWPORT_MARGIN, crossAxis: true }),
        ],
      }).then(({ x, y, placement }) => {
        if (!active) return;
        current = placement.startsWith('top') ? 'top' : 'bottom';
        node.dataset.side = current;
        Object.assign(node.style, { left: `${x}px`, top: `${y}px` });
        settle(node);
      });
    };
    const stop = autoUpdate(reference, node, update);
    return () => {
      active = false;
      stop();
    };
  }, [anchor, drawer, side, align, offset, matchWidth, preferredWidth, maxHeight]);

  // A drawer is a bottom sheet. The on-screen keyboard shrinks the visual viewport but not the
  // layout viewport that fixed elements use, so the sheet is lifted by the part the keyboard
  // covers.
  useLayoutEffect(() => {
    const node = popup.current;
    if (!node || !drawer) return;
    const win = node.ownerDocument.defaultView!;
    const place = () => {
      const visual = win.visualViewport;
      const covered = visual ? Math.max(0, win.innerHeight - visual.height - visual.offsetTop) : 0;
      delete node.dataset.side;
      Object.assign(node.style, {
        top: 'auto',
        left: `${VIEWPORT_MARGIN}px`,
        right: `${VIEWPORT_MARGIN}px`,
        width: 'auto',
        bottom: `calc(max(${VIEWPORT_MARGIN}px, env(safe-area-inset-bottom)) + ${covered}px)`,
        maxHeight: `${Math.min(DRAWER_MAX_HEIGHT, (visual?.height ?? win.innerHeight) * 0.7)}px`,
      });
      settle(node);
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
      !isNode(target) || (!node.contains(target) && !trigger.contains(target));
    // An outside press moves focus as well, and the focus it moves belongs to the same close; a
    // popup kept open by its owner would otherwise hear that close twice.
    let pressedOutside = false;
    const onPointerDown = (event: PointerEvent) => {
      // A drawer closes on a click of its backdrop instead. Closed on the press, the backdrop
      // would be gone before the click, which then lands on the page under it, and the press
      // would move focus to the page after the trigger had taken it back.
      if (drawer) return;
      pressedOutside = outside(event.target);
      if (pressedOutside) close.current(false);
    };
    // Focus leaving a popover closes it; a drawer's focus trap does not let it leave.
    const onFocusIn = (event: FocusEvent) => {
      if (!drawer && !pressedOutside && outside(event.target)) close.current(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      pressedOutside = false;
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

  // Initial focus runs once, and again only if the popup turns into a drawer while focus is
  // still outside it, since a modal sheet must hold focus.
  useLayoutEffect(() => {
    const node = popup.current;
    if (!node) return;
    if (focused.current && (!drawer || node.contains(node.ownerDocument.activeElement))) return;
    focused.current = true;
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
          ref={backdrop}
          popover="manual"
          aria-hidden="true"
          data-field-popup-backdrop=""
          className={styles.backdrop()}
          onClick={() => close.current(true)}
        />
      )}
      {/* A drawer locks the page scroll but not pinch zoom, which people with low vision need. */}
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

function settle(node: HTMLElement) {
  placed.add(node);
  const option = pendingCenter.get(node);
  if (!option) return;
  pendingCenter.delete(node);
  if (node.contains(option)) scrollToOption(option, node, true);
}

function scrollParent(option: HTMLElement, popup: HTMLElement) {
  const view = popup.ownerDocument.defaultView;
  for (let node = option.parentElement; node && node !== popup; node = node.parentElement) {
    const overflow = view?.getComputedStyle(node).overflowY;
    if (overflow === 'auto' || overflow === 'scroll') return node;
  }
  return popup;
}

function scrollToOption(option: HTMLElement, popup: HTMLElement, center: boolean) {
  const scroller = scrollParent(option, popup);
  const view = scroller.clientHeight,
    from = scroller.scrollTop;
  let top: number, height: number;
  // Layout offsets ignore the popup's opening scale, which would skew client rects by several
  // rows in a long list. They only apply when the scroller is the option's offset parent.
  if (option.offsetParent === scroller) {
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

/**
 * Reveal an option without scrolling the document behind its top-layer popup. `center` puts it in
 * the middle, which is how a list should open on its selected option.
 */
export function revealPopupOption(
  option: HTMLElement | null | undefined,
  { center = false }: { center?: boolean } = {},
) {
  const popup = option?.closest<HTMLElement>('[data-field-popup]');
  if (!option || !popup) return;
  if (center && !placed.has(popup)) pendingCenter.set(popup, option);
  scrollToOption(option, popup, center);
}
