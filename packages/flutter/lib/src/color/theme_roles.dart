import 'package:flutter/painting.dart';

import '../../theme/ids_palette.dart';
import '../../theme/ids_theme.dart';
import '../../tokens/ids_color_roles.dart';
import '../../tokens/ids_enums.dart';
import 'contrast.dart';
import 'derived_brands.dart';
import 'oklch.dart';
import 'palette_scales.dart';
import 'palette_seed.dart';
import 'status.dart';

const modes = [IdsMode.light, IdsMode.dark];

const tintedNeutralChroma = 0.02;

typedef Roles = Map<String, Color>;

class ResolvedColors {
  const ResolvedColors({
    required this.ramps,
    required this.palettes,
    required this.neutral,
    required this.given,
    required this.roles,
  });

  final Map<String, IdsRamp> ramps;
  final Map<String, IdsPalette> palettes;
  final IdsPalette neutral;
  final List<String> given;
  final Map<IdsMode, Roles> roles;
}

typedef FamilyColors = ({IdsRamp ramp, IdsPalette? palette});

typedef ParsedColors = ({FamilyColors? colors, List<IdsThemeIssue> issues});

ParsedColors parseThemeColor(
  IdsThemeColor? value,
  String path,
) => switch (value) {
  IdsSeedColor(:final color) => (
    colors: (ramp: IdsRamp.fromSeed(eightBitOpaque(color)), palette: null),
    issues: const [],
  ),
  IdsRamp(:final colors) when colors.length != IdsRamp.steps.length => (
    colors: null,
    issues: [
      IdsThemeIssue(
        path,
        'The palette needs one color for each step from 50 to 950. Got ${colors.length}.',
      ),
    ],
  ),
  IdsRamp(:final colors) => (
    colors: (
      ramp: IdsRamp([for (final color in colors) eightBitOpaque(color)]),
      palette: null,
    ),
    issues: const [],
  ),
  IdsPalette(:final light, :final dark) => _parsePalette(light, dark, path),
  null => (
    colors: null,
    issues: [
      IdsThemeIssue(
        path,
        'The theme needs $path: IdsThemeColor.seed, an IdsRamp of steps 50 to 950, or an IdsPalette of light and dark scales of ${IdsPalette.steps.length} colors.',
      ),
    ],
  ),
};

ParsedColors _parsePalette(List<Color> light, List<Color> dark, String path) {
  final issues = [
    for (final (mode, scale) in [('light', light), ('dark', dark)])
      if (scale.length != IdsPalette.steps.length)
        IdsThemeIssue(
          '$path.$mode',
          '$path.$mode takes ${IdsPalette.steps.length} colors, steps 1 to ${IdsPalette.steps.length}.',
        ),
  ];
  if (issues.isNotEmpty) return (colors: null, issues: issues);

  final palette = IdsPalette(
    light: [for (final color in light) eightBitOpaque(color)],
    dark: [for (final color in dark) eightBitOpaque(color)],
  );
  return (
    colors: (
      ramp: IdsRamp.fromSeed(stepOf(palette.light, ScaleStep.solid)),
      palette: palette,
    ),
    issues: const [],
  );
}

Color _textOnRole(
  String role,
  Color background,
  Backdrop backdrop,
  List<Color> scale,
  IdsMode mode,
  IdsRamp? ramp,
  String path,
  List<IdsThemeIssue> issues,
) {
  final on = textOn(background, backdrop, scale, mode, ramp);
  if (!on.reaches) {
    issues.add(
      IdsThemeIssue(
        path,
        '${mode.name}: no color of the scale, its ramp, white or neutral 950 reaches Lc ${textLc.round()} as $role, under the hover and press layers too.',
      ),
    );
  }
  return on.text;
}

({Roles roles, List<IdsThemeIssue> issues}) familyRoles(
  String family,
  List<Color> scale,
  IdsMode mode,
  List<Color> neutral, [
  IdsRamp? ramp,
  String? path,
]) {
  final at = path ?? family;
  final issues = <IdsThemeIssue>[];
  final soft = stepOf(scale, ScaleStep.soft);
  final solid = stepOf(scale, ScaleStep.solid);
  final strongBorder = stepOf(scale, ScaleStep.strongBorder);
  final text = stepOf(scale, ScaleStep.text);
  final strongText = stepOf(scale, ScaleStep.strongText);
  final bases = textBases(neutral, soft);
  final surfaces = 'base, surface, block and $family-soft';

  if (!reaches(strongBorder, bases, markLc)) {
    issues.add(
      IdsThemeIssue(
        at,
        '${mode.name}: border-$family-strong (step ${ScaleStep.strongBorder}) does not reach Lc ${markLc.round()} on $surfaces.',
      ),
    );
  }

  if (!readsOn(text, bases, solid, accentTextLc)) {
    issues.add(
      IdsThemeIssue(
        at,
        '${mode.name}: text-$family (step ${ScaleStep.text}) does not reach Lc ${accentTextLc.round()} on $surfaces, under their hover and press layers too.',
      ),
    );
  }

  if (!readsOn(strongText, bases, solid)) {
    issues.add(
      IdsThemeIssue(
        at,
        '${mode.name}: text-$family-strong (step ${ScaleStep.strongText}) does not reach Lc ${textLc.round()} on $surfaces, under their hover and press layers too.',
      ),
    );
  }

  return (
    roles: {
      'bg-$family-soft': soft,
      'bg-$family-solid': solid,
      'border-$family': stepOf(scale, ScaleStep.border),
      'border-$family-strong': strongBorder,
      'text-$family': text,
      'text-$family-strong': strongText,
      'text-on-$family-soft': _textOnRole(
        'text-on-$family-soft',
        soft,
        TintedBackdrop(solid),
        scale,
        mode,
        ramp,
        at,
        issues,
      ),
      'text-on-$family-solid': _textOnRole(
        'text-on-$family-solid',
        solid,
        const SolidBackdrop(),
        scale,
        mode,
        ramp,
        at,
        issues,
      ),
    },
    issues: issues,
  );
}

double _bell(double lightness) => 4 * lightness * (1 - lightness);

Color _tinted(double lightness, double hue) =>
    colorOf((l: lightness, c: tintedNeutralChroma * _bell(lightness), h: hue));

List<Color> _tintedScale(List<Color> scale, double hue) => [
  for (final pure in scale) _tinted(oklchOf(pure).l, hue),
];

IdsPalette neutralPalette(IdsNeutral kind, IdsRamp primary) {
  if (kind != IdsNeutral.tinted) return idsNeutralPalette;

  final hue = hueOf(primary.colors);
  return IdsPalette(
    light: _tintedScale(idsNeutralPalette.light, hue),
    dark: _tintedScale(idsNeutralPalette.dark, hue),
  );
}

const _neutralTextOn = <(String, String, Backdrop)>[
  ('text-on-base', 'bg-base', NeutralBackdrop()),
  ('text-on-surface', 'bg-surface', NeutralBackdrop()),
  ('text-on-block', 'bg-block', NeutralBackdrop()),
  ('text-on-neutral-soft', 'bg-neutral-soft', NeutralBackdrop()),
  ('text-on-neutral-solid', 'bg-neutral-solid', SolidBackdrop()),
];

Roles neutralRoles(
  List<Color> neutral,
  IdsMode mode, [
  List<IdsThemeIssue>? issues,
]) {
  final roles = <String, Color>{
    for (final MapEntry(key: slot, value: step)
        in IdsColorRoles.neutralSteps.entries)
      slot: neutral[step - 1],
  };

  for (final (role, background, backdrop) in _neutralTextOn) {
    roles[role] = _textOnRole(
      role,
      roles[background]!,
      backdrop,
      neutral,
      mode,
      null,
      'neutral',
      issues ?? [],
    );
  }

  return roles;
}

bool _isStatus(String family) => IdsColorRoles.statusFamilies.contains(family);

ParsedColors _statusColors(
  String family,
  IdsStatus? status,
  StatusPalettes Function() harmonized,
) {
  if (status == IdsStatus.fixed) {
    return (
      colors: (ramp: fixedStatusPalette(family), palette: null),
      issues: const [],
    );
  }
  if (status is IdsStatusColors && status[family] != null) {
    return parseThemeColor(status[family], 'status.$family');
  }
  return (
    colors: (ramp: harmonized()[family]!, palette: null),
    issues: const [],
  );
}

typedef ColorResolution = ({
  ResolvedColors? colors,
  List<IdsThemeIssue> issues,
});

ColorResolution resolveColors(IdsThemeOverrides theme) {
  final issues = <IdsThemeIssue>[];

  final primary = parseThemeColor(theme.primary, 'primary');
  issues.addAll(primary.issues);
  final primaryColors = primary.colors;
  if (primaryColors == null) return (colors: null, issues: issues);
  final primaryRamp = primaryColors.ramp;

  final families = <String, FamilyColors>{'primary': primaryColors};
  final given = <String>['primary'];

  for (final family in IdsColorRoles.brandFamilies) {
    if (family == 'primary' || theme.brand(family) == null) continue;
    final parsed = parseThemeColor(theme.brand(family), family);
    issues.addAll(parsed.issues);
    if (parsed.colors == null) continue;
    families[family] = parsed.colors!;
    given.add(family);
  }

  StatusPalettes? harmonized;
  StatusPalettes harmonizedOnce() =>
      harmonized ??= harmonizedStatusPalettes(primaryRamp);

  for (final family in IdsColorRoles.statusFamilies) {
    final parsed = _statusColors(family, theme.status, harmonizedOnce);
    issues.addAll(parsed.issues);
    families[family] =
        parsed.colors ?? (ramp: fixedStatusPalette(family), palette: null);
  }

  families['secondary'] ??= (
    ramp: derivedSecondary(primaryRamp),
    palette: null,
  );
  families['tertiary'] ??= (
    ramp: derivedTertiary(primaryRamp, [
      for (final colors in families.values) colors.ramp,
    ]),
    palette: null,
  );

  final neutral = neutralPalette(theme.neutral ?? IdsNeutral.pure, primaryRamp);

  final coloredFamilies = [
    for (final family in IdsColorRoles.families)
      if (family != 'neutral') family,
  ];
  final ramps = {
    for (final family in coloredFamilies) family: families[family]!.ramp,
  };
  final palettes = {
    for (final family in coloredFamilies)
      family:
          families[family]!.palette ??
          paletteFromRamp(families[family]!.ramp, neutral),
  };

  Roles rolesIn(IdsMode mode) {
    final roles = neutralRoles(neutral[mode], mode, issues);

    for (final family in coloredFamilies) {
      final resolved = familyRoles(
        family,
        palettes[family]![mode],
        mode,
        neutral[mode],
        ramps[family],
        _isStatus(family) ? 'status.$family' : family,
      );
      issues.addAll(resolved.issues);
      roles.addAll(resolved.roles);
    }

    return roles;
  }

  return (
    colors: ResolvedColors(
      ramps: ramps,
      palettes: palettes,
      neutral: neutral,
      given: given,
      roles: {for (final mode in modes) mode: rolesIn(mode)},
    ),
    issues: issues,
  );
}
