'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { useSelectContext } from './context';
import { messages } from '../../../internal/messages';
import { mergeProps, part } from '../../../utils';

import type { SelectValueState } from '.';

export type SelectValueProps = Omit<ComponentProps<'span'>, 'children'> & {
  asChild?: boolean;
  placeholder?: string;
  children?: ReactNode | ((state: SelectValueState) => ReactNode);
};

const MAX_LABELS_IN_TRIGGER = 2;

export function SelectValue({
  asChild,
  children,
  placeholder,
  className,
  ...props
}: SelectValueProps) {
  const c = useSelectContext('Select.Value');

  const labels = c.select.state.selected.map(
    (value) => c.options.find((option) => option.value === value)?.label ?? value,
  );
  const state: SelectValueState = {
    value: c.select.state.value,
    labels,
    placeholder: labels.length === 0,
  };
  const shown =
    labels.length > MAX_LABELS_IN_TRIGGER ? labels.slice(0, MAX_LABELS_IN_TRIGGER) : labels;
  const content =
    typeof children === 'function'
      ? children(state)
      : (children ?? (
          <>
            <span className={c.styles.valueText()}>
              {state.placeholder ? (placeholder ?? c.placeholder) : shown.join(', ')}
            </span>
            {labels.length > shown.length && (
              <span className={c.styles.more()}>
                {messages.select.more(labels.length - shown.length)}
              </span>
            )}
          </>
        ));

  return part(
    'span',
    asChild,
    content,
    mergeProps(props, {
      'data-select-value': '',
      'data-placeholder': state.placeholder ? '' : undefined,
      className: c.styles.value({ className }),
    }),
  );
}

SelectValue.displayName = 'Select.Value';
