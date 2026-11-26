'use client';

import { useInternalEditorRoot, type EditorRootProps } from './hooks/use-editor-root';
import { EditorImage } from './image/tool';
import { EditorBlockType } from './parts/block-type';
import {
  EditorBlockquote,
  EditorBulletList,
  EditorCodeBlock,
  EditorOrderedList,
} from './parts/blocks';
import { EditorContentPart } from './parts/content';
import { EditorLink } from './parts/link';
import { EditorBold, EditorCode, EditorItalic, EditorStrike } from './parts/marks';
import { EditorSeparator } from './parts/separator';
import { EditorShell } from './parts/shell';

export type { EditorState, EditorVariant } from './hooks/use-editor-root';

export type EditorProps = EditorRootProps;

function defaultToolbar({ withImage }: { withImage: boolean }) {
  return (
    <>
      <EditorBlockType />
      <EditorSeparator />
      <EditorBold />
      <EditorItalic />
      <EditorStrike />
      <EditorCode />
      <EditorLink />
      {withImage && <EditorImage />}
      <EditorSeparator />
      <EditorBulletList />
      <EditorOrderedList />
      <EditorBlockquote />
      <EditorCodeBlock />
    </>
  );
}

const DEFAULT_TOOLBAR = defaultToolbar({ withImage: false });
const DEFAULT_TOOLBAR_WITH_IMAGE = defaultToolbar({ withImage: true });
const DEFAULT_CONTENT = <EditorContentPart />;

export function EditorRoot(props: EditorProps) {
  const root = useInternalEditorRoot(props, {
    blockEditor: false,
    defaultChildren: props.editor?.imageUpload ? DEFAULT_TOOLBAR_WITH_IMAGE : DEFAULT_TOOLBAR,
    defaultContent: DEFAULT_CONTENT,
    defaultBubbleMenu: null,
  });

  return <EditorShell root={root} />;
}
