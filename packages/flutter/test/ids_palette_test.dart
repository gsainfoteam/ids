import 'package:flutter/painting.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

const _createIdsPaletteResults = <int, List<int>>{
  0xFF0D9488: [
    0xFFF0FDFB,
    0xFFCDFBF3,
    0xFF95F7E7,
    0xFF4AECD9,
    0xFF18D5C4,
    0xFF15BCAD,
    0xFF0D9488,
    0xFF097974,
    0xFF055F5C,
    0xFF084E4C,
    0xFF013031,
  ],
  0xFFFDE68A: [
    0xFFFEFDED,
    0xFFFDFBC9,
    0xFFFCF58C,
    0xFFFDE68A,
    0xFFF3D934,
    0xFFE3C32E,
    0xFFBB9322,
    0xFF946A17,
    0xFF795410,
    0xFF654514,
    0xFF3B2507,
  ],
  0xFF7C3AED: [
    0xFFF5F4FE,
    0xFFEBE8FD,
    0xFFDAD4FB,
    0xFFC2B4F9,
    0xFFA386F5,
    0xFF8B5DF2,
    0xFF7C3AED,
    0xFF682DD5,
    0xFF5627AD,
    0xFF472689,
    0xFF2C165C,
  ],
  0xFF808080: [
    0xFFF6F6F6,
    0xFFEDEDED,
    0xFFDCDCDC,
    0xFFC3C3C3,
    0xFFA3A3A3,
    0xFF909090,
    0xFF808080,
    0xFF6C6C6C,
    0xFF585858,
    0xFF494949,
    0xFF292929,
  ],
};

List<int> _argbOf(IdsPalette palette) => [
  for (final color in palette.colors) color.toARGB32(),
];

void main() {
  group('IdsPalette.fromSeed', () {
    for (final MapEntry(key: seed, value: expected)
        in _createIdsPaletteResults.entries) {
      final hex = '#${(seed & 0xFFFFFF).toRadixString(16).padLeft(6, '0')}';

      test('matches createIdsPalette from ids-react for $hex', () {
        expect(_argbOf(IdsPalette.fromSeed(Color(seed))), expected);
      });

      test('keeps $hex unchanged at one step', () {
        expect(_argbOf(IdsPalette.fromSeed(Color(seed))), contains(seed));
      });
    }

    test('ignores the seed alpha', () {
      expect(
        IdsPalette.fromSeed(const Color(0x800D9488)),
        IdsPalette.fromSeed(const Color(0xFF0D9488)),
      );
    });
  });

  group('IdsPalette', () {
    final palette = IdsPalette.fromSeed(const Color(0xFF7C3AED));

    test('reads a color by its step', () {
      expect(palette[600], const Color(0xFF7C3AED));
      expect(palette[50], palette.colors.first);
      expect(palette[950], palette.colors.last);
    });

    test('rejects a step outside 50 to 950', () {
      expect(() => palette[550], throwsArgumentError);
    });

    test('asserts eleven colors', () {
      expect(() => IdsPalette(const [Color(0xFF000000)]), throwsAssertionError);
    });

    test('status palettes have eleven steps each', () {
      for (final steps in [
        IdsStatusPalettes.red,
        IdsStatusPalettes.yellow,
        IdsStatusPalettes.green,
        IdsStatusPalettes.sky,
      ]) {
        expect(IdsPalette(steps).colors, hasLength(IdsPalette.steps.length));
      }
    });
  });
}
