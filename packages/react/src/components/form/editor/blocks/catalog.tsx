'use client';

import { type ReactElement } from 'react';

import {
  InformationCircleIcon,
  ListBulletIcon,
  MinusIcon,
  NumberedListIcon,
  TableCellsIcon,
} from '@heroicons/react/16/solid';
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  ListCollapse,
  ListTodo,
  Pilcrow,
  SquareCode,
  TextQuote,
} from 'lucide-react';

import { matchesSearch } from '../../../../internal/lib/search-text';
import { hasExtension } from '../parts/tool';
import { insertTable } from '../table/insert';

import type { Translate } from '../../../../internal/translate';
import type { ChainedCommands, Editor as TiptapEditor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

export type EditorBlock = {
  id: string;
  nodeType: string;
  label: (t: Translate) => string;
  icon: ReactElement;
  keywords: readonly string[];
  available: (editor: TiptapEditor) => boolean;
  insert: (chain: ChainedCommands) => ChainedCommands;
  isActive: (editor: TiptapEditor) => boolean;
  holdsText: boolean;
};

type HeadingLevel = 1 | 2 | 3 | 4;

const HEADING_ICONS: Record<HeadingLevel, ReactElement> = {
  1: <Heading1 />,
  2: <Heading2 />,
  3: <Heading3 />,
  4: <Heading4 />,
};

const withExtension = (name: string) => (editor: TiptapEditor) => hasExtension(editor, name);

const headingLevelsOf = (editor: TiptapEditor): readonly number[] =>
  editor.extensionManager.extensions.find((extension) => extension.name === 'heading')?.options
    .levels ?? [];

const heading = (level: HeadingLevel): EditorBlock => ({
  id: `heading-${level}`,
  nodeType: 'heading',
  label: (t) => t('editor.heading', { level }),
  icon: HEADING_ICONS[level],
  keywords: [`h${level}`, 'heading', 'title'],
  available: (editor) => headingLevelsOf(editor).includes(level),
  insert: (chain) => chain.setHeading({ level }),
  isActive: (editor) => editor.isActive('heading', { level }),
  holdsText: true,
});

export const EDITOR_BLOCKS: readonly EditorBlock[] = [
  {
    id: 'paragraph',
    nodeType: 'paragraph',
    label: (t) => t('editor.paragraph'),
    icon: <Pilcrow />,
    keywords: ['text', 'paragraph', 'plain'],
    available: withExtension('paragraph'),
    insert: (chain) => chain.setParagraph(),
    isActive: (editor) => editor.isActive('paragraph'),
    holdsText: true,
  },
  heading(1),
  heading(2),
  heading(3),
  heading(4),
  {
    id: 'bulletList',
    nodeType: 'bulletList',
    label: (t) => t('editor.bulletList'),
    icon: <ListBulletIcon />,
    keywords: ['ul', 'bullet', 'list', '-'],
    available: withExtension('bulletList'),
    insert: (chain) => chain.toggleBulletList(),
    isActive: (editor) => editor.isActive('bulletList'),
    holdsText: true,
  },
  {
    id: 'orderedList',
    nodeType: 'orderedList',
    label: (t) => t('editor.orderedList'),
    icon: <NumberedListIcon />,
    keywords: ['ol', 'numbered', 'ordered', 'list', '1.'],
    available: withExtension('orderedList'),
    insert: (chain) => chain.toggleOrderedList(),
    isActive: (editor) => editor.isActive('orderedList'),
    holdsText: true,
  },
  {
    id: 'taskList',
    nodeType: 'taskList',
    label: (t) => t('editor.taskList'),
    icon: <ListTodo />,
    keywords: ['todo', 'task', 'checkbox', '[]'],
    available: withExtension('taskList'),
    insert: (chain) => chain.toggleTaskList(),
    isActive: (editor) => editor.isActive('taskList'),
    holdsText: true,
  },
  {
    id: 'blockquote',
    nodeType: 'blockquote',
    label: (t) => t('editor.blockquote'),
    icon: <TextQuote />,
    keywords: ['quote', 'blockquote', '>'],
    available: withExtension('blockquote'),
    insert: (chain) => chain.toggleBlockquote(),
    isActive: (editor) => editor.isActive('blockquote'),
    holdsText: true,
  },
  {
    id: 'codeBlock',
    nodeType: 'codeBlock',
    label: (t) => t('editor.codeBlock'),
    icon: <SquareCode />,
    keywords: ['code', 'pre', '```'],
    available: withExtension('codeBlock'),
    insert: (chain) => chain.setCodeBlock(),
    isActive: (editor) => editor.isActive('codeBlock'),
    holdsText: true,
  },
  {
    id: 'callout',
    nodeType: 'callout',
    label: (t) => t('editor.callout'),
    icon: <InformationCircleIcon />,
    keywords: ['callout', 'note', 'tip', 'warning', 'alert'],
    available: withExtension('callout'),
    insert: (chain) => chain.setCallout(),
    isActive: (editor) => editor.isActive('callout'),
    holdsText: true,
  },
  {
    id: 'details',
    nodeType: 'details',
    label: (t) => t('editor.details'),
    icon: <ListCollapse />,
    keywords: ['toggle', 'details', 'collapse', 'fold'],
    available: withExtension('details'),
    insert: (chain) => chain.setDetails().updateAttributes('details', { open: true }),
    isActive: (editor) => editor.isActive('details'),
    holdsText: false,
  },
  {
    id: 'horizontalRule',
    nodeType: 'horizontalRule',
    label: (t) => t('editor.horizontalRule'),
    icon: <MinusIcon />,
    keywords: ['divider', 'hr', 'line', 'separator', '---'],
    available: withExtension('horizontalRule'),
    insert: (chain) => chain.setHorizontalRule(),
    isActive: () => false,
    holdsText: false,
  },
  {
    id: 'table',
    nodeType: 'table',
    label: (t) => t('editor.table'),
    icon: <TableCellsIcon />,
    keywords: ['table', 'grid'],
    available: withExtension('table'),
    insert: (chain) => insertTable(chain),
    isActive: (editor) => editor.isActive('table'),
    holdsText: false,
  },
];

export const turnsIntoOtherBlocks = (node: ProseMirrorNode) =>
  EDITOR_BLOCKS.some((block) => block.holdsText && block.nodeType === node.type.name);

export const blocksAvailableIn = (editor: TiptapEditor) =>
  EDITOR_BLOCKS.filter((block) => block.available(editor));

const withoutSpaces = (text: string) => text.replace(/\s+/g, '');

export const blockMatches = (block: EditorBlock, query: string, t: Translate) =>
  matchesSearch(withoutSpaces(block.label(t)), withoutSpaces(query)) ||
  block.keywords.some((keyword) => keyword.startsWith(query.trim().toLowerCase()));
