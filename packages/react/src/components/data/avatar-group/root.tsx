'use client';

import { createContext, isValidElement, use, type ReactElement } from 'react';

import { arrangeAvatarGroup } from './lib/arrange';
import { avatarGroupStyle } from './style';
import { resolveState } from '../../../internal/lib/state-props';
import { useInternalTranslate } from '../../../internal/translate';
import { elementTypeOf, invariant } from '../../../utils';
import { Avatar } from '../avatar';
import { AvatarCutoutContext, AvatarGroupContext } from '../avatar/context';
import { AvatarRoot } from '../avatar/root';

import type { AvatarGroup } from '.';

type OverflowContextValue = {
  count: number;
  label: string;
  names: string[];
  styles: ReturnType<typeof avatarGroupStyle>;
};

const OverflowContext = createContext<OverflowContextValue | null>(null);

const avatarAsWrittenOrServerRendered: unknown[] = [Avatar, AvatarRoot];

export function AvatarGroupRoot({
  layout = 'stack',
  stacking = 'first-on-top',
  size = 'standard',
  className,
  style,
  children,
  ...rest
}: AvatarGroup.Props) {
  const t = useInternalTranslate();

  const { items, visibleCount, hidden, hiddenNames } = arrangeAvatarGroup({
    children,
    layout,
    stacking,
    isOverflow: (node): node is ReactElement<AvatarGroup.Overflow.Props> =>
      isValidElement(node) && elementTypeOf(node) === AvatarGroupOverflow,
    nameOf: (node) => {
      if (
        !isValidElement<Avatar.Props>(node) ||
        !avatarAsWrittenOrServerRendered.includes(elementTypeOf(node))
      )
        return undefined;
      return node.props.name ?? node.props.alt ?? node.props['aria-label'];
    },
  });
  const state: AvatarGroup.State = { visible: visibleCount, hidden, layout, stacking, size };
  const styles = avatarGroupStyle({ layout, size });

  return (
    <AvatarGroupContext value={{ size }}>
      <OverflowContext
        value={{
          count: hidden,
          label: t('avatarGroup.overflow', { count: hidden }),
          names: hiddenNames,
          styles,
        }}
      >
        <ul
          {...rest}
          data-avatar-group=""
          data-layout={layout}
          data-stacking={stacking}
          data-size={size}
          className={styles.root({ className: resolveState(className, state) })}
          style={resolveState(style, state)}
        >
          {items.map(({ node, cutout, overflow }, index) => (
            <li
              key={overflow ? 'overflow' : isValidElement(node) ? node.key : index}
              className={styles.item()}
            >
              <AvatarCutoutContext value={cutout}>
                {node ?? <AvatarGroupOverflow />}
              </AvatarCutoutContext>
            </li>
          ))}
        </ul>
      </OverflowContext>
    </AvatarGroupContext>
  );
}

export function AvatarGroupOverflow({
  max: _max,
  total: _total,
  className,
  style,
  children,
  'aria-label': ariaLabel,
  ...rest
}: AvatarGroup.Overflow.Props) {
  const overflow = use(OverflowContext);
  invariant(overflow, '`<AvatarGroup.Overflow>` must be used inside `<AvatarGroup>`.');
  if (overflow.count <= 0) return null;

  const state: AvatarGroup.Overflow.State = { count: overflow.count };
  const digits = String(overflow.count).length;
  return (
    <Avatar
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
        {resolveState(children, state) ?? <span dir="ltr">+{overflow.count}</span>}
      </Avatar.Fallback>
    </Avatar>
  );
}

AvatarGroupOverflow.displayName = 'AvatarGroup.Overflow';
