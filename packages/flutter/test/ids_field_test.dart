import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

const danger = Color(0xFFC10007);

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  Directionality(
    textDirection: TextDirection.ltr,
    child: IdsProvider(
      theme: const IdsThemeData(),
      palette: testPalette,
      child: Align(alignment: Alignment.topLeft, child: child),
    ),
  ),
);

TextStyle? styleOf(WidgetTester tester, String text) => tester
    .widget<RichText>(
      find
          .descendant(of: find.text(text), matching: find.byType(RichText))
          .first,
    )
    .text
    .style;

IdsField field({
  IdsSize size = IdsSize.standard,
  bool required = false,
  bool disabled = false,
  bool invalid = false,
  bool? labelRequired,
}) => IdsField(
  size: size,
  required: required,
  disabled: disabled,
  invalid: invalid,
  children: [
    IdsFieldLabel(required: labelRequired, child: const Text('이메일')),
    const IdsFieldDescription(child: Text('설명')),
    const SizedBox(key: Key('control'), height: 36),
    const IdsFieldHint(child: Text('도움말')),
    const IdsFieldError(child: Text('오류')),
  ],
);

void main() {
  group('IdsLabel', () {
    testWidgets('required adds an asterisk screen readers skip', (
      tester,
    ) async {
      final semantics = tester.ensureSemantics();
      await pump(tester, const IdsLabel(required: true, child: Text('이름')));
      expect(find.text('*'), findsOne);
      expect(find.semantics.byLabel('*'), findsNothing);
      semantics.dispose();
    });

    testWidgets('the asterisk sits where Pretendard draws it, at any scale', (
      tester,
    ) async {
      for (final scale in [1.0, 2.0]) {
        await pump(
          tester,
          MediaQuery(
            data: MediaQueryData(textScaler: TextScaler.linear(scale)),
            child: const IdsLabel(required: true, child: Text('이름')),
          ),
        );
        expect(
          tester.getRect(find.text('*')).top,
          moreOrLessEquals(
            tester.getRect(find.text('이름')).top - 14 * scale * 316 / 2048,
          ),
        );
      }
    });

    testWidgets('disabled fades, tiny is smaller', (tester) async {
      await pump(tester, const IdsLabel(disabled: true, child: Text('이름')));
      expect(tester.widget<Opacity>(find.byType(Opacity)).opacity, 0.5);

      await pump(tester, const IdsLabel(size: IdsSize.tiny, child: Text('이름')));
      expect(
        tester.widget<RichText>(find.byType(RichText)).text.style?.fontSize,
        12,
      );
    });
  });

  group('IdsField', () {
    testWidgets('shows the hint until invalid, then the error', (tester) async {
      await pump(tester, field());
      expect(find.text('도움말'), findsOne);
      expect(find.text('오류'), findsNothing);

      await pump(tester, field(invalid: true));
      expect(find.text('도움말'), findsNothing);
      expect(find.text('오류'), findsOne);
      expect(styleOf(tester, '오류')?.color, danger);
      expect(styleOf(tester, '이메일')?.color, isNot(danger));
    });

    testWidgets('keeps 8px between parts, 6px when tiny', (tester) async {
      for (final (size, gap) in [(IdsSize.standard, 8), (IdsSize.tiny, 6)]) {
        await pump(tester, field(size: size));
        expect(
          tester.getRect(find.byKey(const Key('control'))).top,
          tester.getRect(find.text('설명')).bottom + gap,
        );
      }
    });

    testWidgets('description, hint and error are captions', (tester) async {
      await pump(tester, field());
      expect(styleOf(tester, '설명')?.fontSize, 12);
      expect(styleOf(tester, '도움말')?.fontSize, 12);
    });

    testWidgets('disabled fades the whole field once', (tester) async {
      await pump(tester, field(disabled: true));
      expect(
        tester.widgetList<Opacity>(find.byType(Opacity)).map((o) => o.opacity),
        [0.5, 1],
      );
    });

    testWidgets(
      'the label takes required from the field unless it says otherwise',
      (tester) async {
        await pump(tester, field(required: true));
        expect(find.text('*'), findsOne);

        await pump(tester, field(required: true, labelRequired: false));
        expect(find.text('*'), findsNothing);
      },
    );

    testWidgets('a wrapped error still waits for invalid', (tester) async {
      Widget wrapped({required bool invalid}) => IdsField(
        invalid: invalid,
        children: const [
          Padding(
            padding: EdgeInsets.zero,
            child: IdsFieldError(child: Text('오류')),
          ),
        ],
      );
      await pump(tester, wrapped(invalid: false));
      expect(find.text('오류'), findsNothing);
      await pump(tester, wrapped(invalid: true));
      expect(find.text('오류'), findsOne);
    });

    testWidgets('a part outside a field fails', (tester) async {
      await pump(tester, const IdsFieldHint(child: Text('도움말')));
      expect(tester.takeException(), isAssertionError);
    });
  });
}
