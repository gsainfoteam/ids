import type { ComponentProps, KeyboardEvent, ReactNode } from 'react';

import { useInteractiveProps, type WithInteractiveValues } from '../../hooks/use-interactive';
import { tv } from '../../utils';
import { Slot } from '../slot';

export function Card(props: Card.Props) {
  const {
    props: { variant, interactive, asChild, className, children, ...rest },
    handlers,
    dataProps,
  } = useInteractiveProps<HTMLDivElement, Card.Props>(props);

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
      {...dataProps}
      {...handlers}
      {...(needsButtonSemantics ? { onKeyDown } : {})}
      {...rest}
      className={Card.Style({ variant, interactive: isInteractive }).root({ className })}
    >
      {children}
    </Root>
  );
}

export namespace Card {
  export const Style = tv({
    slots: {
      root: 'flex flex-col rounded-lg text-(--ids-color-on-surface)',
      header: 'flex flex-col gap-1 p-4',
      content: 'flex flex-1 flex-col gap-2 p-4 pt-0',
      footer: 'flex items-center gap-2 p-4 pt-0',
      title: 'text-subtitle-s2-semibold',
      description: 'text-body-b3-regular text-(--ids-color-on-muted)',
    },
    variants: {
      variant: {
        outline: { root: 'bg-(--ids-color-surface) inset-ring-1 inset-ring-(--ids-color-outline)' },
        elevated: { root: 'bg-(--ids-color-surface) shadow-md' },
        filled: { root: 'bg-(--ids-color-muted)' },
        ghost: { root: 'bg-transparent' },
      },
      interactive: {
        true: {
          root: [
            'cursor-pointer select-none transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
            'data-hovered:bg-(--ids-color-primary)/10',
            'data-active:bg-(--ids-color-primary)/15',
            'focus-ring',
            'motion-reduce:transition-none',
          ],
        },
        false: {},
      },
    },
    defaultVariants: { variant: 'outline', interactive: false },
  });

  export function Header({ asChild, className, ...rest }: SectionProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={Style().header({ className })} />;
  }

  export function Content({ asChild, className, ...rest }: SectionProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={Style().content({ className })} />;
  }

  export function Footer({ asChild, className, ...rest }: SectionProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={Style().footer({ className })} />;
  }

  export function Title({ asChild, className, ...rest }: SectionProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={Style().title({ className })} />;
  }

  export function Description({ asChild, className, ...rest }: SectionProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={Style().description({ className })} />;
  }

  export type SectionProps = Omit<ComponentProps<'div'>, 'className'> & {
    asChild?: boolean;
    className?: string;
  };

  type BaseProps = Omit<ComponentProps<'div'>, 'children' | 'className'> & {
    variant?: 'outline' | 'elevated' | 'filled' | 'ghost';
    interactive?: boolean;
    asChild?: boolean;
    className?: string;
    children?: ReactNode;
  };

  export type Props = WithInteractiveValues<BaseProps>;
}
