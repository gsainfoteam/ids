'use client';

import { useInternalTranslate } from '../../../../internal/translate';
import { Chip } from '../../chip';
import { useInternalMessageContext } from '../context';
import { useInternalMessageUnread } from '../hooks/use-message-unread';
import { isUnread } from '../lib/unread';

export function MessageUnread() {
  const t = useInternalTranslate();
  const { styles, unread, status } = useInternalMessageContext('Message');
  const showing = status === 'sent' && isUnread(unread);
  const { ref, lastShown, mounted, ending } = useInternalMessageUnread(showing, unread);

  if (!mounted || !isUnread(lastShown)) return null;

  return (
    <span
      ref={ref}
      data-message-unread=""
      data-ending-style={ending ? '' : undefined}
      className={styles.unread()}
    >
      {lastShown === true ? (
        <Chip variant="solid" colorScheme="primary" aria-hidden="true" />
      ) : (
        <span aria-hidden="true">{lastShown}</span>
      )}
      {!ending && (
        <span className={styles.hint()}>
          {lastShown === true ? t('message.unread') : t('message.unreadBy', { count: lastShown })}
        </span>
      )}
    </span>
  );
}
