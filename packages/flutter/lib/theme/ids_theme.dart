import 'package:flutter/widgets.dart';

import '../tokens/ids_color_tokens.dart';
import '../tokens/ids_enums.dart';
import 'ids_palette.dart';
import 'ids_theme_data.dart';

class IdsTheme {
  IdsTheme({required this.data, required this.palette, required this.mode})
    : colors = palette.resolve(
        mode == IdsMode.dark ? Brightness.dark : Brightness.light,
      ) {
    assert(
      mode != IdsMode.system,
      'IdsTheme needs a resolved light or dark mode.',
    );
  }

  final IdsThemeData data;
  final IdsPalette palette;
  final IdsMode mode;
  final IdsPaletteColors colors;

  bool get isDark => mode == IdsMode.dark;
  IdsRadius get radius => data.radius;
  double dimension(double value) => data.dimension(value);
  TextStyle textStyle(TextStyle base, {Color? color, bool mono = false}) =>
      data.textStyle(base, color: color, mono: mono);
  ShapeBorder shape({double? radius, BorderSide side = BorderSide.none}) =>
      data.shape(radius: radius, side: side);

  Color resolve(String token) => switch (token) {
    'primary' => colors.primary,
    'on-primary' => colors.onPrimary,
    'secondary' => colors.secondary,
    'on-secondary' => colors.onSecondary,
    'accent' => colors.accent,
    'outline' => colors.outline,
    _ => IdsTokens.resolve(
      brightness: isDark ? Brightness.dark : Brightness.light,
      token: token,
    ),
  };

  Color get primary => colors.primary;
  Color get onPrimary => colors.onPrimary;
  Color get secondary => colors.secondary;
  Color get onSecondary => colors.onSecondary;
  Color get accent => colors.accent;
  Color get outline => colors.outline;
  Color get surface => resolve('surface');
  Color get onSurface => resolve('on-surface');
  Color get muted => resolve('muted');
  Color get onMuted => resolve('on-muted');
  Color get border => resolve('border');
  Color get danger => resolve('danger');
}
