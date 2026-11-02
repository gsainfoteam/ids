import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

Future<void> pump(
  WidgetTester tester,
  Widget child, {
  IdsMode mode = IdsMode.light,
}) => tester.pumpWidget(
  Directionality(
    textDirection: TextDirection.ltr,
    child: ThemeProvider(
      mode: mode,
      child: Align(alignment: Alignment.topLeft, child: child),
    ),
  ),
);

List<Size> lineSizes(WidgetTester tester) => find
    .descendant(of: find.byType(IdsDivider), matching: find.byType(ColoredBox))
    .evaluate()
    .map((element) => element.size!)
    .toList();

void main() {
  testWidgets('horizontal fills the width at 1px in the neutral border color', (
    tester,
  ) async {
    await pump(tester, const SizedBox(width: 200, child: IdsDivider()));
    expect(lineSizes(tester).single, const Size(200, 1));
    expect(
      tester.widget<ColoredBox>(find.byType(ColoredBox)).color,
      const Color(0xFFE5E5E5),
    );

    await pump(
      tester,
      const SizedBox(width: 200, child: IdsDivider()),
      mode: IdsMode.dark,
    );
    expect(
      tester.widget<ColoredBox>(find.byType(ColoredBox)).color,
      const Color(0xFF262626),
    );
  });

  testWidgets('vertical stretches to the row height', (tester) async {
    await pump(
      tester,
      const IntrinsicHeight(
        child: Row(
          children: [
            SizedBox(height: 40),
            IdsDivider(orientation: Axis.vertical),
          ],
        ),
      ),
    );
    expect(lineSizes(tester).single, const Size(1, 40));
  });

  testWidgets('vertical without a height limit keeps one line', (tester) async {
    await pump(
      tester,
      const DefaultTextStyle(
        style: TextStyle(fontSize: 10, height: 2),
        child: Column(children: [IdsDivider(orientation: Axis.vertical)]),
      ),
    );
    expect(lineSizes(tester).single, const Size(1, 20));
  });

  testWidgets('a long label wraps and leaves 16px of line on each side', (
    tester,
  ) async {
    await pump(
      tester,
      SizedBox(width: 200, child: IdsDivider(child: Text('또는 ' * 20))),
    );
    final sizes = lineSizes(tester);
    expect(sizes, [const Size(16, 1), const Size(16, 1)]);
    expect(tester.getSize(find.byType(Text)).height, greaterThan(20));
  });

  testWidgets('decorative leaves the label out of semantics', (tester) async {
    final semantics = tester.ensureSemantics();
    await pump(
      tester,
      const SizedBox(width: 200, child: IdsDivider(child: Text('또는'))),
    );
    expect(find.semantics.byLabel('또는'), findsOne);

    await pump(
      tester,
      const SizedBox(
        width: 200,
        child: IdsDivider(decorative: true, child: Text('또는')),
      ),
    );
    expect(find.semantics.byLabel('또는'), findsNothing);
    semantics.dispose();
  });
}
