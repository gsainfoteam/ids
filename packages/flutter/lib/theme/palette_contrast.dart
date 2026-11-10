import 'dart:math' as math;

import 'package:flutter/painting.dart';

double paletteContrast(Color a, Color b) {
  final first = a.computeLuminance();
  final second = b.computeLuminance();
  return (math.max(first, second) + .05) / (math.min(first, second) + .05);
}

double _linear(double value) => value <= .04045
    ? value / 12.92
    : math.pow((value + .055) / 1.055, 2.4).toDouble();

double _srgb(double value) =>
    (value <= .0031308
            ? value * 12.92
            : 1.055 * math.pow(value, 1 / 2.4) - .055)
        .toDouble();

double _cubeRoot(double value) => math.pow(value, 1 / 3).toDouble();
double _cube(double value) => value * value * value;

(double, double, double) _oklab(Color color) {
  final r = _linear(color.r);
  final g = _linear(color.g);
  final b = _linear(color.b);
  final l = _cubeRoot(
    .412221469470763 * r + .5363325372617348 * g + .0514459932675022 * b,
  );
  final m = _cubeRoot(
    .2119034958178252 * r + .6806995506452344 * g + .1073969535369406 * b,
  );
  final s = _cubeRoot(
    .0883024591900564 * r + .2817188391361215 * g + .6299787016738222 * b,
  );
  return (
    .210454268309314 * l + .7936177747023054 * m - .0040720430116193 * s,
    1.9779985324311684 * l - 2.4285922420485799 * m + .450593709617411 * s,
    .0259040424655478 * l + .7827717124575296 * m - .8086757549230774 * s,
  );
}

Color mixOklab(Color from, Color to, double amount) {
  final a = _oklab(from);
  final b = _oklab(to);
  double mix(double first, double second) => first + (second - first) * amount;
  final lightness = mix(a.$1, b.$1);
  final greenRed = mix(a.$2, b.$2);
  final blueYellow = mix(a.$3, b.$3);
  final l = _cube(
    lightness + .3963377773761749 * greenRed + .2158037573099136 * blueYellow,
  );
  final m = _cube(
    lightness - .1055613458156586 * greenRed - .0638541728258133 * blueYellow,
  );
  final s = _cube(
    lightness - .0894841775298119 * greenRed - 1.2914855480194092 * blueYellow,
  );
  return Color.from(
    alpha: 1,
    red: _srgb(
      4.0767416360759574 * l - 3.3077115392580616 * m + .2309699031821044 * s,
    ),
    green: _srgb(
      -1.2684379732850317 * l + 2.6097573492876887 * m - .3413193760026573 * s,
    ),
    blue: _srgb(
      -.0041960761386756 * l - .7034186179359362 * m + 1.7076146940746117 * s,
    ),
  );
}
