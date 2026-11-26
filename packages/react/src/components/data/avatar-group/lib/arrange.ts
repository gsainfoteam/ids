import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { flattenFragments } from '../../../../utils';
import { isDevelopment } from '../../../../utils/dev';

import type { AvatarCutout } from '../../avatar/context';

export type AvatarGroupLayout = 'stack' | 'inline';
export type AvatarGroupStacking = 'first-on-top' | 'last-on-top';

export type AvatarGroupItem = { node: ReactNode; cutout: AvatarCutout | undefined };

type OverflowLimits = { max?: number; total?: number };

export function arrangeAvatarGroup({
  children,
  layout,
  stacking,
  isOverflow,
  nameOf,
}: {
  children: ReactNode;
  layout: AvatarGroupLayout;
  stacking: AvatarGroupStacking;
  isOverflow: (node: ReactNode) => node is ReactElement<OverflowLimits>;
  nameOf: (node: ReactNode) => string | undefined;
}) {
  const nodes = flattenFragments(children).filter((node) => isValidElement(node));
  const overflowIndex = nodes.findIndex(isOverflow);
  const overflowNode = nodes[overflowIndex];
  const { max, total } = overflowNode && isOverflow(overflowNode) ? overflowNode.props : {};
  if (isDevelopment && max !== undefined && !(max >= 1))
    console.warn('[IDS] AvatarGroup.Overflow: max must be at least 1.');
  const limit = max === undefined ? Infinity : Math.max(1, Math.floor(max));

  const avatars = nodes.filter((_, index) => index !== overflowIndex);
  const visible = avatars.slice(0, limit);
  const hidden = Math.max(total ?? 0, avatars.length) - visible.length;
  const names = avatars.slice(visible.length).map(nameOf);
  const namesCoverAllHidden = names.length === hidden && names.every(Boolean);
  const hiddenNames = namesCoverAllHidden ? (names as string[]) : [];

  const overflowFirst = overflowIndex === 0;
  const ordered: { node: ReactNode | null }[] = visible.map((node) => ({ node }));
  if (hidden > 0) {
    const overflow = { node: overflowNode ?? null };
    if (overflowFirst) ordered.unshift(overflow);
    else ordered.push(overflow);
  }

  const items = ordered.map(({ node }, index): AvatarGroupItem & { overflow: boolean } => {
    let cutout: AvatarCutout | undefined;
    if (layout === 'stack') {
      if (stacking === 'first-on-top' && index > 0) cutout = 'start';
      if (stacking === 'last-on-top' && index < ordered.length - 1) cutout = 'end';
    }
    return { node, cutout, overflow: node === null || isOverflow(node) };
  });

  return { items, visibleCount: visible.length, hidden, hiddenNames };
}
