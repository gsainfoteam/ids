import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import { Highlight } from '@tiptap/extension-highlight';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import { TextAlign } from '@tiptap/extension-text-align';
import { MarkdownManager } from '@tiptap/markdown';
import { Marked, type marked } from 'marked';

import { Callout } from './callout';
import { DocumentImage } from './image';
import { DocumentMention } from './mention';
import { DocumentSubscript, DocumentSuperscript } from './script';
import { documentStarterKit } from './starter-kit';

import type { Extensions } from '@tiptap/core';

export const alignedBlocks = TextAlign.configure({ types: ['heading', 'paragraph'] });

export const detailsExtensions = [
  Details.configure({ persist: true }),
  DetailsSummary,
  DetailsContent,
];

export const documentTable = [
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
];

export const documentExtensions = (): Extensions => [
  documentStarterKit([1, 2, 3, 4, 5, 6]),
  DocumentImage,
  Highlight,
  DocumentSubscript,
  DocumentSuperscript,
  TaskList,
  TaskItem.configure({ nested: true }),
  alignedBlocks,
  ...documentTable,
  ...detailsExtensions,
  DocumentMention,
  Callout,
];

export const documentMarkdown = (extensions: Extensions) =>
  new MarkdownManager({ marked: new Marked() as unknown as typeof marked, extensions });
