'use client';

import { useInternalEditorSelector } from './use-editor-selector';
import { useInternalEditorContext } from '../context';
import { hasExtension } from '../lib/extensions';

import type { EditorToggleSpec } from '../parts/tool';

const IDLE = { active: false, enabled: true };

export function useInternalEditorToolState(
  spec: Pick<EditorToggleSpec, 'isActive' | 'can' | 'extension'>,
) {
  const { editor } = useInternalEditorContext('Editor');
  return useInternalEditorSelector(
    editor,
    (current) =>
      spec.extension === undefined || hasExtension(current, spec.extension)
        ? { active: spec.isActive(current), enabled: spec.can(current) }
        : { active: false, enabled: false },
    IDLE,
  );
}
