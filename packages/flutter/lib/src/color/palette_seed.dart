import 'dart:math' as math;

import 'package:flutter/painting.dart';

import '../../tokens/ids_palette_model.dart';
import 'oklch.dart';

typedef ModelShade = ({double l, double gamutShare, double h});

const _degrees = math.pi / 180;

double _lerp(double from, double to, double amount) =>
    from + (to - from) * amount;

double _harmonicTerm(int index, double hue) {
  if (index == 0) return 1;
  final angle = (index / 2).ceil() * hue * _degrees;
  return index.isOdd ? math.cos(angle) : math.sin(angle);
}

double _seriesAt(List<double> coefficients, double hue) {
  var sum = 0.0;
  for (var index = 0; index < coefficients.length; index++) {
    sum += coefficients[index] * _harmonicTerm(index, hue);
  }
  return sum;
}

List<ModelShade> modelAt(double hue) => [
  for (var index = 0; index < IdsPaletteModel.lightness.length; index++)
    (
      l: _seriesAt(IdsPaletteModel.lightness[index], hue),
      gamutShare: _seriesAt(
        IdsPaletteModel.chroma[index],
        hue,
      ).clamp(0.0, 1.0).toDouble(),
      h: hue + _seriesAt(IdsPaletteModel.hueShift[index], hue),
    ),
];

int _nearestStepIndex(List<ModelShade> model, double lightness) {
  var nearest = 0;
  var smallest = double.infinity;
  for (var index = 0; index < model.length; index++) {
    final distance = (model[index].l - lightness).abs();
    if (distance < smallest) {
      smallest = distance;
      nearest = index;
    }
  }
  return nearest;
}

double _gamutShareAtLightness(List<ModelShade> model, double lightness) {
  final lightest = model.first;
  final darkest = model.last;
  if (lightness >= lightest.l) return lightest.gamutShare;
  if (lightness <= darkest.l) return darkest.gamutShare;

  for (var index = 0; index < model.length - 1; index++) {
    final lighter = model[index];
    final darker = model[index + 1];
    if (lightness <= lighter.l && lightness >= darker.l) {
      final span = lighter.l - darker.l;
      return _lerp(
        lighter.gamutShare,
        darker.gamutShare,
        (lighter.l - lightness) / (span == 0 ? 1 : span),
      );
    }
  }
  return darkest.gamutShare;
}

double chromaRatioAgainst(List<ModelShade> model, Oklch shade) {
  final modelChroma =
      _gamutShareAtLightness(model, shade.l) * gamutChroma(shade.l, shade.h);
  return modelChroma > 0 ? math.min(1, shade.c / modelChroma) : 0;
}

List<Oklch> shadesOf(List<ModelShade> model, double chromaRatio) => [
  for (final step in model)
    (
      l: step.l,
      c: step.gamutShare * chromaRatio * gamutChroma(step.l, step.h),
      h: step.h,
    ),
];

List<Color> paletteFromSeed(Color seed) {
  final shade = oklchOf(seed);
  final model = modelAt(shade.h);
  final steps = shadesOf(model, chromaRatioAgainst(model, shade));
  steps[_nearestStepIndex(model, shade.l)] = shade;
  return [for (final step in steps) colorOf(step)];
}
