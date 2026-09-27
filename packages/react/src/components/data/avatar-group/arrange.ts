import { isValidElement, type ReactNode } from 'react';

import { flattenFragments } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

import type { AvatarCutout } from '../avatar/context';

export type AvatarGroupLayout = 'stack' | 'inline';
export type AvatarGroupStacking = 'first-on-top' | 'last-on-top';

export type AvatarGroupItem = { node: ReactNode; cutout: AvatarCutout | undefined };

export function arrangeAvatarGroup({
  children,
  max,
  total,
  layout,
  stacking,
  isOverflow,
  nameOf,
}: {
  children: ReactNode;
  max: number | undefined;
  total: number | undefined;
  layout: AvatarGroupLayout;
  stacking: AvatarGroupStacking;
  isOverflow: (node: ReactNode) => boolean;
  nameOf: (node: ReactNode) => string | undefined;
}) {
  if (isDevelopment && max !== undefined && !(max >= 1))
    console.warn('[IDS] AvatarGroup: max must be at least 1.');
  const limit = max === undefined ? Infinity : Math.max(1, Math.floor(max));

  const nodes = flattenFragments(children).filter((node) => isValidElement(node));
  const overflowIndex = nodes.findIndex(isOverflow);
  const avatars = nodes.filter((_, index) => index !== overflowIndex);
  const visible = avatars.slice(0, limit);
  // `total` covers people the page did not render, such as a server that returns the first few
  // avatars and a count.
  const hidden = Math.max(total ?? 0, avatars.length) - visible.length;
  // The +N can say who it stands for, but only when every one of them was rendered and named;
  // a partial list would read as the whole.
  const names = avatars.slice(visible.length).map(nameOf);
  const hiddenNames = names.length === hidden && names.every(Boolean) ? (names as string[]) : [];

  // The overflow indicator sits where it was declared, or last when it was left out.
  const overflowFirst = overflowIndex === 0;
  const ordered: { node: ReactNode | null }[] = visible.map((node) => ({ node }));
  if (hidden > 0) {
    const overflow = { node: overflowIndex === -1 ? null : nodes[overflowIndex] };
    if (overflowFirst) ordered.unshift(overflow);
    else ordered.push(overflow);
  }

  // In a stack each avatar is cut where its neighbour overlaps it: on the start side when the
  // earlier avatar is on top, on the end side when the later one is.
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
