import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dartMessageReaders, dartMessages, messageEntries } from './dart-messages.mjs';

const locale = (language, tag, runtime, argumentTypes = {}) => ({ language, tag, runtime, argumentTypes });

test('flattens paths and types named arguments', () => {
  const tree = { chipField: { remove: '{label} / {count}' } };
  assert.deepEqual(messageEntries(tree, { 'chipField.remove': { label: 'string', count: 'number' } }), [
    {
      id: 'chipField.remove',
      name: 'chipFieldRemove',
      value: '{label} / {count}',
      parameters: [
        { parameter: 'label', type: 'string' },
        { parameter: 'count', type: 'number' },
      ],
    },
  ]);
});

test('writes an abstract contract and one class per language', () => {
  const types = { 'chipField.remove': { label: 'string', count: 'number' } };
  const source = dartMessages([
    locale('ko', 'ko-KR', { chipField: { remove: '{label} 삭제 {count}' } }, types),
    locale('en', 'en-US', { chipField: { remove: 'Remove {label}s {count}' } }, types),
  ]);
  assert.match(source, /String chipFieldRemove\(\{required String label, required num count\}\);/);
  assert.match(source, /class IdsMessagesKo extends IdsMessagesBase/);
  assert.match(source, /NumberFormat\.decimalPattern\('en_US'\)/);
  assert.ok(source.includes("'$label 삭제 ${_number(count)}'"));
  assert.ok(source.includes("'Remove ${label}s ${_number(count)}'"));
  assert.match(source, /static final ko = IdsLocale\(\n    locale: Locale\.fromSubtags\(languageCode: 'ko', countryCode: 'KR'\)/);
});

test('escapes Dart source without changing arguments', () => {
  const source = dartMessages([locale('en', 'en', { test: { value: "It's $5\\\n{name}" } }, { 'test.value': { name: 'string' } })]);
  assert.ok(source.includes("It\\'s \\$5\\\\\\n$name"));
});

test('writes a reader per message for the parity test', () => {
  const source = dartMessageReaders([
    locale('ko', 'ko-KR', { common: { close: '닫기', count: '{count}' } }, { 'common.count': { count: 'number' } }),
  ]);
  assert.ok(source.includes("'common.close': (messages) => messages.commonClose,"));
  assert.ok(source.includes("'common.count': (messages) => messages.commonCount(count: 7),"));
});

test('rejects colliding, reserved or invalid members', () => {
  assert.throws(() => dartMessages([locale('ko', 'ko', { aB: { c: 'one' }, a: { bC: 'two' } })]), /Duplicate/);
  assert.throws(() => dartMessages([locale('ko', 'ko', { language: 'x' })]), /Reserved/);
  assert.throws(() => dartMessages([locale('ko', 'ko', { 'bad-key': 'text' })]), /Invalid message key/);
});
