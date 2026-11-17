'use client';

import { use } from 'react';

import { ArrowDownIcon } from '@heroicons/react/24/outline';

import { MessageScrollerViewContext, useMessageScrollerContext } from './context';
import { messageScrollerStyle } from './style';
import { useTranslate } from '../../../internal/translate';
import { Button } from '../../action/button';

export type MessageScrollerJumpProps = Button.Props;

export function MessageScrollerJump({
  variant = 'outline',
  colorScheme = 'neutral',
  size = 'tiny',
  className,
  children,
  onClick,
  'aria-label': label,
  ...props
}: MessageScrollerJumpProps) {
  const scroll = useMessageScrollerContext('MessageScroller.Jump');
  const { atEnd, unseen } = use(MessageScrollerViewContext);
  const t = useTranslate();

  const ownContent = children !== undefined;
  const iconOnly = !ownContent && unseen === 0;
  const styles = messageScrollerStyle({ opaque: variant === 'outline', iconOnly });

  const defaultLabel =
    unseen > 0 ? t('messageScroller.jumpUnseen', { count: unseen }) : t('messageScroller.jump');

  return (
    <Button
      {...props}
      variant={variant}
      colorScheme={colorScheme}
      size={size}
      aria-label={label ?? (ownContent ? undefined : defaultLabel)}
      inert={atEnd}
      data-hidden={atEnd ? '' : undefined}
      data-message-scroller-jump=""
      className={(state) =>
        styles.jump({
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

MessageScrollerJump.displayName = 'MessageScroller.Jump';
