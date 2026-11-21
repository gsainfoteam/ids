'use client';

import { type ComponentProps, type ReactElement } from 'react';

import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/16/solid';

import { useCodeBlockContext } from './context';
import { useClipboardSupport } from '../../../hooks/use-clipboard-support';
import { useTranslate } from '../../../internal/translate';
import { useCopyFeedback } from '../../../internal/use-copy-feedback';
import { mergeEventHandlers } from '../../../utils';
import { IconButton } from '../../action/icon-button';

export type CodeBlockCopyProps = Omit<ComponentProps<'button'>, 'children'> & {
  children?: ReactElement;
};

export function CodeBlockCopy({ className, children, onClick, ...props }: CodeBlockCopyProps) {
  const t = useTranslate();
  const { code, styles } = useCodeBlockContext('CodeBlock.Copy');
  const supported = useClipboardSupport();
  const { copied, copy } = useCopyFeedback(() => code);

  if (!supported) return null;

  return (
    <>
      <IconButton
        {...props}
        aria-label={props['aria-label'] ?? (copied ? t('codeBlock.copied') : t('codeBlock.copy'))}
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
        {copied ? t('codeBlock.copied') : ''}
      </span>
    </>
  );
}

CodeBlockCopy.displayName = 'CodeBlock.Copy';
