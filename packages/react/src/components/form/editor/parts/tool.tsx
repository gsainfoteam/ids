'use client';

import type { ReactElement } from 'react';

import { useInternalTranslate } from '../../../../internal/translate';
import { IconToggle } from '../../../action/icon-toggle';
import { Tooltip } from '../../../overlay/tooltip';
import { Kbd } from '../../../typography/kbd';
import { useInternalEditorContext } from '../context';
import { useInternalEditorToolProps } from '../hooks/use-editor-tool-props';
import { useInternalEditorToolState } from '../hooks/use-editor-tool-state';
import { extensionIsLoaded } from '../lib/extensions';
import { editorMessages } from '../messages-catalog';

import type { IdsMessageKey } from '../../../../internal/messages';
import type { Hotkey } from '@tanstack/react-hotkeys';
import type { Editor as TiptapEditor } from '@tiptap/core';

export type EditorToolProps = {
  icon?: ReactElement;
  'aria-label'?: string;
  className?: string;
};

export type EditorToggleSpec = {
  name: string;
  label: IdsMessageKey;
  icon: ReactElement;
  isActive: (editor: TiptapEditor) => boolean;
  can: (editor: TiptapEditor) => boolean;
  run: (editor: TiptapEditor) => void;
  extension?: string;
  shortcut?: Hotkey;
};

export type EditorToolTipProps = {
  label: string;
  shortcut?: Hotkey;
  disabled?: boolean;
};

export function EditorToolTip({
  label,
  shortcut,
  disabled,
  children,
}: EditorToolTipProps & { children: ReactElement }) {
  return (
    <Tooltip disabled={disabled}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Content>
        {label}
        {shortcut && <Kbd keys={shortcut} />}
      </Tooltip.Content>
    </Tooltip>
  );
}

export function EditorToggleTool({
  spec,
  icon,
  'aria-label': ariaLabel,
  className,
}: EditorToolProps & { spec: EditorToggleSpec }) {
  const t = useInternalTranslate(editorMessages);
  const { editor, editable } = useInternalEditorContext(`Editor.${spec.name}`);
  const state = useInternalEditorToolState(spec);
  const tool = useInternalEditorToolProps(spec.name);
  const loaded = extensionIsLoaded(editor, spec.name, spec.extension);
  const label = ariaLabel ?? t(spec.label);
  const disabled = !editable || !loaded || !state.enabled;

  return (
    <EditorToolTip label={label} shortcut={spec.shortcut} disabled={disabled}>
      <IconToggle
        {...tool}
        variant="soft"
        size="tiny"
        icon={icon ?? spec.icon}
        aria-label={label}
        className={className}
        pressed={state.active}
        disabled={disabled}
        onPressedChange={() => {
          if (editor && loaded) spec.run(editor);
        }}
      />
    </EditorToolTip>
  );
}
