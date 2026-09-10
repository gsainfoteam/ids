import { Children, isValidElement } from 'react';
import type { ComponentProps, KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { cn, invariant, tv } from '../../utils';
import { Slot } from '../slot';

const ASSERTIVE_VARIANTS = new Set(['warning', 'danger']);

const CLOSE_ATTRIBUTE = 'data-alert-close';

export function Alert({ variant = 'info', className, children, ...rest }: Alert.Props) {
  const assertive = ASSERTIVE_VARIANTS.has(variant);

  const parts = Children.toArray(children);
  const icon = parts.find((child) => isValidElement(child) && child.type === Alert.Icon);
  const close = parts.find((child) => isValidElement(child) && child.type === Alert.Close);
  const body = parts.filter((child) => child !== icon && child !== close);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    rest.onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Escape') return;

    const button = event.currentTarget.querySelector<HTMLButtonElement>(`[${CLOSE_ATTRIBUTE}]`);
    if (button == null) return;
    event.preventDefault();
    button.click();
  }

  return (
    <div
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      {...rest}
      onKeyDown={onKeyDown}
      className={Alert.Style({ variant, className })}
    >
      {icon}
      <div className="flex min-w-0 flex-1 flex-col gap-1">{body}</div>
      {close}
    </div>
  );
}

export namespace Alert {
  export const Style = tv({
    base: [
      'flex items-start gap-3 rounded-xl p-4 inset-ring-1',
      'bg-(--alert-accent)/10 text-(--ids-color-on-surface) inset-ring-(--alert-accent)/30',
    ],
    variants: {
      variant: {
        info: '[--alert-accent:var(--ids-color-info)]',
        success: '[--alert-accent:var(--ids-color-success)]',
        warning: '[--alert-accent:var(--ids-color-warning)]',
        danger: '[--alert-accent:var(--ids-color-danger)]',
        neutral: '[--alert-accent:var(--ids-color-on-surface)]',
      },
    },
    defaultVariants: { variant: 'info' },
  });

  export function Icon({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'span';
    return (
      <Root
        aria-hidden
        {...rest}
        className={cn('inline-flex shrink-0 text-(--alert-accent) [&_svg]:size-5', className)}
      />
    );
  }

  export function Title({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={cn('text-subtitle-s2-semibold', className)} />;
  }

  export function Description({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={cn('text-body-b3-regular', className)} />;
  }

  export function Actions({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={cn('mt-2 flex items-center gap-2', className)} />;
  }

  export function Close({ onClose, children, className, ...rest }: CloseProps) {
    invariant(children != null, '`<Alert.Close>` requires an icon as its `children`.');

    return (
      <button
        type="button"
        aria-label="닫기"
        {...{ [CLOSE_ATTRIBUTE]: '' }}
        {...rest}
        className={cn(
          'inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-lg',
          'opacity-60 transition-opacity hover:opacity-100',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
          'motion-reduce:transition-none',
          '[&_svg]:size-4',
          className,
        )}
        onClick={(event) => {
          onClose(event);
        }}
      >
        {children}
      </button>
    );
  }

  export type PartProps = Omit<ComponentProps<'div'>, 'className'> & {
    asChild?: boolean;
    className?: string;
  };

  export type CloseProps = Omit<
    ComponentProps<'button'>,
    'className' | 'children' | 'onClick' | 'type'
  > & {
    onClose: (event: MouseEvent<HTMLButtonElement>) => void;
    children: ReactNode;
    className?: string;
  };

  export type Props = Omit<ComponentProps<'div'>, 'children' | 'className' | 'role'> & {
    variant?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
    className?: string;
    children?: ReactNode;
  };
}
