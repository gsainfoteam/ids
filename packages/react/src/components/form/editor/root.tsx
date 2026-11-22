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

import { isEqual } from 'es-toolkit';

import { EditorBar } from './bar';
import { EditorBlockHandlePart } from './block-handle';
import { EditorBlockType } from './block-type';
import {
  EditorBlockquote,
  EditorBulletList,
  EditorCodeBlock,
  EditorOrderedList,
  EditorTaskList,
} from './blocks';
import { EditorBubbleMenu } from './bubble-menu';
import { EditorCallout } from './callout/tool';
import { EditorContentPart, type EditorContentProps } from './content';
import { EditorContext, type EditorImages } from './context';
import { EditorCount } from './count';
import { EditorDetails } from './details/tool';
import { EditorHorizontalRule } from './horizontal-rule';
import { EditorImage } from './image/tool';
import { isImageFile, type ImageUpload } from './image/types';
import { EditorLink } from './link';
import {
  EDITOR_FEATURES,
  engineKey,
  loadEngine,
  type EditorFeature,
  type LoadedEngine,
} from './load-engine';
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
import { EditorTable } from './table/tool';
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
import type { FindMentions } from './mention/node';
import type { Editor as TiptapEditor } from '@tiptap/core';

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
  EditorTable,
  EditorTextAlign,
  EditorCallout,
  EditorDetails,
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

const isFloating = (node: ReactNode) =>
  isOfType(EditorBubbleMenu)(node) || isOfType(EditorBlockHandlePart)(node);

const BLOCK_HANDLE = new Set<unknown>([EditorBlockHandlePart]);

const isTool = (node: ReactNode) => isValidElement(node) && TOOLS.has(elementTypeOf(node));

function splitByContent(children: ReactNode) {
  const items = flattenFragments(children);
  const bubbles = items.filter(isOfType(EditorBubbleMenu));
  const laidOut = items.filter((item) => !isFloating(item));
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

type ToolFeature = Exclude<EditorFeature, 'imageUpload' | 'mention'>;

const FEATURE_TOOLS: Record<ToolFeature, unknown> = {
  highlight: EditorHighlight,
  taskList: EditorTaskList,
  textAlign: EditorTextAlign,
  table: EditorTable,
  callout: EditorCallout,
  details: EditorDetails,
};

function featuresIn(
  source: ReactNode,
  props: Record<'imageUpload' | 'mention', boolean>,
): EditorFeature[] {
  return EDITOR_FEATURES.filter((feature) =>
    feature === 'imageUpload' || feature === 'mention'
      ? props[feature]
      : containsElementOfType(source, new Set([FEATURE_TOOLS[feature]])),
  );
}

function useLoadedEngine(format: EditorFormat, features: readonly EditorFeature[]) {
  const key = engineKey(format, features);
  const [loaded, setLoaded] = useState<LoadedEngine | null>(null);
  const requested = useRef({ format, features });
  useLayoutEffect(() => {
    requested.current = { format, features };
  });

  useEffect(() => {
    let mounted = true;
    void loadEngine(requested.current.format, requested.current.features).then((next) => {
      if (mounted) setLoaded(next);
    });
    return () => {
      mounted = false;
    };
  }, [key]);

  return loaded?.key === key ? loaded : null;
}

function taskLabelIn(t: Translate) {
  return (text: string) =>
    text === '' ? t('editor.taskItemEmpty') : t('editor.taskItem', { text });
}

export function EditorRoot(props: Editor.Props) {
  const {
    format = 'html',
    onImageUpload,
    mentions,
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
  const withHandle = containsElementOfType(children, BLOCK_HANDLE) === true;
  const { bubbles, top, content, bottom, items } = splitByContent(shown);
  const features = featuresIn(shown, {
    imageUpload: insertable,
    mention: mentions !== undefined,
  });
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
  const loaded = useLoadedEngine(format, features);
  const [uploaded] = useState(() => new Set<string>());
  const [pendingUploads, setPendingUploads] = useState(0);

  const startUploads = (instance: TiptapEditor, files: readonly File[], at: number) => {
    const upload = latest.current.onImageUpload;
    const uploadImage = loaded?.features.imageUpload?.uploadImage;
    if (!upload || !uploadImage) return;
    const accepted = files.filter(isImageFile);
    for (const file of files.filter((candidate) => !isImageFile(candidate)))
      toast.error(file.name, { description: t('fileField.rejectType') });
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
    mentions: FindMentions | undefined;
    startUploads: typeof startUploads;
    t: Translate;
  }>({ format, setCurrent, onImageUpload, mentions, startUploads, t });
  useLayoutEffect(() => {
    latest.current = { format, setCurrent, onImageUpload, mentions, startUploads, t };
  });
  const reportedSinceTheLastRender = useRef<EditorValue[]>([]);

  const styles = editorStyle({
    variant,
    size,
    editable,
    framed: top.length > 0 || bottom.length > 0,
  });
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
    t: ((key, values) => latest.current.t(key, values)) satisfies Translate,
    findMentions: ((query, signal) =>
      latest.current.mentions?.(query, signal) ?? []) satisfies FindMentions,
  }));

  const setup = useMemo(
    () =>
      loaded?.engine.extensionsFor({
        size,
        maxLength,
        markdown: loaded.markdown,
        features: loaded.features,
        images: { uploaded, start: callIntoTheLatestRender.startUploads },
        taskLabel: callIntoTheLatestRender.taskLabel,
        t: callIntoTheLatestRender.t,
        findMentions: callIntoTheLatestRender.findMentions,
        withHandle,
      }),
    [loaded, size, maxLength, uploaded, callIntoTheLatestRender, withHandle],
  );
  const mention = loaded?.features.mention;
  const floating = (
    <>
      {bubbles}
      {loaded && setup && <loaded.engine.EditorSlashMenu store={setup.slashMenu} />}
      {loaded && setup?.blockHandle && (
        <loaded.engine.EditorBlockHandle store={setup.blockHandle} />
      )}
      {mention && setup?.mentionMenu && <mention.EditorMentionMenu store={setup.mentionMenu} />}
    </>
  );
  const [editor, setEditor] = useState<TiptapEditor | null>(null);

  const engineOptions = setup && {
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    injectCSS: false,
    editable,
    extensions: setup.extensions,
    content: writable(current ?? '', format, uploaded),
    contentType: format,
    editorProps: { attributes: contentAttributes },
  };

  useEffect(() => {
    contentRef.current = editor?.view.dom ?? null;
    if (!editor) return;
    const report = () => {
      const next = readValue(editor, latest.current.format);
      reportedSinceTheLastRender.current = [
        ...reportedSinceTheLastRender.current.slice(-REPORTS_AWAITING_AN_ECHO),
        next,
      ];
      latest.current.setCurrent(next);
    };
    const focus = () => setFocused(true);
    const blur = () => setFocused(false);
    editor.on('update', report);
    editor.on('focus', focus);
    editor.on('blur', blur);
    return () => {
      editor.off('update', report);
      editor.off('focus', focus);
      editor.off('blur', blur);
    };
  }, [editor]);

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
        format,
        editable,
        disabled,
        readOnly,
        size,
        contentId,
        countId,
        maxLength,
        contentAttributes,
        floating,
        images,
        styles,
        EngineContent: loaded?.engine.EditorContent ?? null,
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
        {loaded && engineOptions && (
          <loaded.engine.EditorEngine options={engineOptions} onEditor={setEditor} />
        )}
        {top.length > 0 && (
          <EditorBar toolbar scrolls className={styles.bar()}>
            {top}
          </EditorBar>
        )}
        {content}
        {bottom.length > 0 && (
          <EditorBar toolbar={bottom.some(isTool)} scrolls className={styles.bar()}>
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
