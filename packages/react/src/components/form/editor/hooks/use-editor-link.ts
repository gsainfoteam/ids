'use client';

import { useState } from 'react';

import { withProtocol } from '../lib/popover-form';

import type { Editor as TiptapEditor } from '@tiptap/core';

export function useInternalEditorLink(editor: TiptapEditor | null) {
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState('');

  const removeLink = () => {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    setOpen(false);
  };

  const applyLink = () => {
    if (!editor) return;
    const typed = href.trim();
    if (typed === '') {
      removeLink();
      return;
    }
    const url = withProtocol(typed);
    const theLinkExtensionAllowsTheAddress = editor.can().setLink({ href: url });
    if (!theLinkExtensionAllowsTheAddress) {
      setOpen(false);
      return;
    }
    const insertsTheAddressAsText = editor.state.selection.empty && !editor.isActive('link');
    const chain = editor.chain().focus().extendMarkRange('link');
    const linked = insertsTheAddressAsText
      ? chain.insertContent({
          type: 'text',
          text: typed,
          marks: [{ type: 'link', attrs: { href: url } }],
        })
      : chain.setLink({ href: url });
    linked.run();
    setOpen(false);
  };

  const onOpenChange = (next: boolean) => {
    if (next) setHref((editor?.getAttributes('link').href as string | undefined) ?? '');
    setOpen(next);
  };

  return { open, onOpenChange, href, setHref, applyLink, removeLink };
}
