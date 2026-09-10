import type { ComponentProps, KeyboardEvent, ReactNode } from 'react';

import { useInteractiveProps, type WithInteractiveValues } from '../../hooks/use-interactive';
import { cn, tv } from '../../utils';
import { Slot } from '../slot';

import type { IdsSize } from '../../tokens/types';

export function Item(props: Item.Props) {
  const {
    props: { size, interactive, selected, asChild, className, children, ...rest },
    handlers,
    dataProps,
  } = useInteractiveProps<HTMLDivElement, Item.Props>(props);

  const isInteractive = interactive ?? rest.onClick != null;
  const needsButtonSemantics = isInteractive && asChild !== true;
  const Root = asChild === true ? Slot : 'div';

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    handlers.onKeyDown(event);
    if (event.defaultPrevented || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    event.currentTarget.click();
  }

  return (
    <Root
      {...(needsButtonSemantics ? { role: 'button', tabIndex: 0 } : {})}
      {...(selected === true ? { 'aria-selected': true, 'data-selected': '' } : {})}
      {...dataProps}
      {...handlers}
      {...rest}
      {...(needsButtonSemantics ? { onKeyDown } : {})}
      className={Item.Style({ size, interactive: isInteractive, className })}
    >
      {children}
    </Root>
  );
}

export namespace Item {
  export const Style = tv({
    base: 'flex w-full items-center rounded-xl bg-(--ids-color-surface) text-(--ids-color-on-surface)',
    variants: {
      size: {
        standard: 'min-h-14 gap-3 p-3',
        tiny: 'min-h-10 gap-2 p-2',
      } satisfies Record<IdsSize, string>,
      interactive: {
        true: [
          'cursor-pointer transition-all select-none',
          'data-hovered:bg-(--ids-color-primary)/10',
          'data-active:scale-(--ids-scale-pressed-subtle) data-active:bg-(--ids-color-primary)/15',
          'data-selected:bg-(--ids-color-primary)/15',
          'data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-(--ids-color-primary)',
          'motion-reduce:transition-none motion-reduce:data-active:scale-100',
        ],
        false: 'data-selected:bg-(--ids-color-primary)/15',
      },
    },
    defaultVariants: { size: 'standard', interactive: false },
  });

  export function Media({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return (
      <Root
        {...rest}
        className={cn(
          'inline-flex shrink-0 items-center justify-center text-(--ids-color-on-muted) [&_svg]:size-5',
          className,
        )}
      />
    );
  }

  export function Content({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={cn('flex min-w-0 flex-1 flex-col', className)} />;
  }

  export function Title({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={cn('text-body-b3-medium truncate', className)} />;
  }

  export function Description({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return (
      <Root
        {...rest}
        className={cn('text-caption-c1-regular truncate text-(--ids-color-on-muted)', className)}
      />
    );
  }

  export function Actions({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={cn('ml-auto flex shrink-0 items-center gap-2', className)} />;
  }

  export type PartProps = Omit<ComponentProps<'div'>, 'className'> & {
    asChild?: boolean;
    className?: string;
  };

  type BaseProps = Omit<ComponentProps<'div'>, 'children' | 'className'> & {
    size?: IdsSize;
    interactive?: boolean;
    selected?: boolean;
    asChild?: boolean;
    className?: string;
    children?: ReactNode;
  };

  export type Props = WithInteractiveValues<BaseProps>;
}
