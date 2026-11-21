'use client';

import { useEditorContext } from './context';
import { useEditorToolProps } from './tool';
import { useEditorSelector } from './use-editor-selector';
import { useTranslate } from '../../../internal/translate';
import { Select } from '../select';

import type { Editor as TiptapEditor } from '@tiptap/core';

export type EditorHeadingLevel = 1 | 2 | 3 | 4;

export type EditorBlockTypeProps = {
  levels?: readonly EditorHeadingLevel[];
  'aria-label'?: string;
  className?: string;
};

const PARAGRAPH = 'paragraph';
const DEFAULT_LEVELS: readonly EditorHeadingLevel[] = [2, 3];

const headingValue = (level: EditorHeadingLevel) => `heading-${level}`;

function currentBlockType(editor: TiptapEditor, levels: readonly EditorHeadingLevel[]) {
  const level = levels.find((candidate) => editor.isActive('heading', { level: candidate }));
  if (level !== undefined) return headingValue(level);
  return editor.isActive('paragraph') ? PARAGRAPH : null;
}

export function EditorBlockType({
  levels = DEFAULT_LEVELS,
  'aria-label': ariaLabel,
  className,
}: EditorBlockTypeProps) {
  const t = useTranslate();
  const { editor, editable, styles } = useEditorContext('Editor.BlockType');
  const tool = useEditorToolProps('BlockType', { keepFocus: false });
  const value = useEditorSelector(
    editor,
    (current) => currentBlockType(current, levels),
    PARAGRAPH,
  );

  return (
    <Select
      {...tool}
      value={value ?? PARAGRAPH}
      onValueChange={(next) => {
        if (!editor || next === null) return;
        const level = levels.find((candidate) => headingValue(candidate) === next);
        if (level === undefined) editor.chain().setParagraph().run();
        else editor.chain().setHeading({ level }).run();
      }}
      aria-label={ariaLabel ?? t('editor.blockType')}
      size="tiny"
      variant="ghost"
      disabled={!editable}
      className={styles.blockType({ className })}
    >
      <Select.Item value={PARAGRAPH}>{t('editor.paragraph')}</Select.Item>
      {levels.map((level) => (
        <Select.Item key={level} value={headingValue(level)}>
          {t('editor.heading', { level })}
        </Select.Item>
      ))}
    </Select>
  );
}

EditorBlockType.displayName = 'Editor.BlockType';
