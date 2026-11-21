import 'dart:math' as math;

import '../../theme/ids_palette.dart';
import '../../tokens/ids_palette_model.dart';
import 'color_distance.dart';
import 'palette_seed.dart';

typedef StatusPalettes = Map<String, IdsRamp>;

final _fixedStatusSteps = {
  'success': IdsStatusPalettes.green,
  'warning': IdsStatusPalettes.yellow,
  'danger': IdsStatusPalettes.red,
  'info': IdsStatusPalettes.sky,
};

const statusHues = {
  'danger': (from: 5.0, to: 31.0),
  'warning': (from: 31.0, to: 108.0),
  'success': (from: 108.0, to: 200.0),
  'info': (from: 200.0, to: 268.0),
};

const harmonizeLimit = 15.0;

const _staysInsideItsHues = 1.0;

const _achromatic = 0.02;

const _halvingsBeforeGivingUp = 6;

final statusFamilies = _fixedStatusSteps.keys.toList(growable: false);

double _around(double hue) => hue % 360;

bool readsAs(String family, double hue) {
  final hues = statusHues[family]!;
  return _around(hue - hues.from) < hues.to - hues.from;
}

double harmonizedRotation(String family, double hue, double primaryHue) {
  final distance = signedHueDelta(hue, primaryHue);
  final toward = distance.sign * math.min(harmonizeLimit, distance.abs() / 2);
  final hues = statusHues[family]!;
  final roomBelow = _around(hue - hues.from) - _staysInsideItsHues;
  final roomAbove = _around(hues.to - hue) - _staysInsideItsHues;
  return math.min(
    math.max(toward, -math.max(roomBelow, 0.0)),
    math.max(roomAbove, 0.0),
  );
}

IdsRamp fixedStatusPalette(String family) =>
    IdsRamp(_fixedStatusSteps[family]!);

StatusPalettes _fixedPalettes() => {
  for (final family in statusFamilies) family: fixedStatusPalette(family),
};

Set<String> _familiesLosingDistinction(
  StatusPalettes palettes,
  StatusPalettes fixed,
  IdsRamp primary,
) {
  final losing = <String>{};
  final primaryFill = primary[comparedStep];

  for (final family in statusFamilies) {
    if (tooClose(palettes[family]![comparedStep], primaryFill) &&
        !tooClose(fixed[family]![comparedStep], primaryFill)) {
      losing.add(family);
    }
  }

  for (final (status, other) in redGreenPairs) {
    if (alikeUnderRedGreenCvd(
      palettes[status]![comparedStep],
      palettes[other]![comparedStep],
    )) {
      losing
        ..add(status)
        ..add(other);
    }
  }

  return losing;
}

StatusPalettes harmonizedStatusPalettes(IdsRamp primary) {
  final fixed = _fixedPalettes();
  if (chromaOf(primary.colors) < _achromatic) return fixed;

  final primaryHue = hueOf(primary.colors);
  final rotations = {
    for (final family in statusFamilies)
      family: harmonizedRotation(
        family,
        hueOf(fixed[family]!.colors),
        primaryHue,
      ),
  };

  StatusPalettes rotate() => {
    for (final family in statusFamilies)
      family: rotations[family] == 0
          ? fixed[family]!
          : IdsRamp(rotatedRamp(fixed[family]!.colors, rotations[family]!)),
  };

  var palettes = rotate();
  for (var halving = 0; halving <= _halvingsBeforeGivingUp; halving++) {
    final losing = _familiesLosingDistinction(palettes, fixed, primary);
    if (losing.isEmpty) return palettes;
    for (final family in losing) {
      rotations[family] = halving == _halvingsBeforeGivingUp
          ? 0
          : rotations[family]! / 2;
    }
    palettes = rotate();
  }

  return palettes;
}
