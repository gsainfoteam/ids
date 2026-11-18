import 'dart:ui' show ColorSpace;

import 'package:flutter/painting.dart';

import '../../theme/ids_palette.dart';
import '../../theme/ids_theme.dart';
import '../../tokens/ids_color_roles.dart';
import '../../tokens/ids_enums.dart';
import 'contrast.dart';
import 'derived_brands.dart';
import 'oklch.dart';
import 'palette_seed.dart';
import 'status.dart';

const modes = [IdsMode.light, IdsMode.dark];

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

const tintedNeutralChroma = 0.02;

const _fillStepsOutwardFrom600 = [
  [600],
  [500, 700],
  [400, 800],
];

typedef ModeRule = ({
  List<List<int>> fill,
  int subtler,
  double subtlerTowardSurface,
  int subtle,
  List<int> onSubtle,
  List<int> text,
});

const roleRules = <IdsMode, ModeRule>{
  IdsMode.light: (
    fill: _fillStepsOutwardFrom600,
    subtler: 50,
    subtlerTowardSurface: 0,
    subtle: 100,
    onSubtle: [700, 800, 900, 950],
    text: [600, 700, 800, 900, 950],
  ),
  IdsMode.dark: (
    fill: _fillStepsOutwardFrom600,
    subtler: 950,
    subtlerTowardSurface: 0.5,
    subtle: 950,
    onSubtle: [400, 300, 200, 100, 50],
    text: [500, 400, 300, 200, 100, 50],
  ),
};

typedef Roles = Map<String, Color>;

class ResolvedColors {
  const ResolvedColors({
    required this.palettes,
    required this.neutral,
    required this.given,
    required this.roles,
  });

  final Map<String, IdsPalette> palettes;
  final Map<int, Color> neutral;
  final List<String> given;
  final Map<IdsMode, Roles> roles;
}

typedef ParsedPalette = ({IdsPalette? shades, List<IdsThemeIssue> issues});

Color _eightBitOpaque(Color color) {
  final srgb = color.withValues(colorSpace: ColorSpace.sRGB);
  int channel(double value) => (value.clamp(0.0, 1.0) * 255).round();
  return Color.fromARGB(255, channel(srgb.r), channel(srgb.g), channel(srgb.b));
}

ParsedPalette parsePalette(
  IdsThemeColor? value,
  String path,
) => switch (value) {
  IdsSeedColor(:final color) => (
    shades: IdsPalette.fromSeed(_eightBitOpaque(color)),
    issues: const [],
  ),
  IdsPalette(:final colors) when colors.length != IdsPalette.steps.length => (
    shades: null,
    issues: [
      IdsThemeIssue(
        path,
        'The palette needs one color for each step from 50 to 950. Got ${colors.length}.',
      ),
    ],
  ),
  IdsPalette(:final colors) => (
    shades: IdsPalette([for (final color in colors) _eightBitOpaque(color)]),
    issues: const [],
  ),
  null => (
    shades: null,
    issues: [
      IdsThemeIssue(
        path,
        'The theme needs $path: an IdsPalette of steps 50 to 950, or IdsThemeColor.seed to build one from.',
      ),
    ],
  ),
};

double _towardLikeCulori(double from, double to, double amount) =>
    from + amount * (to - from);

Color withStateLayer(Color base, Color layer, double opacity) {
  final from = base.withValues(colorSpace: ColorSpace.sRGB);
  final to = layer.withValues(colorSpace: ColorSpace.sRGB);
  return _eightBitOpaque(
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

Color? _firstReadableOn(
  IdsPalette shades,
  List<int> candidates,
  List<Color> bases,
  Color familyFill, [
  double lc = textLc,
]) {
  for (final step in candidates) {
    final candidate = shades[step];
    final states = [
      for (final base in bases)
        ...underStateLayers(base, [
          contentLayer(candidate),
          tintLayer(familyFill),
        ]),
    ];
    if (reaches(candidate, states, lc)) return candidate;
  }
  return null;
}

double _lowestContrastUnderStateLayers(Color text, Color fill) => [
  for (final state in underStateLayers(fill, [fillLayer]))
    lightnessContrast(text, state),
].reduce((a, b) => a < b ? a : b);

typedef _Readable = ({Color fill, Color text, double lc});

_Readable _mostReadable(List<Color> fills) {
  _Readable? best;
  for (final fill in fills) {
    for (final text in const [lightText, darkText]) {
      final lc = _lowestContrastUnderStateLayers(text, fill);
      if (best == null || lc > best.lc) best = (fill: fill, text: text, lc: lc);
    }
  }
  return best!;
}

_Readable? _readableFill(IdsPalette shades, List<List<int>> stepsOutward) {
  for (final steps in stepsOutward) {
    final best = _mostReadable([for (final step in steps) shades[step]]);
    if (best.lc >= textLc) return best;
  }
  return null;
}

String _stepsText(Iterable<int> steps) => steps.join(', ');

Color _subtlerOf(IdsPalette shades, ModeRule rule, Color surface) =>
    rule.subtlerTowardSurface == 0
    ? shades[rule.subtler]
    : mixOklab(shades[rule.subtler], surface, rule.subtlerTowardSurface);

({Roles roles, List<IdsThemeIssue> issues}) familyRoles(
  String family,
  IdsPalette shades,
  IdsMode mode,
  Color surface, [
  String? path,
]) {
  final at = path ?? family;
  final rule = roleRules[mode]!;
  final issues = <IdsThemeIssue>[];
  final subtler = _subtlerOf(shades, rule, surface);
  final subtle = shades[rule.subtle];

  final readable = _readableFill(shades, rule.fill);
  if (readable == null) {
    issues.add(
      IdsThemeIssue(
        at,
        '${mode.name}: neither white nor neutral 950 reaches Lc ${textLc.round()} on $family steps ${_stepsText(rule.fill.expand((steps) => steps))} and under their hover and press layers.',
      ),
    );
  }
  final chosen = readable ?? _mostReadable([shades[600]]);

  final onSubtler = _firstReadableOn(shades, rule.onSubtle, [
    subtler,
  ], chosen.fill);
  if (onSubtler == null) {
    issues.add(
      IdsThemeIssue(
        at,
        '${mode.name}: no step of ${_stepsText(rule.onSubtle)} reaches Lc ${textLc.round()} on $family-subtler and under its hover and press layers.',
      ),
    );
  }

  final onSubtle = _firstReadableOn(shades, rule.onSubtle, [
    subtle,
  ], chosen.fill);
  if (onSubtle == null) {
    issues.add(
      IdsThemeIssue(
        at,
        '${mode.name}: no step of ${_stepsText(rule.onSubtle)} reaches Lc ${textLc.round()} on $family-subtle (step ${rule.subtle}) and under its hover and press layers.',
      ),
    );
  }

  final text = _firstReadableOn(
    shades,
    rule.text,
    [surface, subtler, subtle],
    chosen.fill,
    accentTextLc,
  );
  if (text == null) {
    issues.add(
      IdsThemeIssue(
        at,
        '${mode.name}: no step of ${_stepsText(rule.text)} reaches Lc ${accentTextLc.round()} as $family text on the surface, $family-subtler and $family-subtle, under their hover and press layers too.',
      ),
    );
  }

  final accent = text ?? shades[rule.text.last];
  final lastOnSubtle = shades[rule.onSubtle.last];
  return (
    roles: {
      'bg-$family-subtler': subtler,
      'bg-$family-subtle': subtle,
      'bg-$family': chosen.fill,
      'text-on-$family-subtler': onSubtler ?? lastOnSubtle,
      'text-on-$family-subtle': onSubtle ?? lastOnSubtle,
      'text-on-$family': chosen.text,
      'text-$family': accent,
      'border-$family': accent,
    },
    issues: issues,
  );
}

double _bell(double lightness) => 4 * lightness * (1 - lightness);

Map<int, Color> neutralPalette(IdsNeutral kind, IdsPalette primary) {
  if (kind != IdsNeutral.tinted) return IdsColorRoles.neutralPalette;

  final hue = hueOf(primary.colors);
  return {
    for (final MapEntry(key: step, value: pure)
        in IdsColorRoles.neutralPalette.entries)
      step: _tinted(oklchOf(pure).l, hue),
  };
}

Color _tinted(double lightness, double hue) =>
    colorOf((l: lightness, c: tintedNeutralChroma * _bell(lightness), h: hue));

Roles neutralRoles(Map<int, Color> neutral, IdsMode mode) => {
  for (final MapEntry(key: slot, value: step)
      in IdsColorRoles.neutralSteps[mode]!.entries)
    slot: neutral[step]!,
};

bool _isStatus(String family) => IdsColorRoles.statusFamilies.contains(family);

ParsedPalette _statusPalette(
  String family,
  IdsStatus? status,
  StatusPalettes Function() harmonized,
) {
  if (status == IdsStatus.fixed) {
    return (shades: fixedStatusPalette(family), issues: const []);
  }
  if (status is IdsStatusColors && status[family] != null) {
    return parsePalette(status[family], 'status.$family');
  }
  return (shades: harmonized()[family], issues: const []);
}

typedef ColorResolution = ({
  ResolvedColors? colors,
  List<IdsThemeIssue> issues,
});

ColorResolution resolveColors(IdsThemeOverrides theme) {
  final issues = <IdsThemeIssue>[];

  final primary = parsePalette(theme.primary, 'primary');
  issues.addAll(primary.issues);
  final primaryShades = primary.shades;
  if (primaryShades == null) return (colors: null, issues: issues);

  final palettes = <String, IdsPalette>{'primary': primaryShades};
  final given = <String>['primary'];

  for (final family in IdsColorRoles.brandFamilies) {
    if (family == 'primary' || theme.brand(family) == null) continue;
    final parsed = parsePalette(theme.brand(family), family);
    issues.addAll(parsed.issues);
    if (parsed.shades == null) continue;
    palettes[family] = parsed.shades!;
    given.add(family);
  }

  StatusPalettes? harmonized;
  StatusPalettes harmonizedOnce() =>
      harmonized ??= harmonizedStatusPalettes(primaryShades);

  for (final family in IdsColorRoles.statusFamilies) {
    final parsed = _statusPalette(family, theme.status, harmonizedOnce);
    issues.addAll(parsed.issues);
    palettes[family] = parsed.shades ?? fixedStatusPalette(family);
  }

  palettes['secondary'] ??= derivedSecondary(primaryShades);
  palettes['tertiary'] ??= derivedTertiary(primaryShades, palettes.values);

  final neutral = neutralPalette(
    theme.neutral ?? IdsNeutral.pure,
    primaryShades,
  );

  Roles rolesIn(IdsMode mode) {
    final roles = neutralRoles(neutral, mode);
    final surface = roles['bg-neutral-subtlest']!;

    for (final family in IdsColorRoles.families) {
      if (family == 'neutral') continue;
      final resolved = familyRoles(
        family,
        palettes[family]!,
        mode,
        surface,
        _isStatus(family) ? 'status.$family' : family,
      );
      issues.addAll(resolved.issues);
      roles.addAll(resolved.roles);
    }

    return roles;
  }

  return (
    colors: ResolvedColors(
      palettes: palettes,
      neutral: neutral,
      given: given,
      roles: {for (final mode in modes) mode: rolesIn(mode)},
    ),
    issues: issues,
  );
}
