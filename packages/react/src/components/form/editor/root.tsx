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
import { EditorBlockType } from './block-type';
import { EditorBlockquote, EditorBulletList, EditorCodeBlock, EditorOrderedList } from './blocks';
import { EditorBubbleMenu } from './bubble-menu';
import { EditorContentPart, type EditorContentProps } from './content';
import { EditorContext } from './context';
import { EditorCount } from './count';
import { EditorLink } from './link';
import { loadEngine, type LoadedEngine } from './load-engine';
import { EditorBold, EditorCode, EditorItalic, EditorStrike, EditorUnderline } from './marks';
import { EditorSeparator } from './separator';
import { editorStyle } from './style';
import { useEditorSelector } from './use-editor-selector';
import {
  formText,
  isEmptyValue,
  readValue,
  writeValue,
  type EditorFormat,
  type EditorValue,
} from './value';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { useFormReset } from '../../../hooks/use-form-reset';
import { FormValue } from '../../../internal/form-value';
import { useTranslate } from '../../../internal/translate';
import { elementTypeOf, flattenFragments, invariant } from '../../../utils';
import { FieldNotifyContext, useFieldSize } from '../field/context';

import type { Editor } from '.';
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
  EditorLink,
  EditorBulletList,
  EditorOrderedList,
  EditorBlockquote,
  EditorCodeBlock,
]);

const DEFAULT_TOOLBAR = (
  <>
    <EditorBlockType />
    <EditorSeparator />
    <EditorBold />
    <EditorItalic />
    <EditorStrike />
    <EditorCode />
    <EditorLink />
    <EditorSeparator />
    <EditorBulletList />
    <EditorOrderedList />
    <EditorBlockquote />
    <EditorCodeBlock />
  </>
);

const isOfType = (type: unknown) => (node: ReactNode) =>
  isValidElement(node) && elementTypeOf(node) === type;

const isTool = (node: ReactNode) => isValidElement(node) && TOOLS.has(elementTypeOf(node));

function splitByContent(children: ReactNode) {
  const items = flattenFragments(children === undefined ? DEFAULT_TOOLBAR : children);
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

function useLoadedEngine(format: EditorFormat) {
  const [loaded, setLoaded] = useState<LoadedEngine | null>(null);

  useEffect(() => {
    let mounted = true;
    void loadEngine(format).then((next) => {
      if (mounted) setLoaded(next);
    });
    return () => {
      mounted = false;
    };
  }, [format]);

  return loaded?.format === format ? loaded : null;
}

export function EditorRoot(props: Editor.Props) {
  const {
    format = 'html',
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
  const { bubbles, top, content, bottom, items } = splitByContent(children);
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

  const latest = useRef({ format, setCurrent });
  useLayoutEffect(() => {
    latest.current = { format, setCurrent };
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

  const loaded = useLoadedEngine(format);
  const extensions = useMemo(
    () => loaded?.engine.extensionsFor({ maxLength, markdown: loaded.markdown }),
    [loaded, maxLength],
  );
  const [editor, setEditor] = useState<TiptapEditor | null>(null);

  const engineOptions = extensions && {
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    injectCSS: false,
    editable,
    extensions,
    content: current ?? '',
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
    writeValue(editor, value, format);
  }, [editor, value, format]);

  useFormReset(rootRef, () => {
    if (!editor || value !== undefined) return;
    setCurrent(defaultValue, { silent: true });
    writeValue(editor, defaultValue, format);
  });

  const empty = useEditorSelector(editor, (instance) => instance.isEmpty, isEmptyValue(current));

  const submitted = formText(current, empty);
  useLayoutEffect(() => {
    notifyField?.();
  }, [notifyField, submitted]);

  const state: EditorState = { disabled, readOnly, invalid, focused, filled: !empty };

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
