'use client';

import { type ComponentProps, type ReactElement } from 'react';

import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/16/solid';

import { useInternalClipboardSupport } from '../../../../hooks/use-clipboard-support';
import { useInternalCopyFeedback } from '../../../../internal/hooks/use-copy-feedback';
import { useInternalTranslate } from '../../../../internal/translate';
import { mergeEventHandlers } from '../../../../utils';
import { IconButton } from '../../../action/icon-button';
import { useInternalCodeBlockContext } from '../context';

export type CodeBlockCopyProps = Omit<ComponentProps<'button'>, 'children'> & {
  children?: ReactElement;
};

export function CodeBlockCopy({ className, children, onClick, ...props }: CodeBlockCopyProps) {
  const t = useInternalTranslate();
  const { code, styles } = useInternalCodeBlockContext('CodeBlock.Copy');
  const supported = useInternalClipboardSupport();
  const { copied, copy } = useInternalCopyFeedback(() => code);

  if (!supported) return null;

  return (
    <>
      <IconButton
        {...props}
        aria-label={props['aria-label'] ?? (copied ? t('common.copied') : t('common.copy'))}
        data-copied={copied ? '' : undefined}
        variant="outline"
        size="tiny"
        icon={
          children ??
          (copied ? <CheckIcon aria-hidden="true" /> : <ClipboardDocumentIcon aria-hidden="true" />)
        }
        className={styles.copy({ className })}
        onClick={mergeEventHandlers(onClick, copy)}
      />
      <span role="status" className={styles.status()}>
        {copied ? t('common.copied') : ''}
      </span>
    </>
  );
}

CodeBlockCopy.displayName = 'CodeBlock.Copy';
