import 'dart:convert';
import 'dart:io';
import 'dart:ui' show Brightness;

import 'package:flutter/painting.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/theme/ids_palette.dart';
import 'package:ids_flutter/theme/ids_theme_data.dart';
import 'package:ids_flutter/theme/palette_contrast.dart';

Color color(String hex) =>
    Color(int.parse(hex.substring(1), radix: 16) | 0xff000000);

IdsPalette paletteFrom(Map<String, dynamic> shades) => IdsPalette(
  shade50: color(shades['50']),
  shade100: color(shades['100']),
  shade200: color(shades['200']),
  shade300: color(shades['300']),
  shade400: color(shades['400']),
  shade500: color(shades['500']),
  shade600: color(shades['600']),
  shade700: color(shades['700']),
  shade800: color(shades['800']),
  shade900: color(shades['900']),
  shade950: color(shades['950']),
);

void main() {
  final fixtures =
      jsonDecode(
            File(
              '../core/tests/fixtures/runtime-themes.json',
            ).readAsStringSync(),
          )
          as List;
  for (final fixture in fixtures) {
    final palette = paletteFrom(fixture['shades']);
    test(
      '${fixture['name']} reproduces the historical roles in both modes',
      () {
        expect(palette.check(), isEmpty);
        for (final mode in Brightness.values) {
          final expected = fixture['modes'][mode.name];
          final roles = palette.resolve(mode);
          final actual = {
            'primary': roles.primary,
            'on-primary': roles.onPrimary,
            'secondary': roles.secondary,
            'on-secondary': roles.onSecondary,
            'accent': roles.accent,
            'outline': roles.outline,
          };
          for (final entry in actual.entries) {
            expect(
              entry.value,
              color(expected['roles'][entry.key]),
              reason: '${mode.name} ${entry.key}',
            );
          }
          for (var i = 0; i < 2; i++) {
            final tint = mixOklab(
              roles.secondary,
              roles.primary,
              [.06, .12][i],
            );
            final channels = [tint.r, tint.g, tint.b];
            for (var channel = 0; channel < 3; channel++) {
              expect(
                channels[channel],
                closeTo(expected['tints'][i][channel], .000001),
              );
            }
            expect(
              paletteContrast(roles.onSecondary, tint),
              greaterThanOrEqualTo(4.5),
            );
          }
        }
      },
    );
  }

  test('invalid palette reports roles and rejects resolution', () {
    final palette = paletteFrom({
      for (final shade in [
        '50',
        '100',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '800',
        '900',
        '950',
      ])
        shade: '#888888',
    });
    expect(palette.check(), isNotEmpty);
    expect(() => palette.resolve(Brightness.light), throwsArgumentError);
  });

  test('theme validates radius and fonts without inventing scale policy', () {
    expect(const IdsThemeData().check(), isEmpty);
    expect(const IdsThemeData(radius: -1).check(), isNotEmpty);
    expect(const IdsThemeData(radius: double.nan).check(), isNotEmpty);
    expect(const IdsThemeData(fontFamily: '').check(), isNotEmpty);
    const theme = IdsThemeData(
      radius: 12,
      fontFamily: 'App Sans',
      cornerShape: IdsCornerShape.squircle,
    );
    expect(theme.radius.standard, 12);
    expect(theme.radius.indicator, closeTo(4.8, .00001));
    expect(theme.radius.container, closeTo(19.2, .00001));
    expect(theme.dimension(36), 36);
    expect(theme.shape(), isA<ContinuousRectangleBorder>());
    expect(const IdsThemeData().shape(), isA<RoundedRectangleBorder>());
    expect(
      theme.textStyle(const TextStyle(fontFamily: 'Old')).fontFamily,
      'App Sans',
    );
  });
}
