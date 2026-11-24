'use client';

import { type ComponentProps } from 'react';

import { mergeProps, part } from '../../../../utils';
import { useInternalColorFieldContext } from '../context';

export type ColorFieldValueProps = ComponentProps<'span'> & { asChild?: boolean };

export function ColorFieldValue({ asChild, children, className, ...props }: ColorFieldValueProps) {
  const c = useInternalColorFieldContext('ColorField.Value');

  const { text } = c.field.state;

  return part(
    'span',
    asChild,
    children ?? (text || c.placeholder),
    mergeProps(props, {
      id: props.id ?? c.valueId,
      'data-placeholder': text ? undefined : '',
      className: c.styles.value({ className }),
    }),
  );
}

ColorFieldValue.displayName = 'ColorField.Value';
