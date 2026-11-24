'use client';

import { useInternalTranslate } from '../../../../internal/translate';
import { FileList, type FileListProps } from '../../file-field/parts/list';
import { useInternalPromptInputContext } from '../context';

export type PromptInputAttachmentsProps = FileListProps;

export function PromptInputAttachments({ className, ...props }: PromptInputAttachmentsProps) {
  const t = useInternalTranslate();
  const c = useInternalPromptInputContext('PromptInput.Attachments');

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
