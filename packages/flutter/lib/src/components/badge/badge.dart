import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import '../../../theme/ids_theme.dart';
import '../../../theme/theme_provider.dart';
import '../../../tokens/ids_enums.dart';
import '../../../tokens/ids_motion.dart';
import '../../../tokens/ids_typography.dart';
import '../avatar/avatar.dart';
import '../avatar/avatar_scope.dart';

enum BadgePlacement { topEnd, topStart, bottomEnd, bottomStart }

enum BadgeShape { rectangular, circular }

enum BadgeVariant { solid, soft, outline }

double _linear(double c) =>
    c <= 0.04045 ? c / 12.92 : math.pow((c + 0.055) / 1.055, 2.4).toDouble();

double _gamma(double c) =>
    c <= 0.0031308 ? 12.92 * c : 1.055 * math.pow(c, 1 / 2.4) - 0.055;

double _cbrt(double x) => math.pow(x, 1 / 3).toDouble();

List<double> _toOklab(Color color) {
  final r = _linear(color.r), g = _linear(color.g), b = _linear(color.b);
  final l = _cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  final m = _cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  final s = _cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}

Color _fromOklab(List<double> lab) {
  final [lightness, a, b] = lab;
  final l = math.pow(lightness + 0.3963377774 * a + 0.2158037573 * b, 3);
  final m = math.pow(lightness - 0.1055613458 * a - 0.0638541728 * b, 3);
  final s = math.pow(lightness - 0.0894841775 * a - 1.2914855480 * b, 3);
  double channel(num value) => _gamma(value.toDouble()).clamp(0.0, 1.0);
  return Color.from(
    alpha: 1,
    red: channel(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    green: channel(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    blue: channel(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  );
}

Color _mixOklab(Color from, Color to, double amount) {
  final a = _toOklab(from), b = _toOklab(to);
  return _fromOklab([
    for (var i = 0; i < 3; i++) a[i] + (b[i] - a[i]) * amount,
  ]);
}

class Badge extends StatelessWidget {
  const Badge({
    super.key,
    required Widget this.content,
    this.invisible = false,
    this.placement = BadgePlacement.topEnd,
    this.shape,
    this.variant = BadgeVariant.solid,
    this.colorScheme,
    this.size = IdsSize.standard,
    this.semanticsLabel,
    this.child,
  }) : count = null,
       max = 99,
       showZero = false,
       dot = false;

  const Badge.count({
    super.key,
    required int this.count,
    this.max = 99,
    this.showZero = false,
    this.invisible = false,
    this.placement = BadgePlacement.topEnd,
    this.shape,
    this.variant = BadgeVariant.solid,
    this.colorScheme,
    this.size = IdsSize.standard,
    this.semanticsLabel,
    this.child,
  }) : content = null,
       dot = false;

  const Badge.dot({
    super.key,
    this.invisible = false,
    this.placement = BadgePlacement.topEnd,
    this.shape,
    this.variant = BadgeVariant.solid,
    this.colorScheme,
    this.size = IdsSize.standard,
    this.semanticsLabel,
    this.child,
  }) : content = null,
       count = null,
       max = 99,
       showZero = false,
       dot = true;

  final Widget? content;
  final int? count;
  final int max;
  final bool showZero;
  final bool dot;
  final bool invisible;
  final BadgePlacement placement;
  final BadgeShape? shape;
  final BadgeVariant variant;
  final IdsColorScheme? colorScheme;
  final IdsSize size;
  final String? semanticsLabel;
  final Widget? child;

  static const _circularInset = 0.146;
  static const _ringWidth = 2.0;
  static const _outlineAlpha = 0.45;
  static const _tintAmount = 0.16;
  static const _dotSizes = {IdsSize.standard: 10.0, IdsSize.tiny: 8.0};
  static const _heights = {IdsSize.standard: 20.0, IdsSize.tiny: 16.0};
  static const _paddings = {IdsSize.standard: 6.0, IdsSize.tiny: 4.0};
  static const _iconSizes = {IdsSize.standard: 12.0, IdsSize.tiny: 10.0};
  static const _styles = {
    IdsSize.standard: IdsTypography.captionC1Medium,
    IdsSize.tiny: IdsTypography.captionC2Medium,
  };

  int? get _shownCount => count == null ? null : math.max(0, count!);

  bool get _hidden => invisible || (_shownCount == 0 && !showZero);

  String get _countText {
    final cap = math.max(0, max);
    return _shownCount! > cap ? '$cap+' : '$_shownCount';
  }

  bool _circular(BuildContext context) => switch ((shape, child)) {
    (BadgeShape.circular, _) => true,
    (null, Avatar(shape: final own)) =>
      (own ?? AvatarScope.maybeOf(context)?.shape ?? AvatarShape.circle) ==
          AvatarShape.circle,
    _ => false,
  };

  bool get _describes => semanticsLabel == null && !dot && !_hidden;

  ({Color background, Color foreground, Color? edge}) _colors(
    IdsTheme theme,
    IdsColorScheme scheme,
  ) {
    final (fill, onFill, strong) = switch (scheme) {
      IdsColorScheme.neutral => (
        theme.onSurface,
        theme.surface,
        theme.onSurface,
      ),
      IdsColorScheme.primary => (theme.primary, theme.onPrimary, theme.accent),
      IdsColorScheme.success => (
        theme.success,
        theme.onSuccess,
        theme.successStrong,
      ),
      IdsColorScheme.warning => (
        theme.warning,
        theme.onWarning,
        theme.warningStrong,
      ),
      IdsColorScheme.danger => (
        theme.danger,
        theme.onDanger,
        theme.dangerStrong,
      ),
      IdsColorScheme.info => (theme.info, theme.onInfo, theme.infoStrong),
    };
    final (tinted, onTint) = scheme == IdsColorScheme.primary
        ? (theme.secondary, theme.onSecondary)
        : (_mixOklab(theme.surface, fill, _tintAmount), strong);
    return switch (variant) {
      BadgeVariant.solid => (background: fill, foreground: onFill, edge: null),
      BadgeVariant.soft => (background: tinted, foreground: onTint, edge: null),
      BadgeVariant.outline => (
        background: theme.surface,
        foreground: strong,
        edge: fill.withValues(alpha: _outlineAlpha),
      ),
    };
  }

  Widget _indicator(BuildContext context, {required bool attached}) {
    final theme = ThemeProvider.of(context);
    final colors = _colors(
      theme,
      colorScheme ??
          (attached ? IdsColorScheme.danger : IdsColorScheme.neutral),
    );
    final reduced = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final duration = reduced ? Duration.zero : IdsMotion.fast;

    Widget box = Container(
      constraints: dot
          ? BoxConstraints.tight(Size.square(_dotSizes[size]!))
          : BoxConstraints(
              minWidth: _heights[size]!,
              minHeight: _heights[size]!,
              maxHeight: _heights[size]!,
            ),
      padding: dot ? null : EdgeInsets.symmetric(horizontal: _paddings[size]!),
      decoration: ShapeDecoration(
        color: colors.background,
        shape: StadiumBorder(
          side: attached
              ? BorderSide(
                  color: theme.surface,
                  width: _ringWidth,
                  strokeAlign: BorderSide.strokeAlignOutside,
                )
              : BorderSide.none,
        ),
      ),
      foregroundDecoration: colors.edge == null
          ? null
          : ShapeDecoration(
              shape: StadiumBorder(side: BorderSide(color: colors.edge!)),
            ),
      child: dot
          ? null
          : DefaultTextStyle(
              style: _styles[size]!.copyWith(
                height: 1,
                color: colors.foreground,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
              maxLines: 1,
              softWrap: false,
              child: IconTheme(
                data: IconThemeData(
                  size: _iconSizes[size],
                  color: colors.foreground,
                ),
                child: Center(
                  widthFactor: 1,
                  heightFactor: 1,
                  child: content ?? Text(_countText),
                ),
              ),
            ),
    );

    box = AnimatedOpacity(
      opacity: _hidden ? 0 : 1,
      duration: duration,
      curve: Curves.fastOutSlowIn,
      child: AnimatedScale(
        scale: _hidden ? 0 : 1,
        duration: duration,
        curve: Curves.fastOutSlowIn,
        child: box,
      ),
    );

    if (semanticsLabel != null) {
      return Semantics(
        liveRegion: true,
        label: semanticsLabel,
        excludeSemantics: true,
        child: box,
      );
    }
    return ExcludeSemantics(excluding: !attached || !_describes, child: box);
  }

  @override
  Widget build(BuildContext context) {
    final anchor = child;
    if (anchor == null) return _indicator(context, attached: false);

    final rtl = Directionality.of(context) == TextDirection.rtl;
    final top =
        placement == BadgePlacement.topEnd ||
        placement == BadgePlacement.topStart;
    final end =
        placement == BadgePlacement.topEnd ||
        placement == BadgePlacement.bottomEnd;
    final right = end != rtl;
    final inset = _circular(context) ? _circularInset : 0.0;

    final badge = Stack(
      clipBehavior: Clip.none,
      children: [
        anchor,
        Positioned.fill(
          child: IgnorePointer(
            child: LayoutBuilder(
              builder: (context, box) {
                final dx = inset * box.maxWidth;
                final dy = inset * box.maxHeight;
                return Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Positioned(
                      left: right ? null : dx,
                      right: right ? dx : null,
                      top: top ? dy : null,
                      bottom: top ? null : dy,
                      child: FractionalTranslation(
                        translation: Offset(
                          right ? 0.5 : -0.5,
                          top ? -0.5 : 0.5,
                        ),
                        child: _indicator(context, attached: true),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      ],
    );

    return _describes ? MergeSemantics(child: badge) : badge;
  }
}
