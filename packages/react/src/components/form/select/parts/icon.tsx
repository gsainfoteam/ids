'use client';

import { type ComponentProps } from 'react';

import { ChevronDownIcon } from '@heroicons/react/16/solid';

import { mergeProps, part } from '../../../../utils';
import { useInternalSelectContext } from '../context';

export type SelectIconProps = ComponentProps<'span'> & { asChild?: boolean };

export function SelectIcon({ asChild, children, className, ...props }: SelectIconProps) {
  const c = useInternalSelectContext('Select.Icon');

  return part(
    'span',
    asChild,
    children ?? <ChevronDownIcon />,
    mergeProps(props, { 'aria-hidden': true, className: c.styles.icon({ className }) }),
  );
}

SelectIcon.displayName = 'Select.Icon';
