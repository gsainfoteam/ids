'use client';

import { isValidElement, type ComponentProps } from 'react';

import { flattenFragments, mergeRefs } from '../../../../utils';
import { useInternalMessageScrollerContext } from '../context';
import { useInternalMessageScrollerListChange } from '../hooks/use-message-scroller-list-change';
import { messageScrollerStyle } from '../style';

export type MessageScrollerListProps = ComponentProps<'ol'>;

export function MessageScrollerList({
  className,
  children,
  ref,
  ...props
}: MessageScrollerListProps) {
  const scroll = useInternalMessageScrollerContext('MessageScroller.List');
  const styles = messageScrollerStyle();

  useInternalMessageScrollerListChange(scroll);

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
