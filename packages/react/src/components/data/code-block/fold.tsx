'use client';

import { useRef } from 'react';

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/16/solid';
import { flushSync } from 'react-dom';

import { useTranslate } from '../../../internal/translate';
import { Button } from '../../action/button';

type CodeBlockFoldProps = {
  className: string;
  controls: string;
  expanded: boolean;
  hiddenLines: number;
  onExpandedChange: (expanded: boolean) => void;
};

export function CodeBlockFold({
  className,
  controls,
  expanded,
  hiddenLines,
  onExpandedChange,
}: CodeBlockFoldProps) {
  const t = useTranslate();
  const button = useRef<HTMLButtonElement>(null);

  const keepButtonInViewAfterCollapse = () => {
    flushSync(() => onExpandedChange(false));
    button.current?.scrollIntoView({ block: 'nearest' });
  };

  return (
    <div className={className}>
      <Button
        ref={button}
        variant="outline"
        size="tiny"
        aria-expanded={expanded}
        aria-controls={controls}
        onClick={expanded ? keepButtonInViewAfterCollapse : () => onExpandedChange(true)}
      >
        {expanded ? t('codeBlock.collapse') : t('codeBlock.expand', { count: hiddenLines })}
        {expanded ? <ChevronUpIcon aria-hidden="true" /> : <ChevronDownIcon aria-hidden="true" />}
      </Button>
    </div>
  );
}
