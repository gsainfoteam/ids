import type { ComponentProps, KeyboardEvent, ReactNode } from 'react';

import { useInteractiveProps, type WithInteractiveValues } from '../../hooks/use-interactive';
import { tv } from '../../utils';
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
      {...(needsButtonSemantics ? { role: 'button', tabIndex: 0, 'aria-pressed': selected } : {})}
      {...(selected === true ? { 'data-selected': '' } : {})}
      {...dataProps}
      {...handlers}
      {...rest}
      {...(needsButtonSemantics ? { onKeyDown } : {})}
      className={Item.Style({ size, interactive: isInteractive }).root({ className })}
    >
      {children}
    </Root>
  );
}

export namespace Item {
  export const Style = tv({
    slots: {
      root: 'flex w-full items-center rounded-lg bg-(--ids-color-surface) text-(--ids-color-on-surface)',
      media:
        'inline-flex shrink-0 items-center justify-center text-(--ids-color-on-muted) [&_svg]:size-(--ids-size-icon-standard)',
      content: 'flex min-w-0 flex-1 flex-col',
      title: 'text-body-b3-medium truncate',
      description: 'text-caption-c1-regular truncate text-(--ids-color-on-muted)',
      actions: 'ml-auto flex shrink-0 items-center gap-2',
    },
    variants: {
      size: {
        standard: { root: 'min-h-14 gap-3 p-3' },
        tiny: { root: 'min-h-10 gap-2 p-2' },
      } satisfies Record<IdsSize, { root: string }>,
      interactive: {
        true: {
          root: [
            'cursor-pointer select-none transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
            'data-hovered:bg-(--ids-color-primary)/10',
            'data-active:bg-(--ids-color-primary)/15',
            'data-selected:bg-(--ids-color-primary)/15',
            'focus-ring',
            'motion-reduce:transition-none',
          ],
        },
        false: { root: 'data-selected:bg-(--ids-color-primary)/15' },
      },
    },
    defaultVariants: { size: 'standard', interactive: false },
  });

  export function Media({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={Style().media({ className })} />;
  }

  export function Content({ asChild, className, ...rest }: PartProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={Style().content({ className })} />;
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
