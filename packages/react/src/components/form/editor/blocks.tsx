'use client';

import { ListBulletIcon, NumberedListIcon } from '@heroicons/react/16/solid';
import { ListTodo, SquareCode, TextQuote } from 'lucide-react';

import { EditorToggleTool, type EditorToggleSpec, type EditorToolProps } from './tool';

export type EditorBlockProps = EditorToolProps;

const BULLET_LIST: EditorToggleSpec = {
  name: 'BulletList',
  label: 'editor.bulletList',
  icon: <ListBulletIcon />,
  isActive: (editor) => editor.isActive('bulletList'),
  can: (editor) => editor.can().toggleBulletList(),
  run: (editor) => editor.chain().toggleBulletList().run(),
};

const ORDERED_LIST: EditorToggleSpec = {
  name: 'OrderedList',
  label: 'editor.orderedList',
  icon: <NumberedListIcon />,
  isActive: (editor) => editor.isActive('orderedList'),
  can: (editor) => editor.can().toggleOrderedList(),
  run: (editor) => editor.chain().toggleOrderedList().run(),
};

const TASK_LIST: EditorToggleSpec = {
  name: 'TaskList',
  label: 'editor.taskList',
  icon: <ListTodo />,
  isActive: (editor) => editor.isActive('taskList'),
  can: (editor) => editor.can().toggleTaskList(),
  run: (editor) => editor.chain().toggleTaskList().run(),
  extension: 'taskList',
};

const BLOCKQUOTE: EditorToggleSpec = {
  name: 'Blockquote',
  label: 'editor.blockquote',
  icon: <TextQuote />,
  isActive: (editor) => editor.isActive('blockquote'),
  can: (editor) => editor.can().toggleBlockquote(),
  run: (editor) => editor.chain().toggleBlockquote().run(),
};

const CODE_BLOCK: EditorToggleSpec = {
  name: 'CodeBlock',
  label: 'editor.codeBlock',
  icon: <SquareCode />,
  isActive: (editor) => editor.isActive('codeBlock'),
  can: (editor) => editor.can().toggleCodeBlock(),
  run: (editor) => editor.chain().toggleCodeBlock().run(),
};

export function EditorBulletList(props: EditorBlockProps) {
  return <EditorToggleTool {...props} spec={BULLET_LIST} />;
}

EditorBulletList.displayName = 'Editor.BulletList';

export function EditorOrderedList(props: EditorBlockProps) {
  return <EditorToggleTool {...props} spec={ORDERED_LIST} />;
}

EditorOrderedList.displayName = 'Editor.OrderedList';

export function EditorTaskList(props: EditorBlockProps) {
  return <EditorToggleTool {...props} spec={TASK_LIST} />;
}

EditorTaskList.displayName = 'Editor.TaskList';

export function EditorBlockquote(props: EditorBlockProps) {
  return <EditorToggleTool {...props} spec={BLOCKQUOTE} />;
}

EditorBlockquote.displayName = 'Editor.Blockquote';

export function EditorCodeBlock(props: EditorBlockProps) {
  return <EditorToggleTool {...props} spec={CODE_BLOCK} />;
}

EditorCodeBlock.displayName = 'Editor.CodeBlock';
