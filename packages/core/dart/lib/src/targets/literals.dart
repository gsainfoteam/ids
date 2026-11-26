import 'package:code_builder/code_builder.dart';

import '../ir_model.dart' as ir;
import 'target.dart';

const _argbDigits = 8;
const _hexRadix = 16;
const _hexPrefix = '0x';

int _argb(ir.Color color) =>
    (color.alpha << 24) | (color.red << 16) | (color.green << 8) | color.blue;

Expression _hex(int value) => CodeExpression(
  Code(
    _hexPrefix +
        value.toRadixString(_hexRadix).toUpperCase().padLeft(_argbDigits, '0'),
  ),
);

Expression color(ir.Color value) =>
    refer('Color', painting).call([_hex(_argb(value))]);

Expression number(double value) =>
    literalNum(value == value.truncateToDouble() ? value.toInt() : value);

Expression wholeNumber(double value) => value == value.truncateToDouble()
    ? literalNum(value.toInt())
    : throw FormatException('ir: $value is not a whole number');

Expression strings(Iterable<String> values) =>
    literalList(values.map(literalString), refer('String'));

final colorType = refer('Color', painting);

const _quote = "'";
const _interpolation = r'$';
const _escapes = {
  r'\': r'\\',
  _quote: r"\'",
  _interpolation: r'\$',
  '\n': r'\n',
  '\r': r'\r',
  '\t': r'\t',
};

final _identifierStart = RegExp(r'^[A-Za-z0-9_]');

String _escaped(String text) =>
    text.split('').map((character) => _escapes[character] ?? character).join();

bool _textRunsOn(List<Object> parts, int index) =>
    index + 1 < parts.length &&
    parts[index + 1] is String &&
    _identifierStart.hasMatch(parts[index + 1] as String);

String _sourceOf(Expression expression) =>
    expression.accept(DartEmitter()).toString();

Expression interpolated(List<Object> parts) {
  final source = StringBuffer(_quote);
  for (final (index, part) in parts.indexed) {
    switch (part) {
      case final String text:
        source.write(_escaped(text));
      case Reference(:final symbol?, url: null) when !_textRunsOn(parts, index):
        source.write('$_interpolation$symbol');
      case final Expression expression:
        source.write('$_interpolation{${_sourceOf(expression)}}');
      default:
        throw ArgumentError.value(
          part,
          'parts',
          'is not text or an expression',
        );
    }
  }
  source.write(_quote);
  return CodeExpression(Code(source.toString()));
}
