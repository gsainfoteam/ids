import type { ComponentProps, KeyboardEvent, ReactNode } from 'react';

import { useInteractiveProps, type WithInteractiveValues } from '../../hooks/use-interactive';
import { cn, tv } from '../../utils';
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
      className={Card.Style({ variant, interactive: isInteractive, className })}
    >
      {children}
    </Root>
  );
}

export namespace Card {
  export const Style = tv({
    base: 'flex flex-col rounded-xl text-(--ids-color-on-surface)',
    variants: {
      variant: {
        outline: 'bg-(--ids-color-surface) inset-ring-1 inset-ring-(--ids-color-outline)',
        elevated: 'bg-(--ids-color-surface) shadow-md',
        filled: 'bg-(--ids-color-muted)',
        ghost: 'bg-transparent',
      },
      interactive: {
        true: [
          'cursor-pointer transition-all select-none',
          'data-hovered:bg-(--ids-color-primary)/10',
          'data-active:scale-(--ids-scale-pressed-subtle) data-active:bg-(--ids-color-primary)/15',
          'data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-(--ids-color-primary)',
          'motion-reduce:transition-none motion-reduce:data-active:scale-100',
        ],
        false: '',
      },
    },
    defaultVariants: { variant: 'outline', interactive: false },
  });

  export function Header({ asChild, className, ...rest }: SectionProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={cn('flex flex-col gap-1 p-4', className)} />;
  }

  export function Content({ asChild, className, ...rest }: SectionProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={cn('flex flex-1 flex-col gap-2 p-4 pt-0', className)} />;
  }

  export function Footer({ asChild, className, ...rest }: SectionProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={cn('flex items-center gap-2 p-4 pt-0', className)} />;
  }

  export function Title({ asChild, className, ...rest }: SectionProps) {
    const Root = asChild === true ? Slot : 'div';
    return <Root {...rest} className={cn('text-subtitle-s1-semibold', className)} />;
  }

  export function Description({ asChild, className, ...rest }: SectionProps) {
    const Root = asChild === true ? Slot : 'div';
    return (
      <Root
        {...rest}
        className={cn('text-body-b3-regular text-(--ids-color-on-muted)', className)}
      />
    );
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
