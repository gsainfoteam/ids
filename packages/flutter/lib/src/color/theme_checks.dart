import '../../theme/ids_theme.dart';
import '../../tokens/ids_color_roles.dart';
import 'color_distance.dart';
import 'contrast.dart';
import 'palette_seed.dart';
import 'status.dart';
import 'theme_roles.dart';

String _pathOf(String family) =>
    IdsColorRoles.statusFamilies.contains(family) ? 'status.$family' : family;

String _rounded(double value) => value.toStringAsFixed(3);

List<IdsThemeIssue> checkColorDistinction(ResolvedColors colors) {
  final issues = <IdsThemeIssue>[];
  final palettes = colors.ramps;
  fill(String family) => palettes[family]![comparedStep];
  final brands = [
    for (final family in IdsColorRoles.brandFamilies)
      if (colors.given.contains(family)) family,
  ];

  void checkApart(String first, String second) {
    final distance = distanceBetween(fill(first), fill(second));
    if (distance < distinctFamilies) {
      issues.add(
        IdsThemeIssue(
          _pathOf(second),
          '$second is too close to $first to tell apart (OKLab ${_rounded(distance)}, below $distinctFamilies).',
        ),
      );
    }
  }

  for (var index = 0; index < brands.length; index++) {
    for (final other in brands.skip(index + 1)) {
      checkApart(brands[index], other);
    }
  }

  for (final brand in brands) {
    for (final status in IdsColorRoles.statusFamilies) {
      checkApart(status, brand);
    }
  }

  for (final status in IdsColorRoles.statusFamilies) {
    final hue = hueOf(palettes[status]!.colors);
    if (!readsAs(status, hue)) {
      final hues = statusHues[status]!;
      issues.add(
        IdsThemeIssue(
          'status.$status',
          '$status has the hue ${hue.round()}°, which no longer reads as $status. Keep it from ${hues.from.round()}° to ${hues.to.round()}°.',
        ),
      );
    }
  }

  for (final (status, other) in redGreenPairs) {
    final distance = distanceUnderRedGreenCvd(fill(status), fill(other));
    if (distance < distinctUnderRedGreenCvd) {
      issues.add(
        IdsThemeIssue(
          'status.$status',
          '$status and $other look alike to red-green color blindness (OKLab ${_rounded(distance)}, below $distinctUnderRedGreenCvd).',
        ),
      );
    }
  }

  return issues;
}
