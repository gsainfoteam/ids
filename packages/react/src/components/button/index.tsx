import { cn } from '../../utils';
import type { IdsSize, IdsVariant } from '../../tokens/types';

export function Button({ children, variant = 'solid', size = 'md', disabled, onClick }: Button.Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40',
        {
          'px-2 py-0.5 text-xs': size === 'xs',
          'px-2.5 py-1 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-5 py-2.5 text-base': size === 'lg',
          'px-6 py-3 text-lg': size === 'xl',
        },
        {
          'bg-[var(--ids-color-primary)] text-[var(--ids-color-on-primary)] hover:opacity-90': variant === 'solid',
          'border border-[var(--ids-color-primary)] text-[var(--ids-color-primary)] hover:bg-[var(--ids-color-primary)]/10': variant === 'outline',
          'text-[var(--ids-color-primary)] hover:bg-[var(--ids-color-primary)]/10': variant === 'ghost',
        },
      )}
    >
      {children}
    </button>
  );
}

export namespace Button {
  export type Props = {
    children: React.ReactNode;
    variant?: IdsVariant;
    size?: Exclude<IdsSize, '2xl'>;
    disabled?: boolean;
    onClick?: () => void;
  };
}
