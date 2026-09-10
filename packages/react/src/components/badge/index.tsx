import type { ComponentProps, KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { useInteractiveProps, type WithInteractiveValues } from '../../hooks/use-interactive';
import { cn, invariant, tv } from '../../utils';
import { Slot } from '../slot';

import type { IdsSize } from '../../tokens/types';

export function Badge(props: Badge.Props) {
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
  } = useInteractiveProps<HTMLSpanElement, Badge.Props>(props);

  invariant(
    selectedProp == null || onSelectedChange != null,
    '`<Badge>` `selected` requires `onSelectedChange`.',
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
    if (event.defaultPrevented || (event.key !== 'Enter' && event.key !== ' ')) return;
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
      className={Badge.Style({ variant, colorScheme, size, interactive: isInteractive, className })}
    >
      {children}
    </Root>
  );
}

export namespace Badge {
  export const Style = tv({
    base: 'inline-flex shrink-0 items-center gap-1 rounded-full align-middle',
    variants: {
      colorScheme: {
        neutral:
          '[--badge-accent:var(--ids-color-on-surface)] [--badge-fill:var(--ids-color-muted)] [--badge-on-fill:var(--ids-color-on-surface)]',
        primary:
          '[--badge-accent:var(--ids-color-primary)] [--badge-fill:var(--ids-color-primary)] [--badge-on-fill:var(--ids-color-on-primary)]',
        success:
          '[--badge-accent:var(--ids-color-success)] [--badge-fill:var(--ids-color-success)] [--badge-on-fill:var(--ids-color-on-success)]',
        warning:
          '[--badge-accent:var(--ids-color-warning)] [--badge-fill:var(--ids-color-warning)] [--badge-on-fill:var(--ids-color-on-warning)]',
        danger:
          '[--badge-accent:var(--ids-color-danger)] [--badge-fill:var(--ids-color-danger)] [--badge-on-fill:var(--ids-color-on-danger)]',
        info: '[--badge-accent:var(--ids-color-info)] [--badge-fill:var(--ids-color-info)] [--badge-on-fill:var(--ids-color-on-info)]',
      },
      variant: {
        solid: 'bg-(--badge-fill) text-(--badge-on-fill)',
        soft: 'bg-(--badge-accent)/15 text-(--badge-accent)',
        outline: 'inset-ring-1 inset-ring-(--badge-accent)/40 text-(--badge-accent)',
      },
      size: {
        standard: 'min-h-[22px] px-2 text-caption-c1-medium',
        tiny: 'min-h-[18px] px-1.5 text-caption-c2-medium',
      } satisfies Record<IdsSize, string>,
      interactive: {
        true: [
          'cursor-pointer transition-all select-none',
          'data-hovered:bg-(--badge-accent)/25',
          'data-active:scale-[0.96]',
          'data-selected:bg-(--badge-fill) data-selected:text-(--badge-on-fill)',
          'data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-(--ids-color-primary)',
          'motion-reduce:transition-none motion-reduce:data-active:scale-100',
        ],
        false: '',
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
    return <Root {...rest} className={cn('inline-flex shrink-0 [&_svg]:size-[1em]', className)} />;
  }

  export function Label({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'span';
    return <Root {...rest} className={cn('truncate', className)} />;
  }

  export function Close({ onClose, children, className, ...rest }: CloseProps) {
    invariant(children != null, '`<Badge.Close>` requires an icon as its `children`.');

    return (
      <button
        type="button"
        aria-label="삭제"
        {...rest}
        className={cn(
          'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full',
          'opacity-60 transition-opacity hover:opacity-100',
          'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current',
          '[&_svg]:size-[1em]',
          className,
        )}
        onClick={(event) => {
          event.stopPropagation();
          onClose(event);
        }}
      >
        {children}
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
    children: ReactNode;
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
