import 'dart:io';

import 'package:flutter/painting.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

Future<void> loadBundledFont(String family, String file) async {
  final bytes = File('fonts/$file').readAsBytesSync();
  await (FontLoader(
        family,
      )..addFont(Future.value(ByteData.sublistView(Uint8List.fromList(bytes)))))
      .load();
}

double widthOf(String text, TextStyle style) {
  final painter = TextPainter(
    text: TextSpan(text: text, style: style),
    textDirection: TextDirection.ltr,
  )..layout();
  return painter.width;
}

void main() {
  setUpAll(() async {
    await loadBundledFont(
      'packages/ids_flutter/Pretendard GOV Variable',
      'PretendardGOVVariable.ttf',
    );
    await loadBundledFont(
      'packages/ids_flutter/Geist Mono Variable',
      'GeistMonoVariable.ttf',
    );
  });

  test('Pretendard GOV takes its weight from fontWeight', () {
    const text = '가나다 Hamburgefonstiv';
    final regular = widthOf(text, IdsTypography.bodyB3Regular);
    final bold = widthOf(text, IdsTypography.bodyB3Bold);

    expect(bold, greaterThan(regular));
  });

  test('mono text draws in the bundled Geist Mono', () {
    final style = IdsResolvedTheme(
      theme: const IdsTheme(primary: IdsThemeColor.seed(Color(0xFF155DFC))),
      mode: IdsMode.light,
    ).textStyle(IdsTypography.bodyB3Regular, mono: true);
    final advance = widthOf('0123456789', style) / 10;

    expect(advance / style.fontSize!, closeTo(0.6, 0.01));
    expect(widthOf('iiiii', style), widthOf('MMMMM', style));
  });
}
