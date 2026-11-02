import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

const danger = Color(0xFFC10007);

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  Directionality(
    textDirection: TextDirection.ltr,
    child: ThemeProvider(
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
  bool required = false,
  bool invalid = false,
  bool? labelRequired,
}) => IdsField(
  required: required,
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

    testWidgets('invalid turns danger, disabled fades, tiny is smaller', (
      tester,
    ) async {
      await pump(tester, const IdsLabel(invalid: true, child: Text('이름')));
      expect(styleOf(tester, '이름')?.color, danger);

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
      expect(styleOf(tester, '이메일')?.color, danger);
    });

    testWidgets('keeps 8px between parts', (tester) async {
      await pump(tester, field());
      final description = tester.getRect(find.text('설명'));
      expect(
        tester.getRect(find.byKey(const Key('control'))).top,
        description.bottom + 8,
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

    testWidgets('a part outside a field fails', (tester) async {
      await pump(tester, const IdsFieldHint(child: Text('도움말')));
      expect(tester.takeException(), isAssertionError);
    });
  });
}
