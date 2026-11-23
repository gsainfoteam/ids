import 'package:code_builder/code_builder.dart';

import '../ir_model.dart' as ir;
import 'literals.dart';
import 'specs.dart';
import 'target.dart';

ir.IrTypographyFontFamiliesItem _family(
  DartTarget target,
  bool Function(ir.IrTypographyFontFamiliesItem) test,
  Object what,
) => target.model.typography.fontFamilies.firstWhere(
  test,
  orElse: () => throw FormatException('ir: no font family for', what),
);

Expression _textStyle(DartTarget target, ir.TextStyle style) {
  final flutter = _family(
    target,
    (family) => family.flutter.family == style.fontFamily,
    style.fontFamily,
  ).flutter;
  return refer('TextStyle', painting).call([], {
    'fontFamily': literalString(flutter.family),
    if (flutter.package case final package?) 'package': literalString(package),
    'fontSize': number(style.flutter.fontSize),
    'fontWeight': refer(
      'FontWeight',
      painting,
    ).call([wholeNumber(style.fontWeight)]),
    'height': number(style.flutter.height),
    'letterSpacing': number(style.flutter.letterSpacing),
  });
}

Iterable<Spec> typographyLibrary(DartTarget target) {
  String member(String key) => target.symbol(key).dart.member;
  ir.IrTypographyFontFamiliesItemFlutter named(String key) => _family(
    target,
    (family) => family.name.dart.key == target.symbol(key).dart.key,
    key,
  ).flutter;

  final sans = named('sans');
  final mono = named('mono');
  return [
    holder(target.symbol('typography').dart.type, [
      staticConst(member('sansFontFamily'), literalString(sans.family)),
      staticConst(
        member('sansFontPackage'),
        literalString(
          sans.package ??
              (throw FormatException('ir: the sans family is not bundled')),
        ),
      ),
      staticConst(
        member('monoFontFamily'),
        literalString(mono.qualifiedFamily),
      ),
      staticConst(member('monoFontFamilyFallback'), strings(mono.fallback)),
      for (final style in target.model.typography.textStyles)
        staticConst(style.name.dart.member, _textStyle(target, style)),
    ]),
  ];
}
