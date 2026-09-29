import { isValidElement, type ComponentProps, type MouseEvent, type ReactElement } from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { invariant } from '../../../utils';
import { IconButton } from '../../action/icon-button';

import type { IdsSize } from '../../../tokens/types';

type GhostButtonProps = Omit<ComponentProps<'button'>, 'children' | 'onClick'> & {
  asChild?: boolean;
  children?: ReactElement;
  size: IdsSize;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function GhostButton({ asChild, children, ...props }: GhostButtonProps) {
  if (!asChild)
    return (
      <IconButton {...props} variant="ghost" icon={children ?? <XMarkIcon aria-hidden="true" />} />
    );

  invariant(isValidElement(children), 'FileField: asChild requires one button element.');

  return (
    <IconButton {...props} variant="ghost" asChild>
      {children}
    </IconButton>
  );
}
