'use client';

import { use } from 'react';

import { ArrowDownIcon } from '@heroicons/react/24/outline';

import { useInternalTranslate } from '../../../../internal/translate';
import { Button } from '../../../action/button';
import { MessageScrollerViewContext, useInternalMessageScrollerContext } from '../context';
import { messageScrollerStyle } from '../style';

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
  const scroll = useInternalMessageScrollerContext('MessageScroller.Jump');
  const { atEnd, unseen } = use(MessageScrollerViewContext);
  const t = useInternalTranslate();

  const ownContent = children !== undefined;
  const iconOnly = !ownContent && unseen === 0;
  const styles = messageScrollerStyle({ iconOnly });

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
