'use client';

import { useRef, useState } from 'react';

import { useMessageContext } from './context';
import { usePresence } from '../../../internal/overlay';
import { useTranslate } from '../../../internal/translate';
import { Badge } from '../badge';

function isUnread(unread: number | boolean | undefined): unread is number | true {
  return unread === true || (typeof unread === 'number' && unread > 0);
}

export function MessageUnread() {
  const t = useTranslate();
  const { styles, unread, status } = useMessageContext('Message');
  const ref = useRef<HTMLSpanElement>(null);
  const showing = status === 'sent' && isUnread(unread);
  const [lastShown, setLastShown] = useState(showing ? unread : undefined);
  if (showing && lastShown !== unread) setLastShown(unread);
  const { mounted, ending } = usePresence(showing, { elements: () => [ref.current] });

  if (!mounted || !isUnread(lastShown)) return null;

  return (
    <span
      ref={ref}
      data-message-unread=""
      data-ending-style={ending ? '' : undefined}
      className={styles.unread()}
    >
      {lastShown === true ? (
        <Badge dot colorScheme="primary" aria-hidden="true" />
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
