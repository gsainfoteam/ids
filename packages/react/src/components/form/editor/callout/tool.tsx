'use client';

import { InformationCircleIcon } from '@heroicons/react/16/solid';

import { EditorToggleTool, type EditorToggleSpec, type EditorToolProps } from '../parts/tool';

export type EditorCalloutProps = EditorToolProps;

const CALLOUT: EditorToggleSpec = {
  name: 'Callout',
  label: 'editor.callout',
  icon: <InformationCircleIcon />,
  isActive: (editor) => editor.isActive('callout'),
  can: (editor) => editor.can().toggleCallout(),
  run: (editor) => editor.chain().toggleCallout().run(),
  extension: 'callout',
};

export function EditorCallout(props: EditorCalloutProps) {
  return <EditorToggleTool {...props} spec={CALLOUT} />;
}

EditorCallout.displayName = 'Editor.Callout';
