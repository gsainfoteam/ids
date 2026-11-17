import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_kept.dart';
import 'test_theme.dart';
import 'test_image.dart';

Future<void> pump(
  WidgetTester tester,
  Widget child, {
  IdsTheme theme = testTheme,
  IdsMode? mode,
}) => tester.pumpWidget(
  WidgetsApp(
    color: const Color(0xFFFFFFFF),
    builder: (context, _) => IdsProvider(
      theme: theme,
      mode: mode,
      child: FocusScope(
        autofocus: true,
        child: Align(
          alignment: Alignment.topLeft,
          child: SizedBox(width: 300, child: child),
        ),
      ),
    ),
  ),
);

const _box = SizedBox(height: 20);

const _squircleTheme = IdsTheme(
  primary: IdsThemeColor.seed(Color(0xFF155DFC)),
  cornerShape: IdsCornerShape.squircle,
);

Offset offsetIn(WidgetTester tester, Finder finder) =>
    tester.getTopLeft(finder) - tester.getTopLeft(find.byType(Card));

ShapeDecoration surfaceOf(WidgetTester tester) =>
    tester
            .widget<AnimatedContainer>(
              find.descendant(
                of: find.byType(Card),
                matching: find.byType(AnimatedContainer),
              ),
            )
            .decoration!
        as ShapeDecoration;

ShapeDecoration edgeOf(WidgetTester tester) =>
    tester
            .widget<AnimatedContainer>(
              find.descendant(
                of: find.byType(Card),
                matching: find.byType(AnimatedContainer),
              ),
            )
            .foregroundDecoration!
        as ShapeDecoration;

BorderSide sideOf(ShapeDecoration decoration) =>
    (decoration.shape as OutlinedBorder).side;

BorderRadiusGeometry cornerOf(ShapeDecoration decoration) =>
    switch (decoration.shape) {
      RoundedRectangleBorder(:final borderRadius) => borderRadius,
      RoundedSuperellipseBorder(:final borderRadius) => borderRadius,
      final shape => throw StateError('$shape has no corner radius'),
    };

Offset insideTheRoundCornerOnly(Size size, double radius) {
  final squircle = RoundedSuperellipseBorder(
    borderRadius: BorderRadius.circular(radius),
  ).getOuterPath(Offset.zero & size);
  var inset = 0.0;
  while (!squircle.contains(Offset(radius, inset))) {
    inset += 0.01;
  }
  return Offset(radius, inset / 2);
}

Border lineOf(WidgetTester tester, Finder region) =>
    (tester
                    .widget<DecoratedBox>(
                      find
                          .ancestor(
                            of: region,
                            matching: find.byType(DecoratedBox),
                          )
                          .first,
                    )
                    .decoration
                as BoxDecoration)
            .border!
        as Border;

IdsColors themeOf(WidgetTester tester) =>
    IdsProvider.of(tester.element(find.byType(Card))).colors;

void main() {
  group('layout', () {
    testWidgets('pads by 16 and spaces regions by 16', (tester) async {
      await pump(
        tester,
        const Card(
          children: [
            CardContent(key: ValueKey('a'), child: _box),
            CardContent(key: ValueKey('b'), child: _box),
          ],
        ),
      );
      expect(
        offsetIn(tester, find.byKey(const ValueKey('a'))),
        const Offset(16, 16),
      );
      expect(
        offsetIn(tester, find.byKey(const ValueKey('b'))),
        const Offset(16, 52),
      );
      expect(tester.getSize(find.byType(Card)), const Size(300, 88));
    });

    testWidgets('pads and spaces by 12 when tiny', (tester) async {
      await pump(
        tester,
        const Card(
          size: IdsSize.tiny,
          children: [
            CardContent(key: ValueKey('a'), child: _box),
            CardContent(key: ValueKey('b'), child: _box),
          ],
        ),
      );
      expect(
        offsetIn(tester, find.byKey(const ValueKey('a'))),
        const Offset(12, 12),
      );
      expect(
        offsetIn(tester, find.byKey(const ValueKey('b'))),
        const Offset(12, 44),
      );
    });

    testWidgets('media reaches the edges it touches', (tester) async {
      await pump(
        tester,
        const Card(
          children: [
            CardMedia(key: ValueKey('top'), child: _box),
            CardContent(child: _box),
            CardMedia(key: ValueKey('middle'), child: _box),
            CardContent(child: _box),
            CardMedia(key: ValueKey('bottom'), child: _box),
          ],
        ),
      );
      final top = find.byKey(const ValueKey('top'));
      final bottom = find.byKey(const ValueKey('bottom'));
      expect(offsetIn(tester, top), Offset.zero);
      expect(tester.getSize(top).width, 300);
      expect(offsetIn(tester, find.byKey(const ValueKey('middle'))).dx, 0);
      expect(
        tester.getBottomLeft(bottom),
        tester.getBottomLeft(find.byType(Card)),
      );
    });

    testWidgets('a divider spans the card and keeps the gap on its side', (
      tester,
    ) async {
      await pump(
        tester,
        const Card(
          children: [
            CardHeader(key: ValueKey('h'), divider: true, children: [_box]),
            CardContent(key: ValueKey('c'), child: _box),
          ],
        ),
      );
      final line = find
          .ancestor(
            of: find.byKey(const ValueKey('h')),
            matching: find.byType(DecoratedBox),
          )
          .first;
      expect(tester.getSize(line).width, 300);
      expect(offsetIn(tester, find.byKey(const ValueKey('h'))).dx, 16);
      expect(
        offsetIn(tester, find.byKey(const ValueKey('c'))).dy,
        16 + 20 + 16 + 1 + 16,
      );
    });

    testWidgets('the action sits at the top end of the header', (tester) async {
      await pump(
        tester,
        const Card(
          children: [
            CardHeader(
              children: [
                CardTitle(child: Text('Title')),
                CardDescription(child: Text('Description')),
                CardAction(
                  child: SizedBox.square(key: ValueKey('act'), dimension: 24),
                ),
              ],
            ),
          ],
        ),
      );
      expect(
        offsetIn(tester, find.byKey(const ValueKey('act'))),
        const Offset(300 - 16 - 24, 16),
      );
      expect(
        offsetIn(tester, find.text('Description')).dy -
            tester.getBottomLeft(find.text('Title')).dy +
            tester.getTopLeft(find.byType(Card)).dy,
        4,
      );
    });

    testWidgets('shrinks to its content where the width is not set', (
      tester,
    ) async {
      await pump(
        tester,
        const Row(
          children: [
            Card(
              children: [CardContent(child: SizedBox(width: 100, height: 20))],
            ),
          ],
        ),
      );
      expect(tester.takeException(), isNull);
      expect(tester.getSize(find.byType(Card)), const Size(132, 52));

      await pump(
        tester,
        const Row(
          children: [
            Card(
              children: [
                CardHeader(
                  children: [
                    CardTitle(child: SizedBox(width: 100, height: 20)),
                    CardAction(
                      child: SizedBox.square(
                        key: ValueKey('act'),
                        dimension: 24,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      );
      expect(tester.takeException(), isNull);
      expect(tester.getSize(find.byType(Card)).width, 16 + 100 + 4 + 24 + 16);
    });

    testWidgets('two contents share what is left without pushing out', (
      tester,
    ) async {
      await pump(
        tester,
        const SizedBox(
          height: 300,
          child: Card(
            children: [
              CardContent(child: SizedBox(height: 150)),
              CardContent(child: SizedBox(height: 20)),
              CardFooter(
                children: [
                  SizedBox(key: ValueKey('foot'), width: 40, height: 20),
                ],
              ),
            ],
          ),
        ),
      );
      expect(
        tester.getBottomLeft(find.byKey(const ValueKey('foot'))).dy -
            tester.getTopLeft(find.byType(Card)).dy,
        300 - 16,
      );
      final contents = find.byType(CardContent);
      expect(tester.getSize(contents.first).height, 150);
      expect(
        tester.getSize(contents.last).height,
        300 - 16 - 150 - 16 - 16 - 20 - 16,
      );
    });

    testWidgets('lines up on a baseline in a row', (tester) async {
      await pump(
        tester,
        IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              const Text('Label'),
              Expanded(
                child: Card(children: const [CardContent(child: Text('Body'))]),
              ),
            ],
          ),
        ),
      );
      expect(tester.takeException(), isNull);
      expect(
        tester.getTopLeft(find.byType(Card)).dy,
        lessThan(tester.getTopLeft(find.text('Label')).dy),
      );
    });

    testWidgets('a card that starts with media lines up on its first text', (
      tester,
    ) async {
      await pump(
        tester,
        const IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text('Label'),
              Expanded(
                child: Card(
                  children: [
                    CardMedia(child: SizedBox(height: 60)),
                    CardHeader(children: [CardTitle(child: Text('Title'))]),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
      expect(tester.takeException(), isNull);
      expect(
        tester.getTopLeft(find.text('Label')).dy,
        greaterThan(tester.getTopLeft(find.byType(Card)).dy + 60),
      );
    });

    testWidgets('content takes the height a taller card leaves over', (
      tester,
    ) async {
      await pump(
        tester,
        const SizedBox(
          height: 300,
          child: Card(
            children: [
              CardContent(child: _box),
              CardFooter(
                children: [
                  SizedBox(key: ValueKey('foot'), width: 40, height: 20),
                ],
              ),
            ],
          ),
        ),
      );
      expect(tester.getSize(find.byType(Card)).height, 300);
      expect(
        offsetIn(tester, find.byKey(const ValueKey('foot'))).dy,
        300 - 16 - 20,
      );
    });

    testWidgets('cards in a row of equal height line their footers up', (
      tester,
    ) async {
      Widget card(String name, double contentHeight) => Expanded(
        child: Card(
          children: [
            CardContent(child: SizedBox(height: contentHeight)),
            CardFooter(
              children: [SizedBox(key: ValueKey(name), width: 20, height: 20)],
            ),
          ],
        ),
      );
      await pump(
        tester,
        IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: 8,
            children: [card('short', 20), card('tall', 120)],
          ),
        ),
      );
      expect(tester.takeException(), isNull);
      expect(
        tester.getBottomLeft(find.byKey(const ValueKey('short'))).dy,
        tester.getBottomLeft(find.byKey(const ValueKey('tall'))).dy,
      );
      expect(
        tester.getSize(find.byType(Card).first).height,
        16 + 120 + 16 + 20 + 16,
      );
    });

    testWidgets('the footer lines its children up 8 apart', (tester) async {
      await pump(
        tester,
        const Card(
          children: [
            CardFooter(
              children: [
                SizedBox(width: 40, height: 20, key: ValueKey('a')),
                SizedBox(width: 40, height: 20, key: ValueKey('b')),
              ],
            ),
          ],
        ),
      );
      expect(offsetIn(tester, find.byKey(const ValueKey('b'))).dx, 16 + 40 + 8);
    });
  });

  group('scale', () {
    testWidgets('padding, gaps and type grow with the theme scale', (
      tester,
    ) async {
      await pump(
        tester,
        const Card(
          children: [
            CardHeader(
              key: ValueKey('header'),
              children: [
                CardTitle(child: Text('Title')),
                CardDescription(child: Text('Description')),
              ],
            ),
            CardContent(child: Text('Body')),
            CardFooter(
              children: [
                SizedBox(width: 40, height: 20, key: ValueKey('a')),
                SizedBox(width: 40, height: 20, key: ValueKey('b')),
              ],
            ),
          ],
        ),
        theme: scaledTheme,
      );
      final card = tester.getRect(find.byType(Card));
      final title = tester.getRect(find.text('Title'));
      final description = tester.getRect(find.text('Description'));
      final body = tester.getRect(find.text('Body'));
      final first = tester.getRect(find.byKey(const ValueKey('a')));
      final second = tester.getRect(find.byKey(const ValueKey('b')));
      expect(title.topLeft - card.topLeft, const Offset(24, 24));
      expect(description.top - title.bottom, 6);
      expect(
        body.top - tester.getRect(find.byKey(const ValueKey('header'))).bottom,
        24,
      );
      expect(first.top - body.bottom, 24);
      expect(second.left - first.right, 12);
      expect(card.bottom - first.bottom, 24);

      double sizeOf(String text) =>
          DefaultTextStyle.of(tester.element(find.text(text))).style.fontSize!;
      expect(sizeOf('Title'), 24);
      expect(sizeOf('Description'), 21);
      expect(sizeOf('Body'), 21);
      expect(sideOf(edgeOf(tester)).width, 1);

      await pump(
        tester,
        const Card(
          children: [
            CardHeader(
              key: ValueKey('header'),
              divider: true,
              children: [_box],
            ),
            CardContent(key: ValueKey('content'), child: _box),
            CardFooter(
              key: ValueKey('footer'),
              divider: true,
              children: [_box],
            ),
          ],
        ),
        theme: scaledTheme,
      );
      final header = find.byKey(const ValueKey('header'));
      final footer = find.byKey(const ValueKey('footer'));
      final content = tester.getRect(find.byKey(const ValueKey('content')));
      expect(lineOf(tester, header).bottom.width, 1);
      expect(lineOf(tester, footer).top.width, 1);
      expect(content.top - tester.getRect(header).bottom, 24 + 1 + 24);
      expect(tester.getRect(footer).top - content.bottom, 24 + 1 + 24);
    });

    testWidgets('a tiny card scales its 12 and its caption type', (
      tester,
    ) async {
      await pump(
        tester,
        const Card(
          size: IdsSize.tiny,
          children: [
            CardHeader(
              children: [
                CardTitle(child: Text('Title')),
                CardDescription(child: Text('Description')),
              ],
            ),
          ],
        ),
        theme: scaledTheme,
      );
      expect(offsetIn(tester, find.text('Title')), const Offset(18, 18));
      double sizeOf(String text) =>
          DefaultTextStyle.of(tester.element(find.text(text))).style.fontSize!;
      expect(sizeOf('Title'), 21);
      expect(sizeOf('Description'), 18);
    });
  });

  group('look', () {
    testWidgets('title and description take their type and colour', (
      tester,
    ) async {
      await pump(
        tester,
        const Card(
          children: [
            CardHeader(
              children: [
                CardTitle(child: Text('Title')),
                CardDescription(child: Text('Description')),
              ],
            ),
          ],
        ),
      );
      TextStyle styleOf(String text) =>
          DefaultTextStyle.of(tester.element(find.text(text))).style;
      expect(
        styleOf('Title').fontSize,
        IdsTypography.subtitleS2Semibold.fontSize,
      );
      expect(
        styleOf('Title').fontWeight,
        IdsTypography.subtitleS2Semibold.fontWeight,
      );
      expect(styleOf('Description').color, themeOf(tester).textNeutral);
    });

    testWidgets('outline, soft and ghost fill the surface', (tester) async {
      await pump(tester, const Card(children: [CardContent(child: _box)]));
      final theme = themeOf(tester);
      expect(surfaceOf(tester).color, theme.surface);
      expect(surfaceOf(tester).shadows, isNotEmpty);
      expect(cornerOf(surfaceOf(tester)), BorderRadius.circular(16));

      await pump(
        tester,
        const Card(
          variant: CardVariant.soft,
          children: [CardContent(child: _box)],
        ),
      );
      expect(surfaceOf(tester).color, theme.bgNeutralSoft);
      expect(surfaceOf(tester).shadows, isEmpty);

      await pump(
        tester,
        const Card(
          variant: CardVariant.ghost,
          children: [CardContent(child: _box)],
        ),
      );
      expect(surfaceOf(tester).color!.a, 0);
    });

    for (final mode in [IdsMode.light, IdsMode.dark]) {
      testWidgets('reads every colour from its role (${mode.name})', (
        tester,
      ) async {
        Widget card(CardVariant variant) => Card(
          variant: variant,
          children: const [
            CardHeader(
              key: ValueKey('header'),
              divider: true,
              children: [
                CardTitle(child: Text('Title')),
                CardDescription(child: Text('Description')),
              ],
            ),
            CardContent(child: Text('Body')),
            CardFooter(key: ValueKey('footer'), divider: true),
          ],
        );
        Color? colorOf(String text) =>
            DefaultTextStyle.of(tester.element(find.text(text))).style.color;

        await pump(tester, card(CardVariant.outline), mode: mode);
        final colors = themeOf(tester);
        expect(surfaceOf(tester).color, colors.surface);
        expect(sideOf(edgeOf(tester)), BorderSide(color: colors.borderNeutral));
        expect(
          lineOf(tester, find.byKey(const ValueKey('header'))),
          Border(bottom: BorderSide(color: colors.borderNeutral)),
        );
        expect(
          lineOf(tester, find.byKey(const ValueKey('footer'))),
          Border(top: BorderSide(color: colors.borderNeutral)),
        );
        expect(colorOf('Title'), colors.onSurface);
        expect(colorOf('Description'), colors.textNeutral);
        expect(colorOf('Body'), colors.onSurface);

        await pump(tester, card(CardVariant.soft), mode: mode);
        expect(surfaceOf(tester).color, colors.bgNeutralSoft);
      });
    }

    testWidgets('the corner follows the theme radius', (tester) async {
      await pump(
        tester,
        const Card(children: [CardContent(child: _box)]),
        theme: roundedTheme,
      );
      final corner = BorderRadius.circular(
        IdsProvider.of(tester.element(find.byType(Card))).radius.container,
      );
      expect(cornerOf(surfaceOf(tester)), corner);
      expect(cornerOf(edgeOf(tester)), corner);
    });

    testWidgets('the surface, its edge and its clip take the theme corner '
        'shape', (tester) async {
      const card = Card(
        children: [
          CardMedia(child: _box),
          CardContent(child: _box),
        ],
      );
      Path clipOf() {
        final clip = find
            .descendant(of: find.byType(Card), matching: find.byType(ClipPath))
            .first;
        return tester
            .widget<ClipPath>(clip)
            .clipper!
            .getClip(tester.getSize(clip));
      }

      await pump(tester, card);
      final corner = cornerOf(surfaceOf(tester));
      final point = insideTheRoundCornerOnly(
        tester.getSize(find.byType(Card)),
        IdsProvider.of(tester.element(find.byType(Card))).radius.container,
      );
      expect(point.dy, greaterThan(0));
      expect(surfaceOf(tester).shape, isA<RoundedRectangleBorder>());
      expect(edgeOf(tester).shape, isA<RoundedRectangleBorder>());
      expect(cornerOf(edgeOf(tester)), corner);
      expect(clipOf().contains(point), isTrue);

      await pump(tester, card, theme: _squircleTheme);
      await tester.pumpAndSettle();
      expect(surfaceOf(tester).shape, isA<RoundedSuperellipseBorder>());
      expect(edgeOf(tester).shape, isA<RoundedSuperellipseBorder>());
      expect(cornerOf(surfaceOf(tester)), corner);
      expect(cornerOf(edgeOf(tester)), corner);
      expect(clipOf().contains(point), isFalse);
    });

    testWidgets('every part outside a card is a mistake', (tester) async {
      for (final part in const <Widget>[
        CardHeader(),
        CardTitle(child: Text('Title')),
        CardDescription(child: Text('Description')),
        CardAction(child: _box),
        CardContent(child: _box),
        CardFooter(),
        CardMedia(child: _box),
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

  group('pressable', () {
    testWidgets('opens from anywhere but an inner button', (tester) async {
      var opened = 0;
      var liked = 0;
      await pump(
        tester,
        Card(
          onPressed: () => opened++,
          children: [
            const CardContent(child: _box),
            CardFooter(
              children: [
                GestureDetector(
                  key: const ValueKey('like'),
                  behavior: HitTestBehavior.opaque,
                  onTap: () => liked++,
                  child: const SizedBox(width: 40, height: 20),
                ),
              ],
            ),
          ],
        ),
      );
      await tester.tapAt(
        tester.getTopLeft(find.byType(Card)) + const Offset(4, 4),
      );
      expect(opened, 1);

      await tester.tap(find.byKey(const ValueKey('like')));
      expect((opened, liked), (1, 1));
    });

    testWidgets('opens from the keyboard', (tester) async {
      var opened = 0;
      await pump(
        tester,
        Card(
          onPressed: () => opened++,
          children: const [CardContent(child: _box)],
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      expect(opened, 1);
    });

    testWidgets('lays a 4% layer on hover and 8% while pressed', (
      tester,
    ) async {
      await pump(
        tester,
        Card(
          onPressed: () {},
          children: const [CardContent(child: _box)],
        ),
      );
      final theme = themeOf(tester);
      final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.byType(Card)));
      await tester.pumpAndSettle();
      expect(
        surfaceOf(tester).color,
        Color.alphaBlend(
          theme.onSurface.withValues(alpha: 0.04),
          theme.surface,
        ),
      );

      await mouse.down(tester.getCenter(find.byType(Card)));
      await tester.pumpAndSettle();
      expect(
        surfaceOf(tester).color,
        Color.alphaBlend(
          theme.onSurface.withValues(alpha: 0.08),
          theme.surface,
        ),
      );
      await mouse.up();
    });

    testWidgets('the ring never moves the card or what follows it', (
      tester,
    ) async {
      await pump(
        tester,
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Card(
              onPressed: () {},
              children: const [CardContent(child: _box)],
            ),
            const SizedBox(key: ValueKey('below'), height: 10),
          ],
        ),
      );
      final size = tester.getSize(find.byType(Card));
      final below = tester.getTopLeft(find.byKey(const ValueKey('below')));
      final content = tester.getTopLeft(find.byWidget(_box));
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      for (var frame = 0; frame < 10; frame++) {
        await tester.pump(const Duration(milliseconds: 20));
        expect(tester.getSize(find.byType(Card)), size);
        expect(tester.getTopLeft(find.byKey(const ValueKey('below'))), below);
        expect(tester.getTopLeft(find.byWidget(_box)), content);
      }
    });

    testWidgets('rings the card and its border when focused by keyboard', (
      tester,
    ) async {
      await pump(
        tester,
        Card(
          onPressed: () {},
          children: const [CardContent(child: _box)],
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();
      final theme = themeOf(tester);
      expect(
        sideOf(surfaceOf(tester)),
        BorderSide(
          color: theme.borderPrimary.withValues(alpha: 0.4),
          width: 3,
          strokeAlign: BorderSide.strokeAlignOutside,
        ),
      );
      expect(sideOf(edgeOf(tester)).color, theme.borderPrimary);
    });

    testWidgets('a focused ghost card stays clear inside its ring', (
      tester,
    ) async {
      await pump(
        tester,
        Card(
          variant: CardVariant.ghost,
          onPressed: () {},
          children: const [CardContent(child: _box)],
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();
      expect(surfaceOf(tester).color!.a, 0);
      expect(surfaceOf(tester).shadows, isEmpty);
    });

    testWidgets('a disabled card drops the hover layer', (tester) async {
      Widget card({required bool disabled}) => Card(
        onPressed: () {},
        disabled: disabled,
        children: const [CardContent(child: _box)],
      );
      await pump(tester, card(disabled: false));
      final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.byType(Card)));
      await tester.pumpAndSettle();

      await pump(tester, card(disabled: true));
      await tester.pumpAndSettle();
      expect(surfaceOf(tester).color, themeOf(tester).surface);
    });

    testWidgets('a disabled card fades and ignores presses', (tester) async {
      var opened = 0;
      await pump(
        tester,
        Card(
          onPressed: () => opened++,
          disabled: true,
          children: const [CardContent(child: _box)],
        ),
      );
      await tester.tap(find.byType(Card));
      expect(opened, 0);
      expect(
        tester
            .widget<Opacity>(
              find.descendant(
                of: find.byType(Card),
                matching: find.byType(Opacity),
              ),
            )
            .opacity,
        0.5,
      );
    });

    testWidgets('without a header the button is named by its content', (
      tester,
    ) async {
      final semantics = tester.ensureSemantics();
      await pump(
        tester,
        Card(
          onPressed: () {},
          children: const [CardContent(child: Text('Body'))],
        ),
      );
      final button = tester.getSemantics(find.byType(Card));
      expect(button.flagsCollection.isButton, isTrue);
      expect(button.label, 'Body');
      semantics.dispose();
    });

    testWidgets('is one button named by its header', (tester) async {
      final semantics = tester.ensureSemantics();
      await pump(
        tester,
        Card(
          onPressed: () {},
          children: const [
            CardHeader(
              children: [
                CardTitle(child: Text('Title')),
                CardDescription(child: Text('Description')),
              ],
            ),
            CardContent(child: Text('Body')),
          ],
        ),
      );
      final button = tester.getSemantics(find.byType(Card));
      expect(button.flagsCollection.isButton, isTrue);
      expect(button.label, 'Title\nDescription');
      expect(find.bySemanticsLabel('Body'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('an image in media fills it unless it says how to fit', (
      tester,
    ) async {
      await pump(
        tester,
        Card(
          children: [
            CardMedia(
              child: SizedBox(height: 40, child: Image(image: HeldImage())),
            ),
          ],
        ),
      );
      expect(tester.widget<Image>(find.byType(Image)).fit, isNull);

      await pump(
        tester,
        Card(
          children: [CardMedia(child: Image(image: HeldImage()))],
        ),
      );
      expect(tester.widget<Image>(find.byType(Image)).fit, BoxFit.cover);

      await pump(
        tester,
        Card(
          children: [
            CardMedia(
              child: Image(image: HeldImage(), fit: BoxFit.contain),
            ),
          ],
        ),
      );
      expect(tester.widget<Image>(find.byType(Image)).fit, BoxFit.contain);
    });

    testWidgets('media keeps its own name beside the header', (tester) async {
      final semantics = tester.ensureSemantics();
      await pump(
        tester,
        Card(
          onPressed: () {},
          children: [
            CardMedia(
              child: Semantics(image: true, label: 'A cabin', child: _box),
            ),
            const CardHeader(children: [CardTitle(child: Text('Title'))]),
          ],
        ),
      );
      expect(tester.getSemantics(find.byType(Card)).label, 'Title');
      expect(find.bySemanticsLabel('A cabin'), findsOneWidget);
      semantics.dispose();
    });
  });

  testWidgets('keyed content keeps its state when a header appears above it', (
    tester,
  ) async {
    Widget card({required bool header}) => Card(
      children: [
        if (header)
          const CardHeader(children: [CardTitle(child: Text('Title'))]),
        const CardContent(key: ValueKey('content'), child: Kept()),
      ],
    );
    await pump(tester, card(header: false));
    final kept = tester.state(find.byType(Kept));

    await pump(tester, card(header: true));
    expect(tester.state(find.byType(Kept)), same(kept));
  });
}
