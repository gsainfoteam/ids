'use client';

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
import { elementTypeOf, flattenFragments, invariant, mergeProps } from '../../utils';
import { type FieldSurfaceVariant } from '../field-surface';
import { messages } from '../messages';
import { type textControlStyle } from './style';

import type { IdsSize } from '../../tokens/types';

export { clearInput, replaceInput } from './clear-input';
export { useInputValue } from './use-input-value';
export { useMergedRef } from './use-merged-ref';
export { useTextControl } from './use-text-control';
export { insetButtons, textControlStyle } from './style';

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

export function splitAroundInput<P>(
  children: ReactNode,
  Input: unknown,
  fallback: () => ReactElement<P>,
  component: string,
) {
  const items = flattenFragments(children);
  const indexes = items.flatMap((child, index) =>
    isValidElement(child) && elementTypeOf(child) === Input ? [index] : [],
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
  return items.filter((item) => isValidElement(item) && elementTypeOf(item) === type).length;
}

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
    isValidElement(item) && own.includes(elementTypeOf(item)) ? (
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

  const keepFocusInInput = (event: { button: number; preventDefault: () => void }) => {
    if (event.button === 0) event.preventDefault();
  };
  const internal = {
    type: 'button' as const,
    tabIndex: -1,
    'aria-label': props['aria-label'] ?? messages.textField.clear,
    'aria-controls': context.inputId,
    'data-text-control-clear': '',
    onPointerDown: keepFocusInInput,
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
