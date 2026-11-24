import 'package:flutter/painting.dart';
import 'package:flutter/rendering.dart' show CustomPainter;

import '../../theme/ids_resolved_theme.dart';
import '../../tokens/ids_color_roles.dart';
import '../color/oklch.dart';
import '../../tokens/ids_enums.dart';
import 'ids_interactive.dart';
import 'control_tokens.dart';

import 'control_color_states.dart';

const _black = Color(0xff000000);
const _white = Color(0xffffffff);
const _transparent = Color(0x00000000);
typedef ControlColors = ({
  Color fill,
  Color fillHover,
  Color fillActive,
  Color onFill,
  Color soft,
  Color softHover,
  Color softActive,
  Color onSoft,
  Color quiet,
  Color ring,
});

ControlColors controlColors(IdsColors colors, IdsColorScheme scheme) {
  return switch (scheme) {
    IdsColorScheme.primary => (
      fill: colors.bgPrimarySolid,
      fillHover: colors.bgPrimaryHover,
      fillActive: colors.bgPrimaryActive,
      onFill: colors.textOnPrimarySolid,
      soft: colors.bgPrimarySoft,
      softHover: colors.bgPrimarySoftHover,
      softActive: colors.bgPrimarySoftActive,
      onSoft: colors.textOnPrimarySoft,
      quiet: colors.textOnSurface,
      ring: colors.borderPrimary,
    ),
    IdsColorScheme.secondary => (
      fill: colors.bgSecondarySolid,
      fillHover: colors.bgSecondaryHover,
      fillActive: colors.bgSecondaryActive,
      onFill: colors.textOnSecondarySolid,
      soft: colors.bgSecondarySoft,
      softHover: colors.bgSecondarySoftHover,
      softActive: colors.bgSecondarySoftActive,
      onSoft: colors.textOnSecondarySoft,
      quiet: colors.textOnSurface,
      ring: colors.borderSecondary,
    ),
    IdsColorScheme.tertiary => (
      fill: colors.bgTertiarySolid,
      fillHover: colors.bgTertiaryHover,
      fillActive: colors.bgTertiaryActive,
      onFill: colors.textOnTertiarySolid,
      soft: colors.bgTertiarySoft,
      softHover: colors.bgTertiarySoftHover,
      softActive: colors.bgTertiarySoftActive,
      onSoft: colors.textOnTertiarySoft,
      quiet: colors.textOnSurface,
      ring: colors.borderTertiary,
    ),
    IdsColorScheme.danger => (
      fill: colors.bgDangerSolid,
      fillHover: colors.bgDangerHover,
      fillActive: colors.bgDangerActive,
      onFill: colors.textOnDangerSolid,
      soft: colors.bgDangerSoft,
      softHover: colors.bgDangerSoftHover,
      softActive: colors.bgDangerSoftActive,
      onSoft: colors.textOnDangerSoft,
      quiet: colors.textDanger,
      ring: colors.borderDanger,
    ),
    IdsColorScheme.success => (
      fill: colors.bgSuccessSolid,
      fillHover: colors.bgSuccessHover,
      fillActive: colors.bgSuccessActive,
      onFill: colors.textOnSuccessSolid,
      soft: colors.bgSuccessSoft,
      softHover: colors.bgSuccessSoftHover,
      softActive: colors.bgSuccessSoftActive,
      onSoft: colors.textOnSuccessSoft,
      quiet: colors.textSuccess,
      ring: colors.borderSuccess,
    ),
    IdsColorScheme.warning => (
      fill: colors.bgWarningSolid,
      fillHover: colors.bgWarningHover,
      fillActive: colors.bgWarningActive,
      onFill: colors.textOnWarningSolid,
      soft: colors.bgWarningSoft,
      softHover: colors.bgWarningSoftHover,
      softActive: colors.bgWarningSoftActive,
      onSoft: colors.textOnWarningSoft,
      quiet: colors.textWarning,
      ring: colors.borderWarning,
    ),
    IdsColorScheme.info => (
      fill: colors.bgInfoSolid,
      fillHover: colors.bgInfoHover,
      fillActive: colors.bgInfoActive,
      onFill: colors.textOnInfoSolid,
      soft: colors.bgInfoSoft,
      softHover: colors.bgInfoSoftHover,
      softActive: colors.bgInfoSoftActive,
      onSoft: colors.textOnInfoSoft,
      quiet: colors.textInfo,
      ring: colors.borderInfo,
    ),
    IdsColorScheme.neutral => (
      fill: colors.textOnSurface,
      fillHover: mixOklab(
        colors.textOnSurface,
        _awayFromText(colors.bgSurface),
        .10,
      ),
      fillActive: mixOklab(
        colors.textOnSurface,
        _awayFromText(colors.bgSurface),
        .20,
      ),
      onFill: colors.bgSurface,
      soft: colors.bgNeutralSoft,
      softHover: colors.bgNeutralSoftHover,
      softActive: colors.bgNeutralSoftActive,
      onSoft: colors.textOnNeutralSoft,
      quiet: colors.textOnSurface,
      ring: colors.borderPrimary,
    ),
  };
}

Color _awayFromText(Color onFill) => oklabOf(onFill).l >= .5 ? _black : _white;

({Color foreground, ShapeDecoration decoration, Color focusColor})
controlSurface(
  IdsResolvedTheme theme,
  IdsVariant variant,
  IdsColorScheme scheme,
  IdsInteractiveState state, {
  BorderRadiusGeometry? corners,
  double? radius,
  bool toggle = false,
  bool invalid = false,
}) {
  final colors = theme.colors;
  final roles = controlColors(colors, scheme);
  final status = switch (scheme) {
    IdsColorScheme.danger ||
    IdsColorScheme.success ||
    IdsColorScheme.warning ||
    IdsColorScheme.info => true,
    _ => false,
  };
  final active = state.active;
  final hovered = state.hovered && !active;
  final quietBackground = switch ((active, hovered)) {
    (true, _) => status ? roles.softHover : colors.bgNeutralSoftHover,
    (_, true) => status ? roles.soft : colors.bgNeutralSoft,
    _ when variant == IdsVariant.outline =>
      toggle ? colors.bgSurface : outlineControlBackground(theme),
    _ => _transparent,
  };

  final (background, foreground) = switch ((toggle, state.pressed, variant)) {
    (true, false, _) => (quietBackground, roles.quiet),
    (true, true, IdsVariant.ghost || IdsVariant.outline) => (
      status ? roles.softHover : colors.bgNeutralSoftHover,
      status ? roles.onSoft : colors.textOnSurface,
    ),
    (true, true, IdsVariant.soft) => (roles.soft, roles.onSoft),
    (true, true, IdsVariant.solid || IdsVariant.glossy) => (
      roles.fill,
      roles.onFill,
    ),
    (_, _, IdsVariant.solid) => (
      active
          ? roles.fillActive
          : hovered
          ? roles.fillHover
          : roles.fill,
      roles.onFill,
    ),
    (_, _, IdsVariant.soft) => (
      active
          ? roles.softActive
          : hovered
          ? roles.softHover
          : roles.soft,
      roles.onSoft,
    ),
    (_, _, IdsVariant.outline || IdsVariant.ghost) => (
      quietBackground,
      roles.quiet,
    ),
    (_, _, IdsVariant.glossy) => (roles.fill, roles.onFill),
    (_, _, IdsVariant.transparent) => (_transparent, roles.quiet),
  };
  final glossy = variant == IdsVariant.glossy && (!toggle || state.pressed);
  final ring = invalid ? colors.borderDanger : roles.ring;
  final border = invalid
      ? ring
      : switch (variant) {
          IdsVariant.outline => colors.borderNeutral,
          IdsVariant.glossy when glossy => glossyControlBorder(roles.fill),
          _ => null,
        };
  final buttonShadows = switch (variant) {
    IdsVariant.outline => controlShadowXs,
    IdsVariant.solid when !toggle || state.pressed => controlShadowXs,
    IdsVariant.glossy when glossy && (!active || toggle) => controlShadowSm,
    _ => const <BoxShadow>[],
  };

  return (
    foreground: foreground,
    decoration: ShapeDecoration(
      color: glossy ? null : background,
      gradient: glossy
          ? glossyControlGradient(
              roles.fill,
              !toggle && active,
              !toggle && hovered,
            )
          : null,
      shape: theme.shape(
        corners: corners,
        radius: radius,
        side: border == null
            ? BorderSide.none
            : BorderSide(color: state.focusVisible ? ring : border),
      ),
      shadows: buttonShadows,
    ),
    focusColor: ring.withValues(alpha: state.focusVisible ? .40 : 0),
  );
}

class ControlFocusRing extends CustomPainter {
  const ControlFocusRing(this.shape, this.color, {this.direction});

  final ShapeBorder shape;
  final Color color;
  final TextDirection? direction;

  @override
  void paint(Canvas canvas, Size size) {
    if (color.a == 0 || size.isEmpty) return;
    final rect = Offset.zero & size;
    final edge = shape.getOuterPath(rect, textDirection: direction);
    final outside = Path()
      ..fillType = PathFillType.evenOdd
      ..addRect(rect.inflate(4))
      ..addPath(edge, Offset.zero);
    canvas.save();
    canvas.clipPath(outside);
    canvas.drawPath(
      edge,
      Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 6,
    );
    canvas.restore();
  }

  @override
  bool shouldRepaint(ControlFocusRing old) =>
      old.shape != shape || old.color != color || old.direction != direction;
}

Color glossyControlBorder(Color fill) => mixOklab(fill, _black, .20);

LinearGradient glossyControlGradient(Color fill, bool active, bool hovered) {
  final tint = _white.withValues(alpha: hovered ? .30 : .20);
  final top = Color.alphaBlend(tint, fill);
  return LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: active
        ? [Color.alphaBlend(const Color(0x33000000), fill), fill, fill]
        : [Color.alphaBlend(const Color(0x59ffffff), top), top, fill],
    stops: active ? const [0, .07, 1] : const [0, .03, 1],
  );
}

class ControlShapeDecoration extends ShapeDecoration {
  ControlShapeDecoration(ShapeDecoration source)
    : super(
        color: source.color,
        gradient: source.gradient,
        image: source.image,
        shadows: source.shadows,
        shape: source.shape,
      );

  @override
  EdgeInsetsGeometry get padding => EdgeInsets.zero;

  @override
  ShapeDecoration? lerpFrom(Decoration? a, double t) {
    final decoration = a is ShapeDecoration
        ? _lerp(a, this, t)
        : super.lerpFrom(a, t);
    return decoration == null ? null : ControlShapeDecoration(decoration);
  }

  @override
  ShapeDecoration? lerpTo(Decoration? b, double t) {
    final decoration = b is ShapeDecoration
        ? _lerp(this, b, t)
        : super.lerpTo(b, t);
    return decoration == null ? null : ControlShapeDecoration(decoration);
  }

  static ShapeDecoration? _lerp(
    ShapeDecoration a,
    ShapeDecoration b,
    double t,
  ) {
    if (t == 0) return a;
    if (t == 1) return b;
    return ShapeDecoration.lerp(
      a.color != null && b.gradient != null ? _asGradient(a) : a,
      b.color != null && a.gradient != null ? _asGradient(b) : b,
      t,
    );
  }

  static ShapeDecoration _asGradient(ShapeDecoration source) => ShapeDecoration(
    gradient: LinearGradient(colors: [source.color!, source.color!]),
    image: source.image,
    shadows: source.shadows,
    shape: source.shape,
  );
}
