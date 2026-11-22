'use client';

import { useState } from 'react';

import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';

import { useTranslate } from '../../../../internal/translate';
import { EditorGlyphButton } from '../glyph-button';
import { editorStyle } from '../style';

import type { EditorDetailsOptions } from './node';

export function EditorDetailsView({
  node,
  editor,
  extension,
  updateAttributes,
}: ReactNodeViewProps) {
  const t = useTranslate();
  const styles = editorStyle({ size: (extension.options as EditorDetailsOptions).size });
  const [openWhileReading, setOpenWhileReading] = useState<boolean | null>(null);
  const open = (editor.isEditable ? null : openWhileReading) ?? Boolean(node.attrs.open);
  const summaryIsEmpty = node.firstChild?.content.size === 0;

  const toggle = () => {
    if (editor.isEditable) updateAttributes({ open: !open });
    else setOpenWhileReading(!open);
  };

  return (
    <NodeViewWrapper data-details="" data-open={open ? '' : undefined} className={styles.details()}>
      <EditorGlyphButton
        contentEditable={false}
        aria-label={t('editor.detailsToggle')}
        aria-expanded={open}
        data-open={open ? '' : undefined}
        className={styles.detailsToggle()}
        onClick={toggle}
      >
        <ChevronDownIcon aria-hidden="true" />
      </EditorGlyphButton>
      {summaryIsEmpty && (
        <span contentEditable={false} aria-hidden="true" className={styles.detailsPlaceholder()}>
          {t('editor.detailsSummary')}
        </span>
      )}
      <NodeViewContent />
    </NodeViewWrapper>
  );
}
