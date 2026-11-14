import 'dart:ui' show ColorSpace;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

IdsPalette paletteWithPrimary(Color color) => IdsPalette(
  shade50: testPalette.shade50,
  shade100: testPalette.shade100,
  shade200: testPalette.shade200,
  shade300: testPalette.shade300,
  shade400: testPalette.shade400,
  shade500: testPalette.shade500,
  shade600: color,
  shade700: testPalette.shade700,
  shade800: testPalette.shade800,
  shade900: testPalette.shade900,
  shade950: testPalette.shade950,
);

void main() {
  test(
    'controlled and default values cannot be supplied for the same axis',
    () {
      expect(
        () => IdsProvider(
          theme: const IdsThemeData(),
          palette: testPalette,
          defaultPalette: alternatePalette,
          child: const SizedBox(),
        ),
        throwsAssertionError,
      );
      expect(
        () => IdsProvider(
          theme: const IdsThemeData(),
          palette: testPalette,
          mode: IdsMode.light,
          defaultMode: IdsMode.dark,
          child: const SizedBox(),
        ),
        throwsAssertionError,
      );
    },
  );

  test('palette check identifies alpha, color space and channel errors', () {
    final invalid = [
      testPalette.shade600.withValues(alpha: .5),
      testPalette.shade600.withValues(colorSpace: ColorSpace.displayP3),
      const Color.from(alpha: 1, red: double.nan, green: .5, blue: .5),
      const Color.from(alpha: 1, red: double.infinity, green: .5, blue: .5),
      const Color.from(alpha: 1, red: -.1, green: .5, blue: .5),
      const Color.from(alpha: 1, red: 1.1, green: .5, blue: .5),
    ];
    for (final color in invalid) {
      expect(paletteWithPrimary(color).check(), [
        'Palette shade 600 must be an opaque sRGB color.',
      ]);
    }
  });

  test('theme check rejects nonfinite radii and blank font names', () {
    for (final radius in [
      double.infinity,
      double.negativeInfinity,
      double.nan,
      -1.0,
    ]) {
      expect(IdsThemeData(radius: radius).check(), [
        'radius must be finite and non-negative.',
      ]);
    }
    expect(const IdsThemeData(radius: 0).check(), isEmpty);
    expect(const IdsThemeData(fontFamily: '  ').check(), [
      'fontFamily must not be empty.',
    ]);
    expect(const IdsThemeData(monoFontFamily: '').check(), [
      'monoFontFamily must not be empty.',
    ]);
    expect(const IdsThemeData(monoFontFamily: '\t ').check(), [
      'monoFontFamily must not be empty.',
    ]);
  });

  testWidgets('provider rejects invalid theme settings in debug builds', (
    tester,
  ) async {
    for (final theme in [
      const IdsThemeData(radius: double.infinity),
      const IdsThemeData(monoFontFamily: ''),
    ]) {
      await tester.pumpWidget(
        IdsProvider(
          theme: theme,
          palette: testPalette,
          child: const SizedBox(),
        ),
      );
      expect(tester.takeException(), isAssertionError);
      await tester.pumpWidget(const SizedBox());
    }
  });

  for (final controlled in [false, true]) {
    testWidgets(
      'invalid palette requests preserve state and do not call the callback (controlled: $controlled)',
      (tester) async {
        late IdsScope scope;
        final changes = <IdsPalette>[];
        await tester.pumpWidget(
          IdsProvider(
            theme: const IdsThemeData(),
            palette: controlled ? testPalette : null,
            defaultPalette: controlled ? null : testPalette,
            onPaletteChange: changes.add,
            child: Builder(
              builder: (context) {
                scope = IdsProvider.of(context);
                return const SizedBox();
              },
            ),
          ),
        );
        expect(
          () => scope.setColor(
            paletteWithPrimary(testPalette.shade600.withValues(alpha: .5)),
          ),
          throwsA(
            isA<ArgumentError>().having(
              (error) => error.message,
              'message',
              'Palette shade 600 must be an opaque sRGB color.',
            ),
          ),
        );
        await tester.pump();
        expect(scope.palette, testPalette);
        expect(changes, isEmpty);
      },
    );
  }
}
