'use client';

import { type ComponentProps, type ReactElement } from 'react';

import { XMarkIcon } from '@heroicons/react/24/outline';

import { IconButton } from '../../../components/action/icon-button';
import { mergeProps } from '../../../utils';
import { useInternalTemporalContext } from '../context';

export type ClearProps = ComponentProps<'button'> & { asChild?: boolean };

export function TemporalClear({ asChild, children, className, ...props }: ClearProps) {
  const c = useInternalTemporalContext('Clear');
  if (c.state.empty) return null;
  const button = {
    ...mergeProps(props, {
      type: 'button',
      'aria-label': props['aria-label'] ?? c.messages.clear,
      'data-temporal-clear': '',
      onClick: c.clear,
      onBlur: c.onBlur,
    }),
    variant: 'ghost' as const,
    size: c.size,
    disabled: c.blocked,
    className: c.styles.clear({ className }),
  };
  return asChild ? (
    <IconButton {...button} asChild>
      {children as ReactElement}
    </IconButton>
  ) : (
    <IconButton {...button} icon={(children as ReactElement) ?? <XMarkIcon aria-hidden="true" />} />
  );
}
