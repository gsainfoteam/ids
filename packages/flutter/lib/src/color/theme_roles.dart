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

const fillStates = [0.1, 0.2];

const softTints = [0.06, 0.12];

const tintedNeutralChroma = 0.02;

const _fillStepsOutwardFrom600 = [
  [600],
  [500, 700],
  [400, 800],
];

typedef ModeRule = ({
  List<List<int>> fill,
  int soft,
  List<int> onSoft,
  List<int> text,
});

const roleRules = <IdsMode, ModeRule>{
  IdsMode.light: (
    fill: _fillStepsOutwardFrom600,
    soft: 100,
    onSoft: [700, 800, 900, 950],
    text: [600, 700, 800, 900, 950],
  ),
  IdsMode.dark: (
    fill: _fillStepsOutwardFrom600,
    soft: 950,
    onSoft: [400, 300, 200, 100, 50],
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

Color _awayFromText(Color text) =>
    oklchOf(text).l > 0.5 ? const Color(0xFF000000) : const Color(0xFFFFFFFF);

List<Color> fillStatesOf(Color fill, Color onFill) => [
  for (final amount in fillStates)
    mixOklab(fill, _awayFromText(onFill), amount),
];

List<Color> softTintsOf(Color soft, Color fill) => [
  for (final amount in softTints) mixOklab(soft, fill, amount),
];

Color? _firstReaching(
  IdsPalette shades,
  List<int> candidates,
  List<Color> backgrounds, [
  double lc = textLc,
]) {
  for (final step in candidates) {
    if (reaches(shades[step], backgrounds, lc)) return shades[step];
  }
  return null;
}

typedef _Readable = ({Color fill, Color text, double lc});

_Readable _mostReadable(List<Color> fills) {
  _Readable? best;
  for (final fill in fills) {
    for (final text in const [lightText, darkText]) {
      final lc = lightnessContrast(text, fill);
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
  final soft = shades[rule.soft];

  final readable = _readableFill(shades, rule.fill);
  if (readable == null) {
    issues.add(
      IdsThemeIssue(
        at,
        '${mode.name}: neither white nor neutral 950 reaches Lc ${textLc.round()} on $family steps ${_stepsText(rule.fill.expand((steps) => steps))}.',
      ),
    );
  }
  final chosen = readable ?? _mostReadable([shades[600]]);
  final fill = chosen.fill;
  final onFill = chosen.text;

  final fillHoverActive = fillStatesOf(fill, onFill);
  final softHoverActive = softTintsOf(soft, fill);

  final onSoft = _firstReaching(shades, rule.onSoft, [
    soft,
    ...softHoverActive,
  ]);
  if (onSoft == null) {
    issues.add(
      IdsThemeIssue(
        at,
        '${mode.name}: no step of ${_stepsText(rule.onSoft)} reaches Lc ${textLc.round()} on $family-soft (step ${rule.soft}) and its hover and press tints.',
      ),
    );
  }

  final text = _firstReaching(shades, rule.text, [surface, soft], accentTextLc);
  if (text == null) {
    issues.add(
      IdsThemeIssue(
        at,
        '${mode.name}: no step of ${_stepsText(rule.text)} reaches Lc ${accentTextLc.round()} as $family text on the surface and on $family-soft.',
      ),
    );
  }

  final slots = IdsColorRoles.slotsOf(family);
  final lastText = shades[rule.text.last];
  return (
    roles: {
      slots[0]: fill,
      slots[1]: fillHoverActive[0],
      slots[2]: fillHoverActive[1],
      slots[3]: soft,
      slots[4]: softHoverActive[0],
      slots[5]: softHoverActive[1],
      slots[6]: onFill,
      slots[7]: onSoft ?? shades[rule.onSoft.last],
      slots[8]: text ?? lastText,
      slots[9]: text ?? lastText,
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
    final surface = roles['surface']!;

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
