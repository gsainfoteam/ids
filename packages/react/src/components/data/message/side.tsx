'use client';

import { ArrowPathIcon } from '@heroicons/react/16/solid';

import { useMessageContext } from './context';
import { MessageTime } from './time';
import { MessageUnread } from './unread';
import { useTranslate } from '../../../internal/translate';
import { IconButton } from '../../action/icon-button';

export function MessageSide({ onRetry }: { onRetry: (() => void) | undefined }) {
  const t = useTranslate();
  const { styles, status, time, last, timeIn } = useMessageContext('Message');
  const shownTime = timeIn === 'side' && last && status !== 'error' ? time : undefined;

  return (
    <div data-message-side="" className={styles.side()}>
      {status === 'error' && onRetry && (
        <IconButton
          size="tiny"
          variant="outline"
          aria-label={t('message.retry')}
          icon={<ArrowPathIcon />}
          onClick={() => onRetry()}
        />
      )}
      <MessageUnread />
      {status === 'pending' && <span className={styles.hint()}>{t('common.sending')}</span>}
      {shownTime !== undefined && <MessageTime time={shownTime} />}
    </div>
  );
}
