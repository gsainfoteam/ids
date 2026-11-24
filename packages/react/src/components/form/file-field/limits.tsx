'use client';

import { type ComponentProps, type ReactNode } from 'react';

import { useFile } from './context';
import { mergeProps, part } from '../../../utils';

export type FileFieldLimits = { accept: string[]; maxSize?: number; maxCount?: number };

export type FileLimitsProps = Omit<ComponentProps<'span'>, 'children'> & {
  asChild?: boolean;
  children?: ReactNode | ((limits: FileFieldLimits) => ReactNode);
};

export function FileLimits({ asChild, children, className, ...props }: FileLimitsProps) {
  const c = useFile('FileField.Limits');

  return part(
    'span',
    asChild,
    typeof children === 'function' ? children(c.limits) : children,
    mergeProps(props, {
      id: c.limitsId,
      'data-file-field-limits': '',
      className: c.styles.hint({ className }),
    }),
  );
}

FileLimits.displayName = 'FileField.Limits';
