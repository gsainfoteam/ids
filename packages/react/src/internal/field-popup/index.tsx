import {
  Children,
  Fragment,
  cloneElement,
  createElement,
  isValidElement,
  useLayoutEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from 'react';

import { cn, invariant, mergeProps } from '../../utils';
import { fieldSurface, type FieldSurfaceVariant } from '../field-surface';

import type { IdsSize } from '../../tokens/types';

export function flattenParts(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flattenParts(child.props.children)
      : [child],
  );
}
export function part(
  tag: 'button' | 'span' | 'div' | 'input',
  asChild: boolean | undefined,
  children: ReactNode,
  props: Record<string, unknown>,
) {
  if (asChild) {
    invariant(
      isValidElement<Record<string, unknown>>(children) && children.type !== Fragment,
      'IDS: asChild requires one element forwarding props/ref.',
    );
    invariant(
      typeof children.type !== 'string' || tag === 'span' || tag === 'div' || children.type === tag,
      `IDS: asChild must render a ${tag}.`,
    );
    return cloneElement(children, mergeProps(children.props, props));
  }
  return createElement(tag, props, tag === 'input' ? undefined : children);
}
export type FieldTriggerVariant = FieldSurfaceVariant;

// Plain class lists so a component's own `tv({ slots })` can spread them into its trigger
// slot; every string stays literal for Tailwind.
export const fieldTrigger = {
  base: ['flex w-full min-w-0 touch-manipulation items-center text-start', fieldSurface.base],
  variant: fieldSurface.variant,
  size: fieldSurface.size,
  icon: {
    standard: 'size-(--ids-size-icon-standard)',
    tiny: 'size-(--ids-size-icon-tiny)',
  } satisfies Record<IdsSize, string>,
} as const;

// Options highlight with the neutral muted fill, like a menu, and the selected one is marked by
// weight; the theme color is left to the trigger's focus.
export const fieldListbox = {
  option: [
    'flex cursor-default items-center gap-2 rounded-standard px-2.5 py-1.5 outline-none select-none wrap-anywhere',
    'data-active:bg-(--ids-color-muted) aria-selected:font-medium',
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
  ],
  heading: 'px-2.5 pt-2 pb-1 text-caption-c1-medium text-(--ids-color-on-muted)',
  empty: 'px-2.5 py-6 text-center text-body-b3-regular text-(--ids-color-on-muted)',
} as const;

/** Internal field popup. Native top layer preserves inherited IDS theme and avoids clipping. */
export function FieldPopup({
  anchor,
  mobileVariant = 'popover',
  preferredWidth = 240,
  initialFocusSelector,
  onClose,
  children,
  ...props
}: ComponentProps<'div'> & {
  anchor: RefObject<HTMLElement | null>;
  mobileVariant?: 'popover' | 'drawer';
  preferredWidth?: number;
  initialFocusSelector?: string;
  onClose: (restoreFocus: boolean) => void;
}) {
  const popup = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = popup.current,
      trigger = anchor.current;
    if (!node || !trigger) return;
    const doc = node.ownerDocument,
      win = doc.defaultView!;
    const position = () => {
      const rect = trigger.getBoundingClientRect();
      const drawer = mobileVariant === 'drawer' && win.innerWidth < 640;
      node.dataset.presentation = drawer ? 'drawer' : 'popover';
      node.style.width = drawer
        ? 'calc(100vw - 16px)'
        : `${Math.min(Math.max(rect.width, preferredWidth), win.innerWidth - 16)}px`;
      node.style.maxHeight = drawer
        ? 'min(70dvh, 520px)'
        : `${Math.max(120, Math.min(360, win.innerHeight - 24))}px`;
      const height = node.getBoundingClientRect().height;
      node.style.left = drawer
        ? '8px'
        : `${Math.max(8, Math.min(rect.left, win.innerWidth - node.offsetWidth - 8))}px`;
      node.style.top = drawer
        ? 'auto'
        : `${Math.max(8, rect.bottom + height + 8 <= win.innerHeight ? rect.bottom + 4 : rect.top - height - 4)}px`;
      node.style.bottom = drawer ? 'max(8px, env(safe-area-inset-bottom))' : 'auto';
    };
    // Older engines and DOM tests use the same fixed-position fallback.
    if (typeof node.showPopover === 'function') node.showPopover();
    position();
    const initialFocus =
      (initialFocusSelector ? node.querySelector<HTMLElement>(initialFocusSelector) : null) ??
      node.querySelector<HTMLElement>('[data-popup-autofocus]');
    initialFocus?.focus({ preventScroll: true });
    const outside = (event: Event) => {
      const target = event.target as Node;
      if (!node.contains(target) && !trigger.contains(target)) onClose(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        onClose(true);
      }
    };
    doc.addEventListener('pointerdown', outside);
    doc.addEventListener('focusin', outside);
    doc.addEventListener('keydown', escape);
    const onScroll = (event: Event) => {
      if (event.target && 'nodeType' in event.target && node.contains(event.target as Node)) return;
      position();
    };
    win.addEventListener('resize', position);
    win.addEventListener('scroll', onScroll, true);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(position) : null;
    observer?.observe(node);
    observer?.observe(trigger);
    return () => {
      observer?.disconnect();
      doc.removeEventListener('pointerdown', outside);
      doc.removeEventListener('focusin', outside);
      doc.removeEventListener('keydown', escape);
      win.removeEventListener('resize', position);
      win.removeEventListener('scroll', onScroll, true);
    };
  }, [anchor, mobileVariant, preferredWidth, initialFocusSelector, onClose]);
  return (
    <div
      {...props}
      ref={popup}
      popover="manual"
      data-field-popup=""
      className={cn(
        // A real border, not inset-ring: on a scroll container the inset shadow is painted
        // under the content, so highlighted options scrolling past the edge would hide it.
        'text-body-b3-regular concentric-p-1 fixed z-50 m-0 overflow-auto overscroll-contain border border-(--ids-color-border) bg-(--ids-color-surface) text-(--ids-color-on-surface) shadow-md [overflow-anchor:none]',
        props.className,
      )}
      style={{ ...props.style, position: 'fixed' }}
    >
      {children}
    </div>
  );
}

/** Reveal an active option without scrolling the document behind its top-layer popup. */
export function revealPopupOption(option: HTMLElement | null | undefined) {
  const popup = option?.closest<HTMLElement>('[data-field-popup]');
  if (!option || !popup) return;
  const bounds = popup.getBoundingClientRect(),
    rect = option.getBoundingClientRect();
  const top = bounds.top + popup.clientTop,
    bottom = top + popup.clientHeight;
  if (rect.top < top) popup.scrollTop += rect.top - top;
  else if (rect.bottom > bottom) popup.scrollTop += rect.bottom - bottom;
}
