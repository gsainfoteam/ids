'use client';

import { cloneElement, type ReactElement } from 'react';

import { CheckIcon, TrashIcon } from '@heroicons/react/16/solid';

import { useTranslate } from '../../../../internal/translate';
import { Menu } from '../../../overlay/menu';
import { CALLOUT_ICON } from '../../../typography/rich-text/callout-icon';
import { CALLOUT_TITLE } from '../../../typography/rich-text/callout-kinds';
import {
  CALLOUT_KINDS,
  calloutKindOf,
  type CalloutKind,
} from '../../../typography/rich-text/schema/callout';
import { EditorGlyphButton } from '../glyph-button';
import { editorMessages } from '../messages-catalog';
import { editorStyle } from '../style';

const kindIcon = (kind: CalloutKind) =>
  cloneElement(CALLOUT_ICON[kind] as ReactElement<{ className?: string }>, {
    className: editorStyle({ calloutKind: kind }).calloutKindIcon(),
  });

export function EditorCalloutKindMenu({
  kind,
  disabled,
  onKindChange,
  onRemove,
}: {
  kind: CalloutKind;
  disabled: boolean;
  onKindChange: (kind: CalloutKind) => void;
  onRemove: () => void;
}) {
  const t = useTranslate(editorMessages);

  return (
    <Menu>
      <Menu.Trigger asChild>
        <EditorGlyphButton aria-label={t('editor.calloutKind')} disabled={disabled}>
          {CALLOUT_ICON[kind]}
        </EditorGlyphButton>
      </Menu.Trigger>
      <Menu.Content side="bottom" align="start">
        <Menu.RadioGroup value={kind} onValueChange={(next) => onKindChange(calloutKindOf(next))}>
          {CALLOUT_KINDS.map((option) => (
            <Menu.RadioItem key={option} value={option}>
              {kindIcon(option)}
              {t(CALLOUT_TITLE[option])}
              <Menu.ItemIndicator>
                <CheckIcon />
              </Menu.ItemIndicator>
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
        <Menu.Separator />
        <Menu.Item onSelect={onRemove} className={editorStyle().destructiveItem()}>
          <TrashIcon aria-hidden="true" />
          {t('editor.calloutRemove')}
        </Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
