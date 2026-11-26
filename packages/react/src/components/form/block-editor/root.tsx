'use client';

import { BlockEditorBubbleMenu } from './parts/parts';
import { useInternalEditorRoot, type EditorRootProps } from '../editor/hooks/use-editor-root';
import { EditorContentPart } from '../editor/parts/content';
import { EditorShell } from '../editor/parts/shell';

export type { EditorState as BlockEditorState } from '../editor/hooks/use-editor-root';
export type { EditorVariant as BlockEditorVariant } from '../editor/hooks/use-editor-root';

export type BlockEditorProps = EditorRootProps;

const DEFAULT_CONTENT = <EditorContentPart />;
const DEFAULT_BUBBLE_MENU = <BlockEditorBubbleMenu key="block-editor-bubble-menu" />;

export function BlockEditorRoot(props: BlockEditorProps) {
  const root = useInternalEditorRoot(props, {
    blockEditor: true,
    defaultChildren: undefined,
    defaultContent: DEFAULT_CONTENT,
    defaultBubbleMenu: DEFAULT_BUBBLE_MENU,
  });

  return <EditorShell root={root} />;
}
