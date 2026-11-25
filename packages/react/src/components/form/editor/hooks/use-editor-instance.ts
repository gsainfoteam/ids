'use client';

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

import { isEqual } from 'es-toolkit';

import { useInternalFormReset } from '../../../../hooks/use-form-reset';
import { readValue, writeValue, type EditorFormat, type EditorValue } from '../lib/value';

import type { Editor as TiptapEditor } from '@tiptap/core';

const REPORTS_AWAITING_AN_ECHO = 32;

type SetCurrent = (
  next: EditorValue | undefined | ((prev: EditorValue | undefined) => EditorValue | undefined),
  options?: { silent?: boolean },
) => void;

export function useInternalEditorInstance({
  rootRef,
  format,
  value,
  defaultValue,
  setCurrent,
  editable,
  contentAttributes,
  uploaded,
}: {
  rootRef: RefObject<HTMLDivElement | null>;
  format: EditorFormat;
  value: EditorValue | undefined;
  defaultValue: EditorValue | undefined;
  setCurrent: SetCurrent;
  editable: boolean;
  contentAttributes: Record<string, string>;
  uploaded: ReadonlySet<string>;
}) {
  const contentRef = useRef<HTMLElement | null>(null);
  const [focused, setFocused] = useState(false);
  const [editor, setEditor] = useState<TiptapEditor | null>(null);

  const latest = useRef({ format, setCurrent });
  useLayoutEffect(() => {
    latest.current = { format, setCurrent };
  });
  const reportedSinceTheLastRender = useRef<EditorValue[]>([]);

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

  useInternalFormReset(rootRef, () => {
    if (!editor || value !== undefined) return;
    setCurrent(defaultValue, { silent: true });
    writeValue(editor, defaultValue, format, uploaded);
  });

  return { editor, setEditor, focused, contentRef };
}
