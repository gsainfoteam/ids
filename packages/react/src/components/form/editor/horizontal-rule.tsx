'use client';

import { MinusIcon } from '@heroicons/react/16/solid';

import { useEditorContext } from './context';
import { editorMessages } from './messages-catalog';
import { EditorToolTip, useEditorToolProps, type EditorToolProps } from './tool';
import { useEditorSelector } from './use-editor-selector';
import { useTranslate } from '../../../internal/translate';
import { IconButton } from '../../action/icon-button';

export type EditorHorizontalRuleProps = EditorToolProps;

export function EditorHorizontalRule({
  icon,
  'aria-label': ariaLabel,
  className,
}: EditorHorizontalRuleProps) {
  const t = useTranslate(editorMessages);
  const { editor, editable } = useEditorContext('Editor.HorizontalRule');
  const tool = useEditorToolProps('HorizontalRule');
  const enabled = useEditorSelector(editor, (current) => current.can().setHorizontalRule(), true);

  const label = ariaLabel ?? t('editor.horizontalRule');
  const disabled = !editable || !enabled;

  return (
    <EditorToolTip label={label} disabled={disabled}>
      <IconButton
        {...tool}
        variant="ghost"
        colorScheme="neutral"
        size="tiny"
        icon={icon ?? <MinusIcon />}
        aria-label={label}
        className={className}
        disabled={disabled}
        onClick={() => editor?.chain().setHorizontalRule().run()}
      />
    </EditorToolTip>
  );
}

EditorHorizontalRule.displayName = 'Editor.HorizontalRule';
