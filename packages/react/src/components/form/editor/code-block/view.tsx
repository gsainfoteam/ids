'use client';

import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';

import { EditorCodeCopy } from './copy';
import { EditorCodeLanguage, languageOf } from './language';
import { editorStyle } from '../style';

const styles = editorStyle();

export function EditorCodeBlockView({ node, editor, updateAttributes }: ReactNodeViewProps) {
  return (
    <NodeViewWrapper data-code-block="" className={styles.codeBlock()}>
      <div contentEditable={false} className={styles.codeBlockBar()}>
        <EditorCodeLanguage
          language={languageOf(node.attrs.language)}
          disabled={!editor.isEditable}
          onLanguageChange={(language) => updateAttributes({ language })}
        />
        <EditorCodeCopy code={() => node.textContent} />
      </div>
      <pre className={styles.codePre()}>
        <NodeViewContent<'code'> as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
