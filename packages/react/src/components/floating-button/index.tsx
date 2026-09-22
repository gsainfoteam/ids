import {
  Children,
  Fragment,
  cloneElement,
  createElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
  type Ref,
} from 'react';

import {
  useInteractiveProps,
  type InteractiveState,
  type WithInteractiveValues,
} from '../../hooks/use-interactive';
import { invariant, mergeProps, mergeRefs, tv } from '../../utils';
import { controlSurface } from '../control-surface';

import type { IdsSize } from '../../tokens/types';

export type FloatingPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type BaseProps = Omit<ComponentProps<'button'>, 'ref'> & {
  ref?: Ref<HTMLElement>;
  variant?: 'solid' | 'surface';
  tone?: 'default' | 'weak' | 'contrast';
  size?: IdsSize;
  placement?: FloatingPlacement;
  asChild?: boolean;
  /** Override detection for opaque custom content components. */
  iconOnly?: boolean;
  onInteractionChange?: (state: InteractiveState) => void;
};
export type FloatingButtonProps = WithInteractiveValues<BaseProps>;
const mounted = new WeakMap<Document, Map<FloatingPlacement, Set<HTMLElement>>>();
function contentText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') return String(child);
      if (
        !isValidElement<{ children?: ReactNode; 'aria-hidden'?: boolean | 'true' | 'false' }>(child)
      )
        return '';
      if (
        child.props['aria-hidden'] === true ||
        child.props['aria-hidden'] === 'true' ||
        child.type === 'svg'
      )
        return '';
      return contentText(child.props.children);
    })
    .join('')
    .trim();
}
function iconLabel(children: ReactNode): string | undefined {
  for (const child of Children.toArray(children)) {
    if (!isValidElement<{ 'aria-label'?: string; title?: string; children?: ReactNode }>(child))
      continue;
    const label = child.props['aria-label'] || child.props.title || iconLabel(child.props.children);
    if (label) return label;
  }
}

export function FloatingButton(props: FloatingButtonProps) {
  const {
    props: {
      asChild,
      children,
      iconOnly: iconOnlyProp,
      variant = 'solid',
      tone = 'default',
      size = 'standard',
      placement = 'bottom-right',
      className,
      style,
      ref,
      disabled,
      type = 'button',
      ...rest
    },
    handlers,
    dataProps,
  } = useInteractiveProps<HTMLButtonElement, FloatingButtonProps>(props);
  const element = useRef<HTMLElement>(null);
  const child = asChild && isValidElement<Record<string, unknown>>(children) ? children : undefined;
  invariant(
    !asChild || (child && child.type !== Fragment),
    'FloatingButton asChild requires one button/link element forwarding props and ref.',
  );
  invariant(
    !child || typeof child.type !== 'string' || child.type === 'button' || child.type === 'a',
    'FloatingButton asChild must render a button or link.',
  );
  const content = child ? (child.props.children as ReactNode) : children;
  const iconOnly = iconOnlyProp ?? contentText(content).length === 0;
  const ariaLabel =
    rest['aria-label'] ??
    (child?.props['aria-label'] as string | undefined) ??
    (iconOnly ? iconLabel(content) : undefined);
  const labelledBy = rest['aria-labelledby'] ?? child?.props['aria-labelledby'];
  useEffect(() => {
    if (import.meta.env.DEV && iconOnly && !ariaLabel?.trim() && !labelledBy)
      console.warn('[IDS] FloatingButton: icon-only buttons require aria-label or a titled icon.');
  }, [iconOnly, ariaLabel, labelledBy]);
  useLayoutEffect(() => {
    const node = element.current;
    if (!node) return;
    invariant(
      node.tagName === 'BUTTON' || node.tagName === 'A',
      'FloatingButton asChild must forward its ref to a button or link.',
    );
    if (!import.meta.env.DEV || node.hidden) return;
    let placements = mounted.get(node.ownerDocument);
    if (!placements) {
      placements = new Map();
      mounted.set(node.ownerDocument, placements);
    }
    let nodes = placements.get(placement);
    if (!nodes) {
      nodes = new Set();
      placements.set(placement, nodes);
    }
    if (nodes.size)
      console.warn('[IDS] FloatingButton: multiple buttons share a placement and may overlap.');
    nodes.add(node);
    return () => {
      nodes.delete(node);
      if (!nodes.size) placements.delete(placement);
    };
  }, [placement, rest.hidden]);
  const native = mergeProps(child?.props ?? {}, {
    ...rest,
    ...dataProps,
    ...handlers,
    type: child?.type === 'a' ? undefined : type,
    disabled,
    'aria-label': ariaLabel,
    'data-floating-button': '',
    'data-placement': placement,
    'data-size': size,
    'data-icon-only': iconOnly ? '' : undefined,
    className: FloatingButton.Style({ variant, tone, size, iconOnly, placement, className }),
    style,
  });
  native.ref = (node: HTMLElement | null) =>
    mergeRefs(element, ref, child?.props.ref as Ref<HTMLElement> | undefined)(node);
  // A disabled asChild link must suppress both child and root handlers/navigation.
  if (disabled) {
    native['aria-disabled'] = true;
    native.tabIndex = -1;
    native.onClick = (event: { preventDefault(): void; stopPropagation(): void }) => {
      event.preventDefault();
      event.stopPropagation();
    };
    native.onKeyDown = (event: {
      key: string;
      preventDefault(): void;
      stopPropagation(): void;
    }) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    if (asChild) native.href = undefined;
    if (child?.type === 'a')
      native.role = rest.role ?? (child.props.role as ComponentProps<'a'>['role']) ?? 'link';
  }
  // mergeRefs creates a callback without reading refs during render.
  // eslint-disable-next-line react-hooks/refs
  return child ? cloneElement(child, native) : createElement('button', native, content);
}
export namespace FloatingButton {
  export type Props = FloatingButtonProps;
  export const Style = tv({
    base: [
      controlSurface.base,
      'fixed z-40 max-w-[calc(100vw-3rem)] shrink-0 shadow-lg data-hovered:shadow-xl [&_svg]:size-6 [&_svg]:shrink-0',
    ],
    variants: {
      variant: {
        solid: controlSurface.variant.solid,
        surface:
          'bg-(--ids-color-surface) text-(--ids-color-on-surface) inset-ring-1 inset-ring-(--ids-color-outline) data-hovered:bg-(--ids-color-muted)',
      },
      tone: {
        default: '',
        weak: 'bg-(--ids-color-primary)/15 text-(--ids-color-primary) data-hovered:bg-(--ids-color-primary)/20 data-active:bg-(--ids-color-primary)/25',
        contrast:
          'bg-(--ids-color-on-surface) text-(--ids-color-surface) data-hovered:bg-(--ids-color-on-surface)/90 data-active:bg-(--ids-color-on-surface)/80',
      },
      size: {
        standard: 'min-h-14 gap-2 px-5 text-button-standard',
        tiny: 'min-h-11 gap-1.5 px-3 text-button-tiny [&_svg]:size-5',
      },
      iconOnly: { true: 'aspect-square rounded-full p-0', false: 'rounded-2xl py-3' },
      placement: {
        'top-left':
          'top-[calc(1.5rem+env(safe-area-inset-top))] left-[calc(1.5rem+env(safe-area-inset-left))]',
        'top-right':
          'top-[calc(1.5rem+env(safe-area-inset-top))] right-[calc(1.5rem+env(safe-area-inset-right))]',
        'bottom-left':
          'bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-[calc(1.5rem+env(safe-area-inset-left))]',
        'bottom-right':
          'right-[calc(1.5rem+env(safe-area-inset-right))] bottom-[calc(1.5rem+env(safe-area-inset-bottom))]',
      },
    },
    compoundVariants: [
      { size: 'standard', iconOnly: true, class: 'size-14' },
      { size: 'tiny', iconOnly: true, class: 'size-11' },
    ],
    defaultVariants: {
      variant: 'solid',
      tone: 'default',
      size: 'standard',
      iconOnly: false,
      placement: 'bottom-right',
    },
  });
}
