'use client';

import { use } from 'react';

import { ArrowDownIcon } from '@heroicons/react/24/outline';

import { MessageScrollerViewContext, useMessageScrollerContext } from './context';
import { messageScrollerStyle } from './style';
import { useTranslate } from '../../../internal/translate';
import { FloatingButton } from '../../action/floating-button';
import { Badge } from '../../data/badge';

export type MessageScrollerScrollToBottomProps = FloatingButton.Props;

export function MessageScrollerScrollToBottom({
  variant = 'outline',
  colorScheme = 'neutral',
  size = 'tiny',
  className,
  children,
  onClick,
  'aria-label': label,
  ...props
}: MessageScrollerScrollToBottomProps) {
  const scroll = useMessageScrollerContext('MessageScroller.ScrollToBottom');
  const { atEnd, unseen } = use(MessageScrollerViewContext);
  const t = useTranslate();
  const styles = messageScrollerStyle();

  const defaultLabel =
    unseen > 0
      ? t('messageScroller.scrollToBottomUnseen', { count: unseen })
      : t('messageScroller.scrollToBottom');

  return (
    <FloatingButton
      {...props}
      variant={variant}
      colorScheme={colorScheme}
      size={size}
      aria-label={label ?? (children === undefined ? defaultLabel : undefined)}
      inert={atEnd}
      data-hidden={atEnd ? '' : undefined}
      data-message-scroller-scroll-to-bottom=""
      className={(state) =>
        styles.scrollToBottom({
          className: typeof className === 'function' ? className(state) : className,
        })
      }
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) scroll.scrollToBottom();
      }}
    >
      {children ?? (
        <Badge content={unseen}>
          <ArrowDownIcon />
        </Badge>
      )}
    </FloatingButton>
  );
}

MessageScrollerScrollToBottom.displayName = 'MessageScroller.ScrollToBottom';
