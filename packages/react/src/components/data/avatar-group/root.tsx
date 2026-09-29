'use client';

import { createContext, isValidElement, use } from 'react';

import { arrangeAvatarGroup } from './arrange';
import { avatarGroupStyle } from './style';
import { messages } from '../../../internal/messages';
import { resolveState } from '../../../internal/state-props';
import { invariant } from '../../../utils';
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
    isOverflow: (node) => isValidElement(node) && node.type === AvatarGroupOverflow,
    nameOf: (node) => {
      if (
        !isValidElement<Avatar.Props>(node) ||
        !avatarAsWrittenOrServerRendered.includes(node.type)
      )
        return undefined;
      return node.props.name ?? node.props.alt ?? node.props['aria-label'];
    },
  });
  const state: AvatarGroup.State = { visible: visibleCount, hidden, layout, stacking, size, shape };
  const styles = avatarGroupStyle({ layout, size });

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
              {node ?? <AvatarGroupOverflow />}
            </AvatarCutoutContext>
          ))}
        </div>
      </OverflowContext>
    </AvatarGroupContext>
  );
}

export function AvatarGroupOverflow({
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
