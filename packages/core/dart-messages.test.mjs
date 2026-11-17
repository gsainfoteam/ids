import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dartMessages, messageEntries, slangMessages } from './dart-messages.mjs';

test('flattens paths and keeps named arguments once', () => {
  const tree = { chipField: { remove: '{label} / {label}' } };
  assert.deepEqual(messageEntries(tree), [{ name: 'chipFieldRemove', value: '{label} / {label}', parameters: ['label'] }]);
  assert.deepEqual(slangMessages(tree), { 'ids(singleInterface=IdsMessages)': { chipFieldRemove: '{label} / {label}' } });
  assert.match(dartMessages(tree), /String\? chipFieldRemove\(\{required Object label\}\) => null/);
  assert.match(dartMessages(tree), /String chipFieldRemove/);
});

test('escapes Dart source without changing arguments', () => {
  const source = dartMessages({ test: { value: "It's $5\\\n{name}" } });
  assert.ok(source.includes("It\\'s \\$5\\\\\\n${_format(name)}"));
});

test('rejects unsupported ICU and colliding or invalid members', () => {
  assert.throws(() => dartMessages({ count: '{count, plural, other {items}}' }), /plain arguments/);
  assert.throws(() => dartMessages({ aB: { c: 'one' }, a: { bC: 'two' } }), /Duplicate/);
  assert.throws(() => dartMessages({ 'bad-key': 'text' }), /Invalid message key/);
  assert.throws(() => dartMessages({ a: 3 }), /Invalid message/);
});
