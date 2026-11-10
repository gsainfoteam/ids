'use client';

import { type ReactElement, type ReactNode } from 'react';

import { PlusIcon } from '@heroicons/react/16/solid';

import { PromptInputAddAttachments } from './add-attachments';
import { usePromptInputContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { IconButton } from '../../action/icon-button';
import { Menu } from '../../overlay/menu';

export type PromptInputActionMenuProps = Omit<Menu.Props, 'children' | 'triggerType' | 'hotkey'> & {
  icon?: ReactElement;
  'aria-label'?: string;
  side?: Menu.Side;
  align?: Menu.Align;
  children?: ReactNode;
};

export function PromptInputActionMenu({
  icon,
  'aria-label': ariaLabel,
  side = 'top',
  align = 'start',
  children,
  ...menuProps
}: PromptInputActionMenuProps) {
  const t = useTranslate();
  const c = usePromptInputContext('PromptInput.ActionMenu');

  return (
    <Menu {...menuProps}>
      <Menu.Trigger asChild>
        <IconButton
          aria-label={ariaLabel ?? t('promptInput.actions')}
          variant="outline"
          size={c.size}
          disabled={c.disabled}
          icon={icon ?? <PlusIcon aria-hidden="true" />}
          data-prompt-input-action-menu=""
        />
      </Menu.Trigger>
      <Menu.Content side={side} align={align}>
        {children ?? <PromptInputAddAttachments />}
      </Menu.Content>
    </Menu>
  );
}

PromptInputActionMenu.displayName = 'PromptInput.ActionMenu';
