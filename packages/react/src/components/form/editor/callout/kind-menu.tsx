'use client';

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
  const t = useTranslate();

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
              {CALLOUT_ICON[option]}
              {t(CALLOUT_TITLE[option])}
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
        <Menu.Separator />
        <Menu.Item onSelect={onRemove}>{t('editor.calloutRemove')}</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
