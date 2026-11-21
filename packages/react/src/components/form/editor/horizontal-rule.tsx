'use client';

import { MinusIcon } from '@heroicons/react/16/solid';

import { useEditorContext } from './context';
import { useEditorToolProps, type EditorToolProps } from './tool';
import { useEditorSelector } from './use-editor-selector';
import { useTranslate } from '../../../internal/translate';
import { IconButton } from '../../action/icon-button';

export type EditorHorizontalRuleProps = EditorToolProps;

export function EditorHorizontalRule({
  icon,
  'aria-label': ariaLabel,
  className,
}: EditorHorizontalRuleProps) {
  const t = useTranslate();
  const { editor, editable } = useEditorContext('Editor.HorizontalRule');
  const tool = useEditorToolProps('HorizontalRule');
  const enabled = useEditorSelector(editor, (current) => current.can().setHorizontalRule(), true);

  return (
    <IconButton
      {...tool}
      variant="ghost"
      colorScheme="neutral"
      size="tiny"
      icon={icon ?? <MinusIcon />}
      aria-label={ariaLabel ?? t('editor.horizontalRule')}
      className={className}
      disabled={!editable || !enabled}
      onClick={() => editor?.chain().setHorizontalRule().run()}
    />
  );
}

EditorHorizontalRule.displayName = 'Editor.HorizontalRule';
