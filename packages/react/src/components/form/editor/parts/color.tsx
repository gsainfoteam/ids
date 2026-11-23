'use client';

import { useId } from 'react';

import { NoSymbolIcon } from '@heroicons/react/16/solid';
import { noop } from 'es-toolkit';
import { Baseline } from 'lucide-react';

import { useInternalEditorContext } from '../context';
import { editorMessages } from '../messages-catalog';
import {
  EditorToolTip,
  extensionIsLoaded,
  hasExtension,
  useInternalEditorToolProps,
  type EditorToolProps,
} from './tool';
import { useInternalTranslate } from '../../../../internal/translate';
import { IconToggle } from '../../../action/icon-toggle';
import { Popover } from '../../../overlay/popover';
import {
  DOCUMENT_COLORS,
  isDocumentColor,
  type DocumentColor,
} from '../../../typography/rich-text/lib/document-colors';
import { useInternalEditorSelector } from '../hooks/use-editor-selector';

import type { IdsMessageKey } from '../../../../internal/messages';
import type { Editor as TiptapEditor } from '@tiptap/core';

export type EditorColorProps = EditorToolProps;

type Picked = { text: DocumentColor | null; highlight: DocumentColor | 'default' | null };

const COLOR_NAME: Record<DocumentColor, IdsMessageKey> = {
  primary: 'editor.colorPrimary',
  secondary: 'editor.colorSecondary',
  tertiary: 'editor.colorTertiary',
  info: 'editor.colorInfo',
  success: 'editor.colorSuccess',
  warning: 'editor.colorWarning',
  danger: 'editor.colorDanger',
};

const NOTHING_PICKED: Picked = { text: null, highlight: null };

function pickedIn(editor: TiptapEditor): Picked {
  if (!hasExtension(editor, 'textColor')) return NOTHING_PICKED;
  const text: unknown = editor.getAttributes('textColor').color;
  const highlight: unknown = editor.getAttributes('highlight').color;
  return {
    text: isDocumentColor(text) ? text : null,
    highlight: isDocumentColor(highlight)
      ? highlight
      : editor.isActive('highlight')
        ? 'default'
        : null,
  };
}

const canColor = (editor: TiptapEditor) =>
  !editor.isActive('codeBlock') && !editor.isActive('code');

export function EditorColor({ icon, 'aria-label': ariaLabel, className }: EditorColorProps) {
  const t = useInternalTranslate(editorMessages);
  const { editor, editable, styles } = useInternalEditorContext('Editor.Color');
  const tool = useInternalEditorToolProps('Color');
  const textTitleId = useId();
  const highlightTitleId = useId();
  const picked = useInternalEditorSelector(editor, pickedIn, NOTHING_PICKED);
  const enabled = useInternalEditorSelector(editor, canColor, true);
  const loaded = extensionIsLoaded(editor, 'Color', 'textColor');
  const toolLabel = ariaLabel ?? t('editor.color');
  const disabled = !editable || !loaded || !enabled;

  const paint = (apply: (editor: TiptapEditor) => void) => () => {
    if (!editor) return;
    apply(editor);
  };

  const swatch = (
    group: 'text' | 'highlight',
    label: string,
    pressed: boolean,
    onClick: () => void,
    color: DocumentColor | 'none',
  ) => {
    const { textSwatch, highlightSwatch } = styles;
    const look = group === 'text' ? textSwatch : highlightSwatch;
    return (
      <button
        key={color}
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        data-color={color}
        className={look({ swatch: color })}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onClick}
      >
        {group === 'text' && <span aria-hidden="true">A</span>}
        {group === 'highlight' && color === 'none' && <NoSymbolIcon aria-hidden="true" />}
      </button>
    );
  };

  return (
    <Popover>
      <EditorToolTip label={toolLabel} disabled={disabled}>
        <Popover.Trigger asChild>
          <IconToggle
            {...tool}
            variant="soft"
            size="tiny"
            icon={icon ?? <Baseline />}
            aria-label={toolLabel}
            className={className}
            pressed={picked.text !== null || picked.highlight !== null}
            disabled={disabled}
            onPressedChange={noop}
          />
        </Popover.Trigger>
      </EditorToolTip>
      <Popover.Content aria-label={t('editor.color')} side="bottom" align="start" className="w-max">
        <div className={styles.colorPanel()}>
          <div role="group" aria-labelledby={textTitleId} className={styles.colorSection()}>
            <p id={textTitleId} className={styles.colorTitle()}>
              {t('editor.textColor')}
            </p>
            <div className={styles.colorGrid()}>
              {swatch(
                'text',
                t('editor.colorDefault'),
                picked.text === null,
                paint((instance) => instance.chain().focus().unsetTextColor().run()),
                'none',
              )}
              {DOCUMENT_COLORS.map((color) =>
                swatch(
                  'text',
                  t(COLOR_NAME[color]),
                  picked.text === color,
                  paint((instance) => instance.chain().focus().setTextColor(color).run()),
                  color,
                ),
              )}
            </div>
          </div>
          <div role="group" aria-labelledby={highlightTitleId} className={styles.colorSection()}>
            <p id={highlightTitleId} className={styles.colorTitle()}>
              {t('editor.highlightColor')}
            </p>
            <div className={styles.colorGrid()}>
              {swatch(
                'highlight',
                t('editor.colorNone'),
                picked.highlight === null,
                paint((instance) => instance.chain().focus().unsetHighlight().run()),
                'none',
              )}
              {DOCUMENT_COLORS.map((color) =>
                swatch(
                  'highlight',
                  t(COLOR_NAME[color]),
                  picked.highlight === color,
                  paint((instance) => instance.chain().focus().setHighlight({ color }).run()),
                  color,
                ),
              )}
            </div>
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
}

EditorColor.displayName = 'Editor.Color';
