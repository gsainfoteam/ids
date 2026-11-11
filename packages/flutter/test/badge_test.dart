import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

const _anchor = SizedBox.square(dimension: 40);

Future<void> pump(
  WidgetTester tester,
  Widget child, {
  TextDirection direction = TextDirection.ltr,
}) => tester.pumpWidget(
  Directionality(
    textDirection: direction,
    child: ThemeProvider(child: Center(child: child)),
  ),
);

Finder indicator() => find.byWidgetPredicate(
  (widget) =>
      widget is Container &&
      widget.decoration is ShapeDecoration &&
      (widget.decoration! as ShapeDecoration).shape is StadiumBorder,
);

Offset indicatorCenter(WidgetTester tester) =>
    tester.getCenter(indicator()) - tester.getTopLeft(find.byWidget(_anchor));

double indicatorOpacity(WidgetTester tester) => tester
    .widget<AnimatedOpacity>(
      find.descendant(
        of: find.byType(Badge),
        matching: find.byType(AnimatedOpacity),
      ),
    )
    .opacity;

void main() {
  group('count', () {
    testWidgets('caps at max', (tester) async {
      await pump(tester, const Badge.count(count: 120, child: _anchor));
      expect(find.text('99+'), findsOneWidget);

      await pump(
        tester,
        const Badge.count(count: 1200, max: 999, child: _anchor),
      );
      expect(find.text('999+'), findsOneWidget);
    });

    testWidgets('hides zero unless showZero', (tester) async {
      await pump(tester, const Badge.count(count: 0, child: _anchor));
      expect(indicatorOpacity(tester), 0);

      await pump(
        tester,
        const Badge.count(count: 0, showZero: true, child: _anchor),
      );
      expect(indicatorOpacity(tester), 1);
      expect(find.text('0'), findsOneWidget);
    });

    testWidgets('fades out on the same anchor when the count reaches zero', (
      tester,
    ) async {
      Widget badge(int count) => Badge.count(count: count, child: _anchor);
      await pump(tester, badge(3));
      final anchor = tester.element(find.byWidget(_anchor));
      await pump(tester, badge(0));
      await tester.pump(const Duration(milliseconds: 60));
      expect(tester.element(find.byWidget(_anchor)), same(anchor));
      final fade = tester.widget<FadeTransition>(
        find.descendant(
          of: find.byType(Badge),
          matching: find.byType(FadeTransition),
        ),
      );
      expect(fade.opacity.value, inExclusiveRange(0, 1));
      await tester.pumpAndSettle();
      expect(fade.opacity.value, 0);
    });

    testWidgets('counts a negative number as zero', (tester) async {
      await pump(
        tester,
        const Badge.count(count: -3, showZero: true, child: _anchor),
      );
      expect(find.text('0'), findsOneWidget);
    });
  });

  group('size', () {
    testWidgets('grows with the system text size', (tester) async {
      await pump(
        tester,
        const MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(2)),
          child: Badge.count(count: 3, child: _anchor),
        ),
      );
      expect(tester.getSize(indicator()).height, 40);
      expect(
        tester.getSize(find.text('3')).height,
        lessThanOrEqualTo(tester.getSize(indicator()).height),
      );
    });

    testWidgets('is 20 tall and at least 20 wide, 16 when tiny', (
      tester,
    ) async {
      await pump(
        tester,
        const Badge(content: SizedBox.shrink(), child: _anchor),
      );
      expect(tester.getSize(indicator()), const Size(20, 20));

      await pump(
        tester,
        const Badge(
          content: SizedBox.shrink(),
          size: IdsSize.tiny,
          child: _anchor,
        ),
      );
      expect(tester.getSize(indicator()), const Size(16, 16));
    });

    testWidgets('a dot is 10, or 8 when tiny', (tester) async {
      await pump(tester, const Badge.dot(child: _anchor));
      expect(tester.getSize(indicator()), const Size.square(10));

      await pump(tester, const Badge.dot(size: IdsSize.tiny, child: _anchor));
      expect(tester.getSize(indicator()), const Size.square(8));
    });

    testWidgets('grows past a narrow anchor', (tester) async {
      await pump(
        tester,
        const Badge.count(count: 120, child: SizedBox.square(dimension: 16)),
      );
      expect(
        tester.getSize(indicator()).width,
        tester.getSize(find.text('99+')).width + 12,
      );
    });

    testWidgets('the anchor keeps its own size', (tester) async {
      await pump(tester, const Badge.count(count: 3, child: _anchor));
      expect(tester.getSize(find.byType(Badge)), const Size.square(40));
    });
  });

  group('placement', () {
    testWidgets('centres on the corner', (tester) async {
      await pump(tester, const Badge.dot(child: _anchor));
      expect(indicatorCenter(tester), const Offset(40, 0));

      await pump(
        tester,
        const Badge.dot(placement: BadgePlacement.bottomStart, child: _anchor),
      );
      expect(indicatorCenter(tester), const Offset(0, 40));
    });

    testWidgets('start and end flip in right-to-left text', (tester) async {
      await pump(
        tester,
        const Badge.dot(child: _anchor),
        direction: TextDirection.rtl,
      );
      expect(indicatorCenter(tester), const Offset(0, 0));
    });

    testWidgets('pulls in to the edge of a round avatar on its own', (
      tester,
    ) async {
      const pulled = Offset(40 - 40 * 0.146, 40 * 0.146);
      await pump(tester, const Badge.dot(child: Avatar(name: 'A')));
      expect(
        tester.getCenter(indicator()) - tester.getTopLeft(find.byType(Avatar)),
        within(distance: 0.01, from: pulled),
      );

      await pump(
        tester,
        const Badge.dot(
          child: Avatar(name: 'A', shape: AvatarShape.square),
        ),
      );
      expect(
        tester.getCenter(indicator()) - tester.getTopLeft(find.byType(Avatar)),
        const Offset(40, 0),
      );

      await pump(
        tester,
        const Badge.dot(shape: BadgeShape.circular, child: _anchor),
      );
      expect(indicatorCenter(tester), within(distance: 0.01, from: pulled));
    });

    testWidgets('reads the shape an avatar takes from its group', (
      tester,
    ) async {
      await pump(
        tester,
        const AvatarGroup(
          shape: AvatarShape.square,
          children: [Badge.dot(child: Avatar(name: 'A'))],
        ),
      );
      expect(
        tester.getCenter(indicator()) - tester.getTopLeft(find.byType(Avatar)),
        const Offset(40, 0),
      );
    });
  });

  group('color', () {
    Color fill(WidgetTester tester) =>
        (tester.widget<Container>(indicator()).decoration! as ShapeDecoration)
            .color!;

    testWidgets('is danger attached and neutral on its own', (tester) async {
      await pump(tester, const Badge.count(count: 3, child: _anchor));
      final theme = ThemeProvider.of(tester.element(find.byType(Badge)));
      expect(fill(tester), theme.danger);

      await pump(tester, const Badge.count(count: 3));
      expect(fill(tester), theme.onSurface);
    });

    testWidgets('soft mixes 16% of the scheme into the surface in oklab', (
      tester,
    ) async {
      await pump(
        tester,
        const Badge.count(
          count: 3,
          variant: BadgeVariant.soft,
          colorScheme: IdsColorScheme.danger,
          child: _anchor,
        ),
      );
      final color = fill(tester);
      expect(
        [color.r, color.g, color.b].map((c) => (c * 255).round()),
        orderedEquals([251, 221, 217]),
      );
    });

    testWidgets('outline draws on the surface', (tester) async {
      await pump(
        tester,
        const Badge.count(
          count: 3,
          variant: BadgeVariant.outline,
          colorScheme: IdsColorScheme.primary,
          child: _anchor,
        ),
      );
      final theme = ThemeProvider.of(tester.element(find.byType(Badge)));
      expect(fill(tester), theme.surface);
    });
  });

  group('semantics', () {
    testWidgets('a label is a live region', (tester) async {
      final semantics = tester.ensureSemantics();
      await pump(
        tester,
        const Badge.count(
          count: 3,
          semanticLabel: '읽지 않은 알림 3개',
          child: _anchor,
        ),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('읽지 않은 알림 3개')),
        matchesSemantics(label: '읽지 않은 알림 3개', isLiveRegion: true),
      );
      semantics.dispose();
    });

    testWidgets('an unlabelled count joins the anchor', (tester) async {
      final semantics = tester.ensureSemantics();
      await pump(
        tester,
        Badge.count(
          count: 3,
          child: Semantics(button: true, label: '알림', child: _anchor),
        ),
      );
      expect(
        tester.getSemantics(find.byType(Badge)),
        matchesSemantics(label: '알림\n3', isButton: true),
      );
      semantics.dispose();
    });

    testWidgets('an unlabelled dot stays silent', (tester) async {
      final semantics = tester.ensureSemantics();
      await pump(
        tester,
        Badge.dot(
          child: Semantics(button: true, label: '알림', child: _anchor),
        ),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('알림')),
        matchesSemantics(label: '알림', isButton: true),
      );
      semantics.dispose();
    });
  });

  testWidgets('never takes a tap meant for the anchor', (tester) async {
    var taps = 0;
    await pump(
      tester,
      Badge.count(
        count: 3,
        placement: BadgePlacement.bottomEnd,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () => taps++,
          child: _anchor,
        ),
      ),
    );
    await tester.tapAt(tester.getCenter(indicator()) - const Offset(4, 4));
    expect(taps, 1);
  });
}
