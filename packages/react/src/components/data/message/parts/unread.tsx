'use client';

import { useRef, useState } from 'react';

import { useInternalPresence } from '../../../../internal/overlay';
import { useInternalTranslate } from '../../../../internal/translate';
import { Chip } from '../../chip';
import { useInternalMessageContext } from '../context';

function isUnread(unread: number | boolean | undefined): unread is number | true {
  return unread === true || (typeof unread === 'number' && unread > 0);
}

export function MessageUnread() {
  const t = useInternalTranslate();
  const { styles, unread, status } = useInternalMessageContext('Message');
  const ref = useRef<HTMLSpanElement>(null);
  const showing = status === 'sent' && isUnread(unread);
  const [lastShown, setLastShown] = useState(showing ? unread : undefined);
  if (showing && lastShown !== unread) setLastShown(unread);
  const { mounted, ending } = useInternalPresence(showing, { elements: () => [ref.current] });

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
