import type { ReactNode } from 'react';

import { cn } from '../../utils';
import { HStack } from '../hstack';

import type { IdsVariant, IdsSize } from '../../tokens/types';

export function Button({
  children,
  variant = 'solid',
  size = 'md',
  disabled,
  fit = 'content',
  onClick,
}: Button.Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center h-12 rounded-xl font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40',
        {
          'h-8 px-2 text-xs': size === 'xs',
          'h-9 px-2.5 text-sm': size === 'sm',
          'h-12 px-4 text-sm': size === 'md',
          'h-14 px-5 text-base': size === 'lg',
          'h-16 px-6 text-lg': size === 'xl',
        },
        {
          'bg-primary text-on-primary hover:opacity-90': variant === 'solid',
          'bg-secondary text-on-secondary hover:opacity-80': variant === 'soft',
          'border border-primary text-primary hover:bg-primary/10': variant === 'outline',
          'text-primary hover:bg-primary/10': variant === 'ghost',
        },
      )}
    >
      <HStack gap={8} crossAxis="center" fit={fit} className="leading-none">
        {children}
      </HStack>
    </button>
  );
}

export namespace Button {
  export type Props = {
    children: ReactNode;
    variant?: IdsVariant;
    size?: Exclude<IdsSize, '2xl'>;
    disabled?: boolean;
    fit?: HStack.Props['fit'];
    onClick?: () => void;
  };
}
