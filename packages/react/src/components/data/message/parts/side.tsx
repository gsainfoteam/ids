'use client';

import { type ReactNode } from 'react';

import { MessageRetryPlacementContext, useInternalMessageContext } from '../context';
import { MessageTime } from './time';
import { MessageUnread } from './unread';
import { useInternalTranslate } from '../../../../internal/translate';

export function MessageSide({ retry }: { retry: ReactNode }) {
  const t = useInternalTranslate();
  const { styles, status, time, last, timeIn } = useInternalMessageContext('Message');
  const shownTime = timeIn === 'side' && last && status !== 'error' ? time : undefined;

  return (
    <div data-message-side="" className={styles.side()}>
      {status === 'error' && retry && (
        <MessageRetryPlacementContext value="side">{retry}</MessageRetryPlacementContext>
      )}
      <MessageUnread />
      {status === 'pending' && <span className={styles.hint()}>{t('common.sending')}</span>}
      {shownTime !== undefined && <MessageTime time={shownTime} />}
    </div>
  );
}
