import 'dart:math' as math;
import 'dart:ui' show ColorSpace;

import 'package:flutter/painting.dart';

import '../../theme/ids_palette.dart';
import '../../tokens/ids_color_roles.dart';
import '../../tokens/ids_enums.dart';
import 'contrast.dart';
import 'oklch.dart';

abstract final class ScaleStep {
  static const page = 1;
  static const band = 2;
  static const soft = 3;
  static const line = 4;
  static const handle = 5;
  static const text = 6;
  static const fill = 7;
  static const strongText = 8;
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
  List<List<int>> fill,
  List<int> text,
  List<int> strongText,
});

const _fillStepsOutwardFrom600 = [
  [600],
  [500, 700],
  [400, 800],
];

const _sameLightnessAsTheNeutral = <SurfaceRule>[
  AtNeutralLightness(ScaleStep.page),
  AtNeutralLightness(ScaleStep.band),
  AtNeutralLightness(ScaleStep.soft),
  AtNeutralLightness(ScaleStep.line),
  AtNeutralLightness(ScaleStep.handle),
];

const scaleRules = <IdsMode, ScaleRule>{
  IdsMode.light: (
    surfaces: [
      AtNeutralLightness(ScaleStep.page),
      AtRampStep(50),
      AtRampStep(100),
      AtRampStep(200),
      AtRampStep(300),
    ],
    fill: _fillStepsOutwardFrom600,
    text: [600, 700, 800, 900, 950],
    strongText: [700, 800, 900, 950],
  ),
  IdsMode.dark: (
    surfaces: _sameLightnessAsTheNeutral,
    fill: _fillStepsOutwardFrom600,
    text: [500, 400, 300, 200, 100, 50],
    strongText: [400, 300, 200, 100, 50],
  ),
};

List<Color> _rampFromThePage(IdsRamp ramp, IdsMode mode, Color page) => [
  page,
  for (final step
      in mode == IdsMode.light ? IdsRamp.steps : IdsRamp.steps.reversed)
    ramp[step],
];

Color onRampAtLightness(
  IdsRamp ramp,
  IdsMode mode,
  Color page,
  double lightness,
) {
  final points = _rampFromThePage(ramp, mode, page);

  for (var index = 0; index < points.length - 1; index++) {
    final from = points[index];
    final to = points[index + 1];
    final fromL = oklchOf(from).l;
    final toL = oklchOf(to).l;
    if (lightness < math.min(fromL, toL) || lightness > math.max(fromL, toL)) {
      continue;
    }
    return toL == fromL
        ? from
        : mixOklab(from, to, (lightness - fromL) / (toL - fromL));
  }

  return points.last;
}

Color _readableFill(IdsRamp ramp, List<List<int>> stepsOutward) {
  for (final steps in stepsOutward) {
    final best = mostReadable([for (final step in steps) ramp[step]]);
    if (best.lc >= textLc) return best.fill;
  }
  return mostReadable([ramp[600]]).fill;
}

Color _firstReadableOn(
  IdsRamp ramp,
  List<int> candidates,
  List<Color> bases,
  Color fill, [
  double lc = textLc,
]) {
  for (final step in candidates) {
    if (readsOn(ramp[step], bases, fill, lc)) return ramp[step];
  }
  return ramp[candidates.last];
}

List<Color> scaleFromRamp(IdsRamp ramp, IdsMode mode, List<Color> neutral) {
  final rule = scaleRules[mode]!;
  final page = stepOf(neutral, ScaleStep.page);
  final surfaces = [
    for (final surface in rule.surfaces)
      switch (surface) {
        AtRampStep(:final step) => ramp[step],
        AtNeutralLightness(:final step) => onRampAtLightness(
          ramp,
          mode,
          page,
          oklchOf(stepOf(neutral, step)).l,
        ),
      },
  ];
  final band = surfaces[ScaleStep.band - 1];
  final soft = surfaces[ScaleStep.soft - 1];
  final fill = _readableFill(ramp, rule.fill);
  final text = _firstReadableOn(
    ramp,
    rule.text,
    [page, band, soft],
    fill,
    accentTextLc,
  );
  final strongText = _firstReadableOn(ramp, rule.strongText, [
    band,
    soft,
  ], fill);

  return [...surfaces, text, fill, strongText];
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
