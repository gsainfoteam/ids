import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';

import '../src/color/palette_scales.dart';
import '../src/color/palette_seed.dart';
import '../tokens/ids_enums.dart';

@immutable
sealed class IdsThemeColor {
  const IdsThemeColor();

  const factory IdsThemeColor.seed(Color color) = IdsSeedColor;
}

@immutable
final class IdsSeedColor extends IdsThemeColor {
  const IdsSeedColor(this.color);

  final Color color;

  @override
  bool operator ==(Object other) =>
      other is IdsSeedColor && other.color == color;

  @override
  int get hashCode => color.hashCode;

  @override
  String toString() => 'IdsThemeColor.seed(${_hexOf(color)})';
}

@immutable
final class IdsRamp extends IdsThemeColor {
  IdsRamp(List<Color> colors)
    : assert(
        colors.length == steps.length,
        'IdsRamp takes one color for each of ${steps.join(', ')}.',
      ),
      colors = List.unmodifiable(colors);

  factory IdsRamp.fromSeed(Color seed) => IdsRamp(rampFromSeed(seed));

  static const steps = <int>[
    50,
    100,
    200,
    300,
    400,
    500,
    600,
    700,
    800,
    900,
    950,
  ];

  final List<Color> colors;

  Color operator [](int step) {
    final index = steps.indexOf(step);
    if (index < 0) {
      throw ArgumentError.value(
        step,
        'step',
        'is not one of ${steps.join(', ')}',
      );
    }
    return colors[index];
  }

  @override
  bool operator ==(Object other) =>
      other is IdsRamp && listEquals(other.colors, colors);

  @override
  int get hashCode => Object.hashAll(colors);

  @override
  String toString() => 'IdsRamp(${colors.map(_hexOf).join(', ')})';
}

@immutable
final class IdsPalette extends IdsThemeColor {
  IdsPalette({required List<Color> light, required List<Color> dark})
    : assert(
        light.length == steps.length && dark.length == steps.length,
        'IdsPalette takes ${steps.length} colors for each mode, steps 1 to ${steps.length}.',
      ),
      light = List.unmodifiable(light),
      dark = List.unmodifiable(dark);

  factory IdsPalette.fromSeed(Color seed) => paletteFromSeed(seed);

  static const steps = <int>[1, 2, 3, 4, 5, 6, 7, 8];

  final List<Color> light;

  final List<Color> dark;

  List<Color> operator [](IdsMode mode) => mode == IdsMode.dark ? dark : light;

  @override
  bool operator ==(Object other) =>
      other is IdsPalette &&
      listEquals(other.light, light) &&
      listEquals(other.dark, dark);

  @override
  int get hashCode => Object.hash(Object.hashAll(light), Object.hashAll(dark));

  @override
  String toString() =>
      'IdsPalette(light: ${light.map(_hexOf).join(', ')}, dark: ${dark.map(_hexOf).join(', ')})';
}

String _hexOf(Color color) =>
    '#${(color.toARGB32() & 0xFFFFFF).toRadixString(16).padLeft(6, '0')}';
