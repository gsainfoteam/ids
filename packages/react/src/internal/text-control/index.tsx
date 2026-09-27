import {
  cloneElement,
  createContext,
  isValidElement,
  use,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

import { XMarkIcon } from '@heroicons/react/24/outline';

import { IconButton } from '../../components/action/icon-button';
import { flattenFragments, invariant, mergeProps, tv } from '../../utils';
import { fieldSurface, type FieldSurfaceVariant } from '../field-surface';
import { messages } from '../messages';

import type { IdsSize } from '../../tokens/types';

export { clearInput } from './clear-input';
export { useInputValue } from './use-input-value';
export { useMergedRef } from './use-merged-ref';
export { useTextControl } from './use-text-control';

export type TextControlState = {
  size: IdsSize;
  variant: FieldSurfaceVariant;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  focused: boolean;
  filled: boolean;
};

export type TextControlContextValue = {
  state: TextControlState;
  inputId: string | undefined;
  clear: () => void;
  styles: ReturnType<typeof textControlStyle>;
};

export const TextControlContext = createContext<TextControlContextValue | null>(null);

export function stateAttributes(state: TextControlState) {
  return {
    'data-size': state.size,
    'data-variant': state.variant,
    'data-disabled': state.disabled ? '' : undefined,
    'data-readonly': state.readOnly ? '' : undefined,
    'data-invalid': state.invalid ? '' : undefined,
    'data-focused': state.focused ? '' : undefined,
    'data-filled': state.filled ? '' : undefined,
  };
}

export function isInvalid(value: unknown) {
  return value != null && value !== false && value !== 'false';
}

// Children before the Input are leading, after it trailing. Without an Input every child is
// leading and the Input goes last.
export function splitAroundInput<P>(
  children: ReactNode,
  Input: unknown,
  fallback: () => ReactElement<P>,
  component: string,
) {
  const items = flattenFragments(children);
  const indexes = items.flatMap((child, index) =>
    isValidElement(child) && child.type === Input ? [index] : [],
  );
  invariant(
    indexes.length <= 1,
    `\`<${component}>\` accepts at most one \`<${component}.Input />\`.`,
  );
  const index = indexes[0];
  if (index === undefined) return { items, leading: items, input: fallback(), trailing: [] };
  return {
    items,
    leading: items.slice(0, index),
    input: items[index] as ReactElement<P>,
    trailing: items.slice(index + 1),
  };
}

export function countOf(items: ReactNode[], type: unknown) {
  return items.filter((item) => isValidElement(item) && item.type === type).length;
}

// Consumer content is wrapped so icons and text pick up the muted color and the icon size. A
// field's own parts size themselves and render bare.
export function Adornments({
  items,
  own = [],
  marker,
  className,
}: {
  items: ReactNode[];
  own?: unknown[];
  marker: string;
  className: string;
}) {
  return items.map((item, index) =>
    isValidElement(item) && own.includes(item.type) ? (
      item
    ) : (
      <span
        key={(isValidElement(item) && item.key) || index}
        {...{ [`data-${marker}-adornment`]: '' }}
        className={className}
      >
        {item}
      </span>
    ),
  );
}

export type TextControlClearProps = Omit<ComponentProps<'button'>, 'children'> & {
  asChild?: boolean;
  children?: ReactElement;
};

export function TextControlClear({
  asChild,
  children,
  className,
  onClick,
  ...props
}: TextControlClearProps) {
  const context = use(TextControlContext);
  invariant(context, '`Clear` must be used inside a text field.');
  const { state, styles } = context;
  if (!state.filled || state.disabled || state.readOnly) return null;

  // Out of the tab order like a search field's clear button: Escape and select-all delete do the
  // same from the keyboard. Pressing it must not take focus from the input either.
  const internal = {
    type: 'button' as const,
    tabIndex: -1,
    'aria-label': props['aria-label'] ?? messages.textField.clear,
    'aria-controls': context.inputId,
    'data-text-control-clear': '',
    onPointerDown: (event: { button: number; preventDefault: () => void }) => {
      if (event.button === 0) event.preventDefault();
    },
    onClick: (event: Parameters<NonNullable<typeof onClick>>[0]) => {
      onClick?.(event);
      if (!event.defaultPrevented) context.clear();
    },
  };

  if (asChild) {
    invariant(
      isValidElement<Record<string, unknown>>(children),
      '`Clear asChild` requires one button element.',
    );
    return cloneElement(children, mergeProps(mergeProps(children.props, props), internal));
  }
  return (
    <IconButton
      {...props}
      {...internal}
      variant="ghost"
      size={state.size}
      icon={children ?? <XMarkIcon aria-hidden="true" />}
      className={styles.action({ className })}
    />
  );
}

export const textControlStyle = tv({
  slots: {
    root: ['inline-flex w-full min-w-0 cursor-text items-center', fieldSurface.base],
    input: [
      'h-full w-full min-w-0 flex-1 bg-transparent outline-none',
      'text-inherit placeholder:text-(--ids-color-on-muted)',
      'selection:bg-(--ids-color-primary)/30 selection:text-(--ids-color-on-surface)',
      'disabled:cursor-not-allowed',
      // Browsers draw their own clear and reveal buttons into search and password inputs; the
      // field's parts replace them.
      '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
      '[&::-ms-clear]:hidden [&::-ms-reveal]:hidden',
    ],
    adornment: [
      'inline-flex shrink-0 items-center empty:hidden',
      'text-(--ids-color-on-muted) [&_svg]:shrink-0',
      // A button dropped in as an adornment shrinks to the inset size of the field's own parts.
      '[&_button]:w-auto [&_button]:gap-1',
    ],
    action: [
      'shrink-0 text-(--ids-color-on-muted)',
      'data-hovered:text-(--ids-color-on-surface) data-pressed:text-(--ids-color-on-surface)',
    ],
  },
  variants: {
    variant: {
      outline: { root: fieldSurface.variant.outline },
      soft: { root: fieldSurface.variant.soft },
      ghost: { root: fieldSurface.variant.ghost },
    } satisfies Record<FieldSurfaceVariant, object>,
    // Inset buttons sit 4px inside the border on every side, so a button at either end pulls
    // into the padding by the same amount it leaves above and below.
    size: {
      standard: {
        root: fieldSurface.size.standard,
        adornment: [
          "gap-1 text-body-b3-regular [&_svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
          '[&_button]:h-7 [&_button]:min-w-7 [&_button]:px-1.5',
          'has-[button]:first:-ms-2 has-[button]:last:-me-2',
        ],
        action: 'size-7 first:-ms-2 last:-me-2',
      },
      tiny: {
        root: fieldSurface.size.tiny,
        adornment: [
          "gap-0.5 text-caption-c1-regular [&_svg:not([class*='size-'])]:size-(--ids-size-icon-tiny)",
          '[&_button]:h-6 [&_button]:min-w-6 [&_button]:px-1',
          'has-[button]:first:-ms-1.5 has-[button]:last:-me-1.5',
        ],
        action: 'size-6 first:-ms-1.5 last:-me-1.5',
      },
    } satisfies Record<IdsSize, object>,
  },
  defaultVariants: { variant: 'outline', size: 'standard' },
});
