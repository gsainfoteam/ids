import type { ComponentProps, KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { XMarkIcon } from '@heroicons/react/16/solid';

import { useControllableState } from '../../hooks/use-controllable-state';
import { useInteractiveProps, type WithInteractiveValues } from '../../hooks/use-interactive';
import { invariant, tv } from '../../utils';
import { Slot } from '../slot';

import type { IdsSize } from '../../tokens/types';

export function Chip(props: Chip.Props) {
  const {
    props: {
      variant,
      colorScheme,
      size,
      selected: selectedProp,
      defaultSelected,
      onSelectedChange,
      asChild,
      className,
      children,
      ...rest
    },
    handlers,
    dataProps,
  } = useInteractiveProps<HTMLSpanElement, Chip.Props>(props);

  invariant(
    selectedProp == null || onSelectedChange != null,
    '`<Chip>` `selected` requires `onSelectedChange`.',
  );

  const [selected, setSelected] = useControllableState({
    value: selectedProp,
    defaultValue: defaultSelected ?? false,
    onChange: onSelectedChange,
  });

  const isToggle = selectedProp != null || defaultSelected != null || onSelectedChange != null;
  const isInteractive = isToggle || rest.onClick != null;
  const needsButtonSemantics = isInteractive && asChild !== true;
  const Root = asChild === true ? Slot : 'span';

  function onClick(event: MouseEvent<HTMLSpanElement>) {
    rest.onClick?.(event);
    if (event.defaultPrevented || !isToggle) return;
    setSelected(!selected);
  }

  function onKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    handlers.onKeyDown(event);
    if (event.defaultPrevented || (event.key !== 'Enter' && event.key !== '')) return;
    event.preventDefault();
    event.currentTarget.click();
  }

  return (
    <Root
      {...(needsButtonSemantics ? { role: 'button', tabIndex: 0 } : {})}
      {...(isToggle ? { 'aria-pressed': selected } : {})}
      {...dataProps}
      {...(selected ? { 'data-selected': '' } : {})}
      {...handlers}
      {...rest}
      {...(isInteractive ? { onClick } : {})}
      {...(needsButtonSemantics ? { onKeyDown } : {})}
      className={Chip.Style({ variant, colorScheme, size, interactive: isInteractive }).root({
        className,
      })}
    >
      {children}
    </Root>
  );
}

export namespace Chip {
  export const Style = tv({
    slots: {
      root: 'inline-flex shrink-0 items-center gap-1 rounded-full align-middle',
      icon: 'inline-flex shrink-0 [&_svg]:size-[1em]',
      label: 'truncate',
      close: [
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full',
        'opacity-60 transition-opacity hover:opacity-100',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current',
        '[&_svg]:size-[1em]',
      ],
    },
    variants: {
      colorScheme: {
        neutral: {
          root: '[--chip-tint:var(--ids-color-on-surface)] [--chip-accent:var(--ids-color-on-surface)] [--chip-fill:var(--ids-color-muted)] [--chip-on-fill:var(--ids-color-on-surface)]',
        },
        primary: {
          root: '[--chip-tint:var(--ids-color-primary)] [--chip-accent:var(--ids-color-primary)] [--chip-fill:var(--ids-color-primary)] [--chip-on-fill:var(--ids-color-on-primary)]',
        },
        success: {
          root: '[--chip-tint:var(--ids-color-success)] [--chip-accent:var(--ids-color-success-strong)] [--chip-fill:var(--ids-color-success)] [--chip-on-fill:var(--ids-color-on-success)]',
        },
        warning: {
          root: '[--chip-tint:var(--ids-color-warning)] [--chip-accent:var(--ids-color-warning-strong)] [--chip-fill:var(--ids-color-warning)] [--chip-on-fill:var(--ids-color-on-warning)]',
        },
        danger: {
          root: '[--chip-tint:var(--ids-color-danger)] [--chip-accent:var(--ids-color-danger-strong)] [--chip-fill:var(--ids-color-danger)] [--chip-on-fill:var(--ids-color-on-danger)]',
        },
        info: {
          root: '[--chip-tint:var(--ids-color-info)] [--chip-accent:var(--ids-color-info-strong)] [--chip-fill:var(--ids-color-info)] [--chip-on-fill:var(--ids-color-on-info)]',
        },
      },
      variant: {
        solid: { root: 'bg-(--chip-fill) text-(--chip-on-fill)' },
        soft: { root: 'bg-(--chip-tint)/15 text-(--chip-accent)' },
        outline: { root: 'inset-ring-1 inset-ring-(--chip-accent)/40 text-(--chip-accent)' },
      },
      size: {
        standard: { root: 'text-caption-c1-medium min-h-[22px] px-2' },
        tiny: { root: 'text-caption-c2-medium min-h-[18px] px-1.5' },
      } satisfies Record<IdsSize, { root: string }>,
      interactive: {
        true: {
          root: [
            'cursor-pointer transition-all select-none',
            'data-hovered:bg-(--chip-tint)/25',
            '',
            'data-selected:bg-(--chip-fill) data-selected:text-(--chip-on-fill)',
            'data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-(--ids-color-primary)',
            'motion-reduce:transition-none',
          ],
        },
        false: {},
      },
    },
    defaultVariants: {
      variant: 'soft',
      colorScheme: 'neutral',
      size: 'standard',
      interactive: false,
    },
  });

  export function Icon({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'span';
    return <Root {...rest} className={Style().icon({ className })} />;
  }

  export function Label({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'span';
    return <Root {...rest} className={Style().label({ className })} />;
  }

  export function Close({ onClose, children, className, ...rest }: CloseProps) {
    return (
      <button
        type="button"
        aria-label="삭제"
        {...rest}
        className={Style().close({ className })}
        onClick={(event) => {
          event.stopPropagation();
          onClose(event);
        }}
      >
        {children ?? <XMarkIcon />}
      </button>
    );
  }

  export type PartProps = Omit<ComponentProps<'span'>, 'className'> & {
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

  type BaseProps = Omit<ComponentProps<'span'>, 'children' | 'className'> & {
    variant?: 'solid' | 'soft' | 'outline';
    colorScheme?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
    size?: IdsSize;
    selected?: boolean;
    defaultSelected?: boolean;
    onSelectedChange?: (selected: boolean) => void;
    asChild?: boolean;
    className?: string;
    children?: ReactNode;
  };

  export type Props = WithInteractiveValues<BaseProps>;
}
