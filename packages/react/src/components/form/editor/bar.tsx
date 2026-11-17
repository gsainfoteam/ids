'use client';

import { useId, useRef, type ReactNode } from 'react';

import { EditorBarContext, useEditorContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { useRovingFocus } from '../../utility/group/use-roving-focus';

type EditorBarProps = {
  toolbar: boolean;
  label?: string;
  className?: string;
  children: ReactNode;
};

export function EditorBar({ toolbar, label, className, children }: EditorBarProps) {
  const t = useTranslate();
  const { contentId } = useEditorContext('Editor');
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const roving = useRovingFocus({
    rootRef,
    ownItemSelector: `[data-editor-tool="${id}"]`,
    orientation: 'horizontal',
    loop: true,
    radio: false,
    checked: null,
  });

  return (
    <EditorBarContext
      value={{
        id,
        tabStop: roving.tabStop,
        onItemFocus: roving.onItemFocus,
        onItemKeyDown: roving.onItemKeyDown,
      }}
    >
      <div
        ref={rootRef}
        role={toolbar ? 'toolbar' : undefined}
        aria-label={toolbar ? (label ?? t('editor.toolbar')) : undefined}
        aria-orientation={toolbar ? 'horizontal' : undefined}
        aria-controls={toolbar ? contentId : undefined}
        data-editor-bar=""
        className={className}
      >
        {children}
      </div>
    </EditorBarContext>
  );
}
