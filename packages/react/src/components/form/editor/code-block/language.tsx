'use client';

import { useTranslate } from '../../../../internal/translate';
import {
  CODE_LANGUAGES,
  isPlainText,
  listedLanguageName,
} from '../../../data/code-block/highlight';
import { Select } from '../../select';
import { editorStyle } from '../style';

const PLAIN_TEXT = 'text';
const styles = editorStyle();

const isListed = (language: string) =>
  language === PLAIN_TEXT || CODE_LANGUAGES.some((name) => name === language);

export const languageOf = (language: unknown) =>
  typeof language === 'string' && !isPlainText(language)
    ? listedLanguageName(language)
    : PLAIN_TEXT;

export function EditorCodeLanguage({
  language,
  disabled,
  onLanguageChange,
}: {
  language: string;
  disabled: boolean;
  onLanguageChange: (language: string | null) => void;
}) {
  const t = useTranslate();

  return (
    <Select
      value={language}
      onValueChange={(next) => {
        if (next !== null) onLanguageChange(next === PLAIN_TEXT ? null : next);
      }}
      aria-label={t('editor.codeLanguage')}
      size="tiny"
      variant="ghost"
      disabled={disabled}
      className={styles.codeLanguage()}
    >
      <Select.SearchField aria-label={t('editor.codeLanguageSearch')} />
      <Select.Item value={PLAIN_TEXT}>{t('editor.codePlainText')}</Select.Item>
      {!isListed(language) && <Select.Item value={language}>{language}</Select.Item>}
      {CODE_LANGUAGES.map((name) => (
        <Select.Item key={name} value={name}>
          {name}
        </Select.Item>
      ))}
    </Select>
  );
}
