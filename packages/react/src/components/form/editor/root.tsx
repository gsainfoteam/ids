'use client';

import {
  isValidElement,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

import { Highlight } from '@tiptap/extension-highlight';
import { TaskList } from '@tiptap/extension-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { isEqual } from 'es-toolkit';

import { EditorBar } from './bar';
import { EditorBlockType } from './block-type';
import {
  EditorBlockquote,
  EditorBulletList,
  EditorCodeBlock,
  EditorOrderedList,
  EditorTaskList,
} from './blocks';
import { EditorBubbleMenu } from './bubble-menu';
import { EditorContentPart, type EditorContentProps } from './content';
import { EditorContext, type EditorImages } from './context';
import { EditorCount } from './count';
import { LeaveEscapeToTheLayers } from './escape-to-layers';
import { EditorHorizontalRule } from './horizontal-rule';
import { EditorImage } from './image';
import {
  EditorImageNode,
  imageFileHandler,
  isImageFile,
  uploadImage,
  type ImageUpload,
} from './image-node';
import { EditorLink } from './link';
import {
  EditorBold,
  EditorCode,
  EditorHighlight,
  EditorItalic,
  EditorStrike,
  EditorUnderline,
} from './marks';
import { EditorSeparator } from './separator';
import { editorStyle } from './style';
import { EditorTaskItemNode } from './task-item-node';
import { EditorTextAlign } from './text-align';
import { useEditorSelector } from './use-editor-selector';
import {
  formText,
  isEmptyValue,
  readValue,
  writable,
  writeValue,
  type EditorFormat,
  type EditorValue,
} from './value';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { useFormReset } from '../../../hooks/use-form-reset';
import { FormValue } from '../../../internal/form-value';
import { useTranslate, type Translate } from '../../../internal/translate';
import { containsElementOfType, elementTypeOf, flattenFragments, invariant } from '../../../utils';
import { toast } from '../../feedback/toast/toast-store';
import { FieldNotifyContext, useFieldSize } from '../field/context';

import type { Editor } from '.';
import type { Editor as TiptapEditor, Extensions } from '@tiptap/core';

export type EditorVariant = 'outline' | 'soft';

export type EditorState = {
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  focused: boolean;
  filled: boolean;
};

const TOOLS = new Set<unknown>([
  EditorBlockType,
  EditorBold,
  EditorItalic,
  EditorUnderline,
  EditorStrike,
  EditorCode,
  EditorHighlight,
  EditorLink,
  EditorImage,
  EditorBulletList,
  EditorOrderedList,
  EditorTaskList,
  EditorBlockquote,
  EditorCodeBlock,
  EditorHorizontalRule,
  EditorTextAlign,
]);

function defaultToolbar({ withImage }: { withImage: boolean }) {
  return (
    <>
      <EditorBlockType />
      <EditorSeparator />
      <EditorBold />
      <EditorItalic />
      <EditorStrike />
      <EditorCode />
      <EditorLink />
      {withImage && <EditorImage />}
      <EditorSeparator />
      <EditorBulletList />
      <EditorOrderedList />
      <EditorBlockquote />
      <EditorCodeBlock />
    </>
  );
}

const DEFAULT_TOOLBAR = defaultToolbar({ withImage: false });
const DEFAULT_TOOLBAR_WITH_IMAGE = defaultToolbar({ withImage: true });

const isOfType = (type: unknown) => (node: ReactNode) =>
  isValidElement(node) && elementTypeOf(node) === type;

const isTool = (node: ReactNode) => isValidElement(node) && TOOLS.has(elementTypeOf(node));

function splitByContent(children: ReactNode) {
  const items = flattenFragments(children);
  const bubbles = items.filter(isOfType(EditorBubbleMenu));
  const laidOut = items.filter((item) => !isOfType(EditorBubbleMenu)(item));
  const indexes = laidOut.flatMap((item, index) =>
    isOfType(EditorContentPart)(item) ? [index] : [],
  );
  invariant(indexes.length <= 1, '`<Editor>` accepts at most one `<Editor.Content />`.');
  const index = indexes[0];
  if (index === undefined)
    return { items, bubbles, top: laidOut, content: <EditorContentPart />, bottom: [] };
  return {
    items,
    bubbles,
    top: laidOut.slice(0, index),
    content: laidOut[index] as ReactElement<EditorContentProps>,
    bottom: laidOut.slice(index + 1),
  };
}

const REPORTS_AWAITING_AN_ECHO = 32;

const joinIds = (...ids: (string | undefined | false)[]) =>
  ids.filter(Boolean).join(' ') || undefined;

function definedOnly(record: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(record).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
}

const placeholderOfTheTextbox = ({ editor }: { editor: TiptapEditor }) =>
  editor.view.dom.getAttribute('aria-placeholder') ?? '';

type EditorParts = { highlight: boolean; taskList: boolean; textAlign: boolean };

const usesPart = (source: ReactNode, part: unknown) => containsElementOfType(source, new Set([part]));

function partsIn(source: ReactNode): EditorParts {
  return {
    highlight: usesPart(source, EditorHighlight),
    taskList: usesPart(source, EditorTaskList),
    textAlign: usesPart(source, EditorTextAlign),
  };
}

type ImageSetup = {
  uploaded: ReadonlySet<string>;
  start: ((editor: TiptapEditor, files: File[], at: number) => void) | null;
};

function extensionsFor({
  format,
  maxLength,
  parts,
  images,
  taskLabel,
}: {
  format: EditorFormat;
  maxLength: number | undefined;
  parts: EditorParts;
  images: ImageSetup;
  taskLabel: (text: string) => string;
}): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      gapcursor: false,
      trailingNode: false,
      link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
    }),
    Placeholder.configure({ placeholder: placeholderOfTheTextbox }),
    CharacterCount.configure({ limit: maxLength }),
    LeaveEscapeToTheLayers,
    EditorImageNode.configure({ uploaded: images.uploaded, insertable: images.start !== null }),
    ...(images.start ? [imageFileHandler(images.start)] : []),
    ...(parts.highlight ? [Highlight] : []),
    ...(parts.taskList
      ? [
          TaskList,
          EditorTaskItemNode.configure({
            nested: true,
            a11y: { checkboxLabel: (node) => taskLabel(node.textContent) },
          }),
        ]
      : []),
    ...(parts.textAlign ? [TextAlign.configure({ types: ['heading', 'paragraph'] })] : []),
    ...(format === 'markdown' ? [Markdown] : []),
  ];
}

function taskLabelIn(t: Translate) {
  return (text: string) => (text === '' ? t('editor.taskItemEmpty') : t('editor.taskItem', { text }));
}

export function EditorRoot(props: Editor.Props) {
  const {
    format = 'html',
    onImageUpload,
    value,
    defaultValue,
    onValueChange,
    name,
    form,
    required = false,
    disabled = false,
    readOnly = false,
    invalid: invalidProp,
    maxLength,
    variant = 'outline',
    size: sizeProp,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-invalid': ariaInvalid,
    'aria-required': ariaRequired,
    className,
    style,
    children,
  } = props;
  const t = useTranslate();
  const size = useFieldSize(sizeProp) ?? 'standard';
  const generatedId = useId();
  const contentId = id ?? `ids-editor-${generatedId}`;
  const countId = `${contentId}-count`;
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const notifyField = use(FieldNotifyContext);
  const insertable = onImageUpload !== undefined;
  const shown =
    children === undefined ? (insertable ? DEFAULT_TOOLBAR_WITH_IMAGE : DEFAULT_TOOLBAR) : children;
  const { bubbles, top, content, bottom, items } = splitByContent(shown);
  const parts = partsIn(shown);
  const hasCount = items.some(isOfType(EditorCount));
  const editable = !disabled && !readOnly;
  const invalid = Boolean(
    invalidProp ?? (ariaInvalid === true || ariaInvalid === 'true' ? true : undefined),
  );

  const [current, setCurrent] = useControllableState<EditorValue | undefined>({
    value,
    defaultValue,
    onValueChange: onValueChange as ((next: EditorValue | undefined) => void) | undefined,
  });
  const [focused, setFocused] = useState(false);
  const [uploaded] = useState(() => new Set<string>());
  const [pendingUploads, setPendingUploads] = useState(0);

  const startUploads = (instance: TiptapEditor, files: readonly File[], at: number) => {
    const upload = latest.current.onImageUpload;
    if (!upload) return;
    const accepted = files.filter(isImageFile);
    for (const file of files.filter((candidate) => !isImageFile(candidate)))
      toast.error(t('editor.imageNotSupported'), { description: file.name });
    setPendingUploads((count) => count + accepted.length);
    for (const file of accepted)
      void uploadImage(instance, file, at, { upload, uploaded })
        .catch(() => toast.error(t('editor.imageUploadFailed'), { description: file.name }))
        .finally(() => setPendingUploads((count) => count - 1));
  };

  const latest = useRef<{
    format: EditorFormat;
    setCurrent: typeof setCurrent;
    onImageUpload: ImageUpload | undefined;
    startUploads: typeof startUploads;
    t: Translate;
  }>({ format, setCurrent, onImageUpload, startUploads, t });
  useLayoutEffect(() => {
    latest.current = { format, setCurrent, onImageUpload, startUploads, t };
  });
  const reportedSinceTheLastRender = useRef<EditorValue[]>([]);

  const styles = editorStyle({ variant, size, editable });
  const contentAttributes = definedOnly({
    id: contentId,
    role: 'textbox',
    'aria-multiline': 'true',
    'aria-label': ariaLabel ?? (ariaLabelledby ? undefined : t('editor.content')),
    'aria-placeholder': content.props.placeholder || undefined,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': joinIds(ariaDescribedby, hasCount && countId),
    'aria-invalid': invalid ? 'true' : undefined,
    'aria-required': (ariaRequired ?? required) ? 'true' : undefined,
    'aria-readonly': readOnly ? 'true' : undefined,
    'aria-disabled': disabled ? 'true' : undefined,
    'data-field-input': '',
    'data-editor-content': '',
    class: styles.content({ className: content.props.className }),
  });

  const [callIntoTheLatestRender] = useState(() => ({
    startUploads: (instance: TiptapEditor, files: File[], at: number) =>
      latest.current.startUploads(instance, files, at),
    taskLabel: (text: string) => taskLabelIn(latest.current.t)(text),
  }));

  const { highlight, taskList, textAlign } = parts;
  const extensions = useMemo(
    () =>
      extensionsFor({
        format,
        maxLength,
        parts: { highlight, taskList, textAlign },
        images: { uploaded, start: insertable ? callIntoTheLatestRender.startUploads : null },
        taskLabel: callIntoTheLatestRender.taskLabel,
      }),
    [format, maxLength, highlight, taskList, textAlign, insertable, uploaded, callIntoTheLatestRender],
  );

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      injectCSS: false,
      editable,
      extensions,
      content: writable(current ?? '', format, uploaded),
      contentType: format,
      editorProps: { attributes: contentAttributes },
      onCreate: ({ editor: instance }) => {
        contentRef.current = instance.view.dom;
      },
      onUpdate: ({ editor: instance }) => {
        const next = readValue(instance, latest.current.format);
        reportedSinceTheLastRender.current = [
          ...reportedSinceTheLastRender.current.slice(-REPORTS_AWAITING_AN_ECHO),
          next,
        ];
        latest.current.setCurrent(next);
      },
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    },
    [extensions],
  );

  const attributesKey = JSON.stringify(contentAttributes);
  useLayoutEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setOptions({ editorProps: { attributes: JSON.parse(attributesKey) } });
  }, [editor, attributesKey]);

  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.isEditable !== editable)
      editor.setEditable(editable, false);
  }, [editor, editable]);

  useEffect(() => {
    if (!editor || editor.isDestroyed || value === undefined) return;
    const reported = reportedSinceTheLastRender.current;
    const echo = reported.map((report) => isEqual(report, value)).lastIndexOf(true);
    if (echo !== -1) {
      reportedSinceTheLastRender.current = reported.slice(echo + 1);
      return;
    }
    reportedSinceTheLastRender.current = [];
    if (isEqual(readValue(editor, format), value)) return;
    writeValue(editor, value, format, uploaded);
  }, [editor, value, format, uploaded]);

  useFormReset(rootRef, () => {
    if (!editor || value !== undefined) return;
    setCurrent(defaultValue, { silent: true });
    writeValue(editor, defaultValue, format, uploaded);
  });

  const empty = useEditorSelector(editor, (instance) => instance.isEmpty, isEmptyValue(current));

  const submitted = formText(current, empty);
  useLayoutEffect(() => {
    notifyField?.();
  }, [notifyField, submitted]);

  const state: EditorState = { disabled, readOnly, invalid, focused, filled: !empty };

  const images: EditorImages | null = insertable
    ? {
        pending: pendingUploads,
        upload: (files, at) => {
          if (editor) startUploads(editor, files, at);
        },
      }
    : null;

  return (
    <EditorContext
      value={{
        editor,
        editable,
        disabled,
        readOnly,
        size,
        contentId,
        countId,
        maxLength,
        contentAttributes,
        bubbles,
        images,
        styles,
      }}
    >
      <div
        ref={rootRef}
        data-editor=""
        data-size={size}
        data-variant={variant}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-invalid={invalid ? '' : undefined}
        data-focused={focused ? '' : undefined}
        data-filled={state.filled ? '' : undefined}
        className={styles.root({
          className: typeof className === 'function' ? className(state) : className,
        })}
        style={typeof style === 'function' ? style(state) : style}
      >
        {top.length > 0 && (
          <EditorBar toolbar scrolls className={styles.bar({ position: 'top' })}>
            {top}
          </EditorBar>
        )}
        {content}
        {bottom.length > 0 && (
          <EditorBar
            toolbar={bottom.some(isTool)}
            scrolls
            className={styles.bar({ position: 'bottom' })}
          >
            {bottom}
          </EditorBar>
        )}
        {insertable && (
          <span role="status" className="sr-only">
            {pendingUploads > 0 ? t('editor.imageUploading') : ''}
          </span>
        )}
        <FormValue
          name={name}
          form={form}
          value={submitted}
          required={required && !readOnly}
          disabled={disabled}
          anchor={contentRef}
        />
      </div>
    </EditorContext>
  );
}
