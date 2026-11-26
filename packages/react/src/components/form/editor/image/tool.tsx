'use client';

import { PhotoIcon } from '@heroicons/react/16/solid';
import { noop } from 'es-toolkit';

import { useInternalEditorContext } from '../context';
import { IMAGE_ACCEPT } from './types';
import { useInternalTranslate } from '../../../../internal/translate';
import { warnOnce } from '../../../../utils/dev';
import { Button } from '../../../action/button';
import { IconToggle } from '../../../action/icon-toggle';
import { Spinner } from '../../../feedback/spinner';
import { Popover } from '../../../overlay/popover';
import { TextField } from '../../text-field';
import { useInternalEditorImagePopover } from '../hooks/use-editor-image-popover';
import { useInternalEditorToolProps } from '../hooks/use-editor-tool-props';
import { useInternalEditorToolState } from '../hooks/use-editor-tool-state';
import { onPlainEnter } from '../lib/popover-form';
import { editorMessages } from '../messages-catalog';
import { EditorToolTip, type EditorToolProps } from '../parts/tool';

import type { Editor as TiptapEditor } from '@tiptap/core';

export type EditorImageProps = EditorToolProps;

const IMAGE = {
  isActive: (editor: TiptapEditor) => editor.isActive('image'),
  can: () => true,
};

function warnThereIsNoUpload() {
  warnOnce(
    '`<Editor.Image>` renders nothing without `onImageUpload` on `<Editor>`, since the image would have nowhere to go.',
  );
}

export function EditorImage({ icon, 'aria-label': ariaLabel, className }: EditorImageProps) {
  const t = useInternalTranslate(editorMessages);
  const { editor, editable, images, styles } = useInternalEditorContext('Editor.Image');
  const state = useInternalEditorToolState(IMAGE);
  const tool = useInternalEditorToolProps('Image');
  const {
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
  } = useInternalEditorImagePopover(editor);

  if (!images) {
    warnThereIsNoUpload();
    return null;
  }

  const uploading = images.pending > 0;
  const label = ariaLabel ?? t('editor.image');

  return (
    <>
      <Popover open={open !== null} onOpenChange={onOpenChange}>
        <EditorToolTip label={label} disabled={!editable}>
          <Popover.Trigger asChild>
            <IconToggle
              {...tool}
              variant="soft"
              size="tiny"
              icon={uploading ? <Spinner aria-hidden /> : (icon ?? <PhotoIcon />)}
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
                value={alt}
                onValueChange={setAlt}
                onKeyDown={onPlainEnter(applyAlt)}
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
                aria-invalid={urlRejected}
                aria-describedby={urlRejected ? urlErrorId : undefined}
                onValueChange={changeUrl}
                onKeyDown={onPlainEnter(insertUrl)}
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
