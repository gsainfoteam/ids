'use client';

import {
  useId,
  useRef,
  type AriaAttributes,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { useInternalEditorInstance } from './use-editor-instance';
import { useInternalEditorLoadedEngine } from './use-editor-loaded-engine';
import { useInternalEditorSetup } from './use-editor-setup';
import { useInternalEditorSubmitted } from './use-editor-submitted';
import { useInternalEditorUploads } from './use-editor-uploads';
import { useControllableState } from '../../../../hooks/use-controllable-state';
import { useInternalTranslate } from '../../../../internal/translate';
import { useFieldSize, useFieldState } from '../../field/context';
import { editorContentAttributes, engineOptionsFor } from '../lib/content-attributes';
import { featuresIn, layOutTheEditor } from '../lib/layout';
import { editorMessages } from '../messages-catalog';
import { editorStyle } from '../style';

import type { EditorInstance } from './use-editor';
import type { IdsSize } from '../../../../tokens/types';
import type { EditorImages } from '../context';
import type { EditorValue } from '../lib/value';
import type { EditorContentProps } from '../parts/content';
import type { JSONContent } from '@tiptap/core';

export type EditorVariant = 'outline' | 'soft';

export type EditorState = {
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  focused: boolean;
  filled: boolean;
};

type StringValue = {
  format?: 'html' | 'markdown';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type JsonValue = {
  format: 'json';
  value?: JSONContent;
  defaultValue?: JSONContent;
  onValueChange?: (value: JSONContent) => void;
};

export type EditorRootProps = (StringValue | JsonValue) & {
  editor?: EditorInstance;
  name?: string;
  form?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  spellCheck?: boolean;
  variant?: EditorVariant;
  size?: IdsSize;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: AriaAttributes['aria-invalid'];
  'aria-required'?: AriaAttributes['aria-required'];
  className?: string | ((state: EditorState) => string | undefined);
  style?: CSSProperties | ((state: EditorState) => CSSProperties | undefined);
  children?: ReactNode;
};

export type EditorRootLayout = {
  blockEditor: boolean;
  defaultChildren: ReactNode;
  defaultContent: ReactElement<EditorContentProps>;
  defaultBubbleMenu: ReactNode | null;
};

const saysInvalid = (ariaInvalid: AriaAttributes['aria-invalid']) =>
  ariaInvalid === undefined ? undefined : ariaInvalid === true || ariaInvalid === 'true';

export function useInternalEditorRoot(props: EditorRootProps, layout: EditorRootLayout) {
  const {
    format = 'html',
    editor: extensions,
    spellCheck = false,
    value,
    defaultValue,
    onValueChange,
    name,
    form,
    required = false,
    disabled = false,
    readOnly = false,
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
  const { blockEditor } = layout;
  const t = useInternalTranslate(editorMessages);
  const size = useFieldSize(sizeProp) ?? 'standard';
  const field = useFieldState();
  const generatedId = useId();
  const contentId = id ?? `ids-editor-${generatedId}`;
  const countId = `${contentId}-count`;
  const rootRef = useRef<HTMLDivElement>(null);
  const onImageUpload = extensions?.imageUpload?.onUpload;
  const findMentions = extensions?.mentions?.find;
  const insertable = onImageUpload !== undefined;
  const shown = children === undefined ? layout.defaultChildren : children;
  const { content, top, bottom, bubbles, hasCount } = layOutTheEditor(shown, {
    blockEditor,
    defaultContent: layout.defaultContent,
    defaultBubbleMenu: layout.defaultBubbleMenu,
  });
  const features = featuresIn(shown, {
    imageUpload: insertable,
    mention: findMentions !== undefined,
    everyBlock: blockEditor,
  });
  const editable = !disabled && !readOnly;
  const invalid = saysInvalid(ariaInvalid) ?? field?.invalid ?? false;

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
    mentions: findMentions,
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

  const state: EditorState = { disabled, readOnly, invalid, focused, filled: !empty };

  const images: EditorImages | null = insertable
    ? {
        pending: uploads.pending,
        upload: (files, at) => {
          if (editor) uploads.start(editor, files, at);
        },
      }
    : null;

  return {
    context: {
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
      images,
      styles,
      EngineContent: loaded?.engine.EditorContent ?? null,
    },
    rootProps: {
      ref: rootRef,
      'data-editor': '',
      'data-size': size,
      'data-variant': variant,
      'data-block-editor': blockEditor ? '' : undefined,
      'data-disabled': disabled ? '' : undefined,
      'data-readonly': readOnly ? '' : undefined,
      'data-invalid': invalid ? '' : undefined,
      'data-focused': focused ? '' : undefined,
      'data-filled': state.filled ? '' : undefined,
      className: styles.root({
        className: typeof className === 'function' ? className(state) : className,
      }),
      style: typeof style === 'function' ? style(state) : style,
    },
    engine: loaded && engineOptions ? { loaded, options: engineOptions, setEditor } : null,
    floating: { bubbles, loaded, setup },
    top,
    content,
    bottom,
    uploads: insertable ? { pending: uploads.pending } : null,
    formValue: {
      name,
      form,
      value: submitted,
      required: required && !readOnly,
      disabled,
      anchor: contentRef,
    },
    styles,
    t,
  };
}

export type EditorRoot = ReturnType<typeof useInternalEditorRoot>;
