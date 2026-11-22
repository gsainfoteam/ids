'use client';

import { useState } from 'react';

import { LinkIcon } from '@heroicons/react/16/solid';
import { noop } from 'es-toolkit';

import { useEditorContext } from './context';
import { isPlainEnter, withProtocol } from './popover-form';
import { useEditorToolProps, useToolState, type EditorToolProps } from './tool';
import { useTranslate } from '../../../internal/translate';
import { Button } from '../../action/button';
import { IconToggle } from '../../action/icon-toggle';
import { Popover } from '../../overlay/popover';
import { TextField } from '../text-field';

import type { Editor as TiptapEditor } from '@tiptap/core';

export type EditorLinkProps = EditorToolProps;

const LINK = {
  isActive: (editor: TiptapEditor) => editor.isActive('link'),
  can: (editor: TiptapEditor) => !editor.isActive('codeBlock') && !editor.isActive('code'),
};

export function EditorLink({ icon, 'aria-label': ariaLabel, className }: EditorLinkProps) {
  const t = useTranslate();
  const { editor, editable, styles } = useEditorContext('Editor.Link');
  const state = useToolState(LINK);
  const tool = useEditorToolProps('Link');
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

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setHref((editor?.getAttributes('link').href as string | undefined) ?? '');
        setOpen(next);
      }}
    >
      <Popover.Trigger asChild>
        <IconToggle
          {...tool}
          variant="soft"
          size="tiny"
          icon={icon ?? <LinkIcon />}
          aria-label={ariaLabel ?? t('editor.link')}
          className={className}
          pressed={state.active}
          disabled={!editable || !state.enabled}
          onPressedChange={noop}
        />
      </Popover.Trigger>
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
