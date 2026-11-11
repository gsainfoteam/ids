'use client';

import { isValidElement, useLayoutEffect, type ComponentProps } from 'react';

import { useMessageScrollerContext } from './context';
import { messageScrollerStyle } from './style';
import { flattenFragments, mergeRefs } from '../../../utils';

export type MessageScrollerListProps = ComponentProps<'ol'>;

export function MessageScrollerList({
  className,
  children,
  ref,
  ...props
}: MessageScrollerListProps) {
  const scroll = useMessageScrollerContext('MessageScroller.List');
  const styles = messageScrollerStyle();

  useLayoutEffect(() => {
    scroll.contentChanged();
  });

  return (
    <ol
      {...props}
      ref={mergeRefs(ref, scroll.setList)}
      data-message-scroller-list=""
      className={styles.list({ className })}
    >
      {flattenFragments(children).map((child, index) => (
        <li
          key={isValidElement(child) && child.key !== null ? child.key : index}
          data-message-scroller-item=""
          className={styles.item()}
        >
          {child}
        </li>
      ))}
    </ol>
  );
}

MessageScrollerList.displayName = 'MessageScroller.List';
