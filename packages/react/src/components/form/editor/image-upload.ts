import { Extension } from '@tiptap/core';
import { FileHandler } from '@tiptap/extension-file-handler';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { IMAGE_TYPES, type ImageUpload } from './image-types';
import { editorStyle } from './style';
import { cn } from '../../../utils';
import { skeletonStyle } from '../../feedback/skeleton/style';

import type { Editor as TiptapEditor } from '@tiptap/core';

type UploadMeta = { add: { id: symbol; pos: number } } | { remove: symbol };

export type StartUploads = (editor: TiptapEditor, files: File[], at: number) => void;

const uploads = new PluginKey<DecorationSet>('idsImageUploads');

const skeleton = skeletonStyle({ shape: 'rect', animation: 'pulse' });
const UPLOAD_PLACEHOLDER = skeleton.root({
  className: cn(skeleton.paint(), editorStyle().uploadPlaceholder()),
});

function uploadPlaceholder() {
  const placeholder = document.createElement('span');
  placeholder.setAttribute('data-editor-upload', '');
  placeholder.className = UPLOAD_PLACEHOLDER;
  return placeholder;
}

const uploadPlaceholders = new Plugin<DecorationSet>({
  key: uploads,
  state: {
    init: () => DecorationSet.empty,
    apply(tr, set) {
      const mapped = set.map(tr.mapping, tr.doc);
      const meta = tr.getMeta(uploads) as UploadMeta | undefined;
      if (!meta) return mapped;
      if ('add' in meta)
        return mapped.add(tr.doc, [
          Decoration.widget(meta.add.pos, uploadPlaceholder, { id: meta.add.id }),
        ]);
      return mapped.remove(mapped.find(undefined, undefined, (spec) => spec.id === meta.remove));
    },
  },
  props: { decorations: (state) => uploads.getState(state) },
});

function placeholderPosition(editor: TiptapEditor, id: symbol) {
  return uploads
    .getState(editor.state)
    ?.find(undefined, undefined, (spec) => spec.id === id)
    .at(0)?.from;
}

const dispatchMeta = (editor: TiptapEditor, meta: UploadMeta) => {
  if (!editor.isDestroyed) editor.view.dispatch(editor.state.tr.setMeta(uploads, meta));
};

export async function uploadImage(
  editor: TiptapEditor,
  file: File,
  at: number,
  { upload, uploaded }: { upload: ImageUpload; uploaded: Set<string> },
) {
  const id = Symbol(file.name);
  dispatchMeta(editor, { add: { id, pos: at } });

  let src: unknown;
  try {
    src = await upload(file);
  } catch (reason) {
    dispatchMeta(editor, { remove: id });
    throw reason;
  }
  if (typeof src !== 'string' || src === '') {
    dispatchMeta(editor, { remove: id });
    throw new TypeError('`onImageUpload` must resolve to the URL of the uploaded image.');
  }

  uploaded.add(src);
  if (editor.isDestroyed) return;
  const pos = placeholderPosition(editor, id);
  if (pos === undefined) return;
  editor
    .chain()
    .command(({ tr }) => {
      tr.setMeta(uploads, { remove: id } satisfies UploadMeta);
      return true;
    })
    .insertContentAt(pos, { type: 'image', attrs: { src, alt: '' } }, { updateSelection: false })
    .run();
}

const UploadPlaceholders = Extension.create({
  name: 'idsImageUploads',
  addProseMirrorPlugins: () => [uploadPlaceholders],
});

export function imageUploadExtensions(start: StartUploads) {
  return [
    UploadPlaceholders,
    FileHandler.configure({
      allowedMimeTypes: IMAGE_TYPES,
      consumePasteEvent: true,
      onPaste: (editor, files) => start(editor, files, editor.state.selection.to),
      onDrop: (editor, files, pos) => start(editor, files, pos),
    }),
  ];
}
