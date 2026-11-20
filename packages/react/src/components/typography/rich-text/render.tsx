import { renderToReactElement } from '@tiptap/static-renderer/pm/react';

import { CalloutNode } from './nodes/callout';
import { CodeBlockNode } from './nodes/code-block';
import { DetailsContentNode, DetailsNode, DetailsSummaryNode } from './nodes/details';
import { ImageNode } from './nodes/image';
import { LinkMark } from './nodes/link';
import { mentionNode } from './nodes/mention';
import { TableCellNode, TableHeaderNode, TableNode, TableRowNode } from './nodes/table';
import { TaskItemNode } from './nodes/task-item';
import { documentExtensions, documentMarkdown } from './schema/document';
import { keepAllowedImages } from './schema/image-source';
import { Divider } from '../../layout/divider';

import type { JSONContent } from '@tiptap/core';

export type RichTextFormat = 'markdown' | 'json';

const NO_UPLOADS: ReadonlySet<string> = new Set();
const EMPTY_DOCUMENT: JSONContent = { type: 'doc', content: [] };

const extensions = documentExtensions();
const markdown = documentMarkdown(extensions);

export function documentOf(value: string | JSONContent | undefined, format: RichTextFormat) {
  if (value === undefined) return EMPTY_DOCUMENT;
  if (typeof value !== 'string') return keepAllowedImages(value, NO_UPLOADS);
  if (format === 'markdown') return markdown.parse(value);
  return keepAllowedImages(JSON.parse(value) as JSONContent, NO_UPLOADS);
}

export function renderDocument(
  document: JSONContent,
  { mentionHref }: { mentionHref?: (id: string) => string },
) {
  return renderToReactElement({
    content: document,
    extensions,
    options: {
      nodeMapping: {
        codeBlock: CodeBlockNode,
        callout: CalloutNode,
        details: DetailsNode,
        detailsSummary: DetailsSummaryNode,
        detailsContent: DetailsContentNode,
        image: ImageNode,
        table: TableNode,
        tableRow: TableRowNode,
        tableHeader: TableHeaderNode,
        tableCell: TableCellNode,
        taskItem: TaskItemNode,
        mention: mentionNode(mentionHref),
        horizontalRule: () => <Divider />,
      },
      markMapping: { link: LinkMark },
    },
  });
}
