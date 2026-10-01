'use client';

import { type ComponentProps } from 'react';

import { ChevronDownIcon } from '@heroicons/react/16/solid';

import { useSelectContext } from './context';
import { mergeProps, part } from '../../../utils';

export type SelectIconProps = ComponentProps<'span'> & { asChild?: boolean };

export function SelectIcon({ asChild, children, className, ...props }: SelectIconProps) {
  const c = useSelectContext('Select.Icon');

  return part(
    'span',
    asChild,
    children ?? <ChevronDownIcon />,
    mergeProps(props, { 'aria-hidden': true, className: c.styles.icon({ className }) }),
  );
}

SelectIcon.displayName = 'Select.Icon';
