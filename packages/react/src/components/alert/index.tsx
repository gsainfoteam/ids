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
      className={Alert.Style({
        variant,
        icon: icon != null,
        close: close != null,
        className,
      })}
    >
      {icon}
      <div className="flex min-w-0 flex-col gap-0.5">{body}</div>
      {close}
    </div>
  );
}

export namespace Alert {
  export const Style = tv({
    base: [
      'grid w-full items-start gap-y-0.5 rounded-xl px-4 py-3 inset-ring-1',
      'bg-(--alert-tint)/8 text-(--ids-color-on-surface) inset-ring-(--alert-tint)/25',
    ],
    variants: {
      variant: {
        info: '[--alert-tint:var(--ids-color-info)] [--alert-accent:var(--ids-color-info-strong)]',
        success:
          '[--alert-tint:var(--ids-color-success)] [--alert-accent:var(--ids-color-success-strong)]',
        warning:
          '[--alert-tint:var(--ids-color-warning)] [--alert-accent:var(--ids-color-warning-strong)]',
        danger:
          '[--alert-tint:var(--ids-color-danger)] [--alert-accent:var(--ids-color-danger-strong)]',
        neutral:
          '[--alert-tint:var(--ids-color-on-surface)] [--alert-accent:var(--ids-color-on-surface)]',
      },
      icon: { true: 'gap-x-3', false: '' },
      close: { true: 'gap-x-3', false: '' },
    },
    compoundVariants: [
      { icon: false, close: false, class: 'grid-cols-1' },
      { icon: true, close: false, class: 'grid-cols-[auto_1fr]' },
      { icon: false, close: true, class: 'grid-cols-[1fr_auto]' },
      { icon: true, close: true, class: 'grid-cols-[auto_1fr_auto]' },
    ],
    defaultVariants: { variant: 'info', icon: false, close: false },
  });

  export function Icon({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'span';
    return (
      <Root
        aria-hidden
        {...rest}
        className={cn(
          'text-subtitle-s2-semibold inline-flex h-[1lh] shrink-0 items-center',
          'text-(--alert-accent) [&_svg]:size-5',
          className,
        )}
      />
    );
  }

  export function Title({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={cn('text-subtitle-s2-semibold', className)} />;
  }

  export function Description({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return (
      <Root
        {...rest}
        className={cn('text-body-b3-regular text-(--ids-color-on-muted)', className)}
      />
    );
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
          'inline-flex h-[1lh] w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg',
          'text-subtitle-s2-semibold',
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
