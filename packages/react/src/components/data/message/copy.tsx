'use client';

import { useEffect, useState, type ComponentProps, type ReactElement } from 'react';

import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/16/solid';

import { useMessageContext } from './context';
import { useClipboardSupport } from '../../../hooks/use-clipboard-support';
import { useTranslate } from '../../../internal/translate';
import { mergeEventHandlers } from '../../../utils';
import { IconButton } from '../../action/icon-button';

export type MessageCopyProps = Omit<ComponentProps<'button'>, 'children'> & {
  text?: string;
  children?: ReactElement;
};

const COPIED_FOR = 1500;

export function MessageCopy({ text, children, onClick, ...props }: MessageCopyProps) {
  const t = useTranslate();
  const { styles, readContent } = useMessageContext('Message.Copy');
  const supported = useClipboardSupport();
  const [copyRun, setCopyRun] = useState(0);
  const copied = copyRun > 0;

  useEffect(() => {
    if (copyRun === 0) return;
    const timer = setTimeout(() => setCopyRun(0), COPIED_FOR);
    return () => clearTimeout(timer);
  }, [copyRun]);

  const copy = async () => {
    const written = await navigator.clipboard.writeText(text ?? readContent()).then(
      () => true,
      () => false,
    );
    if (!written) return;
    setCopyRun((run) => run + 1);
  };

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
