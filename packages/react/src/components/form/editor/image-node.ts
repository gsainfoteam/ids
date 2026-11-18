import { FileHandler } from '@tiptap/extension-file-handler';
import { Image, type ImageOptions } from '@tiptap/extension-image';
import { Fragment, Slice, type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { IMAGE_TYPES, isAllowedImageSource, type ImageUpload } from './image-source';
import { editorStyle } from './style';
import { cn } from '../../../utils';
import { skeletonStyle } from '../../feedback/skeleton/style';

import type { Editor as TiptapEditor } from '@tiptap/core';

function withoutImages(fragment: Fragment): Fragment {
  const kept: ProseMirrorNode[] = [];
  fragment.forEach((node) => {
    if (node.type.name === 'image') return;
    kept.push(node.isLeaf ? node : node.copy(withoutImages(node.content)));
  });
  return Fragment.from(kept);
}

const pastedImagesAreDropped = new Plugin({
  props: {
    transformPasted: (slice, view) => {
      if (view.dragging) return slice;
      const content = withoutImages(slice.content);
      return content.size === 0 ? Slice.empty : new Slice(content, slice.openStart, slice.openEnd);
    },
  },
});

type UploadMeta = { add: { id: symbol; pos: number } } | { remove: symbol };

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

type EditorImageOptions = ImageOptions & {
  uploaded: ReadonlySet<string>;
  insertable: boolean;
};

export const EditorImageNode = Image.extend<EditorImageOptions>({
  addOptions() {
    return {
      ...(this.parent?.() as ImageOptions),
      uploaded: new Set<string>(),
      insertable: false,
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (element) =>
          isAllowedImageSource(element.getAttribute('src'), this.options.uploaded) ? null : false,
      },
    ];
  },

  parseMarkdown(token, helpers) {
    if (!isAllowedImageSource(token.href, this.options.uploaded)) return [];
    return helpers.createNode('image', { src: token.href, title: token.title, alt: token.text });
  },

  addInputRules() {
    return [];
  },

  addProseMirrorPlugins() {
    return this.options.insertable ? [uploadPlaceholders] : [pastedImagesAreDropped];
  },
});

export function imageFileHandler(start: (editor: TiptapEditor, files: File[], at: number) => void) {
  return FileHandler.configure({
    allowedMimeTypes: IMAGE_TYPES,
    consumePasteEvent: true,
    onPaste: (editor, files) => start(editor, files, editor.state.selection.to),
    onDrop: (editor, files, pos) => start(editor, files, pos),
  });
}
