import type { ReactNode } from 'react';
import { cn } from '../../utils';
import { HStack } from '../hstack';

import type { IdsVariant, IdsSize } from '../../tokens/types';

export function Button({ children, variant = 'solid', size = 'md', disabled, onClick }: Button.Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center h-12 rounded-xl font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40',
        {
          'px-2 text-xs': size === 'xs',
          'px-2.5 text-sm': size === 'sm',
          'px-4 text-sm': size === 'md',
          'px-5 text-base': size === 'lg',
          'px-6 text-lg': size === 'xl',
        },
        {
          'bg-[var(--ids-color-primary)] text-[var(--ids-color-on-primary)] hover:opacity-90': variant === 'solid',
          'border border-[var(--ids-color-primary)] text-[var(--ids-color-primary)] hover:bg-[var(--ids-color-primary)]/10': variant === 'outline',
          'text-[var(--ids-color-primary)] hover:bg-[var(--ids-color-primary)]/10': variant === 'ghost',
        },
      )}
    >
      <HStack gap={2} crossAxis="center">
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
    onClick?: () => void;
  };
}
