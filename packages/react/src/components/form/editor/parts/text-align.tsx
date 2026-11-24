'use client';

import type { ReactElement } from 'react';

import { TextAlignCenter, TextAlignEnd, TextAlignJustify, TextAlignStart } from 'lucide-react';

import { useInternalEditorContext } from '../context';
import { editorMessages } from '../messages-catalog';
import { EditorToolTip, extensionIsLoaded, hasExtension, useInternalEditorToolProps } from './tool';
import { useInternalTranslate } from '../../../../internal/translate';
import { IconToggle } from '../../../action/icon-toggle';
import { useInternalEditorSelector } from '../hooks/use-editor-selector';

import type { IdsMessageKey } from '../../../../internal/messages';
import type { Hotkey } from '@tanstack/react-hotkeys';
import type { Editor as TiptapEditor } from '@tiptap/core';

export type EditorTextAlignment = 'left' | 'center' | 'right' | 'justify';

export type EditorTextAlignProps = {
  alignments?: readonly EditorTextAlignment[];
  'aria-label'?: string;
  className?: string;
};

const THE_DEFAULT: EditorTextAlignment = 'left';

const DEFAULT_ALIGNMENTS: readonly EditorTextAlignment[] = ['left', 'center', 'right'];

const ALIGNMENT: Record<
  EditorTextAlignment,
  { label: IdsMessageKey; icon: ReactElement; shortcut: Hotkey }
> = {
  left: { label: 'editor.alignLeft', icon: <TextAlignStart />, shortcut: 'Mod+Shift+L' },
  center: { label: 'editor.alignCenter', icon: <TextAlignCenter />, shortcut: 'Mod+Shift+E' },
  right: { label: 'editor.alignRight', icon: <TextAlignEnd />, shortcut: 'Mod+Shift+R' },
  justify: { label: 'editor.alignJustify', icon: <TextAlignJustify />, shortcut: 'Mod+Shift+J' },
};

function currentAlignment(editor: TiptapEditor, alignments: readonly EditorTextAlignment[]) {
  if (!hasExtension(editor, 'textAlign')) return null;
  const set = alignments.find((alignment) => editor.isActive({ textAlign: alignment }));
  return set ?? (editor.isActive({ textAlign: null }) ? THE_DEFAULT : null);
}

function AlignmentToggle({
  alignment,
  pressed,
  disabled,
  editor,
}: {
  alignment: EditorTextAlignment;
  pressed: boolean;
  disabled: boolean;
  editor: TiptapEditor | null;
}) {
  const t = useInternalTranslate(editorMessages);
  const tool = useInternalEditorToolProps(`TextAlign-${alignment}`);
  const { label, icon, shortcut } = ALIGNMENT[alignment];

  return (
    <EditorToolTip label={t(label)} shortcut={shortcut} disabled={disabled}>
      <IconToggle
        {...tool}
        variant="soft"
        size="tiny"
        icon={icon}
        aria-label={t(label)}
        pressed={pressed}
        disabled={disabled}
        onPressedChange={() => {
          if (!editor) return;
          if (pressed || alignment === THE_DEFAULT) editor.chain().unsetTextAlign().run();
          else editor.chain().setTextAlign(alignment).run();
        }}
      />
    </EditorToolTip>
  );
}

export function EditorTextAlign({
  alignments = DEFAULT_ALIGNMENTS,
  'aria-label': ariaLabel,
  className,
}: EditorTextAlignProps) {
  const t = useInternalTranslate(editorMessages);
  const { editor, editable, styles } = useInternalEditorContext('Editor.TextAlign');
  const loaded = extensionIsLoaded(editor, 'TextAlign', 'textAlign');
  const current = useInternalEditorSelector(
    editor,
    (instance) => currentAlignment(instance, alignments),
    null,
  );

  return (
    <div
      role="group"
      aria-label={ariaLabel ?? t('editor.textAlign')}
      className={styles.textAlign({ className })}
    >
      {alignments.map((alignment) => (
        <AlignmentToggle
          key={alignment}
          alignment={alignment}
          pressed={current === alignment}
          disabled={!editable || !loaded}
          editor={editor}
        />
      ))}
    </div>
  );
}

EditorTextAlign.displayName = 'Editor.TextAlign';
