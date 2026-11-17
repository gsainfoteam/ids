import 'dart:math' as math;

import 'package:flutter/widgets.dart' hide AspectRatio;
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

Future<void> pump(
  WidgetTester tester,
  Widget child, {
  bool reducedMotion = false,
  TextScaler textScaler = TextScaler.noScaling,
  IdsTheme theme = testTheme,
  IdsMode? mode,
}) => tester.pumpWidget(
  MediaQuery(
    data: MediaQueryData(
      disableAnimations: reducedMotion,
      textScaler: textScaler,
    ),
    child: Directionality(
      textDirection: TextDirection.ltr,
      child: IdsProvider(
        theme: theme,
        mode: mode,
        child: Align(
          alignment: Alignment.topLeft,
          child: SizedBox(width: 200, child: child),
        ),
      ),
    ),
  ),
);

Size skeletonSize(WidgetTester tester) => tester.getSize(find.byType(Skeleton));

Finder painted() => find.descendant(
  of: find.byType(Skeleton),
  matching: find.byType(CustomPaint),
);

PaintPattern paintsCornerOf(double radius) {
  final inset = radius * (1 - math.sqrt1_2);
  return paints..path(
    includes: [Offset(inset + 0.1, inset + 0.1)],
    excludes: [Offset(inset - 0.1, inset - 0.1)],
  );
}

Offset edgeBetween(Path path, Offset inside, Offset outside) {
  var low = 0.0;
  var high = 1.0;
  while (high - low > 1e-6) {
    final middle = (low + high) / 2;
    if (path.contains(Offset.lerp(inside, outside, middle)!)) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return Offset.lerp(inside, outside, low)!;
}

Offset insideOnlyARoundCorner(Size size, double radius) {
  const whereTheShapesDifferMost = 188 * math.pi / 180;
  final bounds = Offset.zero & size;
  final corner = BorderRadius.circular(radius);
  final arcCentre = Offset(radius, radius);
  final outside =
      arcCentre + Offset.fromDirection(whereTheShapesDifferMost, radius * 1.5);
  final roundedEdge = edgeBetween(
    RoundedRectangleBorder(borderRadius: corner).getOuterPath(bounds),
    arcCentre,
    outside,
  );
  final squircleEdge = edgeBetween(
    RoundedSuperellipseBorder(borderRadius: corner).getOuterPath(bounds),
    arcCentre,
    outside,
  );
  expect(
    (roundedEdge - arcCentre).distance - (squircleEdge - arcCentre).distance,
    greaterThan(0.05),
  );
  return Offset.lerp(roundedEdge, squircleEdge, 0.5)!;
}

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

  testWidgets('follows the theme scale', (tester) async {
    await pump(tester, const Skeleton(), theme: scaledTheme);
    expect(skeletonSize(tester), const Size(200, 16 * 1.5));

    await pump(
      tester,
      const Align(child: Skeleton(shape: SkeletonShape.circle)),
      theme: scaledTheme,
    );
    expect(skeletonSize(tester), const Size.square(40 * 1.5));

    Future<Size> barIn(IdsTheme theme) async {
      await pump(
        tester,
        Builder(
          builder: (context) => Skeleton(
            shape: SkeletonShape.text,
            style: IdsProvider.of(
              context,
            ).textStyle(IdsTypography.bodyB3Regular),
          ),
        ),
        theme: theme,
      );
      return tester.getSize(painted());
    }

    final lineAtOne = (await barIn(testTheme), skeletonSize(tester).height);
    final lineScaled = (await barIn(scaledTheme), skeletonSize(tester).height);
    expect(lineScaled.$1.height, 14 * 1.5);
    expect(lineScaled.$1.height, lineAtOne.$1.height * 1.5);
    expect(lineScaled.$2, closeTo(lineAtOne.$2 * 1.5, 0.01));
  });

  testWidgets('follows the theme radius', (tester) async {
    await pump(
      tester,
      const Align(child: SizedBox(width: 120, height: 48, child: Skeleton())),
      theme: roundedTheme,
    );
    final radius = IdsProvider.of(tester.element(find.byType(Skeleton))).radius;
    expect(painted(), paintsCornerOf(radius.standard));

    await pump(
      tester,
      const Skeleton(child: SizedBox(height: 48)),
      theme: roundedTheme,
    );
    expect(painted(), paintsCornerOf(radius.standard));

    await pump(
      tester,
      const Skeleton(shape: SkeletonShape.text, style: TextStyle(fontSize: 14)),
      theme: roundedTheme,
    );
    expect(painted(), paintsCornerOf(radius.indicator));
  });

  testWidgets('takes the corner shape of the theme', (tester) async {
    final squircle = IdsTheme(
      primary: testTheme.primary,
      cornerShape: IdsCornerShape.squircle,
    );
    final drawn = <(Widget, double Function(IdsRadius))>[
      (
        const Align(child: SizedBox(width: 120, height: 48, child: Skeleton())),
        (radius) => radius.standard,
      ),
      (
        const Skeleton(child: SizedBox(height: 48)),
        (radius) => radius.standard,
      ),
      (
        const Skeleton(
          shape: SkeletonShape.text,
          style: TextStyle(fontSize: 14),
        ),
        (radius) => radius.indicator,
      ),
    ];

    for (final (skeleton, cornerOf) in drawn) {
      await pump(tester, skeleton);
      final corner = cornerOf(
        IdsProvider.of(tester.element(find.byType(Skeleton))).radius,
      );
      final point = insideOnlyARoundCorner(tester.getSize(painted()), corner);
      expect(painted(), paints..path(includes: [point]));

      await pump(tester, skeleton, theme: squircle);
      expect(painted(), paints..path(excludes: [point]));
      expect(painted(), paintsCornerOf(corner));
    }

    await pump(
      tester,
      const Skeleton(
        shape: SkeletonShape.circle,
        child: SizedBox(width: 70, height: 30),
      ),
      theme: squircle,
    );
    expect(
      painted(),
      paints..path(
        includes: [const Offset(100, 15), const Offset(86, 15)],
        excludes: [const Offset(84, 15), const Offset(5, 15)],
      ),
    );
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
      final bars = painted()
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

    for (final mode in [IdsMode.light, IdsMode.dark]) {
      testWidgets(
        'pulses from bgNeutralSoft to bgNeutralSoftHover (${mode.name})',
        (tester) async {
          await pump(tester, const Skeleton(), mode: mode);
          final colors = IdsProvider.of(
            tester.element(find.byType(Skeleton)),
          ).colors;
          expect(painted(), paints..path(color: colors.bgNeutralSoft));

          await tester.pump(const Duration(seconds: 1));
          expect(painted(), paints..path(color: colors.bgNeutralSoftHover));

          await tester.pump(const Duration(seconds: 1));
          expect(painted(), paints..path(color: colors.bgNeutralSoft));
        },
      );
    }

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
