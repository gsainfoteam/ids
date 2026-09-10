import { Children, cloneElement, isValidElement } from 'react';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { invariant, tv } from '../../utils';
import { Avatar } from '../avatar';

import type { IdsSize } from '../../tokens/types';

export function AvatarGroup({
  max,
  variant = 'stack',
  size = 'standard',
  className,
  children,
  ...rest
}: AvatarGroup.Props) {
  invariant(max == null || max >= 1, '`<AvatarGroup>` `max` must be at least 1.');

  const avatars = Children.toArray(children);
  invariant(
    avatars.every((child) => isValidElement(child) && child.type === Avatar),
    '`<AvatarGroup>` only accepts `<Avatar>` children.',
  );

  const items = avatars as ReactElement<Avatar.Props>[];
  const visible = max == null ? items : items.slice(0, max);
  const overflow = items.length - visible.length;

  return (
    <div
      role="group"
      {...rest}
      className={AvatarGroup.Style({ variant, size, className })}
      data-size={size}
    >
      {visible.map((child, index) =>
        cloneElement(child, { key: child.key ?? index, size: child.props.size ?? size }),
      )}
      {overflow > 0 ? (
        <span className={Avatar.Style({ variant: visible[0]?.props.variant ?? 'circle', size })}>
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

export namespace AvatarGroup {
  export const Style = tv({
    base: 'inline-flex items-center',
    variants: {
      variant: {
        stack: '[&>*]:ring-2 [&>*]:ring-(--ids-color-surface)',
        inline: 'gap-1',
      },
      size: {
        standard: '',
        tiny: '',
      } satisfies Record<IdsSize, string>,
    },
    compoundVariants: [
      { variant: 'stack', size: 'standard', class: '-space-x-2.5' },
      { variant: 'stack', size: 'tiny', class: '-space-x-1.5' },
    ],
    defaultVariants: { variant: 'stack', size: 'standard' },
  });

  export type Props = Omit<ComponentProps<'div'>, 'children' | 'className' | 'role'> & {
    max?: number;
    variant?: 'stack' | 'inline';
    size?: IdsSize;
    className?: string;
    children?: ReactNode;
  };
}
