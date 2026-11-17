import 'dart:math' as math;

import 'package:flutter/painting.dart';

import 'oklch.dart';

const textLc = 75.0;

const accentTextLc = 60.0;

const markLc = 45.0;

const lightText = Color(0xFFFFFFFF);

const darkText = Color(0xFF0A0A0A);

const _normalBackground = 0.56;
const _normalText = 0.57;
const _reverseText = 0.62;
const _reverseBackground = 0.65;
const _blackThreshold = 0.022;
const _blackClamp = 1.414;
const _lowClip = 0.1;
const _luminanceNoiseGate = 0.0005;
const _scale = 1.14;
const _lowOffset = 0.027;

double _screenLinear(double channel) =>
    (channel < 0 ? -1 : 1) * math.pow(channel.abs(), 2.4).toDouble();

double _screenLuminance(Color color) =>
    _screenLinear(color.r) * 0.2126729 +
    _screenLinear(color.g) * 0.7151522 +
    _screenLinear(color.b) * 0.0721750;

double _withFlare(double luminance) => luminance >= _blackThreshold
    ? luminance
    : luminance + math.pow(_blackThreshold - luminance, _blackClamp).toDouble();

double contrastApca(Color background, Color foreground) {
  final text = _withFlare(_screenLuminance(foreground));
  final page = _withFlare(_screenLuminance(background));

  final double contrast;
  if ((page - text).abs() < _luminanceNoiseGate) {
    contrast = 0;
  } else if (page > text) {
    contrast =
        (math.pow(page, _normalBackground) - math.pow(text, _normalText)) *
        _scale;
  } else {
    contrast =
        (math.pow(page, _reverseBackground) - math.pow(text, _reverseText)) *
        _scale;
  }

  final double lightnessContrast;
  if (contrast.abs() < _lowClip) {
    lightnessContrast = 0;
  } else if (contrast > 0) {
    lightnessContrast = contrast - _lowOffset;
  } else {
    lightnessContrast = contrast + _lowOffset;
  }
  return lightnessContrast * 100;
}

double lightnessContrast(Color foreground, Color background) =>
    contrastApca(background, foreground).abs();

bool reaches(
  Color foreground,
  Iterable<Color> backgrounds, [
  double lc = textLc,
]) => backgrounds.every(
  (background) => lightnessContrast(foreground, background) >= lc,
);

typedef _Machado = List<double>;

const _protanopia = <double>[
  0.152286, 1.052583, -0.204868, //
  0.114503, 0.786281, 0.099216,
  -0.003882, -0.048116, 1.051998,
];

const _deuteranopia = <double>[
  0.367322, 0.860646, -0.227968, //
  0.280085, 0.672501, 0.047413,
  -0.01182, 0.04294, 0.968881,
];

Rgb _simulate(_Machado matrix, Color color) => (
  r: matrix[0] * color.r + matrix[1] * color.g + matrix[2] * color.b,
  g: matrix[3] * color.r + matrix[4] * color.g + matrix[5] * color.b,
  b: matrix[6] * color.r + matrix[7] * color.g + matrix[8] * color.b,
);

const _redGreenDeficiencies = [_deuteranopia, _protanopia];

double distanceUnderRedGreenCvd(Color first, Color second) => [
  for (final deficiency in _redGreenDeficiencies)
    oklabDistanceOf(
      oklabOfRgb(_simulate(deficiency, first)),
      oklabOfRgb(_simulate(deficiency, second)),
    ),
].reduce(math.min);
