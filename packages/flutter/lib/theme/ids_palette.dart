import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';

import '../src/color/palette_seed.dart';

@immutable
class IdsPalette {
  IdsPalette(List<Color> colors)
    : assert(
        colors.length == steps.length,
        'IdsPalette takes one color for each of ${steps.join(', ')}.',
      ),
      colors = List.unmodifiable(colors);

  factory IdsPalette.fromSeed(Color seed) => IdsPalette(paletteFromSeed(seed));

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
      other is IdsPalette && listEquals(other.colors, colors);

  @override
  int get hashCode => Object.hashAll(colors);

  @override
  String toString() => 'IdsPalette(${colors.map(_hexOf).join(', ')})';
}

String _hexOf(Color color) =>
    '#${(color.toARGB32() & 0xFFFFFF).toRadixString(16).padLeft(6, '0')}';
