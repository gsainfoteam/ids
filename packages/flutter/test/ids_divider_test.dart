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
    expect(tester.getSize(find.byType(IdsDivider)).width, 200);
    final label = tester.getRect(find.byType(Text));
    expect(label.left, 28);
    expect(label.right, 172);
    expect(label.height, greaterThan(20));
  });

  testWidgets('a labelled vertical divider fits an IntrinsicHeight row', (
    tester,
  ) async {
    await pump(
      tester,
      const IntrinsicHeight(
        child: Row(
          children: [
            SizedBox(height: 60),
            IdsDivider(orientation: Axis.vertical, child: Text('또는')),
          ],
        ),
      ),
    );
    final divider = tester.getRect(find.byType(IdsDivider));
    expect(divider.height, 60);
    expect(tester.getCenter(find.text('또는')).dy, divider.center.dy);
  });

  testWidgets(
    'a labelled divider without a limit takes its label plus the ends',
    (tester) async {
      await pump(
        tester,
        const Column(
          children: [IdsDivider(orientation: Axis.vertical, child: Text('또는'))],
        ),
      );
      final labelHeight = tester.getSize(find.text('또는')).height;
      expect(tester.getSize(find.byType(IdsDivider)).height, labelHeight + 32);

      await pump(tester, const Row(children: [IdsDivider(child: Text('또는'))]));
      final labelWidth = tester.getSize(find.text('또는')).width;
      expect(tester.getSize(find.byType(IdsDivider)).width, labelWidth + 56);
    },
  );

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
