'use client';

import { usePromptInputContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { FileList, type FileListProps } from '../file-field/list';

export type PromptInputAttachmentsProps = FileListProps;

export function PromptInputAttachments({ className, ...props }: PromptInputAttachmentsProps) {
  const t = useTranslate();
  const c = usePromptInputContext('PromptInput.Attachments');

  return (
    <FileList
      aria-label={t('promptInput.attachments')}
      {...props}
      data-prompt-input-attachments=""
      className={c.styles.attachments({ className })}
    />
  );
}

PromptInputAttachments.displayName = 'PromptInput.Attachments';
