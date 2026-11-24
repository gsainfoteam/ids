'use client';

import { useId, useRef } from 'react';

import { EditorContext, type EditorImages } from './context';
import { useInternalEditorInstance } from './hooks/use-editor-instance';
import { useInternalEditorLoadedEngine } from './hooks/use-editor-loaded-engine';
import { useInternalEditorSetup } from './hooks/use-editor-setup';
import { useInternalEditorSubmitted } from './hooks/use-editor-submitted';
import { useInternalEditorUploads } from './hooks/use-editor-uploads';
import { EditorImage } from './image/tool';
import { editorContentAttributes, engineOptionsFor } from './lib/content-attributes';
import { featuresIn, isTool, layOutTheEditor } from './lib/layout';
import { editorMessages } from './messages-catalog';
import { EditorBar } from './parts/bar';
import { EditorBlockType } from './parts/block-type';
import {
  EditorBlockquote,
  EditorBulletList,
  EditorCodeBlock,
  EditorOrderedList,
} from './parts/blocks';
import { EditorBubbleMenu } from './parts/bubble-menu';
import { EditorColor } from './parts/color';
import { EditorContentPart } from './parts/content';
import { EditorLink } from './parts/link';
import { EditorBold, EditorCode, EditorItalic, EditorStrike, EditorUnderline } from './parts/marks';
import { EditorSeparator } from './parts/separator';
import { editorStyle } from './style';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { FormValue } from '../../../internal/parts/form-value';
import { useInternalTranslate } from '../../../internal/translate';
import { useFieldSize } from '../field/context';

import type { Editor } from '.';
import type { EditorValue } from './lib/value';

export type EditorVariant = 'outline' | 'soft';

export type EditorType = 'toolbar' | 'block';

export type EditorState = {
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  focused: boolean;
  filled: boolean;
};

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

const BLOCK_EDITOR_BUBBLE_MENU = (
  <EditorBubbleMenu key="block-editor-bubble-menu">
    <EditorBold />
    <EditorItalic />
    <EditorUnderline />
    <EditorStrike />
    <EditorCode />
    <EditorColor />
    <EditorLink />
  </EditorBubbleMenu>
);

export function EditorRoot(props: Editor.Props) {
  const {
    format = 'html',
    type = 'toolbar',
    spellCheck = false,
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
  const t = useInternalTranslate(editorMessages);
  const size = useFieldSize(sizeProp) ?? 'standard';
  const generatedId = useId();
  const contentId = id ?? `ids-editor-${generatedId}`;
  const countId = `${contentId}-count`;
  const rootRef = useRef<HTMLDivElement>(null);
  const insertable = onImageUpload !== undefined;
  const blockEditor = type === 'block';
  const shown =
    children !== undefined || blockEditor
      ? children
      : insertable
        ? DEFAULT_TOOLBAR_WITH_IMAGE
        : DEFAULT_TOOLBAR;
  const { content, top, bottom, bubbles, hasCount } = layOutTheEditor(shown, {
    blockEditor,
    defaultContent: <EditorContentPart />,
    defaultBubbleMenu: BLOCK_EDITOR_BUBBLE_MENU,
  });
  const features = featuresIn(shown, {
    imageUpload: insertable,
    mention: mentions !== undefined,
    everyBlock: blockEditor,
  });
  const editable = !disabled && !readOnly;
  const invalid = Boolean(
    invalidProp ?? (ariaInvalid === true || ariaInvalid === 'true' ? true : undefined),
  );

  const [current, setCurrent] = useControllableState<EditorValue | undefined>({
    value,
    defaultValue,
    onValueChange: onValueChange as ((next: EditorValue | undefined) => void) | undefined,
  });
  const loaded = useInternalEditorLoadedEngine(format, features);
  const uploads = useInternalEditorUploads({ features: loaded?.features, onImageUpload, t });
  const setup = useInternalEditorSetup({
    loaded,
    size,
    maxLength,
    withHandle: blockEditor,
    uploaded: uploads.uploaded,
    startUploads: uploads.start,
    mentions,
    t,
  });

  const styles = editorStyle({
    variant,
    size,
    editable,
    blockEditor,
    framed: top.length > 0 || bottom.length > 0,
  });
  const contentAttributes = editorContentAttributes({
    contentId,
    countId,
    hasCount,
    spellCheck,
    placeholder: content.props.placeholder,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    ariaRequired,
    required,
    invalid,
    readOnly,
    disabled,
    className: styles.content({ className: content.props.className }),
    t,
  });

  const { editor, setEditor, focused, contentRef } = useInternalEditorInstance({
    rootRef,
    format,
    value,
    defaultValue,
    setCurrent,
    editable,
    contentAttributes,
    uploaded: uploads.uploaded,
  });
  const { empty, submitted } = useInternalEditorSubmitted(editor, current);

  const engineOptions = engineOptionsFor(setup, {
    editable,
    current,
    format,
    uploaded: uploads.uploaded,
    contentAttributes,
  });
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

  const state: EditorState = { disabled, readOnly, invalid, focused, filled: !empty };

  const images: EditorImages | null = insertable
    ? {
        pending: uploads.pending,
        upload: (files, at) => {
          if (editor) uploads.start(editor, files, at);
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
        data-type={type}
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
            {uploads.pending > 0 ? t('editor.imageUploading') : ''}
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
