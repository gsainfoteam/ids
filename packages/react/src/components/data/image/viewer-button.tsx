'use client';

import { type ComponentProps, type MouseEvent, type ReactElement } from 'react';

import { IconButton } from '../../action/icon-button';

import type { IdsSize, IdsVariant } from '../../../tokens/types';

export type ImageViewerButtonProps = Omit<ComponentProps<'button'>, 'children' | 'color'> & {
  variant?: IdsVariant;
  size?: IdsSize;
  icon?: ReactElement;
};

type Behaviour = {
  label: string;
  glyph: ReactElement;
  act: () => void;
  unavailable?: boolean;
  quiet: boolean;
};

export function ViewerButton({
  label,
  glyph,
  act,
  unavailable = false,
  quiet,
  icon,
  variant,
  size,
  disabled,
  onClick,
  ...rest
}: ImageViewerButtonProps & Behaviour) {
  return (
    <IconButton
      {...rest}
      aria-label={rest['aria-label'] ?? label}
      icon={icon ?? glyph}
      variant={variant ?? (quiet ? 'ghost' : 'outline')}
      size={size}
      disabled={disabled || unavailable}
      focusableWhenDisabled
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) act();
      }}
    />
  );
}
