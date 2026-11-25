'use client';

import { useId, useRef, useState } from 'react';

import { isWebAddress } from '../../../typography/rich-text/schema/url-rules';
import { withProtocol } from '../lib/popover-form';

import type { Editor as TiptapEditor } from '@tiptap/core';

type ImagePopover = 'insert' | 'alt';

export function useInternalEditorImagePopover(editor: TiptapEditor | null) {
  const inputRef = useRef<HTMLInputElement>(null);
  const urlErrorId = useId();
  const [open, setOpen] = useState<ImagePopover | null>(null);
  const [alt, setAlt] = useState('');
  const [url, setUrl] = useState('');
  const [urlRejected, setUrlRejected] = useState(false);

  const applyAlt = () => {
    editor?.chain().focus().updateAttributes('image', { alt: alt.trim() }).run();
    setOpen(null);
  };

  const insertUrl = () => {
    const src = withProtocol(url.trim());
    if (!isWebAddress(src)) {
      setUrlRejected(true);
      return;
    }
    editor?.chain().focus().setImage({ src }).run();
    setOpen(null);
  };

  const pickFiles = () => {
    setOpen(null);
    inputRef.current?.click();
  };

  const onOpenChange = (next: boolean) => {
    if (!next) {
      setOpen(null);
      return;
    }
    if (editor?.isActive('image')) {
      setAlt((editor.getAttributes('image').alt as string | null | undefined) ?? '');
      setOpen('alt');
      return;
    }
    setUrl('');
    setUrlRejected(false);
    setOpen('insert');
  };

  const changeUrl = (next: string) => {
    setUrl(next);
    setUrlRejected(false);
  };

  return {
    inputRef,
    urlErrorId,
    open,
    onOpenChange,
    alt,
    setAlt,
    applyAlt,
    url,
    changeUrl,
    urlRejected,
    insertUrl,
    pickFiles,
  };
}
