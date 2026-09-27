import {
  createContext,
  isValidElement,
  use,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { arrangeAvatarGroup, type AvatarGroupLayout, type AvatarGroupStacking } from './arrange';
import { messages } from '../../../internal/messages';
import { resolveState, type StateValue } from '../../../internal/state-props';
import { invariant, tv } from '../../../utils';
import { Avatar } from '../avatar';
import { AvatarCutoutContext, AvatarGroupContext, type AvatarShape } from '../avatar/context';

import type { IdsSize } from '../../../tokens/types';

export type { AvatarGroupLayout, AvatarGroupStacking } from './arrange';

type OverflowContextValue = {
  count: number;
  label: string;
  names: string[];
  styles: ReturnType<typeof AvatarGroup.Style>;
};

const OverflowContext = createContext<OverflowContextValue | null>(null);

export function AvatarGroup({
  max,
  total,
  layout = 'stack',
  stacking = 'first-on-top',
  size = 'standard',
  shape = 'circle',
  overflowLabel = messages.avatarGroup.overflow,
  className,
  style,
  children,
  ...rest
}: AvatarGroup.Props) {
  const { items, visibleCount, hidden, hiddenNames } = arrangeAvatarGroup({
    children,
    max,
    total,
    layout,
    stacking,
    isOverflow: (node) => isValidElement(node) && node.type === AvatarGroup.Overflow,
    nameOf: (node) => {
      if (!isValidElement<Avatar.Props>(node) || node.type !== Avatar) return undefined;
      return node.props.name ?? node.props.alt ?? node.props['aria-label'];
    },
  });
  const state: AvatarGroup.State = { visible: visibleCount, hidden, layout, stacking, size, shape };
  const styles = AvatarGroup.Style({ layout, size });

  return (
    <AvatarGroupContext value={{ size, shape }}>
      <OverflowContext
        value={{ count: hidden, label: overflowLabel(hidden), names: hiddenNames, styles }}
      >
        <div
          role="group"
          {...rest}
          data-avatar-group=""
          data-layout={layout}
          data-stacking={stacking}
          data-size={size}
          className={styles.root({ className: resolveState(className, state) })}
          style={resolveState(style, state)}
        >
          {items.map(({ node, cutout, overflow }, index) => (
            <AvatarCutoutContext
              key={overflow ? 'overflow' : isValidElement(node) ? node.key : index}
              value={cutout}
            >
              {node ?? <AvatarGroup.Overflow />}
            </AvatarCutoutContext>
          ))}
        </div>
      </OverflowContext>
    </AvatarGroupContext>
  );
}

export namespace AvatarGroup {
  export type Layout = AvatarGroupLayout;
  export type Stacking = AvatarGroupStacking;

  export type State = {
    visible: number;
    hidden: number;
    layout: AvatarGroupLayout;
    stacking: AvatarGroupStacking;
    size: IdsSize;
    shape: AvatarShape;
  };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style' | 'children'> & {
    max?: number;
    total?: number;
    layout?: AvatarGroupLayout;
    stacking?: AvatarGroupStacking;
    size?: IdsSize;
    shape?: AvatarShape;
    overflowLabel?: (count: number) => string;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: ReactNode;
  };

  export function Overflow({
    className,
    style,
    children,
    'aria-label': ariaLabel,
    ...rest
  }: Overflow.Props) {
    const overflow = use(OverflowContext);
    invariant(overflow, '`<AvatarGroup.Overflow>` must be used inside `<AvatarGroup>`.');
    if (overflow.count <= 0) return null;

    const state: Overflow.State = { count: overflow.count };
    const digits = String(overflow.count).length;
    return (
      <Avatar
        // Hovering the +N lists who it stands for.
        title={overflow.names.length > 0 ? overflow.names.join(', ') : undefined}
        {...rest}
        alt={ariaLabel ?? overflow.label}
        data-avatar-group-overflow=""
        className={overflow.styles.overflow({
          digits: digits <= 2 ? 'short' : digits === 3 ? 'medium' : 'long',
          className: resolveState(className, state),
        })}
        style={resolveState(style, state)}
      >
        <Avatar.Fallback delay={0}>
          {/* Without a direction of its own, "+2" is laid out as "2+" in right-to-left text. */}
          {resolveState(children, state) ?? <span dir="ltr">+{overflow.count}</span>}
        </Avatar.Fallback>
      </Avatar>
    );
  }

  export namespace Overflow {
    export type State = { count: number };

    export type Props = Omit<
      ComponentProps<'span'>,
      'className' | 'style' | 'children' | 'role'
    > & {
      className?: StateValue<string | undefined, State>;
      style?: StateValue<CSSProperties | undefined, State>;
      children?: StateValue<ReactNode, State>;
    };
  }

  export const Style = tv({
    slots: {
      // --ag-overlap and --ag-gap are read by each avatar's cut-out mask.
      root: 'inline-flex items-center [--ag-gap:2px]',
      overflow: 'text-(--ids-color-on-surface) tabular-nums',
    },
    variants: {
      // "+125" would touch the curve of a circle at the size that suits "+2".
      digits: {
        short: { overflow: '[&_[data-avatar-fallback]]:text-[length:max(9px,36cqi)]' },
        medium: { overflow: '[&_[data-avatar-fallback]]:text-[length:max(7px,28cqi)]' },
        long: { overflow: '[&_[data-avatar-fallback]]:text-[length:max(6px,22cqi)]' },
      },
      layout: {
        stack: { root: '[&>*:not(:first-child)]:-ms-(--ag-overlap)' },
        inline: {},
      } satisfies Record<AvatarGroupLayout, object>,
      size: {
        standard: { root: '[--ag-overlap:--spacing(2.5)]' },
        tiny: { root: '[--ag-overlap:--spacing(1.5)]' },
      } satisfies Record<IdsSize, object>,
    },
    compoundVariants: [
      { layout: 'inline', size: 'standard', class: { root: 'gap-1.5' } },
      { layout: 'inline', size: 'tiny', class: { root: 'gap-1' } },
    ],
    defaultVariants: { layout: 'stack', size: 'standard', digits: 'short' },
  });
}
