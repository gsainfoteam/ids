'use client';

import { type ComponentProps, type ReactElement } from 'react';

import { PaperClipIcon } from '@heroicons/react/16/solid';

import { usePromptInputContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { IconButton } from '../../action/icon-button';
import { FileTrigger } from '../file-field/trigger';

export type PromptInputAttachProps = Omit<ComponentProps<'button'>, 'children' | 'type'> & {
  icon?: ReactElement;
};

export function PromptInputAttach({ icon, ...props }: PromptInputAttachProps) {
  const t = useTranslate();
  const c = usePromptInputContext('PromptInput.Attach');

  return (
    <FileTrigger asChild>
      <IconButton
        aria-label={t('promptInput.attach')}
        {...props}
        variant="outline"
        size={c.size}
        icon={icon ?? <PaperClipIcon aria-hidden="true" />}
        data-prompt-input-attach=""
      />
    </FileTrigger>
  );
}

PromptInputAttach.displayName = 'PromptInput.Attach';
