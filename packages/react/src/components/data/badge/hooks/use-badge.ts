'use client';

import {
  cloneElement,
  Fragment,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from 'react';

import { elementTypeOf, flattenFragments, invariant } from '../../../../utils';
import { badgeDisplay } from '../lib/badge-count';
import { BADGE_MAX, BadgeIndicator, type BadgeIndicatorProps } from '../parts/indicator';

type Describable = ReactElement<{ 'aria-describedby'?: string }>;

const isIndicator = (node: ReactNode): node is ReactElement<BadgeIndicatorProps> =>
  isValidElement(node) && elementTypeOf(node) === BadgeIndicator;

export function useInternalBadge(children: ReactNode) {
  const indicatorId = `${useId()}-badge`;
  const nodes = flattenFragments(children);
  const indicator = nodes.find(isIndicator);
  const others = nodes.filter((node) => !isIndicator(node));
  const child = others[0];
  invariant(
    others.length === 1 && isValidElement(child),
    '`<Badge>` wraps exactly one element, with an optional `<Badge.Indicator>` beside it.',
  );

  const display = indicator
    ? badgeDisplay(
        indicator.props.count,
        indicator.props.children,
        indicator.props.max ?? BADGE_MAX,
      )
    : undefined;
  const describes =
    display !== undefined && !display.dot && indicator?.props['aria-label'] === undefined;
  const anchor =
    describes && child.type !== Fragment
      ? cloneElement(child as Describable, {
          'aria-describedby': [(child as Describable).props['aria-describedby'], indicatorId]
            .filter(Boolean)
            .join(' '),
        })
      : child;

  return { indicatorId, indicator, display, anchor };
}
