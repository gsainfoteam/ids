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

import { invariant, mergeProps, tv } from '../../utils';

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
export const fieldTriggerStyle = tv({
  base: 'flex w-full min-w-0 items-center gap-2 text-left text-(--ids-color-on-surface) disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ids-color-primary) [--ids-popup-danger:var(--ids-field-danger,#b42318)] [[data-mode=dark]_&]:[--ids-popup-danger:var(--ids-field-danger,#fda29b)] aria-invalid:inset-ring-1 aria-invalid:inset-ring-(--ids-popup-danger)',
  variants: {
    variant: {
      outline: 'bg-transparent inset-ring-1 inset-ring-(--ids-color-outline)',
      filled: 'bg-(--ids-color-primary)/10',
      unstyled: 'bg-transparent',
    },
    size: {
      standard: 'h-11 rounded-xl px-3 text-body-b2-regular',
      tiny: 'h-8 rounded-lg px-2 text-body-b3-regular',
    },
  },
});

/** Internal field popup. Native top layer preserves inherited IDS theme and avoids clipping. */
export function FieldPopup({
  anchor,
  mobileVariant = 'popover',
  onClose,
  children,
  ...props
}: ComponentProps<'div'> & {
  anchor: RefObject<HTMLButtonElement | null>;
  mobileVariant?: 'popover' | 'drawer';
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
        : `${Math.min(Math.max(rect.width, 240), win.innerWidth - 16)}px`;
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
      node.style.bottom = drawer ? '8px' : 'auto';
    };
    // Older engines and DOM tests use the same fixed-position fallback.
    if (typeof node.showPopover === 'function') node.showPopover();
    position();
    node.querySelector<HTMLElement>('[data-popup-autofocus]')?.focus({ preventScroll: true });
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
    win.addEventListener('resize', position);
    win.addEventListener('scroll', position, true);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(position) : null;
    observer?.observe(node);
    observer?.observe(trigger);
    return () => {
      observer?.disconnect();
      doc.removeEventListener('pointerdown', outside);
      doc.removeEventListener('focusin', outside);
      doc.removeEventListener('keydown', escape);
      win.removeEventListener('resize', position);
      win.removeEventListener('scroll', position, true);
    };
  }, [anchor, mobileVariant, onClose]);
  return (
    <div
      {...props}
      ref={popup}
      popover="manual"
      data-field-popup=""
      className={`fixed z-50 m-0 overflow-auto rounded-xl border border-(--ids-color-outline) bg-(--ids-color-surface) p-2 text-(--ids-color-on-surface) shadow-lg ${props.className ?? ''}`}
      style={{ ...props.style, position: 'fixed' }}
    >
      {children}
    </div>
  );
}
