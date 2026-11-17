import 'package:flutter/painting.dart';
import 'package:flutter/rendering.dart' show CustomPainter;

import '../../theme/ids_resolved_theme.dart';
import '../../tokens/ids_color_roles.dart';
import '../color/oklch.dart';
import '../../tokens/ids_enums.dart';
import 'ids_interactive.dart';

const _black = Color(0xff000000);
const _white = Color(0xffffffff);
const _transparent = Color(0x00000000);
const _shadowXs = [
  BoxShadow(color: Color(0x0d000000), offset: Offset(0, 1), blurRadius: 2),
];
const _shadowSm = [
  BoxShadow(color: Color(0x1a000000), offset: Offset(0, 1), blurRadius: 3),
  BoxShadow(
    color: Color(0x1a000000),
    offset: Offset(0, 1),
    blurRadius: 2,
    spreadRadius: -1,
  ),
];

typedef _ControlColors = ({
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

_ControlColors _controlColors(IdsColors colors, IdsColorScheme scheme) {
  return switch (scheme) {
    IdsColorScheme.primary => (
      fill: colors.bgPrimary,
      fillHover: colors.bgPrimaryHover,
      fillActive: colors.bgPrimaryActive,
      onFill: colors.textOnPrimary,
      soft: colors.bgPrimarySoft,
      softHover: colors.bgPrimarySoftHover,
      softActive: colors.bgPrimarySoftActive,
      onSoft: colors.textOnPrimarySoft,
      quiet: colors.onSurface,
      ring: colors.borderPrimary,
    ),
    IdsColorScheme.secondary => (
      fill: colors.bgSecondary,
      fillHover: colors.bgSecondaryHover,
      fillActive: colors.bgSecondaryActive,
      onFill: colors.textOnSecondary,
      soft: colors.bgSecondarySoft,
      softHover: colors.bgSecondarySoftHover,
      softActive: colors.bgSecondarySoftActive,
      onSoft: colors.textOnSecondarySoft,
      quiet: colors.onSurface,
      ring: colors.borderSecondary,
    ),
    IdsColorScheme.tertiary => (
      fill: colors.bgTertiary,
      fillHover: colors.bgTertiaryHover,
      fillActive: colors.bgTertiaryActive,
      onFill: colors.textOnTertiary,
      soft: colors.bgTertiarySoft,
      softHover: colors.bgTertiarySoftHover,
      softActive: colors.bgTertiarySoftActive,
      onSoft: colors.textOnTertiarySoft,
      quiet: colors.onSurface,
      ring: colors.borderTertiary,
    ),
    IdsColorScheme.danger => (
      fill: colors.bgDanger,
      fillHover: colors.bgDangerHover,
      fillActive: colors.bgDangerActive,
      onFill: colors.textOnDanger,
      soft: colors.bgDangerSoft,
      softHover: colors.bgDangerSoftHover,
      softActive: colors.bgDangerSoftActive,
      onSoft: colors.textOnDangerSoft,
      quiet: colors.textDanger,
      ring: colors.borderDanger,
    ),
    IdsColorScheme.success => (
      fill: colors.bgSuccess,
      fillHover: colors.bgSuccessHover,
      fillActive: colors.bgSuccessActive,
      onFill: colors.textOnSuccess,
      soft: colors.bgSuccessSoft,
      softHover: colors.bgSuccessSoftHover,
      softActive: colors.bgSuccessSoftActive,
      onSoft: colors.textOnSuccessSoft,
      quiet: colors.textSuccess,
      ring: colors.borderSuccess,
    ),
    IdsColorScheme.warning => (
      fill: colors.bgWarning,
      fillHover: colors.bgWarningHover,
      fillActive: colors.bgWarningActive,
      onFill: colors.textOnWarning,
      soft: colors.bgWarningSoft,
      softHover: colors.bgWarningSoftHover,
      softActive: colors.bgWarningSoftActive,
      onSoft: colors.textOnWarningSoft,
      quiet: colors.textWarning,
      ring: colors.borderWarning,
    ),
    IdsColorScheme.info => (
      fill: colors.bgInfo,
      fillHover: colors.bgInfoHover,
      fillActive: colors.bgInfoActive,
      onFill: colors.textOnInfo,
      soft: colors.bgInfoSoft,
      softHover: colors.bgInfoSoftHover,
      softActive: colors.bgInfoSoftActive,
      onSoft: colors.textOnInfoSoft,
      quiet: colors.textInfo,
      ring: colors.borderInfo,
    ),
    IdsColorScheme.neutral => (
      fill: colors.onSurface,
      fillHover: mixOklab(colors.onSurface, _awayFromText(colors.surface), .10),
      fillActive: mixOklab(
        colors.onSurface,
        _awayFromText(colors.surface),
        .20,
      ),
      onFill: colors.surface,
      soft: colors.bgNeutralSoft,
      softHover: colors.bgNeutralSoftHover,
      softActive: colors.bgNeutralSoftActive,
      onSoft: colors.textOnNeutralSoft,
      quiet: colors.onSurface,
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
  IdsInteractiveState state,
) {
  final colors = theme.colors;
  final roles = _controlColors(colors, scheme);
  final status = switch (scheme) {
    IdsColorScheme.danger ||
    IdsColorScheme.success ||
    IdsColorScheme.warning ||
    IdsColorScheme.info => true,
    _ => false,
  };
  final active = state.active || state.pressed;
  final hovered = state.hovered && !active;
  final quietBackground = switch ((active, hovered)) {
    (true, _) => status ? roles.softHover : colors.bgNeutralSoftHover,
    (_, true) => status ? roles.soft : colors.bgNeutralSoft,
    _ when variant == IdsVariant.outline =>
      theme.isDark
          ? colors.bgNeutralSoft.withValues(alpha: .30)
          : colors.surface,
    _ => _transparent,
  };

  final (background, foreground) = switch (variant) {
    IdsVariant.solid => (
      active
          ? roles.fillActive
          : hovered
          ? roles.fillHover
          : roles.fill,
      roles.onFill,
    ),
    IdsVariant.soft => (
      active
          ? roles.softActive
          : hovered
          ? roles.softHover
          : roles.soft,
      roles.onSoft,
    ),
    IdsVariant.outline || IdsVariant.ghost => (quietBackground, roles.quiet),
    IdsVariant.glossy => (roles.fill, roles.onFill),
  };
  final border = switch (variant) {
    IdsVariant.outline => colors.borderNeutral,
    IdsVariant.glossy => mixOklab(roles.fill, _black, .20),
    _ => null,
  };
  final shadows = switch (variant) {
    IdsVariant.solid || IdsVariant.outline => _shadowXs,
    IdsVariant.glossy when !active => _shadowSm,
    _ => const <BoxShadow>[],
  };

  return (
    foreground: foreground,
    decoration: ShapeDecoration(
      gradient: variant == IdsVariant.glossy
          ? _glossy(roles.fill, active, hovered)
          : LinearGradient(colors: [background, background]),
      shape: theme.shape(
        side: border == null
            ? BorderSide.none
            : BorderSide(color: state.focusVisible ? roles.ring : border),
      ),
      shadows: shadows,
    ),
    focusColor: roles.ring.withValues(alpha: state.focusVisible ? .40 : 0),
  );
}

class ControlFocusRing extends CustomPainter {
  const ControlFocusRing(this.theme, this.color);

  final IdsResolvedTheme theme;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    if (color.a == 0 || size.isEmpty) return;
    final rect = Offset.zero & size;
    final inner = theme.shape().getOuterPath(rect);
    final outer = theme
        .shape(radius: theme.radius.standard + 3)
        .getOuterPath(rect.inflate(3));
    final ring = Path()
      ..fillType = PathFillType.evenOdd
      ..addPath(outer, Offset.zero)
      ..addPath(inner, Offset.zero);
    canvas.drawPath(ring, Paint()..color = color);
  }

  @override
  bool shouldRepaint(ControlFocusRing old) =>
      old.theme != theme || old.color != color;
}

LinearGradient _glossy(Color fill, bool active, bool hovered) {
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
