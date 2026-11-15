import 'dart:math' as math;

import 'package:flutter/painting.dart';

typedef Oklch = ({double l, double c, double h});

typedef _Rgb = ({double r, double g, double b});

const _chromaRange = 0.4;

const _bisectionSteps = 8192;

const _chromaResolution = _chromaRange / _bisectionSteps;

const _beyondSrgbChroma = 0.5;

double _cbrt(double value) {
  if (value == 0 || value.isNaN || value.isInfinite) return value;
  final magnitude = value.abs();
  var root = math.pow(magnitude, 1 / 3).toDouble();
  root -= (root * root * root - magnitude) / (3 * root * root);
  return value < 0 ? -root : root;
}

double _toLinear(double channel) {
  final magnitude = channel.abs();
  if (magnitude <= 0.04045) return channel / 12.92;
  final sign = channel < 0 ? -1.0 : 1.0;
  return sign * math.pow((magnitude + 0.055) / 1.055, 2.4).toDouble();
}

double _fromLinear(double channel) {
  final magnitude = channel.abs();
  if (magnitude > 0.0031308) {
    final sign = channel < 0 ? -1.0 : 1.0;
    return sign * (1.055 * math.pow(magnitude, 1 / 2.4).toDouble() - 0.055);
  }
  return channel * 12.92;
}

double _normalizeHue(double hue) {
  final turned = hue.remainder(360);
  return turned < 0 ? turned + 360 : turned;
}

Oklch _oklchOfRgb(_Rgb rgb) {
  final r = _toLinear(rgb.r);
  final g = _toLinear(rgb.g);
  final b = _toLinear(rgb.b);

  final long = _cbrt(
    0.412221469470763 * r + 0.5363325372617348 * g + 0.0514459932675022 * b,
  );
  final medium = _cbrt(
    0.2119034958178252 * r + 0.6806995506452344 * g + 0.1073969535369406 * b,
  );
  final short = _cbrt(
    0.0883024591900564 * r + 0.2817188391361215 * g + 0.6299787016738222 * b,
  );

  final lightness =
      0.210454268309314 * long +
      0.7936177747023054 * medium -
      0.0040720430116193 * short;
  final isGray = rgb.r == rgb.b && rgb.b == rgb.g;
  final greenRed = isGray
      ? 0.0
      : 1.9779985324311684 * long -
            2.4285922420485799 * medium +
            0.450593709617411 * short;
  final blueYellow = isGray
      ? 0.0
      : 0.0259040424655478 * long +
            0.7827717124575296 * medium -
            0.8086757549230774 * short;

  final chroma = math.sqrt(greenRed * greenRed + blueYellow * blueYellow);
  final hue = chroma != 0
      ? _normalizeHue((math.atan2(blueYellow, greenRed) * 180) / math.pi)
      : 0.0;
  return (l: lightness, c: chroma, h: hue);
}

_Rgb _rgbOf(Oklch color) {
  final angle = (color.h / 180) * math.pi;
  final greenRed = color.c != 0 ? color.c * math.cos(angle) : 0.0;
  final blueYellow = color.c != 0 ? color.c * math.sin(angle) : 0.0;

  final long = math
      .pow(
        color.l +
            0.3963377773761749 * greenRed +
            0.2158037573099136 * blueYellow,
        3,
      )
      .toDouble();
  final medium = math
      .pow(
        color.l -
            0.1055613458156586 * greenRed -
            0.0638541728258133 * blueYellow,
        3,
      )
      .toDouble();
  final short = math
      .pow(
        color.l -
            0.0894841775298119 * greenRed -
            1.2914855480194092 * blueYellow,
        3,
      )
      .toDouble();

  return (
    r: _fromLinear(
      4.0767416360759574 * long -
          3.3077115392580616 * medium +
          0.2309699031821044 * short,
    ),
    g: _fromLinear(
      -1.2684379732850317 * long +
          2.6097573492876887 * medium -
          0.3413193760026573 * short,
    ),
    b: _fromLinear(
      -0.0041960761386756 * long -
          0.7034186179359362 * medium +
          1.7076146940746117 * short,
    ),
  );
}

bool _inUnit(double channel) => channel >= 0 && channel <= 1;

bool _displayable(Oklch color) {
  final rgb = _rgbOf(color);
  return _inUnit(rgb.r) && _inUnit(rgb.g) && _inUnit(rgb.b);
}

double _clipChannel(double channel) => math.max(0, math.min(channel, 1));

Oklch oklchOf(Color color) => _oklchOfRgb((r: color.r, g: color.g, b: color.b));

Oklch clampChroma(Oklch color) {
  if (_displayable(color)) return color;

  var clamped = (l: color.l, c: 0.0, h: color.h);
  if (!_displayable(clamped)) {
    final rgb = _rgbOf(clamped);
    return _oklchOfRgb((
      r: _clipChannel(rgb.r),
      g: _clipChannel(rgb.g),
      b: _clipChannel(rgb.b),
    ));
  }

  var start = 0.0;
  var end = color.c;
  var lastGoodChroma = clamped.c;
  while (end - start > _chromaResolution) {
    clamped = (l: color.l, c: start + (end - start) * 0.5, h: color.h);
    if (_displayable(clamped)) {
      lastGoodChroma = clamped.c;
      start = clamped.c;
    } else {
      end = clamped.c;
    }
  }

  return _displayable(clamped)
      ? clamped
      : (l: clamped.l, c: lastGoodChroma, h: clamped.h);
}

double gamutChroma(double lightness, double hue) =>
    clampChroma((l: lightness, c: _beyondSrgbChroma, h: hue)).c;

int _eightBit(double channel) {
  final unit = channel.isNaN ? 0.0 : math.max(0.0, math.min(1.0, channel));
  return (unit * 255).round();
}

Color colorOf(Oklch color) {
  final rgb = _rgbOf(clampChroma(color));
  return Color.fromARGB(
    255,
    _eightBit(rgb.r),
    _eightBit(rgb.g),
    _eightBit(rgb.b),
  );
}
