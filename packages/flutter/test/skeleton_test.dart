import 'package:flutter/widgets.dart' hide AspectRatio;
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

Future<void> pump(
  WidgetTester tester,
  Widget child, {
  bool reducedMotion = false,
  TextScaler textScaler = TextScaler.noScaling,
}) => tester.pumpWidget(
  MediaQuery(
    data: MediaQueryData(
      disableAnimations: reducedMotion,
      textScaler: textScaler,
    ),
    child: Directionality(
      textDirection: TextDirection.ltr,
      child: ThemeProvider(
        child: Align(
          alignment: Alignment.topLeft,
          child: SizedBox(width: 200, child: child),
        ),
      ),
    ),
  ),
);

Size skeletonSize(WidgetTester tester) => tester.getSize(find.byType(Skeleton));

class _Counter extends StatefulWidget {
  const _Counter();

  @override
  State<_Counter> createState() => _CounterState();
}

class _CounterState extends State<_Counter> {
  @override
  Widget build(BuildContext context) => const Text('child');
}

void main() {
  group('size', () {
    testWidgets('rect fills the width at 16 under loose height', (
      tester,
    ) async {
      await pump(tester, const Skeleton());
      expect(skeletonSize(tester), const Size(200, 16));
    });

    testWidgets('rect follows a tight parent', (tester) async {
      await pump(
        tester,
        const Align(child: SizedBox(width: 120, height: 48, child: Skeleton())),
      );
      expect(skeletonSize(tester), const Size(120, 48));

      await pump(tester, const AspectRatio(ratio: 2, child: Skeleton()));
      expect(skeletonSize(tester), const Size(200, 100));
    });

    testWidgets('circle is 40 unless the parent sets its size', (tester) async {
      await pump(
        tester,
        const Align(child: Skeleton(shape: SkeletonShape.circle)),
      );
      expect(skeletonSize(tester), const Size.square(40));

      await pump(
        tester,
        const Align(
          child: SizedBox.square(
            dimension: 24,
            child: Skeleton(shape: SkeletonShape.circle),
          ),
        ),
      );
      expect(skeletonSize(tester), const Size.square(24));
    });
  });

  group('text', () {
    Future<void> expectLineMatchesText(
      WidgetTester tester,
      TextStyle style, {
      TextScaler textScaler = TextScaler.noScaling,
    }) async {
      await pump(
        tester,
        Column(
          children: [
            Skeleton(shape: SkeletonShape.text, style: style),
            Text('Hg', style: style),
          ],
        ),
        textScaler: textScaler,
      );
      expect(
        skeletonSize(tester).height,
        tester.getSize(find.text('Hg')).height,
      );
    }

    testWidgets('a line is as tall as Text without a height', (tester) async {
      await expectLineMatchesText(tester, const TextStyle(fontSize: 14));
    });

    testWidgets('a line is as tall as Text with a height', (tester) async {
      await expectLineMatchesText(tester, IdsTypography.bodyB3Regular);
    });

    testWidgets('a line scales with the text scaler', (tester) async {
      await expectLineMatchesText(
        tester,
        IdsTypography.bodyB3Regular,
        textScaler: const TextScaler.linear(2),
      );
    });

    testWidgets('draws one bar per line and shortens the last', (tester) async {
      await pump(
        tester,
        const Skeleton(
          shape: SkeletonShape.text,
          lines: 3,
          style: TextStyle(fontSize: 10),
        ),
      );
      final bars = find
          .descendant(
            of: find.byType(Skeleton),
            matching: find.byType(CustomPaint),
          )
          .evaluate()
          .map((element) => element.size!)
          .toList();
      expect(bars, [
        const Size(200, 10),
        const Size(200, 10),
        const Size(120, 10),
      ]);
    });

    testWidgets('fewer than one line draws one', (tester) async {
      await pump(
        tester,
        const Column(
          children: [
            Skeleton(shape: SkeletonShape.text, lines: 0),
            Skeleton(shape: SkeletonShape.text),
          ],
        ),
      );
      final sizes = tester
          .widgetList<Skeleton>(find.byType(Skeleton))
          .map((widget) => tester.getSize(find.byWidget(widget)))
          .toList();
      expect(sizes.first, sizes.last);
    });
  });

  group('wrapping', () {
    testWidgets('keeps the child state when loading ends', (tester) async {
      await pump(tester, const Skeleton(loading: true, child: _Counter()));
      final before = tester.state(find.byType(_Counter));

      await pump(tester, const Skeleton(loading: false, child: _Counter()));
      expect(tester.state(find.byType(_Counter)), same(before));
    });

    testWidgets('hides the child from semantics, focus and taps', (
      tester,
    ) async {
      final semantics = tester.ensureSemantics();
      final focus = FocusNode();
      addTearDown(focus.dispose);
      var taps = 0;

      Widget wrapped({required bool loading}) => Skeleton(
        loading: loading,
        child: Focus(
          focusNode: focus,
          child: GestureDetector(
            onTap: () => taps++,
            child: const SizedBox(height: 40, child: Text('child')),
          ),
        ),
      );

      await pump(tester, wrapped(loading: true));
      expect(find.bySemanticsLabel('child'), findsNothing);
      focus.requestFocus();
      await tester.pump();
      expect(focus.hasFocus, isFalse);
      await tester.tap(find.text('child'), warnIfMissed: false);
      expect(taps, 0);

      await pump(tester, wrapped(loading: false));
      expect(find.bySemanticsLabel('child'), findsOneWidget);
      focus.requestFocus();
      await tester.pump();
      expect(focus.hasFocus, isTrue);
      await tester.tap(find.text('child'));
      expect(taps, 1);

      semantics.dispose();
    });

    testWidgets('loads by default when given a child', (tester) async {
      await pump(tester, const Skeleton(child: Text('child')));
      expect(
        tester
            .widget<Opacity>(
              find.descendant(
                of: find.byType(Skeleton),
                matching: find.byType(Opacity),
              ),
            )
            .opacity,
        0,
      );
    });
  });

  group('motion', () {
    testWidgets('animates by default', (tester) async {
      await pump(tester, const Skeleton());
      expect(tester.hasRunningAnimations, isTrue);
    });

    testWidgets('stays still under reduced motion', (tester) async {
      await pump(tester, const Skeleton(), reducedMotion: true);
      expect(tester.hasRunningAnimations, isFalse);
    });

    testWidgets('stays still with animation none', (tester) async {
      await pump(tester, const Skeleton(animation: SkeletonAnimation.none));
      expect(tester.hasRunningAnimations, isFalse);
    });

    testWidgets('stops once loading ends', (tester) async {
      await pump(tester, const Skeleton(loading: false, child: Text('child')));
      expect(tester.hasRunningAnimations, isFalse);
    });

    testWidgets('draws nothing once loading ends without a child', (
      tester,
    ) async {
      await pump(tester, const Skeleton(loading: false));
      expect(skeletonSize(tester).height, 0);
      expect(find.byType(CustomPaint), findsNothing);
      expect(tester.hasRunningAnimations, isFalse);
    });
  });
}
