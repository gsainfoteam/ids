import { useEffect, useRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '../../utils';

export function Checkbox({
  checked,
  defaultChecked,
  indeterminate,
  disabled,
  invalid,
  size = 'md',
  variant = 'outline',
  onChange,
  className,
  children,
  ...props
}: Checkbox.Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  return (
    <span className={cn('relative inline-flex items-center justify-center', className)}>
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange?.(event.currentTarget.checked)}
        className={cn(
          'peer appearance-none rounded border transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40',
          variant === 'filled' && 'bg-(--ids-color-muted)',
          invalid
            ? 'border-red-500 checked:border-red-500 checked:bg-red-500'
            : 'border-(--ids-color-outline) checked:border-(--ids-color-primary) checked:bg-(--ids-color-primary)',
          {
            'size-3.5': size === 'sm',
            'size-4': size === 'md',
            'size-5': size === 'lg',
          },
        )}
        {...props}
      />
      <span
        className={cn(
          'pointer-events-none absolute text-(--ids-color-on-primary)',
          indeterminate ? 'opacity-100' : 'opacity-0 peer-checked:opacity-100',
        )}
      >
        {children ?? (indeterminate ? '−' : '✓')}
      </span>
    </span>
  );
}

export namespace Checkbox {
  export type Props = {
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'outline' | 'filled';
    onChange?: (checked: boolean) => void;
    className?: string;
    children?: ReactNode;
  } & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'checked' | 'defaultChecked' | 'disabled' | 'size' | 'onChange' | 'type' | 'children'
  >;
}
