'use client';

import { cloneElement, Fragment, isValidElement, use, type ComponentProps } from 'react';

import { ScrollAreaContext } from './context';
import { scrollAreaStyle } from './style';
import { invariant, mergeProps, mergeRefs } from '../../../utils';

export type ScrollAreaViewportProps = ComponentProps<'div'> & { asChild?: boolean };

export function ScrollAreaViewport({
  asChild = false,
  children,
  className,
  tabIndex,
  ref,
  ...props
}: ScrollAreaViewportProps) {
  const c = use(ScrollAreaContext);
  invariant(c, '`<ScrollArea.Viewport>` must be used inside `<ScrollArea>`.');

  const { area } = c;
  const styles = scrollAreaStyle({ scrolls: c.scrolls });

  const own = {
    ...props,
    // eslint-disable-next-line react-hooks/refs
    ref: mergeRefs(ref, area.setViewport),
    tabIndex: tabIndex ?? (area.tabStop ? 0 : undefined),
    'data-scroll-area-viewport': '',
    'data-tab-stop': area.tabStop ? '' : undefined,
    className: styles.viewport({ className }),
  };

  if (!asChild) return <div {...own}>{children}</div>;

  invariant(
    isValidElement<Record<string, unknown>>(children) && children.type !== Fragment,
    '`<ScrollArea.Viewport asChild>` requires one element to become the scrolling element.',
  );
  return cloneElement(children, mergeProps(own, children.props));
}

ScrollAreaViewport.displayName = 'ScrollArea.Viewport';
