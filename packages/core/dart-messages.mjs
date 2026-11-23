const DART_TYPES = { number: 'num', string: 'String' };
const SAMPLE_VALUES = { number: '7', string: "'x'" };
const MEMBERS_OF_THE_BASE = new Set(['language', 'hashCode', 'runtimeType', 'toString']);

export function messageEntries(tree, argumentTypes, path = []) {
  return Object.entries(tree).flatMap(([key, value]) => {
    if (!/^[a-z][a-zA-Z0-9]*$/.test(key)) throw new Error(`Invalid message key: ${key}`);
    const parts = [...path, key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value))
      return messageEntries(value, argumentTypes, parts);
    const id = parts.join('.');
    const name = parts.map((part, index) => index ? part[0].toUpperCase() + part.slice(1) : part).join('');
    const parameters = Object.entries(argumentTypes[id] ?? {}).map(([parameter, type]) => ({ parameter, type }));
    return [{ id, name, value, parameters }];
  });
}

const dartLiteral = (value) => value
  .replaceAll('\\', '\\\\')
  .replaceAll("'", "\\'")
  .replaceAll('$', '\\$')
  .replaceAll('\n', '\\n')
  .replaceAll('\r', '\\r')
  .replaceAll('\t', '\\t');

const signature = ({ name, parameters }) => parameters.length
  ? `${name}({${parameters.map(({ parameter, type }) => `required ${DART_TYPES[type]} ${parameter}`).join(', ')}})`
  : `get ${name}`;

const expressionOf = ({ value, parameters }) => {
  const types = Object.fromEntries(parameters.map(({ parameter, type }) => [parameter, type]));
  const interpolated = dartLiteral(value).replace(
    /\{([a-z][a-zA-Z0-9]*)\}/g,
    (placeholder, parameter, offset, whole) => {
      if (types[parameter] === 'number') return `\${_number(${parameter})}`;
      const runsOn = /[a-zA-Z0-9_]/.test(whole[offset + placeholder.length] ?? '');
      return runsOn ? `\${${parameter}}` : `\$${parameter}`;
    },
  );
  return `'${interpolated}'`;
};

const className = (language) => `IdsMessages${language[0].toUpperCase()}${language.slice(1)}`;

const localeExpression = (tag) => {
  const { language, script, region } = new Intl.Locale(tag);
  const subtags = [`languageCode: '${language}'`];
  if (script) subtags.push(`scriptCode: '${script}'`);
  if (region) subtags.push(`countryCode: '${region}'`);
  return `Locale.fromSubtags(${subtags.join(', ')})`;
};

export function dartMessages(locales) {
  const [{ argumentTypes }] = locales;
  const contract = messageEntries(locales[0].runtime, argumentTypes);
  for (const { name } of contract)
    if (MEMBERS_OF_THE_BASE.has(name)) throw new Error(`Reserved Dart member: ${name}`);

  const languageClass = ({ language, tag, runtime }) => {
    const entries = messageEntries(runtime, argumentTypes);
    const members = entries.map((entry) => `  @override\n  String ${signature(entry)} => ${expressionOf(entry)};`);
    return `class ${className(language)} extends IdsMessagesBase {
  const ${className(language)}();

  static final _numbers = NumberFormat.decimalPattern('${tag.replaceAll('-', '_')}');

  static String _number(num value) => _numbers.format(value);

  @override
  String get language => '${language}';

${members.join('\n\n')}
}`;
  };

  return `import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';

abstract class IdsMessagesBase {
  const IdsMessagesBase();

  String get language;

${contract.map((entry) => `  String ${signature(entry)};`).join('\n\n')}
}

${locales.map(languageClass).join('\n\n')}

@immutable
class IdsLocale {
  IdsLocale({required this.locale, required this.messages})
    : assert(
        locale.languageCode == messages.language,
        'IdsLocale: the locale \${locale.toLanguageTag()} is not in the language of its messages (\${messages.language}).',
      );

${locales.map(({ language, tag }) => `  static final ${language} = IdsLocale(\n    locale: ${localeExpression(tag)},\n    messages: const ${className(language)}(),\n  );`).join('\n\n')}

  static final List<IdsLocale> values = [${locales.map(({ language }) => language).join(', ')}];

  final Locale locale;
  final IdsMessagesBase messages;

  @override
  bool operator ==(Object other) =>
      other is IdsLocale && other.locale == locale && other.messages == messages;

  @override
  int get hashCode => Object.hash(locale, messages);
}
`;
}

export function dartMessageReaders(locales) {
  const { runtime, argumentTypes } = locales[0];
  const readers = messageEntries(runtime, argumentTypes).map(({ id, name, parameters }) => {
    const call = parameters.length
      ? `messages.${name}(${parameters.map(({ parameter, type }) => `${parameter}: ${SAMPLE_VALUES[type]}`).join(', ')})`
      : `messages.${name}`;
    return `  '${id}': (messages) => ${call},`;
  });
  const samples = Object.entries(SAMPLE_VALUES).map(([type, value]) => `  '${type}': '${value.replaceAll("'", '')}',`);
  return `import 'package:ids_flutter/ids.dart';

const sampleArguments = <String, String>{
${samples.join('\n')}
};

final messageReaders = <String, String Function(IdsMessagesBase)>{
${readers.join('\n')}
};
`;
}
