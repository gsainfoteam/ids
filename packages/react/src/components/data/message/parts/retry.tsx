'use client';

import { use } from 'react';

import { ArrowPathIcon } from '@heroicons/react/16/solid';

import { useInternalTranslate } from '../../../../internal/translate';
import { Button } from '../../../action/button';
import { IconButton } from '../../../action/icon-button';
import { MessageRetryPlacementContext } from '../context';

export type MessageRetryProps = { onClick?: () => void; disabled?: boolean };

export function MessageRetry({ onClick, disabled }: MessageRetryProps) {
  const t = useInternalTranslate();
  const placement = use(MessageRetryPlacementContext);
  if (placement === null) return null;

  if (placement === 'side')
    return (
      <IconButton
        size="tiny"
        variant="outline"
        aria-label={t('message.retry')}
        icon={<ArrowPathIcon />}
        disabled={disabled}
        onClick={() => onClick?.()}
      />
    );

  return (
    <Button size="tiny" variant="outline" disabled={disabled} onClick={() => onClick?.()}>
      <ArrowPathIcon aria-hidden="true" />
      {t('message.retry')}
    </Button>
  );
}

MessageRetry.displayName = 'Message.Retry';
