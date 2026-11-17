import 'dart:convert';
import 'dart:io';
import 'dart:ui' show ColorSpace;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';
import 'package:ids_flutter/src/color/theme_roles.dart';

import 'test_theme.dart';

Color _color(String hex) =>
    Color(int.parse(hex.substring(1), radix: 16) | 0xFF000000);

final _palettes = {
  for (final theme
      in ((jsonDecode(
                    File(
                      '../core/tests/fixtures/theme-roles.json',
                    ).readAsStringSync(),
                  )
                  as Map<String, dynamic>)['themes']
              as List)
          .cast<Map<String, dynamic>>())
    theme['primary'] as String: IdsPalette.fromSeed(
      _color(theme['seed'] as String),
    ),
};

void main() {
  for (final MapEntry(key: hue, value: palette) in _palettes.entries) {
    test('$hue passes every role rule', () {
      expect(resolveColors(IdsTheme(primary: palette)).issues, isEmpty);
    });
  }

  test('reports a palette whose text roles cannot reach their Lc', () {
    final washedOut = IdsPalette([
      for (final _ in IdsPalette.steps) const Color(0xFF9CA3AF),
    ]);
    expect(checkIdsTheme(IdsTheme(primary: washedOut)), isNotEmpty);
  });

  test('reports radius and scale outside their range', () {
    expect(
      checkIdsTheme(
        const IdsTheme(
          primary: IdsThemeColor.seed(Color(0xFF155DFC)),
          radius: 40,
          scale: 3,
        ),
      ).map((issue) => issue.path),
      ['radius', 'scale'],
    );
    for (final radius in [double.infinity, double.nan, -1.0]) {
      expect(
        checkIdsTheme(
          IdsTheme(primary: testTheme.primary, radius: radius),
        ).map((issue) => issue.path),
        ['radius'],
      );
    }
    expect(
      checkIdsTheme(IdsTheme(primary: testTheme.primary, scale: 0.875)),
      isEmpty,
    );
  });

  test('reports brand colors too close to tell apart', () {
    expect(
      checkIdsTheme(
        IdsTheme(primary: _palettes['blue']!, secondary: _palettes['blue']!),
      ).map((issue) => issue.path),
      ['secondary'],
    );
  });

  test('reads any color as its opaque 8-bit sRGB value', () {
    final blue = _palettes['blue']!;
    final translucent = IdsPalette([
      for (final color in blue.colors) color.withValues(alpha: .5),
    ]);
    final displayP3 = IdsPalette([
      for (final color in blue.colors)
        color.withValues(colorSpace: ColorSpace.displayP3),
    ]);
    final roles = resolveColors(IdsTheme(primary: blue)).colors!.roles;
    expect(resolveColors(IdsTheme(primary: translucent)).colors!.roles, roles);
    expect(checkIdsTheme(IdsTheme(primary: displayP3)), isEmpty);
  });

  test('a controlled and a default mode cannot both be given', () {
    expect(
      () => IdsProvider(
        theme: testTheme,
        mode: IdsMode.light,
        defaultMode: IdsMode.dark,
        child: const SizedBox(),
      ),
      throwsAssertionError,
    );
  });

  testWidgets('the provider prints each theme issue in debug builds', (
    tester,
  ) async {
    final printed = <String>[];
    final print = debugPrint;
    debugPrint = (message, {wrapWidth}) => printed.add(message!);

    await tester.pumpWidget(
      IdsProvider(
        theme: IdsTheme(primary: testTheme.primary, radius: 40),
        child: const SizedBox(),
      ),
    );
    debugPrint = print;
    expect(tester.takeException(), isNull);
    expect(printed, [
      '[IDS] IdsProvider theme.radius: radius is the standard corner in px, from 0 to 18 (half a 36px control). Got 40.0.',
    ]);
  });
}
