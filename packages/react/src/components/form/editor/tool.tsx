'use client';

import { use, type MouseEvent, type ReactElement } from 'react';

import { EditorBarContext, useEditorContext } from './context';
import { useEditorSelector } from './use-editor-selector';
import { useTranslate } from '../../../internal/translate';
import { isDevelopment } from '../../../utils/dev';
import { IconToggle } from '../../action/icon-toggle';

import type { IdsMessageKey } from '../../../internal/messages';
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
};

export const hasExtension = (editor: TiptapEditor, name: string) =>
  editor.extensionManager.extensions.some((extension) => extension.name === name);

const warned = new Set<string>();

function warnTheExtensionIsMissing(part: string) {
  if (!isDevelopment || warned.has(part)) return;
  warned.add(part);
  console.warn(
    `\`<Editor.${part}>\` found no extension to drive. Place it directly in \`<Editor>\` or \`<Editor.BubbleMenu>\`, not inside a component of your own, so Editor sees it and loads the extension.`,
  );
}

export function extensionIsLoaded(editor: TiptapEditor | null, part: string, name?: string) {
  const loaded = name === undefined || editor === null || hasExtension(editor, name);
  if (!loaded) warnTheExtensionIsMissing(part);
  return loaded;
}

const keepFocusWhereItWas = (event: MouseEvent) => event.preventDefault();

export function useEditorToolProps(name: string, { keepFocus = true } = {}) {
  const bar = use(EditorBarContext);

  return {
    onMouseDown: keepFocus ? keepFocusWhereItWas : undefined,
    ...(bar && {
      'data-editor-tool': bar.id,
      'data-value': name,
      tabIndex: bar.tabStop === undefined ? undefined : bar.tabStop === name ? 0 : -1,
      onFocus: () => bar.onItemFocus(name),
      onKeyDown: bar.onItemKeyDown,
    }),
  };
}

const IDLE = { active: false, enabled: true };

export function useToolState(spec: Pick<EditorToggleSpec, 'isActive' | 'can' | 'extension'>) {
  const { editor } = useEditorContext('Editor');
  return useEditorSelector(
    editor,
    (current) =>
      spec.extension === undefined || hasExtension(current, spec.extension)
        ? { active: spec.isActive(current), enabled: spec.can(current) }
        : { active: false, enabled: false },
    IDLE,
  );
}

export function EditorToggleTool({
  spec,
  icon,
  'aria-label': ariaLabel,
  className,
}: EditorToolProps & { spec: EditorToggleSpec }) {
  const t = useTranslate();
  const { editor, editable } = useEditorContext(`Editor.${spec.name}`);
  const state = useToolState(spec);
  const tool = useEditorToolProps(spec.name);
  const loaded = extensionIsLoaded(editor, spec.name, spec.extension);

  return (
    <IconToggle
      {...tool}
      variant="soft"
      size="tiny"
      icon={icon ?? spec.icon}
      aria-label={ariaLabel ?? t(spec.label)}
      className={className}
      pressed={state.active}
      disabled={!editable || !loaded || !state.enabled}
      onPressedChange={() => {
        if (editor && loaded) spec.run(editor);
      }}
    />
  );
}
