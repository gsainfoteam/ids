import { useLayoutEffect, useRef, type ComponentProps, type RefObject } from 'react';

import {
  isTopPopup,
  lockScroll,
  registerPopup,
  showInTopLayer,
  supportsPopover,
  tabbables,
  useDrawerPresentation,
  type PopupPresentation,
} from './layer';
import { placePopup, type PopupAlign, type PopupSide } from './position';
import { popupStyle } from './styles';

export { flattenParts, part, resolveState } from './parts';
export { fieldListbox, fieldTrigger, type FieldTriggerVariant } from './styles';
export { useDrawerPresentation, type PopupPresentation } from './layer';
export type { PopupAlign, PopupSide } from './position';

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
  const placedSide = useRef(side);
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
    const unregister = registerPopup(node);
    const unlock = drawer ? lockScroll(doc) : undefined;
    return () => {
      unregister();
      unlock?.();
    };
  }, [drawer]);

  useLayoutEffect(() => {
    const node = popup.current,
      trigger = anchor.current;
    if (!node || !trigger) return;
    const doc = node.ownerDocument,
      win = doc.defaultView!;

    const position = () => {
      if (drawer) {
        // The on-screen keyboard shrinks the visual viewport but not the layout viewport that
        // fixed elements use, so the sheet is lifted by the part the keyboard covers.
        const visual = win.visualViewport;
        const covered = visual
          ? Math.max(0, win.innerHeight - visual.height - visual.offsetTop)
          : 0;
        Object.assign(node.style, {
          top: 'auto',
          left: `${VIEWPORT_MARGIN}px`,
          right: `${VIEWPORT_MARGIN}px`,
          width: 'auto',
          bottom: `calc(max(${VIEWPORT_MARGIN}px, env(safe-area-inset-bottom)) + ${covered}px)`,
          maxHeight: `${Math.min(DRAWER_MAX_HEIGHT, (visual?.height ?? win.innerHeight) * 0.7)}px`,
        });
        return;
      }
      const rect = trigger.getBoundingClientRect();
      const viewport = {
        width: doc.documentElement.clientWidth || win.innerWidth,
        height: doc.documentElement.clientHeight || win.innerHeight,
      };
      const width = Math.min(
        matchWidth ? rect.width : Math.max(rect.width, preferredWidth),
        viewport.width - VIEWPORT_MARGIN * 2,
      );
      // The UA's `inset: 0` for popovers would otherwise over-constrain the box, and in RTL the
      // browser then drops `left` rather than `right`.
      Object.assign(node.style, { width: `${width}px`, right: 'auto', bottom: 'auto' });
      const placement = placePopup({
        anchor: rect,
        width,
        height: naturalHeight(node),
        viewport,
        side: placedSide.current,
        align,
        rtl: win.getComputedStyle(trigger).direction === 'rtl',
        offset,
        margin: VIEWPORT_MARGIN,
        maxHeight,
        minHeight: MIN_HEIGHT,
      });
      placedSide.current = placement.side;
      node.dataset.side = placement.side;
      node.style.setProperty('--anchor-width', `${rect.width}px`);
      Object.assign(node.style, {
        top: `${placement.top}px`,
        left: `${placement.left}px`,
        maxHeight: `${placement.maxHeight}px`,
      });
    };
    position();

    const outside = (target: EventTarget | null) =>
      !isNode(target) || (!node.contains(target) && !trigger.contains(target));
    // An outside press moves focus as well, and the focus it moves belongs to the same close; a
    // popup kept open by its owner would otherwise hear that close twice.
    let pressedOutside = false;
    const onPointerDown = (event: PointerEvent) => {
      pressedOutside = outside(event.target);
      // A drawer held focus, and its backdrop is not focusable, so focus goes back.
      if (pressedOutside) close.current(drawer);
    };
    const onFocusIn = (event: FocusEvent) => {
      if (!outside(event.target)) return;
      if (drawer) (tabbables(node)[0] ?? node).focus({ preventScroll: true });
      else if (!pressedOutside) close.current(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      pressedOutside = false;
      if (event.key === 'Escape') {
        if (event.defaultPrevented || event.isComposing || !isTopPopup(node)) return;
        event.preventDefault();
        close.current(true);
        return;
      }
      if (event.key !== 'Tab' || !drawer || !isNode(event.target) || !node.contains(event.target))
        return;
      const items = tabbables(node);
      const first = items[0],
        last = items[items.length - 1];
      const active = doc.activeElement;
      if (!first || !last) event.preventDefault();
      else if (event.shiftKey && (active === first || active === node)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onScroll = (event: Event) => {
      if (isNode(event.target) && node.contains(event.target)) return;
      position();
    };

    doc.addEventListener('pointerdown', onPointerDown);
    doc.addEventListener('focusin', onFocusIn);
    doc.addEventListener('keydown', onKeyDown);
    win.addEventListener('resize', position);
    win.addEventListener('scroll', onScroll, true);
    win.visualViewport?.addEventListener('resize', position);
    win.visualViewport?.addEventListener('scroll', position);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(position) : null;
    observer?.observe(node);
    observer?.observe(trigger);
    return () => {
      observer?.disconnect();
      doc.removeEventListener('pointerdown', onPointerDown);
      doc.removeEventListener('focusin', onFocusIn);
      doc.removeEventListener('keydown', onKeyDown);
      win.removeEventListener('resize', position);
      win.removeEventListener('scroll', onScroll, true);
      win.visualViewport?.removeEventListener('resize', position);
      win.visualViewport?.removeEventListener('scroll', position);
    };
  }, [anchor, drawer, matchWidth, preferredWidth, align, offset, maxHeight]);

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
      (drawer ? (tabbables(node)[0] ?? node) : null);
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
        />
      )}
      <div
        {...props}
        ref={popup}
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
    </>
  );
}

// The height the popup would take uncapped: its own height plus whatever it, or a list scrolling
// inside it, hides. Lifting max-height to measure instead would reset that list's scroll position.
// offsetHeight also ignores the scale of the opening transition.
function naturalHeight(node: HTMLElement) {
  const hidden = (element: Element) => Math.max(0, element.scrollHeight - element.clientHeight);
  return Array.from(node.children).reduce(
    (height, child) => height + hidden(child),
    node.offsetHeight + hidden(node),
  );
}

function scrollParent(option: HTMLElement, popup: HTMLElement) {
  const view = popup.ownerDocument.defaultView;
  for (let node = option.parentElement; node && node !== popup; node = node.parentElement) {
    const overflow = view?.getComputedStyle(node).overflowY;
    if (overflow === 'auto' || overflow === 'scroll') return node;
  }
  return popup;
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
