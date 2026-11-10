import 'package:flutter/painting.dart';

import '../tokens/ids_typography.dart';

enum IdsCornerShape { round, squircle }

class IdsRadius {
  const IdsRadius(this.standard);

  final double standard;
  double get indicator => standard * .4;
  double get container => standard * 1.6;
}

class IdsThemeData {
  const IdsThemeData({
    double radius = 10,
    this.fontFamily = IdsTypography.sansFontFamily,
    this.fontPackage,
    this.monoFontFamily = 'monospace',
    this.monoFontPackage,
    this.cornerShape = IdsCornerShape.round,
  }) : _radius = radius;

  final double _radius;
  IdsRadius get radius => IdsRadius(_radius);
  final String fontFamily;
  final String? fontPackage;
  final String monoFontFamily;
  final String? monoFontPackage;
  final IdsCornerShape cornerShape;

  double dimension(double value) => value;

  List<String> check() => [
    if (!radius.standard.isFinite || radius.standard < 0)
      'radius must be finite and non-negative.',
    if (fontFamily.trim().isEmpty) 'fontFamily must not be empty.',
    if (monoFontFamily.trim().isEmpty) 'monoFontFamily must not be empty.',
  ];

  TextStyle textStyle(TextStyle base, {Color? color, bool mono = false}) =>
      TextStyle(
        inherit: false,
        color: color ?? base.color,
        backgroundColor: base.backgroundColor,
        fontSize: base.fontSize,
        fontWeight: base.fontWeight,
        fontStyle: base.fontStyle,
        letterSpacing: base.letterSpacing,
        wordSpacing: base.wordSpacing,
        textBaseline: base.textBaseline ?? TextBaseline.alphabetic,
        height: base.height,
        leadingDistribution: base.leadingDistribution,
        locale: base.locale,
        foreground: color == null ? base.foreground : null,
        background: base.background,
        shadows: base.shadows,
        fontFeatures: base.fontFeatures,
        fontVariations: base.fontVariations,
        decoration: base.decoration,
        decorationColor: base.decorationColor,
        decorationStyle: base.decorationStyle,
        decorationThickness: base.decorationThickness,
        overflow: base.overflow,
        fontFamily: mono ? monoFontFamily : fontFamily,
        package: mono
            ? monoFontPackage
            : fontPackage ??
                  (fontFamily == IdsTypography.sansFontFamily
                      ? IdsTypography.sansFontPackage
                      : null),
      );

  ShapeBorder shape({double? radius, BorderSide side = BorderSide.none}) {
    final borderRadius = BorderRadius.circular(radius ?? this.radius.standard);
    return switch (cornerShape) {
      IdsCornerShape.round => RoundedRectangleBorder(
        borderRadius: borderRadius,
        side: side,
      ),
      IdsCornerShape.squircle => ContinuousRectangleBorder(
        borderRadius: borderRadius,
        side: side,
      ),
    };
  }
}
