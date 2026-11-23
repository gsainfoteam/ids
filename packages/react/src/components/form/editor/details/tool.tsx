'use client';

import { ListCollapse } from 'lucide-react';

import { EditorToggleTool, type EditorToggleSpec, type EditorToolProps } from '../parts/tool';

export type EditorDetailsProps = EditorToolProps;

const DETAILS: EditorToggleSpec = {
  name: 'Details',
  label: 'editor.details',
  icon: <ListCollapse />,
  isActive: (editor) => editor.isActive('details'),
  can: (editor) => editor.isActive('details') || editor.can().setDetails(),
  run: (editor) =>
    editor.isActive('details')
      ? editor.chain().unsetDetails().run()
      : editor.chain().setDetails().updateAttributes('details', { open: true }).run(),
  extension: 'details',
};

export function EditorDetails(props: EditorDetailsProps) {
  return <EditorToggleTool {...props} spec={DETAILS} />;
}

EditorDetails.displayName = 'Editor.Details';
