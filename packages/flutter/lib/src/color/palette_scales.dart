import 'dart:math' as math;
import 'dart:ui' show ColorSpace;

import 'package:flutter/painting.dart';

import '../../theme/ids_palette.dart';
import '../../tokens/ids_color_roles.dart';
import '../../tokens/ids_enums.dart';
import 'contrast.dart';
import 'oklch.dart';

abstract final class ScaleStep {
  static const base = 1;
  static const surface = 2;
  static const block = 3;
  static const soft = 4;
  static const border = 5;
  static const strongBorder = 6;
  static const solid = 7;
  static const text = 8;
  static const strongText = 9;
}

Color stepOf(List<Color> scale, int step) => scale[step - 1];

final idsNeutralPalette = IdsPalette(
  light: IdsColorRoles.neutralScales[IdsMode.light]!,
  dark: IdsColorRoles.neutralScales[IdsMode.dark]!,
);

typedef StateLayer = ({Color color, List<double> opacities});

StateLayer contentLayer(Color content) => (
  color: content,
  opacities: const [IdsStateOpacity.hover, IdsStateOpacity.press],
);

StateLayer tintLayer(Color fill) => (
  color: fill,
  opacities: const [IdsStateOpacity.tintHover, IdsStateOpacity.tintPress],
);

const StateLayer fillLayer = (
  color: IdsStateLayer.fillColor,
  opacities: [IdsStateOpacity.fillHover, IdsStateOpacity.fillPress],
);

Color eightBitOpaque(Color color) {
  final srgb = color.withValues(colorSpace: ColorSpace.sRGB);
  int channel(double value) => (value.clamp(0.0, 1.0) * 255).round();
  return Color.fromARGB(255, channel(srgb.r), channel(srgb.g), channel(srgb.b));
}

double _towardLikeCulori(double from, double to, double amount) =>
    from + amount * (to - from);

Color withStateLayer(Color base, Color layer, double opacity) {
  final from = base.withValues(colorSpace: ColorSpace.sRGB);
  final to = layer.withValues(colorSpace: ColorSpace.sRGB);
  return eightBitOpaque(
    Color.from(
      alpha: 1,
      red: _towardLikeCulori(from.r, to.r, opacity),
      green: _towardLikeCulori(from.g, to.g, opacity),
      blue: _towardLikeCulori(from.b, to.b, opacity),
    ),
  );
}

List<Color> underStateLayers(Color base, List<StateLayer> layers) => [
  base,
  for (final layer in layers)
    for (final opacity in layer.opacities)
      withStateLayer(base, layer.color, opacity),
];

bool readsOn(Color text, List<Color> bases, Color fill, [double lc = textLc]) =>
    reaches(text, [
      for (final base in bases)
        ...underStateLayers(base, [contentLayer(text), tintLayer(fill)]),
    ], lc);

double _lowestContrastUnderStateLayers(Color text, Color fill) => [
  for (final state in underStateLayers(fill, [fillLayer]))
    lightnessContrast(text, state),
].reduce(math.min);

typedef Readable = ({Color fill, Color text, double lc});

Readable mostReadable(List<Color> fills) {
  Readable? best;
  for (final fill in fills) {
    for (final text in const [lightText, darkText]) {
      final lc = _lowestContrastUnderStateLayers(text, fill);
      if (best == null || lc > best.lc) best = (fill: fill, text: text, lc: lc);
    }
  }
  return best!;
}

sealed class Backdrop {
  const Backdrop();
}

final class SolidBackdrop extends Backdrop {
  const SolidBackdrop();
}

final class NeutralBackdrop extends Backdrop {
  const NeutralBackdrop();
}

final class TintedBackdrop extends Backdrop {
  const TintedBackdrop(this.solid);

  final Color solid;
}

List<StateLayer> _layersOver(Backdrop backdrop, Color text) =>
    switch (backdrop) {
      SolidBackdrop() => [fillLayer],
      NeutralBackdrop() => [contentLayer(text)],
      TintedBackdrop(:final solid) => [contentLayer(text), tintLayer(solid)],
    };

double _lowestContrastOver(Color text, Color background, Backdrop backdrop) => [
  for (final state in underStateLayers(background, _layersOver(backdrop, text)))
    lightnessContrast(text, state),
].reduce(math.min);

double _lightnessOf(Color color) => oklchOf(color).l;

List<Color> _candidatesToward(
  Color end,
  Color absoluteEnd,
  IdsRamp? ramp,
  bool darker,
) {
  final endL = _lightnessOf(end);
  final beyond = [
    if (ramp != null)
      for (final step in IdsRamp.steps)
        if (darker
            ? _lightnessOf(ramp[step]) < endL
            : _lightnessOf(ramp[step]) > endL)
          ramp[step],
  ];
  beyond.sort(
    (a, b) => darker
        ? _lightnessOf(b).compareTo(_lightnessOf(a))
        : _lightnessOf(a).compareTo(_lightnessOf(b)),
  );
  return [end, ...beyond, absoluteEnd];
}

typedef TextOn = ({Color text, double lc, bool reaches});

typedef _Candidate = ({Color text, double lc});

_Candidate _highest(Iterable<_Candidate> candidates) =>
    candidates.reduce((best, next) => next.lc > best.lc ? next : best);

TextOn textOn(
  Color background,
  Backdrop backdrop,
  List<Color> scale,
  IdsMode mode, [
  IdsRamp? ramp,
]) {
  final darkEnd = stepOf(
    scale,
    mode == IdsMode.light ? ScaleStep.strongText : ScaleStep.base,
  );
  final lightEnd = stepOf(
    scale,
    mode == IdsMode.light ? ScaleStep.base : ScaleStep.strongText,
  );
  final directions = [
    for (final candidates in [
      _candidatesToward(darkEnd, darkText, ramp, true),
      _candidatesToward(lightEnd, lightText, ramp, false),
    ])
      [
        for (final text in candidates)
          (text: text, lc: _lowestContrastOver(text, background, backdrop)),
      ],
  ];

  final firstReaching = [
    for (final candidates in directions)
      ...candidates.where((candidate) => candidate.lc >= textLc).take(1),
  ];

  if (firstReaching.isNotEmpty) {
    final best = _highest(firstReaching);
    return (text: best.text, lc: best.lc, reaches: true);
  }
  final best = _highest(directions.expand((candidates) => candidates));
  return (text: best.text, lc: best.lc, reaches: false);
}

sealed class SurfaceRule {
  const SurfaceRule();
}

final class AtRampStep extends SurfaceRule {
  const AtRampStep(this.step);

  final int step;
}

final class AtNeutralLightness extends SurfaceRule {
  const AtNeutralLightness(this.step);

  final int step;
}

typedef ScaleRule = ({
  List<SurfaceRule> surfaces,
  List<int> strongBorder,
  List<List<int>> solid,
  List<int> outward,
});

const _solidStepsOutwardFrom600 = [
  [600],
  [500, 700],
  [400, 800],
];

const _lightOutward = IdsRamp.steps;

final _darkOutward = IdsRamp.steps.reversed.toList();

final scaleRules = <IdsMode, ScaleRule>{
  IdsMode.light: (
    surfaces: const [
      AtNeutralLightness(ScaleStep.base),
      AtNeutralLightness(ScaleStep.surface),
      AtNeutralLightness(ScaleStep.block),
      AtRampStep(100),
      AtRampStep(200),
    ],
    strongBorder: _lightOutward.sublist(_lightOutward.indexOf(300)),
    solid: _solidStepsOutwardFrom600,
    outward: _lightOutward,
  ),
  IdsMode.dark: (
    surfaces: const [
      AtNeutralLightness(ScaleStep.base),
      AtNeutralLightness(ScaleStep.surface),
      AtNeutralLightness(ScaleStep.block),
      AtNeutralLightness(ScaleStep.soft),
      AtNeutralLightness(ScaleStep.border),
    ],
    strongBorder: _darkOutward.sublist(_darkOutward.indexOf(900)),
    solid: _solidStepsOutwardFrom600,
    outward: _darkOutward,
  ),
};

List<Color> _rampFromThePage(IdsRamp ramp, IdsMode mode) => [
  for (final step in mode == IdsMode.light ? _lightOutward : _darkOutward)
    ramp[step],
];

Color _towardTheRampKeepingChroma(Color page, Color rampEnd, double lightness) {
  final pageL = _lightnessOf(page);
  if (lightness == pageL) return page;

  final end = oklchOf(rampEnd);
  final along = (lightness - pageL) / (end.l - pageL);
  return colorOf((l: lightness, c: end.c * math.sqrt(along), h: end.h));
}

Color onRampAtLightness(
  IdsRamp ramp,
  IdsMode mode,
  Color page,
  double lightness,
) {
  final points = _rampFromThePage(ramp, mode);
  final pageL = _lightnessOf(page);
  final firstL = _lightnessOf(points.first);

  if (lightness >= math.min(pageL, firstL) &&
      lightness <= math.max(pageL, firstL)) {
    return _towardTheRampKeepingChroma(page, points.first, lightness);
  }

  for (var index = 0; index < points.length - 1; index++) {
    final from = points[index];
    final to = points[index + 1];
    final fromL = _lightnessOf(from);
    final toL = _lightnessOf(to);
    if (lightness < math.min(fromL, toL) || lightness > math.max(fromL, toL)) {
      continue;
    }
    return toL == fromL
        ? from
        : mixOklab(from, to, (lightness - fromL) / (toL - fromL));
  }

  return points.last;
}

int _readableSolid(IdsRamp ramp, List<List<int>> stepsOutward) {
  for (final steps in stepsOutward) {
    ({int step, double lc})? best;
    for (final step in steps) {
      final lc = mostReadable([ramp[step]]).lc;
      if (best == null || lc > best.lc) best = (step: step, lc: lc);
    }
    if (best!.lc >= textLc) return best.step;
  }
  return 600;
}

int _firstStep(List<int> candidates, bool Function(int step) passes) =>
    candidates.firstWhere(passes, orElse: () => candidates.last);

List<int> _stepsBeyond(List<int> outward, int step) {
  final beyond = outward.sublist(outward.indexOf(step) + 1);
  return beyond.isNotEmpty ? beyond : [step];
}

List<Color> textBases(List<Color> neutral, Color soft) => [
  stepOf(neutral, ScaleStep.base),
  stepOf(neutral, ScaleStep.surface),
  stepOf(neutral, ScaleStep.block),
  soft,
];

List<Color> scaleFromRamp(IdsRamp ramp, IdsMode mode, List<Color> neutral) {
  final rule = scaleRules[mode]!;
  final page = stepOf(neutral, ScaleStep.base);
  final surfaces = [
    for (final surface in rule.surfaces)
      switch (surface) {
        AtRampStep(:final step) => ramp[step],
        AtNeutralLightness(:final step) => onRampAtLightness(
          ramp,
          mode,
          page,
          _lightnessOf(stepOf(neutral, step)),
        ),
      },
  ];
  final bases = textBases(neutral, surfaces[ScaleStep.soft - 1]);
  final solidStep = _readableSolid(ramp, rule.solid);
  final solid = ramp[solidStep];
  final strongBorder = _firstStep(
    rule.strongBorder,
    (step) => reaches(ramp[step], bases, markLc),
  );
  final fromTheSolid = rule.outward.sublist(rule.outward.indexOf(solidStep));
  final text = _firstStep(
    fromTheSolid,
    (step) => readsOn(ramp[step], bases, solid, accentTextLc),
  );
  final strongText = _firstStep(
    _stepsBeyond(fromTheSolid, text),
    (step) => readsOn(ramp[step], bases, solid),
  );

  return [...surfaces, ramp[strongBorder], solid, ramp[text], ramp[strongText]];
}

IdsPalette paletteFromRamp(IdsRamp ramp, [IdsPalette? neutral]) {
  final scales = neutral ?? idsNeutralPalette;
  return IdsPalette(
    light: scaleFromRamp(ramp, IdsMode.light, scales.light),
    dark: scaleFromRamp(ramp, IdsMode.dark, scales.dark),
  );
}

IdsPalette paletteFromSeed(Color seed) =>
    paletteFromRamp(IdsRamp.fromSeed(eightBitOpaque(seed)));
