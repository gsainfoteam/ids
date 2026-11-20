'use client';

import { useEffect, useState } from 'react';

import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/16/solid';

import { useClipboardSupport } from '../../../../hooks/use-clipboard-support';
import { useTranslate } from '../../../../internal/translate';
import { IconButton } from '../../../action/icon-button';
import { editorStyle } from '../style';

const COPIED_FOR = 1500;
const styles = editorStyle();

function useCopiedFlag() {
  const [copyRun, setCopyRun] = useState(0);

  useEffect(() => {
    if (copyRun === 0) return;
    const timer = setTimeout(() => setCopyRun(0), COPIED_FOR);
    return () => clearTimeout(timer);
  }, [copyRun]);

  return [copyRun > 0, () => setCopyRun((run) => run + 1)] as const;
}

export function EditorCodeCopy({ code }: { code: () => string }) {
  const t = useTranslate();
  const supported = useClipboardSupport();
  const [copied, markCopied] = useCopiedFlag();

  if (!supported) return null;

  const copy = () => navigator.clipboard.writeText(code()).then(markCopied, () => undefined);

  return (
    <>
      <IconButton
        aria-label={copied ? t('codeBlock.copied') : t('codeBlock.copy')}
        variant="ghost"
        colorScheme="neutral"
        size="tiny"
        icon={
          copied ? <CheckIcon aria-hidden="true" /> : <ClipboardDocumentIcon aria-hidden="true" />
        }
        onClick={copy}
      />
      <span role="status" className={styles.codeCopyStatus()}>
        {copied ? t('codeBlock.copied') : ''}
      </span>
    </>
  );
}
