'use client';

import { type ComponentProps, type ReactElement } from 'react';

import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/16/solid';

import { useInternalClipboardSupport } from '../../../../hooks/use-clipboard-support';
import { useInternalCopyFeedback } from '../../../../internal/hooks/use-copy-feedback';
import { useInternalTranslate } from '../../../../internal/translate';
import { mergeEventHandlers } from '../../../../utils';
import { IconButton } from '../../../action/icon-button';
import { useInternalMessageContext } from '../context';

export type MessageCopyProps = Omit<ComponentProps<'button'>, 'children'> & {
  text?: string;
  children?: ReactElement;
};

export function MessageCopy({ text, children, onClick, ...props }: MessageCopyProps) {
  const t = useInternalTranslate();
  const { styles, readContent } = useInternalMessageContext('Message.Copy');
  const supported = useInternalClipboardSupport();
  const { copied, copy } = useInternalCopyFeedback(() => text ?? readContent());

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
