'use client';

import { useMessageContext } from './context';
import { MessageCopy } from './copy';
import { useTranslate } from '../../../internal/translate';
import { ButtonGroup } from '../../action/button-group';

export type MessageActionsProps = ButtonGroup.Props;

export function MessageActions({ className, children, ...props }: MessageActionsProps) {
  const t = useTranslate();
  const { styles } = useMessageContext('Message.Actions');

  return (
    <ButtonGroup
      attached={false}
      size="tiny"
      variant="outline"
      aria-label={t('message.actions')}
      {...props}
      data-message-actions=""
      className={styles.actions({ className })}
    >
      {children ?? <MessageCopy />}
    </ButtonGroup>
  );
}

MessageActions.displayName = 'Message.Actions';
