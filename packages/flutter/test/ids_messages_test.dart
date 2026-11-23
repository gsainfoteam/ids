import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'generated/ids_message_readers.dart';

final _argument = RegExp(r'\{([a-z][a-zA-Z0-9]*)(?:, (number))?\}');

Map<String, String> _leaves(Map<String, dynamic> tree, [String prefix = '']) =>
    {
      for (final MapEntry(:key, :value) in tree.entries)
        if (value is String)
          '$prefix$key': value
        else
          ..._leaves(value as Map<String, dynamic>, '$prefix$key.'),
    };

void main() {
  final sources = Directory('../core/messages')
      .listSync()
      .whereType<File>()
      .where((file) => file.path.endsWith('.json'))
      .map(
        (file) => jsonDecode(file.readAsStringSync()) as Map<String, dynamic>,
      )
      .toList();

  test('every shipped locale matches its core source, message by message', () {
    expect(IdsLocale.values.map((locale) => locale.messages.language).toSet(), {
      for (final source in sources) source['language'],
    });
    for (final source in sources) {
      final locale = IdsLocale.values.singleWhere(
        (locale) => locale.messages.language == source['language'],
      );
      expect(locale.locale.toLanguageTag(), source['tag']);
      final messages = _leaves(source['messages'] as Map<String, dynamic>);
      expect(messageReaders.keys.toSet(), messages.keys.toSet());
      for (final MapEntry(:key, :value) in messages.entries) {
        final expected = value.replaceAllMapped(
          _argument,
          (match) => sampleArguments[match[2] ?? 'string']!,
        );
        expect(
          messageReaders[key]!(locale.messages),
          expected,
          reason: '${source['language']}: $key',
        );
      }
    }
  });

  test('numbers follow the language of the messages', () {
    expect(
      IdsLocale.ko.messages.dataTableSelectRowNumber(number: 1200),
      '1,200번째 행 선택',
    );
    expect(
      IdsLocale.ko.messages.ratingValueLabel(max: 5, value: 4.5),
      '5점 만점에 4.5점',
    );
    expect(
      IdsLocale.en.messages.avatarGroupOverflow(count: 1200),
      '1,200 more',
    );
    expect(IdsLocale.ko.messages.commonRemoveItem(label: '사과'), '사과 삭제');
  });

  test('a subclass of a shipped language overrides only what it names', () {
    const custom = _Custom();
    expect(custom.commonClose, 'Dismiss');
    expect(custom.commonLoading, IdsLocale.en.messages.commonLoading);
  });
}

class _Custom extends IdsMessagesEn {
  const _Custom();

  @override
  String get commonClose => 'Dismiss';
}
