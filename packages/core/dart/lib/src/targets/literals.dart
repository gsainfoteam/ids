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
