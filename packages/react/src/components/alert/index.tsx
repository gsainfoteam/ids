import { Children, isValidElement } from 'react';
import type { ComponentProps, KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { tv } from '../../utils';
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
      }).root({ className })}
    >
      {icon}
      <div className="flex min-w-0 flex-col gap-0.5">{body}</div>
      {close}
    </div>
  );
}

export namespace Alert {
  export const Style = tv({
    slots: {
      root: [
        'grid w-full items-start gap-y-0.5 rounded-lg px-4 py-3 inset-ring-1',
        'bg-(--alert-tint)/8 text-(--ids-color-on-surface) inset-ring-(--alert-tint)/25',
      ],
      icon: [
        'text-subtitle-s2-semibold inline-flex h-[1lh] shrink-0 items-center',
        'text-(--alert-accent) [&_svg]:size-(--ids-size-icon-standard)',
      ],
      title: 'text-subtitle-s2-semibold',
      description: 'text-body-b3-regular text-(--ids-color-on-muted)',
      actions: 'mt-2 flex items-center gap-2',
      close: [
        'inline-flex h-[1lh] w-6 shrink-0 cursor-pointer items-center justify-center rounded-sm',
        'text-subtitle-s2-semibold',
        'opacity-60 transition-opacity hover:opacity-100',
        'focus-ring',
        'motion-reduce:transition-none',
        '[&_svg]:size-4',
      ],
    },
    variants: {
      variant: {
        info: {
          root: '[--alert-tint:var(--ids-color-info)] [--alert-accent:var(--ids-color-info-strong)]',
        },
        success: {
          root: '[--alert-tint:var(--ids-color-success)] [--alert-accent:var(--ids-color-success-strong)]',
        },
        warning: {
          root: '[--alert-tint:var(--ids-color-warning)] [--alert-accent:var(--ids-color-warning-strong)]',
        },
        danger: {
          root: '[--alert-tint:var(--ids-color-danger)] [--alert-accent:var(--ids-color-danger-strong)]',
        },
        neutral: {
          root: '[--alert-tint:var(--ids-color-on-surface)] [--alert-accent:var(--ids-color-on-surface)]',
        },
      },
      icon: { true: { root: 'gap-x-3' }, false: {} },
      close: { true: { root: 'gap-x-3' }, false: {} },
    },
    compoundVariants: [
      { icon: false, close: false, class: { root: 'grid-cols-1' } },
      { icon: true, close: false, class: { root: 'grid-cols-[auto_1fr]' } },
      { icon: false, close: true, class: { root: 'grid-cols-[1fr_auto]' } },
      { icon: true, close: true, class: { root: 'grid-cols-[auto_1fr_auto]' } },
    ],
    defaultVariants: { variant: 'info', icon: false, close: false },
  });

  export function Icon({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'span';
    return <Root aria-hidden {...rest} className={Style().icon({ className })} />;
  }

  export function Title({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={Style().title({ className })} />;
  }

  export function Description({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={Style().description({ className })} />;
  }

  export function Actions({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={Style().actions({ className })} />;
  }

  export function Close({ onClose, children, className, ...rest }: CloseProps) {
    return (
      <button
        type="button"
        aria-label="닫기"
        {...{ [CLOSE_ATTRIBUTE]: '' }}
        {...rest}
        className={Style().close({ className })}
        onClick={(event) => {
          onClose(event);
        }}
      >
        {children ?? <XMarkIcon />}
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
    children?: ReactNode;
    className?: string;
  };

  export type Props = Omit<ComponentProps<'div'>, 'children' | 'className' | 'role'> & {
    variant?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
    className?: string;
    children?: ReactNode;
  };
}
