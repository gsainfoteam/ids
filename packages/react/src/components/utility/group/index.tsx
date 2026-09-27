import { createContext, use, useEffect, type ComponentProps, type ReactNode } from 'react';

import { invariant, tv } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { Divider } from '../../layout/divider';
import { Slot } from '../slot';

import type { IdsSize, IdsVariant } from '../../../tokens/types';

export type GroupOrientation = 'horizontal' | 'vertical';

export type GroupContextValue = {
  orientation: GroupOrientation;
  attached: boolean;
  size?: IdsSize;
  variant?: IdsVariant;
  separator: 'semantic' | 'decorative';
};

const GroupContext = createContext<GroupContextValue | null>(null);

export function useGroupContext() {
  return use(GroupContext);
}

export function useGroupNameWarning(
  component: string,
  props: { 'aria-label'?: string; 'aria-labelledby'?: string },
) {
  const nested = useGroupContext() !== null;
  const named =
    (typeof props['aria-label'] === 'string' && props['aria-label'].trim() !== '') ||
    props['aria-labelledby'] != null;
  useEffect(() => {
    if (isDevelopment && !named && !nested)
      console.warn(
        `[IDS] ${component}: add aria-label or aria-labelledby so a screen reader can say what the group is for.`,
      );
  }, [component, named, nested]);
}

export function Group({
  orientation = 'horizontal',
  attached = true,
  size,
  variant,
  separator = 'semantic',
  className,
  children,
  ...rest
}: Group.Props) {
  const parent = useGroupContext();
  const context: GroupContextValue = {
    orientation,
    attached,
    size: size ?? parent?.size,
    variant: variant ?? parent?.variant,
    separator,
  };
  return (
    <GroupContext value={context}>
      <div
        role="group"
        data-group=""
        data-orientation={orientation}
        data-size={context.size}
        {...rest}
        className={Group.Style({ orientation, attached }).root({ className })}
      >
        {children}
      </div>
    </GroupContext>
  );
}

export namespace Group {
  export type Props = ComponentProps<'div'> & {
    orientation?: GroupOrientation;
    attached?: boolean;
    size?: IdsSize;
    variant?: IdsVariant;
    separator?: GroupContextValue['separator'];
    children?: ReactNode;
  };

  export type SeparatorProps = Omit<
    ComponentProps<'div'>,
    'children' | 'role' | 'aria-orientation' | 'aria-hidden' | 'tabIndex'
  >;

  export type TextProps = ComponentProps<'div'> & { asChild?: boolean };

  export function Separator({ className, ...props }: SeparatorProps) {
    const group = useGroupContext();
    invariant(group, 'Group.Separator must be rendered inside ButtonGroup or ToggleGroup.');
    return (
      <Divider
        {...props}
        orientation={group.orientation === 'horizontal' ? 'vertical' : 'horizontal'}
        decorative={group.separator === 'decorative'}
        data-group-separator=""
        className={Style({ orientation: group.orientation, attached: group.attached }).separator({
          className,
        })}
      />
    );
  }

  export function Text({ asChild, className, ...props }: TextProps) {
    const group = useGroupContext();
    const Root = asChild ? Slot : 'div';
    return (
      <Root
        data-variant="outline"
        {...props}
        className={Style({ size: group?.size ?? 'standard' }).text({ className })}
      />
    );
  }

  export const Style = tv({
    slots: {
      root: [
        'relative flex w-fit items-stretch',
        '[&>:not(input)]:relative',
        '[&>[data-hovered]]:z-10 [&>[data-active]]:z-20 [&>[data-focus-visible]]:z-30',
        'has-[>[data-group]]:gap-2',
      ],
      separator: 'relative z-25',
      text: [
        'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-standard shadow-xs',
        'bg-(--ids-color-muted) text-(--ids-color-on-surface)',
        'inset-ring-1 inset-ring-(--ids-color-border)',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
      ],
    },
    variants: {
      orientation: {
        horizontal: { root: 'flex-row' },
        vertical: { root: 'flex-col' },
      } satisfies Record<GroupOrientation, object>,
      attached: {
        true: {},
        false: { root: 'gap-2' },
      },
      size: {
        standard: {
          text: "px-4 text-button-standard [&_svg:not([class*='size-'])]:size-(--ids-size-icon-standard)",
        },
        tiny: {
          text: "px-3 text-button-tiny [&_svg:not([class*='size-'])]:size-(--ids-size-icon-tiny)",
        },
      } satisfies Record<IdsSize, object>,
    },
    compoundVariants: [
      {
        orientation: 'horizontal',
        attached: true,
        class: {
          root: [
            '[&>:not(input)~*]:rounded-s-none [&>*:has(~:not(input))]:rounded-e-none',
            '[&>[data-variant=outline]+[data-variant=outline]]:-ms-px',
          ],
          separator: '-mx-px',
        },
      },
      {
        orientation: 'vertical',
        attached: true,
        class: {
          root: [
            '[&>:not(input)~*]:rounded-t-none [&>*:has(~:not(input))]:rounded-b-none',
            '[&>[data-variant=outline]+[data-variant=outline]]:-mt-px',
          ],
          separator: '-my-px',
        },
      },
    ],
    defaultVariants: {
      orientation: 'horizontal',
      attached: true,
      size: 'standard',
    },
  });
}
