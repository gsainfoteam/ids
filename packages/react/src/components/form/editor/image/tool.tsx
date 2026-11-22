'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';

import { PhotoIcon } from '@heroicons/react/16/solid';
import { noop } from 'es-toolkit';

import { useEditorContext } from '../context';
import { IMAGE_ACCEPT } from './types';
import { useTranslate } from '../../../../internal/translate';
import { isDevelopment } from '../../../../utils/dev';
import { Button } from '../../../action/button';
import { IconToggle } from '../../../action/icon-toggle';
import { Spinner } from '../../../feedback/spinner';
import { Popover } from '../../../overlay/popover';
import { isWebAddress } from '../../../typography/rich-text/schema/url-rules';
import { TextField } from '../../text-field';
import { editorMessages } from '../messages-catalog';
import { isPlainEnter, withProtocol } from '../popover-form';
import { EditorToolTip, useEditorToolProps, useToolState, type EditorToolProps } from '../tool';

import type { Editor as TiptapEditor } from '@tiptap/core';

export type EditorImageProps = EditorToolProps;

const IMAGE = {
  isActive: (editor: TiptapEditor) => editor.isActive('image'),
  can: () => true,
};

let warnedWithoutUpload = false;

function warnThereIsNoUpload() {
  if (!isDevelopment || warnedWithoutUpload) return;
  warnedWithoutUpload = true;
  console.warn(
    '`<Editor.Image>` renders nothing without `onImageUpload` on `<Editor>`, since the image would have nowhere to go.',
  );
}

type ImagePopover = 'insert' | 'alt';

export function EditorImage({ icon, 'aria-label': ariaLabel, className }: EditorImageProps) {
  const t = useTranslate(editorMessages);
  const { editor, editable, images, styles } = useEditorContext('Editor.Image');
  const state = useToolState(IMAGE);
  const tool = useEditorToolProps('Image');
  const inputRef = useRef<HTMLInputElement>(null);
  const urlErrorId = useId();
  const [open, setOpen] = useState<ImagePopover | null>(null);
  const [alt, setAlt] = useState('');
  const [url, setUrl] = useState('');
  const [urlRejected, setUrlRejected] = useState(false);

  if (!images) {
    warnThereIsNoUpload();
    return null;
  }

  const uploading = images.pending > 0;
  const label = ariaLabel ?? t('editor.image');

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

  const onEnter = (action: () => void) => (event: KeyboardEvent) => {
    if (!isPlainEnter(event)) return;
    event.preventDefault();
    action();
  };

  return (
    <>
      <Popover
        open={open !== null}
        onOpenChange={(next) => {
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
        }}
      >
        <EditorToolTip label={label} disabled={!editable}>
          <Popover.Trigger asChild>
            <IconToggle
              {...tool}
              variant="soft"
              size="tiny"
              icon={uploading ? <Spinner decorative /> : (icon ?? <PhotoIcon />)}
              aria-label={label}
              aria-busy={uploading || undefined}
              className={className}
              pressed={state.active}
              disabled={!editable}
              onPressedChange={noop}
            />
          </Popover.Trigger>
        </EditorToolTip>
        <Popover.Content
          aria-label={open === 'alt' ? t('editor.imageAlt') : t('editor.image')}
          initialFocus="input"
          side="bottom"
          align="start"
        >
          {open === 'alt' ? (
            <div className={styles.linkForm()}>
              <TextField
                size="tiny"
                aria-label={t('editor.imageAlt')}
                placeholder={t('editor.imageAltPlaceholder')}
                value={alt}
                onValueChange={setAlt}
                onKeyDown={onEnter(applyAlt)}
                data-1p-ignore=""
                data-lpignore="true"
              />
              <div className={styles.linkActions()}>
                <Button size="tiny" onClick={applyAlt}>
                  {t('editor.linkApply')}
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.linkForm()}>
              <TextField
                size="tiny"
                type="url"
                aria-label={t('editor.imageUrl')}
                placeholder="https://"
                value={url}
                invalid={urlRejected}
                aria-describedby={urlRejected ? urlErrorId : undefined}
                onValueChange={(next) => {
                  setUrl(next);
                  setUrlRejected(false);
                }}
                onKeyDown={onEnter(insertUrl)}
                data-1p-ignore=""
                data-lpignore="true"
              />
              {urlRejected && (
                <p id={urlErrorId} className={styles.imageUrlError()}>
                  {t('editor.imageUrlInvalid')}
                </p>
              )}
              <div className={styles.linkActions()}>
                <Button size="tiny" variant="outline" colorScheme="neutral" onClick={pickFiles}>
                  {t('editor.imagePickFiles')}
                </Button>
                <Button size="tiny" onClick={insertUrl}>
                  {t('editor.imageInsert')}
                </Button>
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        tabIndex={-1}
        aria-hidden="true"
        data-editor-image-input=""
        className={styles.imageInput()}
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          event.currentTarget.value = '';
          if (editor && files.length > 0) images.upload(files, editor.state.selection.to);
        }}
      />
    </>
  );
}

EditorImage.displayName = 'Editor.Image';
