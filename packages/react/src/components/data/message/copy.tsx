'use client';

import { type ComponentProps, type ReactElement } from 'react';

import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/16/solid';

import { useMessageContext } from './context';
import { useClipboardSupport } from '../../../hooks/use-clipboard-support';
import { useTranslate } from '../../../internal/translate';
import { useCopyFeedback } from '../../../internal/use-copy-feedback';
import { mergeEventHandlers } from '../../../utils';
import { IconButton } from '../../action/icon-button';

export type MessageCopyProps = Omit<ComponentProps<'button'>, 'children'> & {
  text?: string;
  children?: ReactElement;
};

export function MessageCopy({ text, children, onClick, ...props }: MessageCopyProps) {
  const t = useTranslate();
  const { styles, readContent } = useMessageContext('Message.Copy');
  const supported = useClipboardSupport();
  const { copied, copy } = useCopyFeedback(() => text ?? readContent());

  if (!supported) return null;

  return (
    <>
      <IconButton
        {...props}
        aria-label={props['aria-label'] ?? (copied ? t('message.copied') : t('message.copy'))}
        data-copied={copied ? '' : undefined}
        icon={
          children ??
          (copied ? <CheckIcon aria-hidden="true" /> : <ClipboardDocumentIcon aria-hidden="true" />)
        }
        onClick={mergeEventHandlers(onClick, copy)}
      />
      <span role="status" className={styles.hint()}>
        {copied ? t('message.copied') : ''}
      </span>
    </>
  );
}

MessageCopy.displayName = 'Message.Copy';
