import 'package:code_builder/code_builder.dart';

import '../ir_model.dart' as ir;
import 'literals.dart';
import 'specs.dart';
import 'target.dart';

typedef _Entry = ir.IrMessagesEntriesItem;
typedef _Locale = ir.IrMessagesLocalesItem;
typedef _ArgumentType = ir.IrMessagesEntriesItemParametersItemType;

const _messagesOutput = 'messages';
const _numbers = '_numbers';
const _number = '_number';
const _value = 'value';
const _other = 'other';
const _intlLocaleSeparator = '_';

const _membersEveryObjectHas = {
  'hashCode',
  'runtimeType',
  'toString',
  'noSuchMethod',
};

const _samples = <_ArgumentType, Object>{
  _ArgumentType.number: 7,
  _ArgumentType.string: 'x',
};

Reference _typeOf(_ArgumentType type) => switch (type) {
  _ArgumentType.number => refer('num'),
  _ArgumentType.string => string,
};

Method _member(_Entry entry, {required Expression? body}) => Method(
  (method) => method
    ..annotations.addAll([if (body != null) refer('override')])
    ..returns = string
    ..name = entry.name.dart.member
    ..type = entry.parameters.isEmpty ? MethodType.getter : null
    ..optionalParameters.addAll(
      entry.parameters.map(
        (parameter) => Parameter(
          (item) => item
            ..name = parameter.name
            ..type = _typeOf(parameter.type)
            ..named = true
            ..required = true,
        ),
      ),
    )
    ..lambda = body == null ? null : true
    ..body = body?.code,
);

Expression _text(_Entry entry, _Locale locale) {
  final text = entry.texts.firstWhere(
    (candidate) => candidate.language == locale.language,
    orElse: () => throw FormatException(
      'ir: messages.${entry.id} has nothing in ${locale.language}',
    ),
  );
  final types = {
    for (final parameter in entry.parameters) parameter.name: parameter.type,
  };
  return interpolated([
    for (final part in text.parts)
      switch (part) {
        ir.IrMessagesEntriesItemTextsItemPartsItemText(:final text) => text,
        ir.IrMessagesEntriesItemTextsItemPartsItemArgument(:final argument) =>
          types[argument] == _ArgumentType.number
              ? refer(_number).call([refer(argument)])
              : refer(argument),
      },
  ]);
}

void _checkMembers(DartTarget target, List<_Entry> entries) {
  final reserved = {
    ..._membersEveryObjectHas,
    target.symbol('language').dart.member,
  };
  for (final entry in entries) {
    if (reserved.contains(entry.name.dart.member)) {
      throw FormatException(
        'ir: messages.${entry.id} spells ${entry.name.dart.member}, '
        'a member every messages class already has',
      );
    }
  }
}

String _intlLocale(_Locale locale) => [
  locale.subtags.language,
  ?locale.subtags.script,
  ?locale.subtags.region,
].join(_intlLocaleSeparator);

Iterable<Spec> messagesLibrary(DartTarget target) {
  final messages = target.model.messages;
  final entries = messages.entries;
  _checkMembers(target, entries);
  final base = target.symbol('messagesBase').dart.type;
  final language = target.symbol('language').dart.member;
  final formatsNumbers = entries.any(
    (entry) => entry.parameters.any(
      (parameter) => parameter.type == _ArgumentType.number,
    ),
  );
  final constant = Constructor((constructor) => constructor.constant = true);

  return [
    Class(
      (type) => type
        ..abstract = true
        ..name = base
        ..constructors.add(constant)
        ..methods.addAll([
          Method(
            (method) => method
              ..returns = string
              ..type = MethodType.getter
              ..name = language,
          ),
          for (final entry in entries) _member(entry, body: null),
        ]),
    ),
    for (final locale in messages.locales)
      Class(
        (type) => type
          ..name = locale.catalog.dart.type
          ..extend = refer(base)
          ..constructors.add(constant)
          ..fields.addAll([
            if (formatsNumbers)
              Field(
                (field) => field
                  ..static = true
                  ..modifier = FieldModifier.final$
                  ..name = _numbers
                  ..assignment = refer('NumberFormat', intl).newInstanceNamed(
                    'decimalPattern',
                    [literalString(_intlLocale(locale))],
                  ).code,
              ),
          ])
          ..methods.addAll([
            if (formatsNumbers)
              lambda(
                _number,
                string,
                refer(_numbers).property('format').call([refer(_value)]),
                parameters: [positional(_value, refer('num'))],
                static: true,
              ),
            override(
              language,
              string,
              literalString(locale.language),
              type: MethodType.getter,
            ),
            for (final entry in entries)
              _member(entry, body: _text(entry, locale)),
          ]),
      ),
    _localeClass(target, base),
  ];
}

Expression _localeOf(_Locale locale) =>
    refer('Locale', widgets).newInstanceNamed('fromSubtags', [], {
      'languageCode': literalString(locale.subtags.language),
      if (locale.subtags.script case final script?)
        'scriptCode': literalString(script),
      if (locale.subtags.region case final region?)
        'countryCode': literalString(region),
    });

Class _localeClass(DartTarget target, String base) {
  final type = target.symbol('locale').dart.type;
  final localeField = target.symbol('locale').dart.member;
  final messagesField = target.symbol('localeMessages').dart.member;
  final language = target.symbol('language').dart.member;
  final locales = target.model.messages.locales;
  final fields = <Member>[
    (name: localeField, type: refer('Locale', widgets)),
    (name: messagesField, type: refer(base)),
  ];
  final locale = refer(localeField);
  final messages = refer(messagesField);
  return Class(
    (item) => item
      ..annotations.add(refer('immutable', widgets))
      ..name = type
      ..constructors.add(
        Constructor(
          (constructor) => constructor
            ..optionalParameters.addAll(
              fields.map((field) => requiredThis(field.name)),
            )
            ..initializers.add(
              refer('assert').call([
                locale
                    .property('languageCode')
                    .equalTo(messages.property(language)),
                interpolated([
                  '$type: the locale ',
                  locale.property('toLanguageTag').call([]),
                  ' is not in the language of its messages (',
                  messages.property(language),
                  ').',
                ]),
              ]).code,
            ),
        ),
      )
      ..fields.addAll([
        for (final entry in locales)
          Field(
            (field) => field
              ..static = true
              ..modifier = FieldModifier.final$
              ..name = entry.name.dart.member
              ..assignment = refer(type).call([], {
                localeField: _localeOf(entry),
                messagesField: refer(entry.catalog.dart.type).constInstance([]),
              }).code,
          ),
        Field(
          (field) => field
            ..static = true
            ..modifier = FieldModifier.final$
            ..type = listOf(refer(type))
            ..name = target.symbol('locales').dart.member
            ..assignment = literalList([
              for (final entry in locales) refer(entry.name.dart.member),
            ]).code,
        ),
        for (final field in fields) finalField(field.name, field.type),
      ])
      ..methods.addAll([
        override(
          'operator ==',
          refer('bool'),
          allOf([refer(_other).isA(refer(type)), ...fields.map(sameAs)]),
          parameters: [positional(_other, refer('Object'))],
        ),
        override(
          'hashCode',
          refer('int'),
          refer('Object').property('hash').call([locale, messages]),
          type: MethodType.getter,
        ),
      ]),
  );
}

Expression _reader(_Entry entry, Reference messages) => entry.parameters.isEmpty
    ? messages.property(entry.name.dart.member)
    : messages.property(entry.name.dart.member).call([], {
        for (final parameter in entry.parameters)
          parameter.name: literal(_samples[parameter.type]),
      });

Iterable<Spec> messageReadersLibrary(DartTarget target) {
  final base = refer(
    target.symbol('messagesBase').dart.type,
    target.packageImport(_messagesOutput),
  );
  final messages = refer(target.symbol('localeMessages').dart.member);
  final readerType = FunctionType(
    (function) => function
      ..returnType = string
      ..requiredParameters.add(base),
  );
  return [
    Field(
      (field) => field
        ..modifier = FieldModifier.constant
        ..name = target.symbol('sampleArguments').dart.member
        ..assignment = literalMap(
          {
            for (final MapEntry(:key, :value) in _samples.entries)
              key.name: '$value',
          },
          string,
          string,
        ).code,
    ),
    Field(
      (field) => field
        ..modifier = FieldModifier.final$
        ..name = target.symbol('messageReaders').dart.member
        ..assignment = literalMap(
          {
            for (final entry in target.model.messages.entries)
              entry.id: Method(
                (method) => method
                  ..requiredParameters.add(
                    Parameter((parameter) => parameter.name = messages.symbol!),
                  )
                  ..lambda = true
                  ..body = _reader(entry, messages).code,
              ).closure,
          },
          string,
          readerType,
        ).code,
    ),
  ];
}
