import type { AriaAttributes } from 'react';

import { writable, type EditorFormat, type EditorValue } from './value';

import type { Translate } from '../../../../internal/translate';
import type { EngineSetup } from '../parts/engine';

const joinIds = (...ids: (string | undefined | false)[]) =>
  ids.filter(Boolean).join(' ') || undefined;

function definedOnly(record: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(record).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
}

export function editorContentAttributes({
  contentId,
  countId,
  hasCount,
  spellCheck,
  placeholder,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  ariaRequired,
  required,
  invalid,
  readOnly,
  disabled,
  className,
  t,
}: {
  contentId: string;
  countId: string;
  hasCount: boolean;
  spellCheck: boolean;
  placeholder: string | undefined;
  ariaLabel: string | undefined;
  ariaLabelledby: string | undefined;
  ariaDescribedby: string | undefined;
  ariaRequired: AriaAttributes['aria-required'];
  required: boolean;
  invalid: boolean;
  readOnly: boolean;
  disabled: boolean;
  className: string;
  t: Translate;
}) {
  return definedOnly({
    id: contentId,
    role: 'textbox',
    'aria-multiline': 'true',
    spellcheck: spellCheck ? 'true' : 'false',
    'aria-label': ariaLabel ?? (ariaLabelledby ? undefined : t('editor.content')),
    'aria-placeholder': placeholder || undefined,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': joinIds(ariaDescribedby, hasCount && countId),
    'aria-invalid': invalid ? 'true' : undefined,
    'aria-required': (ariaRequired ?? required) ? 'true' : undefined,
    'aria-readonly': readOnly ? 'true' : undefined,
    'aria-disabled': disabled ? 'true' : undefined,
    'data-field-input': '',
    'data-editor-content': '',
    class: className,
  });
}

export function engineOptionsFor(
  setup: EngineSetup | undefined,
  {
    editable,
    current,
    format,
    uploaded,
    contentAttributes,
  }: {
    editable: boolean;
    current: EditorValue | undefined;
    format: EditorFormat;
    uploaded: ReadonlySet<string>;
    contentAttributes: Record<string, string>;
  },
) {
  return (
    setup && {
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      injectCSS: false,
      editable,
      extensions: setup.extensions,
      content: writable(current ?? '', format, uploaded),
      contentType: format,
      editorProps: { attributes: contentAttributes },
    }
  );
}
