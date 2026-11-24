'use client';

import { useId, useRef, type ReactNode } from 'react';

import { useInternalTranslate } from '../../../../internal/translate';
import { ScrollArea } from '../../../layout/scroll-area';
import { useInternalRovingFocus } from '../../../utility/group/hooks/use-roving-focus';
import { EditorBarContext, useInternalEditorContext } from '../context';
import { editorMessages } from '../messages-catalog';

type EditorBarProps = {
  toolbar: boolean;
  scrolls?: boolean;
  label?: string;
  className?: string;
  children: ReactNode;
};

export function EditorBar({
  toolbar,
  scrolls = false,
  label,
  className,
  children,
}: EditorBarProps) {
  const t = useInternalTranslate(editorMessages);
  const { contentId, styles } = useInternalEditorContext('Editor');
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const roving = useInternalRovingFocus({
    rootRef,
    ownItemSelector: `[data-editor-tool="${id}"]`,
    orientation: 'horizontal',
    loop: true,
    radio: false,
    checked: null,
  });

  const barProps = {
    ref: rootRef,
    role: toolbar ? 'toolbar' : undefined,
    'aria-label': toolbar ? (label ?? t('editor.toolbar')) : undefined,
    'aria-orientation': toolbar ? ('horizontal' as const) : undefined,
    'aria-controls': toolbar ? contentId : undefined,
    'data-editor-bar': '',
    className,
  };

  return (
    <EditorBarContext
      value={{
        id,
        tabStop: roving.tabStop,
        onItemFocus: roving.onItemFocus,
        onItemKeyDown: roving.onItemKeyDown,
      }}
    >
      {scrolls ? (
        <ScrollArea asChild orientation="horizontal" variant="none" fade="x">
          <div {...barProps}>
            <ScrollArea.Viewport className={styles.barItems()}>{children}</ScrollArea.Viewport>
          </div>
        </ScrollArea>
      ) : (
        <div {...barProps}>{children}</div>
      )}
    </EditorBarContext>
  );
}
