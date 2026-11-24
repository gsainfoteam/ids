'use client';

import { MinusIcon } from '@heroicons/react/16/solid';

import { useInternalEditorContext } from '../context';
import { editorMessages } from '../messages-catalog';
import { EditorToolTip, useInternalEditorToolProps, type EditorToolProps } from './tool';
import { useInternalTranslate } from '../../../../internal/translate';
import { IconButton } from '../../../action/icon-button';
import { useInternalEditorSelector } from '../hooks/use-editor-selector';

export type EditorHorizontalRuleProps = EditorToolProps;

export function EditorHorizontalRule({
  icon,
  'aria-label': ariaLabel,
  className,
}: EditorHorizontalRuleProps) {
  const t = useInternalTranslate(editorMessages);
  const { editor, editable } = useInternalEditorContext('Editor.HorizontalRule');
  const tool = useInternalEditorToolProps('HorizontalRule');
  const enabled = useInternalEditorSelector(
    editor,
    (current) => current.can().setHorizontalRule(),
    true,
  );

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
