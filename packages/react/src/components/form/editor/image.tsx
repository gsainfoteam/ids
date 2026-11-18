'use client';

import { useRef, useState, type KeyboardEvent } from 'react';

import { PhotoIcon } from '@heroicons/react/16/solid';
import { noop } from 'es-toolkit';

import { useEditorContext } from './context';
import { IMAGE_TYPES } from './image-source';
import { useEditorToolProps, useToolState, type EditorToolProps } from './tool';
import { useTranslate } from '../../../internal/translate';
import { isDevelopment } from '../../../utils/dev';
import { Button } from '../../action/button';
import { IconToggle } from '../../action/icon-toggle';
import { Spinner } from '../../feedback/spinner';
import { Popover } from '../../overlay/popover';
import { TextField } from '../text-field';

import type { Editor as TiptapEditor } from '@tiptap/core';

export type EditorImageProps = EditorToolProps;

const IMAGE = {
  isActive: (editor: TiptapEditor) => editor.isActive('image'),
  can: () => true,
};

const ACCEPTED = IMAGE_TYPES.join(',');

const isPlainEnter = (event: KeyboardEvent) =>
  event.key === 'Enter' &&
  !event.nativeEvent.isComposing &&
  !event.shiftKey &&
  !event.altKey &&
  !event.ctrlKey &&
  !event.metaKey;

let warnedWithoutUpload = false;

function warnThereIsNoUpload() {
  if (!isDevelopment || warnedWithoutUpload) return;
  warnedWithoutUpload = true;
  console.warn(
    '`<Editor.Image>` renders nothing without `onImageUpload` on `<Editor>`, since the image would have nowhere to go.',
  );
}

export function EditorImage({ icon, 'aria-label': ariaLabel, className }: EditorImageProps) {
  const t = useTranslate();
  const { editor, editable, images, styles } = useEditorContext('Editor.Image');
  const state = useToolState(IMAGE);
  const tool = useEditorToolProps('Image');
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [alt, setAlt] = useState('');

  if (!images) {
    warnThereIsNoUpload();
    return null;
  }

  const uploading = images.pending > 0;

  const applyAlt = () => {
    editor?.chain().focus().updateAttributes('image', { alt: alt.trim() }).run();
    setOpen(false);
  };

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setOpen(false);
            return;
          }
          if (!editor?.isActive('image')) {
            inputRef.current?.click();
            return;
          }
          setAlt((editor.getAttributes('image').alt as string | null | undefined) ?? '');
          setOpen(true);
        }}
      >
        <Popover.Trigger asChild>
          <IconToggle
            {...tool}
            variant="soft"
            size="tiny"
            icon={uploading ? <Spinner decorative /> : (icon ?? <PhotoIcon />)}
            aria-label={ariaLabel ?? t('editor.image')}
            aria-busy={uploading || undefined}
            className={className}
            pressed={state.active}
            disabled={!editable}
            onPressedChange={noop}
          />
        </Popover.Trigger>
        <Popover.Content
          aria-label={t('editor.imageAlt')}
          initialFocus="input"
          side="bottom"
          align="start"
        >
          <div className={styles.linkForm()}>
            <TextField
              size="tiny"
              aria-label={t('editor.imageAlt')}
              placeholder={t('editor.imageAltPlaceholder')}
              value={alt}
              onValueChange={setAlt}
              onKeyDown={(event) => {
                if (!isPlainEnter(event)) return;
                event.preventDefault();
                applyAlt();
              }}
              data-1p-ignore=""
              data-lpignore="true"
            />
            <div className={styles.linkActions()}>
              <Button size="tiny" onClick={applyAlt}>
                {t('editor.linkApply')}
              </Button>
            </div>
          </div>
        </Popover.Content>
      </Popover>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
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
