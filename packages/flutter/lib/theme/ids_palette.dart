import 'dart:ui' show Brightness, ColorSpace;

import 'package:flutter/painting.dart';

import 'palette_contrast.dart';

class IdsPalette {
  const IdsPalette({
    required this.shade50,
    required this.shade100,
    required this.shade200,
    required this.shade300,
    required this.shade400,
    required this.shade500,
    required this.shade600,
    required this.shade700,
    required this.shade800,
    required this.shade900,
    required this.shade950,
  });

  final Color shade50;
  final Color shade100;
  final Color shade200;
  final Color shade300;
  final Color shade400;
  final Color shade500;
  final Color shade600;
  final Color shade700;
  final Color shade800;
  final Color shade900;
  final Color shade950;

  Map<int, Color> get shades => {
    50: shade50,
    100: shade100,
    200: shade200,
    300: shade300,
    400: shade400,
    500: shade500,
    600: shade600,
    700: shade700,
    800: shade800,
    900: shade900,
    950: shade950,
  };

  List<String> check() {
    final issues = <String>[
      for (final entry in shades.entries)
        if (entry.value.a != 1 ||
            entry.value.colorSpace != ColorSpace.sRGB ||
            [
              entry.value.r,
              entry.value.g,
              entry.value.b,
            ].any((v) => !v.isFinite || v < 0 || v > 1))
          'Palette shade ${entry.key} must be an opaque sRGB color.',
    ];
    if (issues.isNotEmpty) return issues;
    for (final brightness in Brightness.values) {
      try {
        resolve(brightness);
      } on ArgumentError catch (error) {
        issues.add('${brightness.name}: ${error.message}');
      }
    }
    return issues;
  }

  IdsPaletteColors resolve(Brightness brightness) {
    final dark = brightness == Brightness.dark;
    final primary = shade600;
    final secondary = dark ? shade950 : shade100;
    const white = Color(0xffffffff);
    const black = Color(0xff0a0a0a);
    final surface = dark ? black : white;
    final onPrimary = paletteContrast(white, primary) >= 4.5 ? white : black;
    if (paletteContrast(onPrimary, primary) < 4.5) {
      throw ArgumentError('No on-primary color reaches 4.5:1.');
    }
    final onSecondary = _firstPassing(
      'on-secondary',
      dark ? [shade400, shade300, shade200] : [shade700, shade800, shade900],
      [
        secondary,
        mixOklab(secondary, primary, .06),
        mixOklab(secondary, primary, .12),
      ],
    );
    final accent = _firstPassing(
      'accent',
      dark
          ? [shade500, shade400, shade300]
          : [shade600, shade700, shade800, shade900],
      [surface, secondary],
    );
    return IdsPaletteColors(
      primary: primary,
      onPrimary: onPrimary,
      secondary: secondary,
      onSecondary: onSecondary,
      accent: accent,
      outline: dark ? shade800 : shade200,
    );
  }

  static Color _firstPassing(
    String role,
    List<Color> candidates,
    List<Color> backgrounds,
  ) {
    for (final color in candidates) {
      if (backgrounds.every(
        (background) => paletteContrast(color, background) >= 4.5,
      )) {
        return color;
      }
    }
    throw ArgumentError('No $role color reaches 4.5:1.');
  }
}

class IdsPaletteColors {
  const IdsPaletteColors({
    required this.primary,
    required this.onPrimary,
    required this.secondary,
    required this.onSecondary,
    required this.accent,
    required this.outline,
  });

  final Color primary;
  final Color onPrimary;
  final Color secondary;
  final Color onSecondary;
  final Color accent;
  final Color outline;
}
