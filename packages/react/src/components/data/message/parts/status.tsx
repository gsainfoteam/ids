'use client';

import { ExclamationCircleIcon } from '@heroicons/react/16/solid';

import { useInternalTranslate } from '../../../../internal/translate';
import { Marker } from '../../../feedback/marker';
import { useInternalMessageContext } from '../context';

export type MessageStatusProps = { value: 'pending' | 'error' };

export function MessageStatus(_props: MessageStatusProps) {
  const t = useInternalTranslate();
  const { styles, status, retryBesideTheFailure } = useInternalMessageContext('Message.Status');
  if (status !== 'error') return null;

  return (
    <div data-message-failure="" className={styles.failure()}>
      <Marker size="tiny" role="status" className={styles.failureText()}>
        <ExclamationCircleIcon aria-hidden="true" />
        {t('message.error')}
      </Marker>
      {retryBesideTheFailure}
    </div>
  );
}

MessageStatus.displayName = 'Message.Status';
