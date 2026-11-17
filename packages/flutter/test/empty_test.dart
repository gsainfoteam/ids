import 'dart:math' as math;

import 'package:flutter/material.dart' show Icons;
import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';
import 'test_image.dart';

Future<void> pump(
  WidgetTester tester,
  Widget child, {
  TextDirection direction = TextDirection.ltr,
  IdsTheme theme = testTheme,
  IdsMode? mode,
  double width = 400,
}) => tester.pumpWidget(
  Directionality(
    textDirection: direction,
    child: IdsProvider(
      theme: theme,
      mode: mode,
      child: Align(
        alignment: Alignment.topLeft,
        child: SizedBox(width: width, child: child),
      ),
    ),
  ),
);

const _title = EmptyTitle(child: Text('Title'));

Offset offsetIn(WidgetTester tester, Finder finder) =>
    tester.getTopLeft(finder) - tester.getTopLeft(find.byType(Empty));

Finder mediaBox() => find.descendant(
  of: find.byType(EmptyMedia),
  matching: find.byType(SizedBox),
);

Finder tile() => find.descendant(
  of: find.byType(EmptyMedia),
  matching: find.byType(DecoratedBox),
);

ShapeDecoration tileOf(WidgetTester tester) =>
    tester.widget<DecoratedBox>(tile().first).decoration as ShapeDecoration;

ShapeBorderClipper tileClipOf(WidgetTester tester) =>
    tester
            .widget<ClipPath>(
              find.descendant(
                of: find.byType(EmptyMedia),
                matching: find.byType(ClipPath),
              ),
            )
            .clipper!
        as ShapeBorderClipper;

ShapeDecoration fillOf(WidgetTester tester) =>
    tester
            .widget<DecoratedBox>(
              find
                  .descendant(
                    of: find.byType(Empty),
                    matching: find.byType(DecoratedBox),
                  )
                  .first,
            )
            .decoration
        as ShapeDecoration;

IdsScope themeOf(WidgetTester tester) =>
    IdsProvider.of(tester.element(find.byType(Empty)));

List<({Path path, Paint paint})> dashesOf(WidgetTester tester) {
  final canvas = TestRecordingCanvas();
  tester
      .widget<CustomPaint>(
        find
            .descendant(
              of: find.byType(Empty),
              matching: find.byType(CustomPaint),
            )
            .first,
      )
      .foregroundPainter!
      .paint(canvas, tester.getSize(find.byType(Empty)));
  return [
    for (final call in canvas.invocations)
      if (call.invocation.memberName == #drawPath)
        (
          path: call.invocation.positionalArguments[0] as Path,
          paint: call.invocation.positionalArguments[1] as Paint,
        ),
  ];
}

List<Offset> pointsOn(List<({Path path, Paint paint})> dashes) => [
  for (final dash in dashes)
    for (final metric in dash.path.computeMetrics())
      for (var at = 0.0; at <= metric.length; at += 0.25)
        metric.getTangentForOffset(at)!.position,
];

double cornerInsetOf(List<({Path path, Paint paint})> dashes) =>
    pointsOn(dashes).map((point) => (point.dx + point.dy) / 2).reduce(math.min);

Path areaInside(List<({Path path, Paint paint})> dashes) =>
    Path()..addPolygon(pointsOn(dashes), true);

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

Offset insideOnlyARoundCorner(Rect bounds, double radius) {
  const whereTheShapesDifferMost = 188 * math.pi / 180;
  final corner = BorderRadius.circular(radius);
  final arcCentre = bounds.topLeft + Offset(radius, radius);
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

double insetOfCorner(double radius) =>
    0.5 + (radius - 0.5) * (1 - math.sqrt1_2);

void main() {
  group('layout', () {
    testWidgets('pads by 32 inside a 1px dashed edge, 16 when tiny', (
      tester,
    ) async {
      await pump(tester, const Empty(children: [_title]));
      expect(offsetIn(tester, mediaBox().first).dy, 33);

      await pump(
        tester,
        const Empty(variant: EmptyVariant.ghost, children: [_title]),
      );
      expect(offsetIn(tester, mediaBox().first).dy, 32);

      await pump(
        tester,
        const Empty(
          variant: EmptyVariant.ghost,
          size: IdsSize.tiny,
          children: [_title],
        ),
      );
      expect(offsetIn(tester, mediaBox().first).dy, 16);
    });

    testWidgets('spaces media, title, description and actions', (tester) async {
      Future<List<double>> gaps(IdsSize size) async {
        await pump(
          tester,
          Empty(
            variant: EmptyVariant.ghost,
            size: size,
            children: const [
              _title,
              EmptyDescription(child: Text('Description')),
              EmptyActions(
                children: [
                  SizedBox(key: ValueKey('act'), width: 40, height: 20),
                ],
              ),
            ],
          ),
        );
        double top(Finder finder) => tester.getTopLeft(finder).dy;
        double bottom(Finder finder) => tester.getBottomLeft(finder).dy;
        return [
          top(find.text('Title')) - bottom(mediaBox().first),
          top(find.text('Description')) - bottom(find.text('Title')),
          top(find.byKey(const ValueKey('act'))) -
              bottom(find.text('Description')),
        ];
      }

      expect(await gaps(IdsSize.standard), [16, 4, 20]);
      expect(await gaps(IdsSize.tiny), [12, 2, 12]);
    });

    testWidgets('centres its content, or starts it', (tester) async {
      await pump(
        tester,
        const Empty(variant: EmptyVariant.ghost, children: [_title]),
      );
      expect(
        tester.getCenter(find.text('Title')).dx,
        tester.getCenter(find.byType(Empty)).dx,
      );

      await pump(
        tester,
        const Empty(
          variant: EmptyVariant.ghost,
          align: EmptyAlign.start,
          children: [_title],
        ),
      );
      expect(offsetIn(tester, find.text('Title')).dx, 32);

      await pump(
        tester,
        const Empty(
          variant: EmptyVariant.ghost,
          align: EmptyAlign.start,
          children: [_title],
        ),
        direction: TextDirection.rtl,
      );
      expect(
        tester.getTopRight(find.byType(Empty)).dx -
            tester.getTopRight(find.text('Title')).dx,
        32,
      );
    });

    testWidgets('keeps the description within 384', (tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 600));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await pump(
        tester,
        Empty(
          children: [
            _title,
            EmptyDescription(child: Text('word ' * 30)),
          ],
        ),
        width: 1200,
      );
      expect(
        tester.getSize(find.byType(EmptyDescription)).width,
        lessThanOrEqualTo(384),
      );
    });

    testWidgets('fits a row without a set width', (tester) async {
      await pump(
        tester,
        const Row(
          children: [
            Empty(children: [_title]),
          ],
        ),
      );
      expect(tester.takeException(), isNull);
    });
  });

  group('media', () {
    testWidgets('draws an inbox tile unless told otherwise', (tester) async {
      await pump(tester, const Empty(children: [_title]));
      expect(find.byIcon(Icons.inbox_outlined), findsOneWidget);
      expect(tester.getSize(mediaBox().first), const Size.square(48));

      await pump(
        tester,
        const Empty(children: [EmptyMedia(hidden: true), _title]),
      );
      expect(find.byIcon(Icons.inbox_outlined), findsNothing);
      expect(offsetIn(tester, find.text('Title')).dy, 33);
    });

    testWidgets('sizes the tile and icon by size and variant', (tester) async {
      double iconSize() =>
          IconTheme.of(tester.element(find.byIcon(Icons.search))).size!;

      await pump(
        tester,
        const Empty(
          children: [
            EmptyMedia(child: Icon(Icons.search)),
            _title,
          ],
        ),
      );
      expect(iconSize(), 24);

      await pump(
        tester,
        const Empty(
          size: IdsSize.tiny,
          children: [
            EmptyMedia(child: Icon(Icons.search)),
            _title,
          ],
        ),
      );
      expect(tester.getSize(mediaBox().first), const Size.square(40));
      expect(iconSize(), 20);

      await pump(
        tester,
        const Empty(
          children: [
            EmptyMedia(
              variant: EmptyMediaVariant.ghost,
              child: Icon(Icons.search),
            ),
            _title,
          ],
        ),
      );
      expect(iconSize(), 48);
    });

    testWidgets('a tile centres what is not an image', (tester) async {
      await pump(
        tester,
        const Empty(
          children: [
            EmptyMedia(
              child: SizedBox.square(key: ValueKey('n'), dimension: 10),
            ),
            _title,
          ],
        ),
      );
      final number = find.byKey(const ValueKey('n'));
      expect(tester.getSize(number), const Size.square(10));
      expect(tester.getCenter(number), tester.getCenter(mediaBox().first));
    });

    testWidgets('an image fills a tile unless it says how to fit', (
      tester,
    ) async {
      Widget empty(Image image) => Empty(
        children: [
          EmptyMedia(child: image),
          _title,
        ],
      );
      await pump(tester, empty(Image(image: HeldImage())));
      expect(tester.widget<Image>(find.byType(Image)).fit, BoxFit.cover);
      expect(
        tester.getSize(find.byType(Image)),
        tester.getSize(mediaBox().first),
      );

      await pump(tester, empty(Image(image: HeldImage(), fit: BoxFit.contain)));
      expect(tester.widget<Image>(find.byType(Image)).fit, BoxFit.contain);
    });

    testWidgets('a soft tile turns to the surface on a soft Empty', (
      tester,
    ) async {
      await pump(tester, const Empty(children: [_title]));
      final theme = themeOf(tester).colors;
      expect(tileOf(tester).color, theme.bgNeutralSoft);

      await pump(
        tester,
        const Empty(variant: EmptyVariant.soft, children: [_title]),
      );
      expect(tileOf(tester).color, theme.surface);
    });

    for (final mode in [IdsMode.light, IdsMode.dark]) {
      testWidgets('reads every colour from its role (${mode.name})', (
        tester,
      ) async {
        Widget empty(EmptyVariant variant, EmptyMediaVariant media) => Empty(
          variant: variant,
          children: [
            EmptyMedia(variant: media, child: const Icon(Icons.search)),
            _title,
            const EmptyDescription(child: Text('Description')),
            const EmptyActions(children: [Text('Action')]),
          ],
        );
        Color? iconColor() =>
            IconTheme.of(tester.element(find.byIcon(Icons.search))).color;
        Color? colorOf(String text) =>
            DefaultTextStyle.of(tester.element(find.text(text))).style.color;

        await pump(
          tester,
          empty(EmptyVariant.outline, EmptyMediaVariant.outline),
          mode: mode,
        );
        final colors = themeOf(tester).colors;
        expect(
          dashesOf(tester).first.paint.color,
          isSameColorAs(colors.borderNeutral),
        );
        expect(tileOf(tester).color, isNull);
        expect(
          (tileOf(tester).shape as OutlinedBorder).side,
          BorderSide(color: colors.borderNeutral),
        );
        expect(iconColor(), colors.onSurface);
        expect(colorOf('Title'), colors.onSurface);
        expect(colorOf('Description'), colors.textNeutral);
        expect(colorOf('Action'), colors.onSurface);

        await pump(
          tester,
          empty(EmptyVariant.soft, EmptyMediaVariant.ghost),
          mode: mode,
        );
        final fill =
            tester
                    .widget<DecoratedBox>(
                      find.descendant(
                        of: find.byType(Empty),
                        matching: find.byType(DecoratedBox),
                      ),
                    )
                    .decoration
                as ShapeDecoration;
        expect(fill.color, colors.bgNeutralSoft);
        expect(tile(), findsNothing);
        expect(iconColor(), colors.textNeutral);
      });
    }
  });

  group('text', () {
    testWidgets('title and description take their type and colour', (
      tester,
    ) async {
      await pump(
        tester,
        const Empty(
          children: [
            _title,
            EmptyDescription(child: Text('Description')),
          ],
        ),
      );
      TextStyle styleOf(String text) =>
          DefaultTextStyle.of(tester.element(find.text(text))).style;
      final theme = IdsProvider.of(tester.element(find.byType(Empty))).colors;
      expect(styleOf('Title').fontSize, 16);
      expect(styleOf('Title').fontWeight, FontWeight.w600);
      expect(styleOf('Title').color, theme.onSurface);
      expect(styleOf('Description').fontSize, 14);
      expect(styleOf('Description').color, theme.textNeutral);
    });

    testWidgets('the title is a heading only when given a level', (
      tester,
    ) async {
      final semantics = tester.ensureSemantics();
      await pump(tester, const Empty(children: [_title]));
      expect(
        tester.getSemantics(find.text('Title')).flagsCollection.isHeader,
        isFalse,
      );

      await pump(
        tester,
        const Empty(
          children: [EmptyTitle(headingLevel: 2, child: Text('Title'))],
        ),
      );
      final node = tester.getSemantics(find.text('Title'));
      expect(node.flagsCollection.isHeader, isTrue);
      expect(node.headingLevel, 2);
      semantics.dispose();
    });
  });

  group('mistakes', () {
    testWidgets('warns once without a title', (tester) async {
      final printed = <String>[];
      final original = debugPrint;
      debugPrint = (message, {wrapWidth}) => printed.add(message!);
      try {
        await pump(tester, const Empty());
        await pump(tester, const Empty());
        await pump(tester, const Empty(children: [_title]));
      } finally {
        debugPrint = original;
      }
      expect(printed, ['[IDS] Empty: give it an EmptyTitle.']);
    });

    testWidgets('every part outside an Empty is a mistake', (tester) async {
      for (final part in const <Widget>[
        EmptyMedia(),
        _title,
        EmptyDescription(child: Text('Description')),
        EmptyActions(),
      ]) {
        await pump(tester, part);
        expect(
          tester.takeException(),
          isAssertionError,
          reason: '${part.runtimeType}',
        );
      }
    });
  });

  testWidgets('follows the theme scale', (tester) async {
    await pump(
      tester,
      const Empty(
        children: [
          EmptyMedia(
            variant: EmptyMediaVariant.outline,
            child: Icon(Icons.search),
          ),
          _title,
          EmptyDescription(
            child: SizedBox(width: double.infinity, child: Text('Description')),
          ),
          EmptyActions(
            children: [
              SizedBox(key: ValueKey('first'), width: 40, height: 20),
              SizedBox(key: ValueKey('second'), width: 40, height: 20),
            ],
          ),
        ],
      ),
      theme: scaledTheme,
      width: 800,
    );
    double top(Finder finder) => tester.getTopLeft(finder).dy;
    double bottom(Finder finder) => tester.getBottomLeft(finder).dy;
    TextStyle styleOf(String text) =>
        DefaultTextStyle.of(tester.element(find.text(text))).style;
    final first = find.byKey(const ValueKey('first'));

    expect(offsetIn(tester, mediaBox().first).dy, 32 * 1.5 + 1);
    expect(tester.getSize(mediaBox().first), const Size.square(48 * 1.5));
    expect(
      IconTheme.of(tester.element(find.byIcon(Icons.search))).size,
      24 * 1.5,
    );
    expect(top(find.text('Title')) - bottom(mediaBox().first), 16 * 1.5);
    expect(top(find.text('Description')) - bottom(find.text('Title')), 4 * 1.5);
    expect(top(first) - bottom(find.text('Description')), 20 * 1.5);
    expect(
      tester.getTopLeft(find.byKey(const ValueKey('second'))).dx -
          tester.getTopRight(first).dx,
      8 * 1.5,
    );
    expect(styleOf('Title').fontSize, 16 * 1.5);
    expect(styleOf('Description').fontSize, 14 * 1.5);
    expect(tester.getSize(find.byType(EmptyDescription)).width, 384);
    expect((tileOf(tester).shape as OutlinedBorder).side.width, 1);

    final dashes = dashesOf(tester);
    final firstDash = dashes[0].path.computeMetrics().single;
    final secondDash = dashes[1].path.computeMetrics().single;
    expect(dashes.first.paint.strokeWidth, 1);
    expect(firstDash.length, closeTo(3, 0.001));
    expect(
      (secondDash.getTangentForOffset(0)!.position -
              firstDash.getTangentForOffset(firstDash.length)!.position)
          .distance,
      closeTo(2, 0.001),
    );
  });

  testWidgets('follows the theme radius', (tester) async {
    await pump(tester, const Empty(children: [_title]), theme: roundedTheme);
    final radius = themeOf(tester).radius;
    expect(
      cornerInsetOf(dashesOf(tester)),
      closeTo(insetOfCorner(radius.container), 0.05),
    );
    expect(
      tileOf(tester).shape,
      RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radius.standard),
      ),
    );
    expect(
      tileClipOf(tester).shape,
      RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radius.standard),
      ),
    );

    await pump(
      tester,
      const Empty(variant: EmptyVariant.soft, children: [_title]),
      theme: roundedTheme,
    );
    expect(
      fillOf(tester).shape,
      RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radius.container),
      ),
    );
  });

  testWidgets('takes the corner shape of the theme', (tester) async {
    for (final (theme, shape, round) in [
      (testTheme, RoundedRectangleBorder.new, true),
      (
        IdsTheme(
          primary: testTheme.primary,
          cornerShape: IdsCornerShape.squircle,
        ),
        RoundedSuperellipseBorder.new,
        false,
      ),
    ]) {
      await pump(
        tester,
        const Empty(
          children: [
            EmptyMedia(
              variant: EmptyMediaVariant.outline,
              child: Icon(Icons.search),
            ),
            _title,
          ],
        ),
        theme: theme,
      );
      final ids = themeOf(tester);
      final tileBounds = Offset.zero & tester.getSize(mediaBox().first);
      final lineBounds = (Offset.zero & tester.getSize(find.byType(Empty)))
          .deflate(0.5);

      expect(
        tileOf(tester).shape,
        shape(
          borderRadius: BorderRadius.circular(ids.radius.standard),
          side: BorderSide(color: ids.colors.borderNeutral),
        ),
      );
      expect(
        tileClipOf(tester)
            .getClip(tileBounds.size)
            .contains(insideOnlyARoundCorner(tileBounds, ids.radius.standard)),
        round,
      );
      expect(
        areaInside(dashesOf(tester)).contains(
          insideOnlyARoundCorner(lineBounds, ids.radius.container - 0.5),
        ),
        round,
      );

      await pump(
        tester,
        const Empty(variant: EmptyVariant.soft, children: [_title]),
        theme: theme,
      );
      expect(
        fillOf(tester).shape,
        shape(borderRadius: BorderRadius.circular(ids.radius.container)),
      );
    }
  });

  testWidgets('has no role of its own', (tester) async {
    final semantics = tester.ensureSemantics();
    await pump(tester, const Empty(children: [_title]));
    final node = tester.getSemantics(find.text('Title'));
    expect(node.flagsCollection.isLiveRegion, isFalse);
    expect(node.role, SemanticsRole.none);
    semantics.dispose();
  });
}
