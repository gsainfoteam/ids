'use client';

import { useId, useRef, type ReactNode } from 'react';

import { EditorBarContext, useEditorContext } from './context';
import { useTranslate } from '../../../internal/translate';
import { ScrollArea } from '../../layout/scroll-area';
import { useRovingFocus } from '../../utility/group/use-roving-focus';

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
  const t = useTranslate();
  const { contentId, styles } = useEditorContext('Editor');
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
        <ScrollArea asChild orientation="horizontal" size="tiny" fade="x">
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
