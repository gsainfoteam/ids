import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';
import 'package:ids_flutter/src/components/group/ids_group.dart';

import 'test_theme.dart';

Future<void> pump(WidgetTester tester, Widget group) => tester.pumpWidget(
  Directionality(
    textDirection: TextDirection.ltr,
    child: IdsProvider(
      theme: testTheme,
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

  testWidgets('separator crosses an attached group', (tester) async {
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

  testWidgets('spaced separator is a short line centered in the gap', (
    tester,
  ) async {
    await pump(
      tester,
      const IdsGroup(attached: false, children: [a, IdsGroupSeparator(), b]),
    );
    final line = tester.getRect(find.byType(IdsDivider));
    expect(line.size, const Size(1, 20));
    expect(line.left, 48);
    expect(line.center.dy, rectOf(tester, 'b').center.dy);
    expect(rectOf(tester, 'b').left, 57);

    await pump(
      tester,
      const IdsGroup(
        attached: false,
        size: IdsSize.tiny,
        children: [a, IdsGroupSeparator(), b],
      ),
    );
    expect(tester.getSize(find.byType(IdsDivider)), const Size(1, 16));
  });

  testWidgets('vertical spaced separator is a short horizontal line', (
    tester,
  ) async {
    await pump(
      tester,
      const IdsGroup(
        orientation: Axis.vertical,
        attached: false,
        children: [a, IdsGroupSeparator(), b],
      ),
    );
    final line = tester.getRect(find.byType(IdsDivider));
    expect(line.size, const Size(20, 1));
    expect(line.top, 28);
    expect(line.center.dx, rectOf(tester, 'a').center.dx);
  });

  testWidgets('a nested group takes the outer size', (tester) async {
    await pump(
      tester,
      const IdsGroup(
        size: IdsSize.tiny,
        children: [
          IdsGroup(attached: false, children: [a, IdsGroupSeparator(), b]),
        ],
      ),
    );
    expect(tester.getSize(find.byType(IdsDivider)), const Size(1, 16));
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
