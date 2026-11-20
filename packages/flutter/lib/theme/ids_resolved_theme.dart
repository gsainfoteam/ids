import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';

import '../src/color/theme_checks.dart';
import '../src/color/theme_roles.dart';
import '../tokens/ids_color_roles.dart';
import '../tokens/ids_component_tokens.dart';
import '../tokens/ids_enums.dart';
import '../tokens/ids_typography.dart';
import 'ids_theme.dart';

const idsRadiusRange = (min: 0.0, max: 18.0);

const idsScaleRange = (min: 0.5, max: 2.0);

const _defaultRadius = 10.0;

const _indicatorRadiusRatio = 0.4;

const _containerRadiusRatio = 1.6;

const _fullRadius = 9999.0;

double _insetAt45Degrees(double exponent) =>
    1 - math.pow(2, -1 / exponent).toDouble();

const _superellipseExponentOfSquircle = 4.0;

final _squircleRadiusAsDeepAsRound =
    _insetAt45Degrees(2) / _insetAt45Degrees(_superellipseExponentOfSquircle);

final idsCornerRadiusScale = {
  IdsCornerShape.round: 1.0,
  IdsCornerShape.squircle: (_squircleRadiusAsDeepAsRound * 100).round() / 100,
};

@immutable
class IdsRadius {
  const IdsRadius({
    required this.standard,
    required this.indicator,
    required this.container,
  });

  factory IdsRadius.of(
    double radius,
    IdsCornerShape cornerShape,
    double scale,
  ) {
    final cornerScale = idsCornerRadiusScale[cornerShape]!;
    double drawn(double value) =>
        (value.roundToDouble() * cornerScale * scale).roundToDouble();
    return IdsRadius(
      standard: drawn(radius),
      indicator: drawn(radius * _indicatorRadiusRatio),
      container: drawn(radius * _containerRadiusRatio),
    );
  }

  final double standard;
  final double indicator;
  final double container;
  double get full => _fullRadius;

  @override
  bool operator ==(Object other) =>
      other is IdsRadius &&
      other.standard == standard &&
      other.indicator == indicator &&
      other.container == container;

  @override
  int get hashCode => Object.hash(standard, indicator, container);
}

final _colorResolutions = <IdsThemeOverrides, ColorResolution>{};

const _rememberedColorResolutions = 32;

IdsThemeOverrides _colorPart(IdsThemeOverrides theme) => IdsThemeOverrides(
  primary: theme.primary,
  secondary: theme.secondary,
  tertiary: theme.tertiary,
  neutral: theme.neutral,
  status: theme.status,
);

ColorResolution _resolveColorsOnce(IdsThemeOverrides theme) {
  final key = _colorPart(theme);
  final remembered = _colorResolutions.remove(key);
  final resolution = remembered ?? resolveColors(key);
  _colorResolutions[key] = resolution;
  if (_colorResolutions.length > _rememberedColorResolutions) {
    _colorResolutions.remove(_colorResolutions.keys.first);
  }
  return resolution;
}

List<IdsThemeIssue> _radiusIssues(double? radius) => [
  if (radius != null &&
      (!radius.isFinite ||
          radius < idsRadiusRange.min ||
          radius > idsRadiusRange.max))
    IdsThemeIssue(
      'radius',
      'radius is the standard corner in px, from ${idsRadiusRange.min.round()} to ${idsRadiusRange.max.round()} (half a 36px control). Got $radius.',
    ),
];

List<IdsThemeIssue> _scaleIssues(double? scale) => [
  if (scale != null &&
      (!scale.isFinite ||
          scale < idsScaleRange.min ||
          scale > idsScaleRange.max))
    IdsThemeIssue(
      'scale',
      'scale multiplies sizes, from ${idsScaleRange.min} to ${idsScaleRange.max}. Got $scale.',
    ),
];

List<IdsThemeIssue> _colorIssues(IdsThemeOverrides theme) {
  final resolution = _resolveColorsOnce(theme);
  final colors = resolution.colors;
  return [
    ...resolution.issues,
    if (colors != null) ...checkColorDistinction(colors),
  ];
}

List<IdsThemeIssue> themeIssues(
  IdsThemeOverrides own,
  IdsThemeOverrides merged,
) => [
  if (own.writesColors) ..._colorIssues(merged),
  ..._radiusIssues(own.radius),
  ..._scaleIssues(own.scale),
];

List<IdsThemeIssue> checkIdsTheme(IdsTheme theme) => themeIssues(theme, theme);

@immutable
class IdsResolvedTheme {
  IdsResolvedTheme({required IdsThemeOverrides theme, required this.mode})
    : assert(
        mode != IdsMode.system,
        'IdsResolvedTheme needs a resolved light or dark mode.',
      ),
      theme = _valid(theme),
      _roles = _resolveColorsOnce(theme).colors?.roles {
    if (_roles == null) {
      throw FlutterError(
        'IdsProvider could not resolve the theme colors: ${_resolveColorsOnce(theme).issues.join(' ')}',
      );
    }
  }

  static IdsThemeOverrides _valid(IdsThemeOverrides theme) => IdsThemeOverrides(
    primary: theme.primary,
    secondary: theme.secondary,
    tertiary: theme.tertiary,
    neutral: theme.neutral,
    status: theme.status,
    radius: _radiusIssues(theme.radius).isEmpty ? theme.radius : null,
    cornerShape: theme.cornerShape,
    scale: _scaleIssues(theme.scale).isEmpty ? theme.scale : null,
  );

  final IdsThemeOverrides theme;
  final IdsMode mode;
  final Map<IdsMode, Map<String, Color>>? _roles;

  late final IdsColors colors = IdsColors.fromRoles(_roles![mode]!);

  IdsColors colorsIn(IdsMode mode) => IdsColors.fromRoles(_roles![mode]!);

  late final IdsComponentColors componentColors = IdsComponentColors.of(
    colors,
    mode,
  );

  late final IdsComponentShadows componentShadows = IdsComponentShadows.of(
    mode,
  );

  bool get isDark => mode == IdsMode.dark;

  double get scale => theme.scale ?? 1;

  IdsCornerShape get cornerShape => theme.cornerShape ?? IdsCornerShape.round;

  late final IdsRadius radius = IdsRadius.of(
    theme.radius ?? _defaultRadius,
    cornerShape,
    scale,
  );

  double dimension(double value) => value * scale;

  TextStyle textStyle(TextStyle base, {Color? color, bool mono = false}) =>
      TextStyle(
        inherit: false,
        color: color ?? base.color,
        backgroundColor: base.backgroundColor,
        fontSize: base.fontSize == null
            ? null
            : (base.fontSize! * scale).roundToDouble(),
        fontWeight: base.fontWeight,
        fontStyle: base.fontStyle,
        letterSpacing: base.letterSpacing == null
            ? null
            : base.letterSpacing! * scale,
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
        fontFamily: mono
            ? IdsTypography.monoFontFamily
            : IdsTypography.sansFontFamily,
        fontFamilyFallback: mono ? IdsTypography.monoFontFamilyFallback : null,
        package: mono ? null : IdsTypography.sansFontPackage,
      );

  ShapeBorder shape({double? radius, BorderSide side = BorderSide.none}) {
    final borderRadius = BorderRadius.circular(radius ?? this.radius.standard);
    return switch (cornerShape) {
      IdsCornerShape.round => RoundedRectangleBorder(
        borderRadius: borderRadius,
        side: side,
      ),
      IdsCornerShape.squircle => RoundedSuperellipseBorder(
        borderRadius: borderRadius,
        side: side,
      ),
    };
  }

  @override
  bool operator ==(Object other) =>
      other is IdsResolvedTheme && other.theme == theme && other.mode == mode;

  @override
  int get hashCode => Object.hash(theme, mode);
}
