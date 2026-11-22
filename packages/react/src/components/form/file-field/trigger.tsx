'use client';

import { type ComponentProps } from 'react';

import { FileClear } from './clear';
import { useFile } from './context';
import { isType } from './is-type';
import { FileItem } from './item';
import { FileList } from './list';
import { resolveState } from '../../../internal/state-props';
import { flattenFragments, invariant, mergeProps, part } from '../../../utils';

import type { FileFieldState } from '.';

export type FileTriggerProps = Omit<ComponentProps<'button'>, 'className'> & {
  asChild?: boolean;
  className?: string | ((state: FileFieldState) => string | undefined);
};

export function FileTrigger({ asChild, children, className, ...props }: FileTriggerProps) {
  const c = useFile('FileField.Trigger');
  invariant(
    !flattenFragments(children).some(
      (node) => isType(FileClear)(node) || isType(FileList)(node) || isType(FileItem)(node),
    ),
    'FileField: Clear/List/Item must be siblings of Trigger.',
  );

  return part(
    'button',
    asChild,
    children ?? c.triggerContent,
    mergeProps(props, {
      ...c.triggerProps,
      className: c.styles.trigger({ className: resolveState(className, c.state) }),
    }),
  );
}

FileTrigger.displayName = 'FileField.Trigger';
