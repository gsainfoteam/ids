'use client';

import { use } from 'react';

import { ArrowDownIcon } from '@heroicons/react/24/outline';

import { MessageScrollerViewContext, useMessageScrollerContext } from './context';
import { messageScrollerStyle } from './style';
import { useTranslate } from '../../../internal/translate';
import { Button } from '../../action/button';

export type MessageScrollerScrollToBottomProps = Button.Props;

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

  const ownContent = children !== undefined;
  const iconOnly = !ownContent && unseen === 0;
  const styles = messageScrollerStyle({ opaque: variant === 'outline', iconOnly });

  const defaultLabel =
    unseen > 0
      ? t('messageScroller.scrollToBottomUnseen', { count: unseen })
      : t('messageScroller.scrollToBottom');

  return (
    <Button
      {...props}
      variant={variant}
      colorScheme={colorScheme}
      size={size}
      aria-label={label ?? (ownContent ? undefined : defaultLabel)}
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
      {ownContent ? (
        children
      ) : (
        <>
          <ArrowDownIcon />
          {unseen > 0 ? t('messageScroller.unseen', { count: unseen }) : null}
        </>
      )}
    </Button>
  );
}

MessageScrollerScrollToBottom.displayName = 'MessageScroller.ScrollToBottom';
