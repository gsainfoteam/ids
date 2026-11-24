'use client';

import { useState } from 'react';

import { LinkIcon } from '@heroicons/react/16/solid';
import { noop } from 'es-toolkit';

import { useInternalEditorContext } from '../context';
import { EditorToolTip, useInternalEditorToolProps, useInternalToolState, type EditorToolProps } from './tool';
import { useInternalTranslate } from '../../../../internal/translate';
import { Button } from '../../../action/button';
import { IconToggle } from '../../../action/icon-toggle';
import { Popover } from '../../../overlay/popover';
import { TextField } from '../../text-field';
import { isPlainEnter, withProtocol } from '../lib/popover-form';
import { editorMessages } from '../messages-catalog';

import type { Editor as TiptapEditor } from '@tiptap/core';

export type EditorLinkProps = EditorToolProps;

const LINK = {
  isActive: (editor: TiptapEditor) => editor.isActive('link'),
  can: (editor: TiptapEditor) => !editor.isActive('codeBlock') && !editor.isActive('code'),
};

export function EditorLink({ icon, 'aria-label': ariaLabel, className }: EditorLinkProps) {
  const t = useInternalTranslate(editorMessages);
  const { editor, editable, styles } = useInternalEditorContext('Editor.Link');
  const state = useInternalToolState(LINK);
  const tool = useInternalEditorToolProps('Link');
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState('');
  const label = ariaLabel ?? t('editor.link');
  const disabled = !editable || !state.enabled;

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

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setHref((editor?.getAttributes('link').href as string | undefined) ?? '');
        setOpen(next);
      }}
    >
      <EditorToolTip label={label} disabled={disabled}>
        <Popover.Trigger asChild>
          <IconToggle
            {...tool}
            variant="soft"
            size="tiny"
            icon={icon ?? <LinkIcon />}
            aria-label={label}
            className={className}
            pressed={state.active}
            disabled={disabled}
            onPressedChange={noop}
          />
        </Popover.Trigger>
      </EditorToolTip>
      <Popover.Content
        aria-label={t('editor.link')}
        className="w-max"
        initialFocus="input"
        side="bottom"
        align="start"
      >
        <div className={styles.linkRow()}>
          <TextField
            type="url"
            size="tiny"
            className={styles.linkUrl()}
            aria-label={t('editor.linkUrl')}
            placeholder="https://"
            value={href}
            onValueChange={setHref}
            onKeyDown={(event) => {
              if (!isPlainEnter(event)) return;
              event.preventDefault();
              applyLink();
            }}
            data-1p-ignore=""
            data-lpignore="true"
          />
          {state.active && (
            <Button variant="outline" size="tiny" onClick={removeLink}>
              {t('editor.linkRemove')}
            </Button>
          )}
          <Button size="tiny" onClick={applyLink}>
            {t('editor.linkApply')}
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  );
}

EditorLink.displayName = 'Editor.Link';
