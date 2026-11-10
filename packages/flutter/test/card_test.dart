import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  WidgetsApp(
    color: const Color(0xFFFFFFFF),
    builder: (context, _) => ThemeProvider(
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

Offset offsetIn(WidgetTester tester, Finder finder) =>
    tester.getTopLeft(finder) - tester.getTopLeft(find.byType(Card));

BoxDecoration surfaceOf(WidgetTester tester) =>
    tester
            .widget<AnimatedContainer>(
              find.descendant(
                of: find.byType(Card),
                matching: find.byType(AnimatedContainer),
              ),
            )
            .decoration!
        as BoxDecoration;

IdsTheme themeOf(WidgetTester tester) =>
    ThemeProvider.of(tester.element(find.byType(Card)));

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
        16 + 20 + 16 + 16,
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
      expect(styleOf('Description').color, themeOf(tester).onMuted);
    });

    testWidgets('outline, soft and ghost fill the surface', (tester) async {
      await pump(tester, const Card(children: [CardContent(child: _box)]));
      final theme = themeOf(tester);
      expect(surfaceOf(tester).color, theme.surface);
      expect(surfaceOf(tester).boxShadow, isNotEmpty);
      expect(surfaceOf(tester).borderRadius, BorderRadius.circular(16));

      await pump(
        tester,
        const Card(
          variant: CardVariant.soft,
          children: [CardContent(child: _box)],
        ),
      );
      expect(surfaceOf(tester).color, theme.muted);
      expect(surfaceOf(tester).boxShadow, isEmpty);

      await pump(
        tester,
        const Card(
          variant: CardVariant.ghost,
          children: [CardContent(child: _box)],
        ),
      );
      expect(surfaceOf(tester).color!.a, 0);
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
        surfaceOf(tester).border,
        Border.all(
          color: theme.primary.withValues(alpha: 0.4),
          width: 3,
          strokeAlign: BorderSide.strokeAlignOutside,
        ),
      );
      final edge =
          tester
                  .widget<AnimatedContainer>(
                    find.descendant(
                      of: find.byType(Card),
                      matching: find.byType(AnimatedContainer),
                    ),
                  )
                  .foregroundDecoration!
              as BoxDecoration;
      expect((edge.border! as Border).top.color, theme.primary);
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
      expect(surfaceOf(tester).boxShadow, isEmpty);
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
  });
}
