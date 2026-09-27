import {
  isValidElement,
  useId,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { invariant, tv } from '../../../utils';
import { Slot } from '../../utility/slot';

function resolve<T, S>(value: T | ((state: S) => T), state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

export function Divider({
  orientation = 'horizontal',
  align = 'center',
  decorative = false,
  asChild = false,
  className,
  style,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: Divider.Props) {
  const labelId = useId();
  // With asChild the single child becomes the line itself, so it cannot also carry a label.
  const labelled = !asChild && children != null && children !== false && children !== '';
  invariant(
    !asChild || isValidElement(children),
    '`Divider asChild` requires one element to render as, such as an `li` or `hr`.',
  );
  const state: Divider.State = { orientation, labelled, align, decorative };
  const { root, label } = Divider.Style({ orientation, labelled, align });

  // A separator's children are presentational, so the label names it by reference instead of
  // being read as content.
  const naming = decorative
    ? { 'aria-hidden': true }
    : {
        role: 'separator',
        'aria-orientation': orientation,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledBy ?? (labelled && !ariaLabel ? labelId : undefined),
      };

  const rootProps = {
    ...rest,
    ...naming,
    'data-divider': '',
    'data-orientation': orientation,
    'data-labelled': labelled ? '' : undefined,
    'data-align': labelled ? align : undefined,
    className: root({ className: resolve(className, state) }),
    style: resolve(style, state),
  };

  if (asChild) return <Slot {...rootProps}>{children}</Slot>;
  return (
    <div {...rootProps}>
      {labelled && (
        <span id={labelId} className={label()}>
          {children}
        </span>
      )}
    </div>
  );
}

export namespace Divider {
  export type Orientation = 'horizontal' | 'vertical';
  export type Align = 'start' | 'center' | 'end';

  export type State = {
    orientation: Orientation;
    labelled: boolean;
    align: Align;
    decorative: boolean;
  };

  export type Props = Omit<
    ComponentProps<'div'>,
    'role' | 'aria-orientation' | 'aria-hidden' | 'tabIndex' | 'className' | 'style'
  > & {
    orientation?: Orientation;
    align?: Align;
    decorative?: boolean;
    asChild?: boolean;
    className?: string | ((state: State) => string | undefined);
    style?: CSSProperties | ((state: State) => CSSProperties | undefined);
    children?: ReactNode;
  };

  // A labelled divider draws its two lines as ::before and ::after around the label, so the
  // lines follow the writing direction and `align` only hides one of them.
  export const Style = tv({
    slots: {
      // An hr drawn through asChild keeps the base style's 1px top border, which would cover the
      // line's fill in the text color.
      root: 'shrink-0 border-0',
      label: 'min-w-0 text-center text-caption-c1-medium text-(--ids-color-on-muted)',
    },
    variants: {
      orientation: { horizontal: {}, vertical: {} } satisfies Record<Orientation, object>,
      labelled: {
        false: { root: 'bg-(--ids-color-border)' },
        true: {
          root: [
            'flex items-center',
            'before:shrink before:bg-(--ids-color-border) after:shrink after:bg-(--ids-color-border)',
          ],
        },
      },
      align: { start: {}, center: {}, end: {} } satisfies Record<Align, object>,
    },
    compoundVariants: [
      { labelled: true, align: 'start', class: { root: 'before:hidden' } },
      { labelled: true, align: 'end', class: { root: 'after:hidden' } },
      { orientation: 'horizontal', labelled: false, class: { root: 'h-px w-full' } },
      // Outside a flex row nothing stretches it, so it keeps at least one line of height.
      {
        orientation: 'vertical',
        labelled: false,
        class: { root: 'min-h-[1lh] w-px self-stretch' },
      },
      {
        orientation: 'horizontal',
        labelled: true,
        class: {
          root: 'w-full gap-3 before:h-px before:min-w-4 before:flex-1 after:h-px after:min-w-4 after:flex-1',
        },
      },
      {
        orientation: 'vertical',
        labelled: true,
        class: {
          root: 'flex-col gap-2 self-stretch before:min-h-2 before:w-px before:flex-1 after:min-h-2 after:w-px after:flex-1',
        },
      },
    ],
    defaultVariants: { orientation: 'horizontal', labelled: false, align: 'center' },
  });
}
