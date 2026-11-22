'use client';

import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';

import { EditorCodeLanguage, languageOf } from './language';
import { CodeBlockContext } from '../../../data/code-block/context';
import { CodeBlockCopy } from '../../../data/code-block/copy';
import { codeBlockStyle } from '../../../data/code-block/style';
import { Divider } from '../../../layout/divider';
import { ScrollArea } from '../../../layout/scroll-area';
import { editorStyle } from '../style';

const styles = codeBlockStyle({ variant: 'outline', wrap: false });
const { codePre } = editorStyle();

export function EditorCodeBlockView({ node, editor, updateAttributes }: ReactNodeViewProps) {
  return (
    <NodeViewWrapper as="figure" data-code-block="" className={styles.root()}>
      <CodeBlockContext value={{ code: node.textContent, styles }}>
        <figcaption contentEditable={false} className={styles.caption()}>
          <EditorCodeLanguage
            language={languageOf(node.attrs.language)}
            disabled={!editor.isEditable}
            onLanguageChange={(language) => updateAttributes({ language })}
          />
        </figcaption>
        <Divider decorative className={styles.divider()} />
        <div contentEditable={false}>
          <CodeBlockCopy />
        </div>
        <ScrollArea orientation="horizontal" className={styles.scroller()}>
          <ScrollArea.Viewport asChild>
            <pre dir="ltr" className={styles.pre({ className: codePre() })}>
              <NodeViewContent<'code'> as="code" className={styles.code()} />
            </pre>
          </ScrollArea.Viewport>
        </ScrollArea>
      </CodeBlockContext>
    </NodeViewWrapper>
  );
}
