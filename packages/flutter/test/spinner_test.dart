import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

Future<void> pump(
  WidgetTester tester,
  Widget spinner, {
  IconThemeData icon = const IconThemeData(),
  bool reducedMotion = false,
}) => tester.pumpWidget(
  MediaQuery(
    data: MediaQueryData(disableAnimations: reducedMotion),
    child: Directionality(
      textDirection: TextDirection.ltr,
      child: IconTheme(
        data: icon,
        child: Align(alignment: Alignment.topLeft, child: spinner),
      ),
    ),
  ),
);

Size spinnerSize(WidgetTester tester) =>
    tester.getSize(find.byType(CustomPaint).last);

void main() {
  testWidgets('follows the icon size unless given one', (tester) async {
    await pump(tester, const Spinner(), icon: const IconThemeData(size: 20));
    expect(spinnerSize(tester), const Size.square(20));

    await pump(
      tester,
      const Spinner(size: IdsSize.standard),
      icon: const IconThemeData(size: 20),
    );
    expect(spinnerSize(tester), const Size.square(16));

    await pump(tester, const Spinner(size: IdsSize.tiny));
    expect(spinnerSize(tester), const Size.square(14));
  });

  testWidgets('follows the text size when nothing sets an icon size', (
    tester,
  ) async {
    const text = DefaultTextStyle(
      style: TextStyle(fontSize: 18),
      child: Spinner(),
    );
    await pump(tester, text);
    expect(spinnerSize(tester), const Size.square(18));

    await pump(tester, const ThemeProvider(child: text));
    expect(spinnerSize(tester), const Size.square(18));

    await pump(
      tester,
      const MediaQuery(
        data: MediaQueryData(textScaler: TextScaler.linear(2)),
        child: text,
      ),
    );
    expect(spinnerSize(tester), const Size.square(36));
  });

  testWidgets('takes the size of the Field around it', (tester) async {
    Widget field(IdsSize size) => ThemeProvider(
      child: Field(
        size: size,
        children: const [
          FieldHint(child: Row(children: [Spinner()])),
        ],
      ),
    );
    await pump(tester, field(IdsSize.tiny));
    expect(spinnerSize(tester), const Size.square(14));

    await pump(tester, field(IdsSize.standard));
    expect(spinnerSize(tester), const Size.square(16));
  });

  testWidgets('spins, or pulses under reduced motion', (tester) async {
    await pump(tester, const Spinner());
    expect(find.byType(RotationTransition), findsOne);

    await pump(tester, const Spinner(), reducedMotion: true);
    expect(find.byType(RotationTransition), findsNothing);
    expect(find.byType(FadeTransition), findsOne);
  });

  testWidgets('pulses when iOS asks to reduce motion', (tester) async {
    tester.platformDispatcher.accessibilityFeaturesTestValue =
        const FakeAccessibilityFeatures(reduceMotion: true);
    addTearDown(tester.platformDispatcher.clearAccessibilityFeaturesTestValue);
    await pump(tester, const Spinner());
    expect(find.byType(FadeTransition), findsOne);
  });

  testWidgets('announces after a short delay', (tester) async {
    final semantics = tester.ensureSemantics();
    await pump(tester, const Spinner());
    expect(find.semantics.byLabel('불러오는 중'), findsNothing);

    await tester.pump(const Duration(milliseconds: 100));
    expect(find.semantics.byLabel('불러오는 중'), findsOne);

    await pump(tester, const Spinner(semanticLabel: '댓글 불러오는 중'));
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.semantics.byLabel('댓글 불러오는 중'), findsOne);
    semantics.dispose();
  });

  testWidgets('decorative stays silent', (tester) async {
    final semantics = tester.ensureSemantics();
    await pump(tester, const Spinner(decorative: true));
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.semantics.byLabel('불러오는 중'), findsNothing);
    semantics.dispose();
  });
}
