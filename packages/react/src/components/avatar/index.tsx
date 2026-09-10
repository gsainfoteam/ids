import { Children, isValidElement, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';

import { cn, invariant, tv } from '../../utils';
import { Slot } from '../slot';

import type { IdsSize } from '../../tokens/types';

const HANGUL = /[ㄱ-ㆎ가-힣]/;

export function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (HANGUL.test(words[0])) return words[0].slice(0, 1);
  return words
    .slice(0, 2)
    .map((word) => word.slice(0, 1))
    .join('')
    .toUpperCase();
}

export function Avatar({
  src,
  name,
  alt,
  variant = 'circle',
  size = 'standard',
  className,
  children,
  ...rest
}: Avatar.Props) {
  const [failed, setFailed] = useState(false);

  const fallback = Children.toArray(children).find(
    (child) => isValidElement(child) && child.type === Avatar.Fallback,
  );
  const initials = name == null ? '' : initialsOf(name);
  const label = alt ?? name;

  invariant(
    src != null || fallback != null || initials !== '',
    '`<Avatar>` requires one of `src`, `name` or `<Avatar.Fallback>`.',
  );
  invariant(label != null, '`<Avatar>` requires `name` or `alt` for assistive technology.');

  return (
    <span
      role="img"
      aria-label={label}
      {...rest}
      className={Avatar.Style({ variant, size, className })}
    >
      {src != null && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        (fallback ?? <Avatar.Fallback>{initials}</Avatar.Fallback>)
      )}
    </span>
  );
}

export namespace Avatar {
  export const Style = tv({
    base: 'inline-flex shrink-0 items-center justify-center overflow-hidden bg-(--ids-color-muted) text-(--ids-color-on-muted) select-none',
    variants: {
      variant: {
        circle: 'rounded-full',
        square: 'rounded-lg',
      },
      size: {
        standard: 'size-10 text-body-b3-medium',
        tiny: 'size-6 text-caption-c2-medium',
      } satisfies Record<IdsSize, string>,
    },
    defaultVariants: { variant: 'circle', size: 'standard' },
  });

  export function Fallback({ asChild, className, ...rest }: FallbackProps) {
    const Root = asChild === true ? Slot : 'span';
    return (
      <Root
        aria-hidden
        {...rest}
        className={cn('inline-flex items-center justify-center [&_svg]:size-[60%]', className)}
      />
    );
  }

  export type FallbackProps = Omit<ComponentProps<'span'>, 'className'> & {
    asChild?: boolean;
    className?: string;
  };

  export type Props = Omit<ComponentProps<'span'>, 'children' | 'className' | 'role'> & {
    src?: string;
    name?: string;
    alt?: string;
    variant?: 'circle' | 'square';
    size?: IdsSize;
    className?: string;
    children?: ReactNode;
  };
}
