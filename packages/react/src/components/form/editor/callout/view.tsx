'use client';

import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';

import { EditorCalloutKindMenu } from './kind-menu';
import { useTranslate } from '../../../../internal/translate';
import { alertStyle } from '../../../feedback/alert/style';
import { CALLOUT_TITLE } from '../../../typography/rich-text/callout-kinds';
import { calloutKindOf } from '../../../typography/rich-text/schema/callout';

export function EditorCalloutView({ node, editor, getPos, updateAttributes }: ReactNodeViewProps) {
  const t = useTranslate();
  const kind = calloutKindOf(node.attrs.kind);
  const styles = alertStyle({ colorScheme: kind, variant: 'soft', icon: true });

  const unwrap = () => {
    const pos = getPos();
    if (pos === undefined) return;
    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        tr.replaceWith(pos, pos + node.nodeSize, node.content);
        return true;
      })
      .run();
  };

  return (
    <NodeViewWrapper data-callout="" data-kind={kind} className={styles.root()}>
      <span contentEditable={false} className={styles.icon()}>
        <EditorCalloutKindMenu
          kind={kind}
          disabled={!editor.isEditable}
          onKindChange={(next) => updateAttributes({ kind: next })}
          onRemove={unwrap}
        />
      </span>
      <div className={styles.content()}>
        <span contentEditable={false} className={styles.title()}>
          {t(CALLOUT_TITLE[kind])}
        </span>
        <NodeViewContent data-document-blocks="" className={styles.description()} />
      </div>
    </NodeViewWrapper>
  );
}
