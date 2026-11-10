'use client';

import { type ReactNode } from 'react';

import { PaperClipIcon } from '@heroicons/react/16/solid';

import { useTranslate } from '../../../internal/translate';
import { Menu } from '../../overlay/menu';
import { useFile } from '../file-field/context';

export type PromptInputAddAttachmentsProps = Omit<Menu.ItemProps, 'children'> & {
  children?: ReactNode;
};

export function PromptInputAddAttachments({
  onSelect,
  disabled,
  children,
  ...props
}: PromptInputAddAttachmentsProps) {
  const t = useTranslate();
  const file = useFile('PromptInput.AddAttachments');

  return (
    <Menu.Item
      {...props}
      disabled={disabled ?? file.state.disabled}
      data-prompt-input-add-attachments=""
      onSelect={(event) => {
        onSelect?.(event);
        if (!event.defaultPrevented) file.field.actions.openPicker();
      }}
    >
      {children ?? (
        <>
          <PaperClipIcon aria-hidden="true" />
          {t('promptInput.attach')}
        </>
      )}
    </Menu.Item>
  );
}

PromptInputAddAttachments.displayName = 'PromptInput.AddAttachments';
