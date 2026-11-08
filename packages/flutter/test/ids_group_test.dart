import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';
import 'package:ids_flutter/src/components/group/ids_group.dart';

Future<void> pump(WidgetTester tester, Widget group) => tester.pumpWidget(
  Directionality(
    textDirection: TextDirection.ltr,
    child: ThemeProvider(
      child: Align(alignment: Alignment.topLeft, child: group),
    ),
  ),
);

const a = SizedBox(key: Key('a'), width: 40, height: 20);
const b = SizedBox(key: Key('b'), width: 30, height: 36);

Rect rectOf(WidgetTester tester, String key) =>
    tester.getRect(find.byKey(Key(key)));

void main() {
  testWidgets('attached children touch and share the tallest height', (
    tester,
  ) async {
    await pump(tester, const IdsGroup(children: [a, b]));
    expect(rectOf(tester, 'a'), const Rect.fromLTWH(0, 0, 40, 36));
    expect(rectOf(tester, 'b'), const Rect.fromLTWH(40, 0, 30, 36));
  });

  testWidgets('separated children keep 8px apart', (tester) async {
    await pump(tester, const IdsGroup(attached: false, children: [a, b]));
    expect(rectOf(tester, 'b').left, 48);
  });

  testWidgets('vertical stacks and shares the widest width', (tester) async {
    await pump(
      tester,
      const IdsGroup(orientation: Axis.vertical, children: [a, b]),
    );
    expect(rectOf(tester, 'a'), const Rect.fromLTWH(0, 0, 40, 20));
    expect(rectOf(tester, 'b'), const Rect.fromLTWH(0, 20, 40, 36));
  });

  testWidgets('separator crosses the group', (tester) async {
    await pump(tester, const IdsGroup(children: [a, IdsGroupSeparator(), b]));
    expect(tester.getSize(find.byType(IdsDivider)), const Size(1, 36));
    expect(rectOf(tester, 'b').left, 41);

    await pump(
      tester,
      const IdsGroup(
        orientation: Axis.vertical,
        children: [a, IdsGroupSeparator(), b],
      ),
    );
    expect(tester.getSize(find.byType(IdsDivider)), const Size(40, 1));
  });

  testWidgets('separator outside a group fails', (tester) async {
    await pump(tester, const IdsGroupSeparator());
    expect(tester.takeException(), isAssertionError);
  });

  testWidgets('semanticLabel names the group', (tester) async {
    final semantics = tester.ensureSemantics();
    await pump(
      tester,
      const IdsGroup(
        semanticLabel: '글자 모양',
        children: [Text('굵게'), Text('기울임')],
      ),
    );
    expect(find.semantics.byLabel('글자 모양'), findsOne);
    expect(find.semantics.byLabel('굵게'), findsOne);
    semantics.dispose();
  });
}
