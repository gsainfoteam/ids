'use client';

import { useInternalMessageContext } from '../context';
import { MessageCopy } from './copy';
import { useInternalTranslate } from '../../../../internal/translate';
import { ButtonGroup } from '../../../action/button-group';

export type MessageActionsProps = ButtonGroup.Props;

export function MessageActions({ className, children, ...props }: MessageActionsProps) {
  const t = useInternalTranslate();
  const { styles } = useInternalMessageContext('Message.Actions');

  return (
    <ButtonGroup
      size="tiny"
      variant="outline"
      aria-label={t('message.actions')}
      {...props}
      data-message-actions=""
      className={styles.actions({ className })}
    >
      <div className={styles.actionItems()}>{children ?? <MessageCopy />}</div>
    </ButtonGroup>
  );
}

MessageActions.displayName = 'Message.Actions';
