'use client';

import { useRef } from 'react';

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/16/solid';
import { flushSync } from 'react-dom';

import { useInternalTranslate } from '../../../../internal/translate';
import { IconButton } from '../../../action/icon-button';

type CodeBlockFoldProps = {
  className: string;
  controls: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

export function CodeBlockFold({
  className,
  controls,
  expanded,
  onExpandedChange,
}: CodeBlockFoldProps) {
  const t = useInternalTranslate();
  const button = useRef<HTMLButtonElement>(null);

  const keepButtonInViewAfterCollapse = () => {
    flushSync(() => onExpandedChange(false));
    button.current?.scrollIntoView({ block: 'nearest' });
  };

  return (
    <div className={className}>
      <IconButton
        ref={button}
        variant="outline"
        size="tiny"
        aria-label={expanded ? t('common.collapse') : t('common.expand')}
        aria-expanded={expanded}
        aria-controls={controls}
        icon={
          expanded ? <ChevronUpIcon aria-hidden="true" /> : <ChevronDownIcon aria-hidden="true" />
        }
        onClick={expanded ? keepButtonInViewAfterCollapse : () => onExpandedChange(true)}
      />
    </div>
  );
}
