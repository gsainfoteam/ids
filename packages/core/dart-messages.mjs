export function messageEntries(tree, path = []) {
  return Object.entries(tree).flatMap(([key, value]) => {
    if (!/^[a-z][a-zA-Z0-9]*$/.test(key)) throw new Error(`Invalid message key: ${key}`);
    const parts = [...path, key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value))
      return messageEntries(value, parts);
    if (typeof value !== 'string') throw new Error(`Invalid message: ${parts.join('.')}`);
    const parameters = [...new Set([...value.matchAll(/\{([a-z][a-zA-Z0-9]*)\}/g)].map((match) => match[1]))];
    if (/[{}]/.test(value.replace(/\{([a-z][a-zA-Z0-9]*)\}/g, '')))
      throw new Error(`Only plain arguments are supported: ${parts.join('.')}`);
    const name = parts.map((part, index) => index ? part[0].toUpperCase() + part.slice(1) : part).join('');
    return [{ name, value, parameters }];
  });
}

const dartLiteral = (value) => value
  .replaceAll('\\', '\\\\')
  .replaceAll("'", "\\'")
  .replaceAll('$', '\\$')
  .replaceAll('\n', '\\n')
  .replaceAll('\r', '\\r')
  .replaceAll('\t', '\\t');

export function dartMessages(tree) {
  const entries = messageEntries(tree);
  const names = new Set();
  for (const { name } of entries) {
    if (names.has(name) || name === 'ko') throw new Error(`Duplicate or reserved Dart member: ${name}`);
    names.add(name);
  }
  const signature = ({ name, parameters }) => parameters.length
    ? `${name}({${parameters.map((parameter) => `required Object ${parameter}`).join(', ')}})`
    : `get ${name}`;
  const defaults = entries.map((entry) => {
    const value = dartLiteral(entry.value).replace(/\{([a-z][a-zA-Z0-9]*)\}/g, (_, name) => '${_format(' + name + ')}');
    const singleArgument = entry.value.match(/^\{([a-z][a-zA-Z0-9]*)\}$/);
    const expression = singleArgument ? `_format(${singleArgument[1]})` : `'${value}'`;
    return `  @override\n  String ${signature(entry)} => ${expression};`;
  }).join('\n\n');
  return `import 'package:intl/intl.dart';

mixin IdsMessages {
  static const ko = IdsKoreanMessages._();

${entries.map((entry) => `  String? ${signature(entry)} => null;`).join('\n\n')}
}

final class IdsKoreanMessages with IdsMessages {
  const IdsKoreanMessages._();

  static final _numbers = NumberFormat.decimalPattern('ko_KR');

  static String _format(Object value) =>
      value is num ? _numbers.format(value) : value.toString();

${defaults}
}
`;
}

export function slangMessages(tree) {
  return { 'ids(singleInterface=IdsMessages)': Object.fromEntries(messageEntries(tree).map(({ name, value }) => [name, value])) };
}
