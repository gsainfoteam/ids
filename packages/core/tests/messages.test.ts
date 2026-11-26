import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { describe, expect, test } from 'vitest';

import { buildIr } from '../src/ir/build.ts';
import type { MessageTree } from '../src/sources/config.ts';
import { loadSources, SourceError, type MessageSource } from '../src/sources/load.ts';
import { dartOutputs } from '../src/targets/dart/run.ts';
import { tsOutputs } from '../src/targets/ts/emit.ts';

const root = new URL('../', import.meta.url);

const DART_COMPILES_BOTH_STEPS_FIRST = { timeout: 120_000 };

const korean = (messages: MessageTree): MessageSource => ({
  file: 'messages/ko.json',
  language: 'ko',
  tag: 'ko-KR',
  messages,
});

const english = (messages: MessageTree): MessageSource => ({
  file: 'messages/en.json',
  language: 'en',
  tag: 'en-US',
  messages,
});

const EDITOR = { editor: { bold: '굵게' } };

const EDITOR_IN_ENGLISH = { editor: { bold: 'Bold' } };

const buildWith = async (...messages: MessageSource[]) => {
  const loaded = await loadSources(root);
  loaded.messages = messages;
  return () => buildIr(loaded);
};

const writtenIr = (ir: unknown) => {
  const file = join(mkdtempSync(join(tmpdir(), 'ids-ir-')), 'ir.json');
  writeFileSync(file, JSON.stringify(ir));
  return pathToFileURL(file);
};

const outputEnding = (outputs: Record<string, string>, ending: string) => {
  const found = Object.entries(outputs).find(([file]) => file.endsWith(ending));
  if (!found) throw new Error(`no output ends with ${ending}`);
  return found[1];
};

describe('a message', () => {
  test('is flattened to its path, a name and its arguments in order', async () => {
    const build = await buildWith(
      korean({ chipField: { remove: '{label} 삭제 {count, number}' }, ...EDITOR }),
      english({ chipField: { remove: 'Remove {label}s {count, number}' }, ...EDITOR_IN_ENGLISH }),
    );
    const [entry] = build().messages.entries;

    expect(entry?.id).toBe('chipField.remove');
    expect(entry?.name.dart.member).toBe('chipFieldRemove');
    expect(entry?.parameters).toEqual([
      { name: 'label', type: 'string' },
      { name: 'count', type: 'number' },
    ]);
  });

  test(
    'is written to every target with its arguments',
    DART_COMPILES_BOTH_STEPS_FIRST,
    async () => {
      const ir = (
        await buildWith(
          korean({ chipField: { remove: '{label} 삭제 {count, number}' }, ...EDITOR }),
          english({
            chipField: { remove: "Remove {label}s {count, number} for $5 at 'it'\\" },
            ...EDITOR_IN_ENGLISH,
          }),
        )
      )();
      const dart = await dartOutputs(root, writtenIr(ir));
      const messages = outputEnding(dart, 'ids_messages.dart');
      const readers = outputEnding(dart, 'ids_message_readers.dart');
      const ts = await tsOutputs(root, ir);

      expect(messages).toMatch(
        /String chipFieldRemove\(\{required String label, required num count\}\);/,
      );
      expect(messages).toMatch(/class IdsMessagesKo extends IdsMessagesBase/);
      expect(messages).toMatch(/NumberFormat\.decimalPattern\('en_US'\)/);
      expect(messages).toContain("'$label 삭제 ${_number(count)}'");
      expect(messages).toContain("'Remove ${label}s ${_number(count)} for \\$5 at \\'it\\'\\\\'");
      expect(messages).toMatch(
        /static final ko = IdsLocale\(\n {4}locale: Locale\.fromSubtags\(languageCode: 'ko', countryCode: 'KR'\)/,
      );
      expect(readers).toContain(
        "'chipField.remove': (messages) =>\n      messages.chipFieldRemove(label: 'x', count: 7),",
      );
      expect(outputEnding(ts, 'locales/ko.ts')).toContain("remove: '{label} 삭제 {count}'");
      expect(outputEnding(ts, 'message-arguments.ts')).toContain("count: 'number'");
      expect(outputEnding(ts, 'editor/messages-catalog.ts')).toContain("bold: '굵게'");
    },
  );
});

describe('a messages source error names the file and the key', () => {
  test('for an argument other than {name} or {name, number}', async () => {
    const build = await buildWith(
      korean({ cart: { items: '{count, plural, other {#개}}' }, ...EDITOR }),
    );

    expect(build).toThrow(SourceError);
    expect(build).toThrow(
      'messages/ko.json: messages.cart.items: only text, {name} and {name, number} are supported',
    );
  });

  test('for a message a locale lacks or adds', async () => {
    const missing = await buildWith(
      korean({ common: { close: '닫기', open: '열기' }, ...EDITOR }),
      english({ common: { close: 'Close' }, ...EDITOR_IN_ENGLISH }),
    );
    const extra = await buildWith(
      korean({ common: { close: '닫기' }, ...EDITOR }),
      english({ common: { close: 'Close', open: 'Open' }, ...EDITOR_IN_ENGLISH }),
    );

    expect(missing).toThrow('messages/en.json: messages.common.open: missing');
    expect(extra).toThrow('messages/en.json: messages messages/ko.json lacks: common.open');
  });

  test('for arguments that differ from the fallback', async () => {
    const build = await buildWith(
      korean({ common: { count: '{count, number}개' }, ...EDITOR }),
      english({ common: { count: '{count} items' }, ...EDITOR_IN_ENGLISH }),
    );

    expect(build).toThrow(
      'messages/en.json: messages.common.count: takes other arguments than messages/ko.json',
    );
  });

  test('for keys out of order', async () => {
    const build = await buildWith(korean({ ...EDITOR, common: { open: '열기', close: '닫기' } }));

    expect(build).toThrow(/^messages\/ko\.json: messages: keys are not sorted/);
  });

  test('for two messages that spell one name', async () => {
    const build = await buildWith(korean({ a: { bC: '하나' }, aB: { c: '둘' }, ...EDITOR }));

    expect(build).toThrow('messages/ko.json: messages.aB.c: spells the same name as a.bC');
  });

  test('for a tag of another language', async () => {
    const build = await buildWith({ ...korean(EDITOR), tag: 'en-US' });

    expect(build).toThrow('messages/ko.json: tag: "en-US" is not a tag of language "ko"');
  });

  test('for a catalog of its own whose group does not exist', async () => {
    const build = await buildWith(korean({ common: { close: '닫기' } }));

    expect(build).toThrow('config/messages.json: ownCatalogs: there is no message group "editor"');
  });

  test('for a member every Dart messages class has', DART_COMPILES_BOTH_STEPS_FIRST, async () => {
    const ir = (await buildWith(korean({ ...EDITOR, language: '언어' })))();

    await expect(dartOutputs(root, writtenIr(ir))).rejects.toThrow();
  });
});
