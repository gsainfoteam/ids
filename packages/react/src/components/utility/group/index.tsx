import { createContext, use, useEffect, type ComponentProps, type ReactNode } from 'react';

import { invariant, tv } from '../../../utils';
import { Slot } from '../slot';

import type { IdsSize, IdsVariant } from '../../../tokens/types';

export type GroupOrientation = 'horizontal' | 'vertical';

export type GroupContextValue = {
  orientation: GroupOrientation;
  attached: boolean;
  // Defaults for the controls inside; a control's own size or variant wins.
  size?: IdsSize;
  variant?: IdsVariant;
  // Inside a radiogroup only radios belong, so a separator there is drawn but not announced.
  separator: 'semantic' | 'decorative';
};

const GroupContext = createContext<GroupContextValue | null>(null);

export function useGroupContext() {
  return use(GroupContext);
}

// A group is announced by its name; without one a screen reader says only "group".
export function useGroupNameWarning(
  component: string,
  props: { 'aria-label'?: string; 'aria-labelledby'?: string },
) {
  const nested = useGroupContext() !== null;
  const named =
    (typeof props['aria-label'] === 'string' && props['aria-label'].trim() !== '') ||
    props['aria-labelledby'] != null;
  useEffect(() => {
    if (import.meta.env.DEV && !named && !nested)
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
  // A group of groups hands its size and variant down to the inner groups' controls.
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
    // Joined into one control (default), or spaced apart with each control keeping its corners.
    attached?: boolean;
    size?: IdsSize;
    variant?: IdsVariant;
    separator?: GroupContextValue['separator'];
    children?: ReactNode;
  };

  export type SeparatorProps = Omit<ComponentProps<'div'>, 'children'>;

  export type TextProps = ComponentProps<'div'> & { asChild?: boolean };

  // A drawn line between controls. Outline controls already show a border there, so the line
  // overlaps it by a pixel on each side and the seam stays one pixel wide.
  export function Separator({ className, ...props }: SeparatorProps) {
    const group = useGroupContext();
    invariant(group, 'Group.Separator must be rendered inside ButtonGroup or ToggleGroup.');
    const orientation: GroupOrientation =
      group.orientation === 'horizontal' ? 'vertical' : 'horizontal';
    const semantics =
      group.separator === 'semantic'
        ? { role: 'separator', 'aria-orientation': orientation }
        : { 'aria-hidden': true as const };
    return (
      <div
        {...semantics}
        data-group-separator=""
        data-orientation={orientation}
        {...props}
        className={Style({ orientation: group.orientation, attached: group.attached }).separator({
          className,
        })}
      />
    );
  }

  // A label or prefix inside the group (a unit, "https://"), drawn like an outline control so it
  // joins its neighbours' borders.
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
        // Joined controls overlap by a pixel, so the one under the pointer or focus comes to the
        // front and its border and focus ring are drawn whole. Hidden form inputs are left alone.
        '[&>:not(input)]:relative',
        '[&>[data-hovered]]:z-10 [&>[data-active]]:z-20 [&>[data-focus-visible]]:z-30',
        // A group of groups spaces them apart, and each inner group stays joined.
        'has-[>[data-group]]:gap-2',
      ],
      separator: 'relative z-25 shrink-0 self-stretch bg-(--ids-color-border)',
      text: [
        'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-standard shadow-xs',
        'bg-(--ids-color-muted) text-(--ids-color-on-surface)',
        'inset-ring-1 inset-ring-(--ids-color-border)',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
      ],
    },
    variants: {
      orientation: {
        horizontal: { root: 'flex-row', separator: 'w-px' },
        vertical: { root: 'flex-col', separator: 'h-px' },
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
    // Only the outer corners stay round. Every child after the first loses its start corners and
    // every child before the last its end corners; hidden inputs a group renders for its form value
    // come last and must not count as the last child. Logical corners keep this right in RTL.
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
