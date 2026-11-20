import type { ReactNode } from 'react';

import type { Mark, Node as ProseMirrorNode } from '@tiptap/pm/model';

export type DocumentNodeProps = {
  node: ProseMirrorNode;
  children?: ReactNode;
  renderElement: (props: { content: ProseMirrorNode; parent?: ProseMirrorNode }) => ReactNode;
};

export type DocumentMarkProps = { mark: Mark; children?: ReactNode };
