import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart' show Icons;
import 'dart:ui' show Tristate;

import 'package:flutter/rendering.dart' show debugCheckIntrinsicSizes;
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
}) => tester.pumpWidget(
  WidgetsApp(
    color: const Color(0xFFFFFFFF),
    builder: (context, _) => Directionality(
      textDirection: direction,
      child: IdsProvider(
        theme: theme,
        child: Align(
          alignment: Alignment.topLeft,
          child: SizedBox(width: 300, child: child),
        ),
      ),
    ),
  ),
);

const _content = ItemContent(children: [ItemTitle(child: Text('Title'))]);

const scaled = IdsTheme(
  primary: IdsThemeColor.seed(Color(0xFF155DFC)),
  scale: 1.5,
);

const squircle = IdsTheme(
  primary: IdsThemeColor.seed(Color(0xFF155DFC)),
  cornerShape: IdsCornerShape.squircle,
);

Offset offsetIn(WidgetTester tester, Finder finder, [Finder? item]) =>
    tester.getTopLeft(finder) - tester.getTopLeft(item ?? find.byType(Item));

AnimatedContainer containerOf(WidgetTester tester, [Finder? item]) =>
    tester.widget(
      find
          .descendant(
            of: item ?? find.byType(Item),
            matching: find.byType(AnimatedContainer),
          )
          .first,
    );

ShapeDecoration surfaceOf(WidgetTester tester, [Finder? item]) =>
    containerOf(tester, item).decoration! as ShapeDecoration;

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

IdsColors themeOf(WidgetTester tester) =>
    IdsProvider.of(tester.element(find.byType(Item).first)).colors;

void main() {
  group('size', () {
    testWidgets('height, padding and corner follow size', (tester) async {
      for (final (size, height, pad, radius) in [
        (IdsSize.standard, 56.0, 12.0, 16.0),
        (IdsSize.tiny, 40.0, 8.0, 16.0),
      ]) {
        await pump(
          tester,
          Item(
            size: size,
            children: const [
              ItemContent(children: [SizedBox(key: ValueKey('c'), height: 4)]),
            ],
          ),
        );
        final label = '$size';
        expect(tester.getSize(find.byType(Item)).height, height, reason: label);
        expect(
          offsetIn(tester, find.byKey(const ValueKey('c'))).dx,
          pad,
          reason: label,
        );
        expect(
          cornerOf(surfaceOf(tester)),
          BorderRadius.circular(radius),
          reason: label,
        );
      }
    });

    testWidgets('a corner under the container corner is the control corner '
        'plus the padding', (tester) async {
      await pump(
        tester,
        const Item(size: IdsSize.tiny, children: [_content]),
        theme: const IdsTheme(
          primary: IdsThemeColor.seed(Color(0xFF155DFC)),
          radius: 18,
        ),
      );
      final radius = IdsProvider.of(tester.element(find.byType(Item))).radius;
      expect(radius.standard + 8, lessThan(radius.container));
      expect(cornerOf(surfaceOf(tester)), BorderRadius.circular(18 + 8));
    });
  });

  group('layout', () {
    testWidgets('media, content and actions sit in a row', (tester) async {
      await pump(
        tester,
        const Item(
          children: [
            ItemMedia(
              variant: ItemVariant.soft,
              child: Icon(Icons.inbox_outlined),
            ),
            _content,
            ItemActions(
              children: [SizedBox(key: ValueKey('act'), width: 24, height: 24)],
            ),
          ],
        ),
      );
      expect(tester.getSize(find.byType(ItemMedia)), const Size.square(32));
      expect(offsetIn(tester, find.byType(ItemContent)).dx, 12 + 32 + 12);
      expect(
        offsetIn(tester, find.byKey(const ValueKey('act'))).dx,
        300 - 12 - 24,
      );
      expect(
        tester.getSize(find.byType(ItemContent)).width,
        300 - 12 - 32 - 12 - 12 - 24 - 12,
      );
    });

    testWidgets('a tile centres what is not an image', (tester) async {
      await pump(
        tester,
        const Item(
          children: [
            ItemMedia(
              variant: ItemVariant.soft,
              child: SizedBox.square(key: ValueKey('n'), dimension: 10),
            ),
            _content,
          ],
        ),
      );
      final number = find.byKey(const ValueKey('n'));
      expect(tester.getSize(number), const Size.square(10));
      expect(
        tester.getCenter(number),
        tester.getCenter(find.byType(ItemMedia)),
      );
    });

    testWidgets('an image fills a tile unless it says how to fit', (
      tester,
    ) async {
      Widget row(Image image) => Item(
        children: [
          ItemMedia(variant: ItemVariant.soft, child: image),
          _content,
        ],
      );
      await pump(tester, row(Image(image: HeldImage())));
      expect(tester.widget<Image>(find.byType(Image)).fit, BoxFit.cover);
      expect(
        tester.getSize(find.byType(Image)),
        tester.getSize(find.byType(ItemMedia)),
      );

      await pump(tester, row(Image(image: HeldImage(), fit: BoxFit.contain)));
      expect(tester.widget<Image>(find.byType(Image)).fit, BoxFit.contain);
    });

    testWidgets('actions go to the end without content', (tester) async {
      await pump(
        tester,
        const Item(
          children: [
            ItemMedia(child: Icon(Icons.inbox_outlined)),
            ItemActions(
              children: [SizedBox(key: ValueKey('act'), width: 24, height: 24)],
            ),
          ],
        ),
      );
      expect(
        offsetIn(tester, find.byKey(const ValueKey('act'))).dx,
        300 - 12 - 24,
      );
    });

    testWidgets('a bare icon keeps its size and its centre on the row', (
      tester,
    ) async {
      Widget item({required bool described}) => Item(
        children: [
          const ItemMedia(child: Icon(Icons.inbox_outlined)),
          ItemContent(
            children: [
              const ItemTitle(child: Text('Title')),
              if (described) const ItemDescription(child: Text('one\ntwo')),
            ],
          ),
        ],
      );

      for (final described in [false, true]) {
        await pump(tester, item(described: described));
        final row = tester.getSize(find.byType(Item)).height;
        final media = offsetIn(tester, find.byType(ItemMedia));
        expect(tester.getSize(find.byType(ItemMedia)), const Size.square(16));
        expect(media.dx, 12, reason: 'described: $described');
        expect(media.dy, (row - 16) / 2, reason: 'described: $described');
      }
    });

    testWidgets('a second content keeps its own width', (tester) async {
      await pump(
        tester,
        const Item(
          children: [
            _content,
            ItemContent(children: [SizedBox(key: ValueKey('t'), width: 40)]),
          ],
        ),
      );
      expect(tester.getSize(find.byType(ItemContent).last).width, 40);
      expect(
        offsetIn(tester, find.byKey(const ValueKey('t'))).dx,
        300 - 12 - 40,
      );
    });

    testWidgets('right-to-left text puts the media on the right', (
      tester,
    ) async {
      await pump(
        tester,
        const Item(
          children: [
            ItemMedia(
              variant: ItemVariant.soft,
              child: Icon(Icons.inbox_outlined),
            ),
            _content,
          ],
        ),
        direction: TextDirection.rtl,
      );
      expect(offsetIn(tester, find.byType(ItemMedia)).dx, 300 - 12 - 32);
    });

    testWidgets('a direction changed in place mirrors the row', (tester) async {
      const item = Item(
        children: [
          ItemMedia(
            variant: ItemVariant.soft,
            child: SizedBox.square(dimension: 10),
          ),
          SizedBox(key: ValueKey('box'), width: 40, height: 10),
        ],
      );
      final box = find.byKey(const ValueKey('box'));

      await pump(tester, item);
      expect(offsetIn(tester, find.byType(ItemMedia)).dx, 12);
      expect(offsetIn(tester, box).dx, 12 + 32 + 12);

      await pump(tester, item, direction: TextDirection.rtl);
      expect(offsetIn(tester, find.byType(ItemMedia)).dx, 300 - 12 - 32);
      expect(offsetIn(tester, box).dx, 300 - 12 - 32 - 12 - 40);
    });

    testWidgets('shrinks in a row and works in an intrinsic height', (
      tester,
    ) async {
      await pump(
        tester,
        const Row(
          children: [
            Item(
              children: [
                ItemContent(
                  children: [
                    SizedBox(key: ValueKey('c'), width: 80, height: 4),
                  ],
                ),
              ],
            ),
          ],
        ),
      );
      expect(tester.takeException(), isNull);
      expect(tester.getSize(find.byType(Item)).width, 12 + 80 + 12);

      await pump(
        tester,
        IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Expanded(child: Item(children: [_content])),
              Container(width: 10, height: 90, color: const Color(0xFF000000)),
            ],
          ),
        ),
      );
      expect(tester.takeException(), isNull);
      expect(tester.getSize(find.byType(Item)).height, 90);
    });

    testWidgets('lines up on a baseline in a row', (tester) async {
      await pump(
        tester,
        const IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text('Label'),
              Expanded(child: Item(children: [_content])),
            ],
          ),
        ),
      );
      expect(tester.takeException(), isNull);
    });
  });

  group('tile', () {
    const ratios = {IdsSize.standard: 8 / 14, IdsSize.tiny: 7 / 11};
    const texts = ['title', 'one line', 'small line', 'two lines', 'action'];

    Widget row(IdsSize size, String text, ItemVariant media) => Item(
      variant: ItemVariant.outline,
      size: size,
      children: [
        ItemMedia(variant: media, child: const Icon(Icons.inbox_outlined)),
        ItemContent(
          children: [
            const ItemTitle(child: Text('Title')),
            if (text == 'one line') const ItemDescription(child: Text('one')),
            if (text == 'small line')
              const ItemDescription(
                child: Text('one', style: TextStyle(fontSize: 8)),
              ),
            if (text == 'two lines')
              const ItemDescription(child: Text('one\ntwo')),
          ],
        ),
        if (text == 'action')
          ItemActions(
            children: [SizedBox(height: size == IdsSize.standard ? 40 : 32)],
          ),
      ],
    );

    testWidgets('grows with the row and the space around it, up to one line '
        'of description', (tester) async {
      for (final size in IdsSize.values) {
        final sides = <String, double>{};
        var oneLineRow = 0.0;
        for (final (index, text) in texts.indexed) {
          final label = '$size, $text';
          await pump(
            tester,
            row(
              size,
              text,
              index.isEven ? ItemVariant.soft : ItemVariant.outline,
            ),
          );
          final height = tester.getSize(find.byType(Item)).height;
          final tile = tester.getSize(find.byType(ItemMedia));
          final inset = offsetIn(tester, find.byType(ItemMedia));
          final below = height - inset.dy - tile.height;
          if (text == 'one line') oneLineRow = height;
          final wraps = text == 'two lines';

          expect(tile.width, tile.height, reason: label);
          expect(
            tile.height,
            moreOrLessEquals((wraps ? oneLineRow : height) * ratios[size]!),
            reason: label,
          );
          expect(inset.dx, moreOrLessEquals(inset.dy), reason: label);
          if (wraps) {
            expect(height, greaterThan(oneLineRow + 10), reason: label);
            expect(below, greaterThan(inset.dy + 10), reason: label);
          } else {
            expect(below, moreOrLessEquals(inset.dy), reason: label);
          }
          expect(
            IconTheme.of(tester.element(find.byType(Icon))).size,
            tile.height / 2,
            reason: label,
          );
          sides[text] = tile.height;
        }
        expect(sides['title'], size == IdsSize.standard ? 32 : 28);
        expect(sides['one line'], greaterThan(sides['title']!));
        expect(sides['small line'], lessThan(sides['one line']!));
        expect(sides['small line'], greaterThan(sides['title']!));
        expect(sides['action'], greaterThan(sides['title']!));
        expect(sides['two lines'], moreOrLessEquals(sides['one line']!));
      }
    });

    testWidgets('leaves its width to the text beside it', (tester) async {
      for (final text in ['one line', 'small line', 'action']) {
        await pump(tester, row(IdsSize.standard, text, ItemVariant.soft));
        final tile = tester.getSize(find.byType(ItemMedia)).width;
        final inset = offsetIn(tester, find.byType(ItemMedia)).dx;
        final end = 300 - 12 - (text == 'action' ? 12 : 0);
        expect(tile, greaterThan(32), reason: text);
        expect(
          offsetIn(tester, find.byType(ItemContent)).dx,
          moreOrLessEquals(inset + tile + 12),
          reason: text,
        );
        expect(
          tester.getSize(find.byType(ItemContent)).width,
          moreOrLessEquals(end - inset - tile - 12),
          reason: text,
        );
      }
    });

    testWidgets('follows a row height set from outside, up to the largest '
        'row', (tester) async {
      for (final (height, side, inset) in [
        (64.0, 36.57, 13.71),
        (80.0, 37.71, 14.14),
      ]) {
        await pump(
          tester,
          SizedBox(
            height: height,
            child: row(IdsSize.standard, 'title', ItemVariant.soft),
          ),
        );
        final label = 'height $height';
        final tile = tester.getSize(find.byType(ItemMedia));
        final at = offsetIn(tester, find.byType(ItemMedia));
        expect(tester.getSize(find.byType(Item)).height, height, reason: label);
        expect(tile.width, tile.height, reason: label);
        expect(
          tile.height,
          moreOrLessEquals(side, epsilon: 0.01),
          reason: label,
        );
        expect(at.dx, moreOrLessEquals(inset, epsilon: 0.01), reason: label);
        expect(at.dy, moreOrLessEquals(inset, epsilon: 0.01), reason: label);
      }
    });

    testWidgets('the widest a described row asks for is the width it lays '
        'out to', (tester) async {
      for (final text in ['one line', 'small line']) {
        await pump(
          tester,
          Row(children: [row(IdsSize.standard, text, ItemVariant.soft)]),
        );
        final item = tester.renderObject<RenderBox>(find.byType(Item));
        expect(
          item.getMaxIntrinsicWidth(double.infinity),
          moreOrLessEquals(item.size.width),
          reason: text,
        );
      }
    });

    testWidgets('a tile inside a wrapper keeps its base side where '
        'intrinsics are asked', (tester) async {
      for (final (size, theme, side) in [
        (IdsSize.standard, testTheme, 32.0),
        (IdsSize.tiny, testTheme, 28.0),
        (IdsSize.standard, scaled, 48.0),
      ]) {
        final item = Item(
          size: size,
          children: const [
            Padding(
              padding: EdgeInsets.zero,
              child: ItemMedia(
                variant: ItemVariant.soft,
                child: Icon(Icons.inbox_outlined),
              ),
            ),
            _content,
          ],
        );
        for (final (asked, around) in [
          ('IntrinsicHeight', IntrinsicHeight(child: item)),
          (
            'IntrinsicWidth',
            Align(
              alignment: Alignment.topLeft,
              child: IntrinsicWidth(child: item),
            ),
          ),
          (
            'Row > ItemGroup',
            Row(
              children: [
                ItemGroup(children: [item]),
              ],
            ),
          ),
        ]) {
          final label = '$size, $side, $asked';
          await pump(tester, around, theme: theme);
          expect(tester.takeException(), isNull, reason: label);
          expect(
            tester.getSize(find.byType(ItemMedia)),
            Size.square(side),
            reason: label,
          );
        }
      }
    });

    testWidgets('a tile row answers the same baseline before and after '
        'layout', (tester) async {
      final before = debugCheckIntrinsicSizes;
      addTearDown(() => debugCheckIntrinsicSizes = before);
      debugCheckIntrinsicSizes = true;
      for (final size in IdsSize.values) {
        for (final text in texts) {
          await pump(tester, row(size, text, ItemVariant.soft));
          expect(tester.takeException(), isNull, reason: '$size, $text');
        }
      }
      debugCheckIntrinsicSizes = before;
    });
  });

  group('text', () {
    testWidgets('title and description take their type, colour and lines', (
      tester,
    ) async {
      await pump(
        tester,
        const Item(
          children: [
            ItemContent(
              children: [
                ItemTitle(truncate: true, child: Text('Title')),
                ItemDescription(child: Text('Description')),
              ],
            ),
          ],
        ),
      );
      DefaultTextStyle textOf(String text) =>
          DefaultTextStyle.of(tester.element(find.text(text)));
      final theme = themeOf(tester);
      expect(textOf('Title').style.fontSize, 14);
      expect(textOf('Title').style.fontWeight, FontWeight.w500);
      expect(textOf('Title').maxLines, 1);
      expect(textOf('Title').overflow, TextOverflow.ellipsis);
      expect(textOf('Description').style.color, theme.textNeutral);
      expect(textOf('Description').maxLines, 2);
    });
  });

  group('look', () {
    testWidgets('ghost, outline and soft fill the row', (tester) async {
      await pump(tester, const Item(children: [_content]));
      final theme = themeOf(tester);
      expect(surfaceOf(tester).color!.a, 0);

      await pump(
        tester,
        const Item(variant: ItemVariant.soft, children: [_content]),
      );
      expect(surfaceOf(tester).color, theme.bgNeutralSoft);
    });

    testWidgets('a selected row lays 6%, 10% hovered, 8% pressed', (
      tester,
    ) async {
      await pump(
        tester,
        Item(selected: true, onPressed: () {}, children: const [_content]),
      );
      final theme = themeOf(tester);
      Color layer(double alpha) => Color.alphaBlend(
        theme.onSurface.withValues(alpha: alpha),
        theme.surface.withValues(alpha: 0),
      );
      expect(surfaceOf(tester).color, layer(0.06));

      final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.byType(Item)));
      await tester.pumpAndSettle();
      expect(surfaceOf(tester).color, layer(0.10));

      await mouse.down(tester.getCenter(find.byType(Item)));
      await tester.pumpAndSettle();
      expect(surfaceOf(tester).color, layer(0.08));
      await mouse.up();
    });

    testWidgets('the row, its edge and its tile take the theme corner shape', (
      tester,
    ) async {
      const item = Item(
        variant: ItemVariant.outline,
        children: [
          ItemMedia(variant: ItemVariant.outline, child: SizedBox()),
          _content,
        ],
      );
      final tile = find.byType(ItemMedia);
      ShapeDecoration edgeOf() =>
          containerOf(tester).foregroundDecoration! as ShapeDecoration;
      ShapeDecoration tileOf() =>
          tester
                  .widget<DecoratedBox>(
                    find
                        .descendant(
                          of: tile,
                          matching: find.byType(DecoratedBox),
                        )
                        .first,
                  )
                  .decoration
              as ShapeDecoration;
      Path tileClipOf() {
        final clip = find.descendant(of: tile, matching: find.byType(ClipPath));
        return tester
            .widget<ClipPath>(clip)
            .clipper!
            .getClip(tester.getSize(clip));
      }

      await pump(tester, item);
      final radius = IdsProvider.of(tester.element(find.byType(Item))).radius;
      final point = insideTheRoundCornerOnly(
        tester.getSize(tile),
        radius.standard,
      );
      expect(point.dy, greaterThan(0));
      final round = [surfaceOf(tester), edgeOf(), tileOf()];
      expect(
        round.map((decoration) => decoration.shape),
        everyElement(isA<RoundedRectangleBorder>()),
      );
      expect(round.map(cornerOf), [
        BorderRadius.circular(radius.container),
        BorderRadius.circular(radius.container),
        BorderRadius.circular(radius.standard),
      ]);
      expect(tileClipOf().contains(point), isTrue);

      await pump(tester, item, theme: squircle);
      final squircled = [surfaceOf(tester), edgeOf(), tileOf()];
      expect(
        squircled.map((decoration) => decoration.shape),
        everyElement(isA<RoundedSuperellipseBorder>()),
      );
      expect(squircled.map(cornerOf), round.map(cornerOf));
      expect(tileClipOf().contains(point), isFalse);
    });
  });

  group('pressable', () {
    testWidgets('presses from anywhere but its actions', (tester) async {
      var opened = 0;
      var archived = 0;
      await pump(
        tester,
        Item(
          onPressed: () => opened++,
          children: [
            _content,
            ItemActions(
              children: [
                GestureDetector(
                  key: const ValueKey('archive'),
                  behavior: HitTestBehavior.opaque,
                  onTap: () => archived++,
                  child: const SizedBox.square(dimension: 24),
                ),
              ],
            ),
          ],
        ),
      );
      await tester.tapAt(
        tester.getTopLeft(find.byType(Item)) + const Offset(4, 4),
      );
      expect(opened, 1);
      await tester.tap(find.byKey(const ValueKey('archive')));
      expect((opened, archived), (1, 1));
    });

    testWidgets('is one button named by its content, selection read out', (
      tester,
    ) async {
      final semantics = tester.ensureSemantics();
      await pump(
        tester,
        Item(
          onPressed: () {},
          selected: false,
          children: const [
            ItemMedia(child: Icon(Icons.inbox_outlined)),
            ItemContent(
              children: [
                ItemTitle(child: Text('Title')),
                ItemDescription(child: Text('Description')),
              ],
            ),
            ItemActions(children: [Text('Action')]),
          ],
        ),
      );
      final button = tester.getSemantics(find.byType(Item));
      expect(button.flagsCollection.isButton, isTrue);
      expect(button.label, 'Title\nDescription');
      expect(button.flagsCollection.isSelected, Tristate.isFalse);
      expect(find.bySemanticsLabel('Action'), findsOneWidget);

      await pump(
        tester,
        Item(onPressed: () {}, selected: true, children: const [_content]),
      );
      expect(
        tester.getSemantics(find.byType(Item)).flagsCollection.isSelected,
        Tristate.isTrue,
      );
      semantics.dispose();
    });
  });

  group('group', () {
    testWidgets('bordered draws lines between square rows', (tester) async {
      await pump(
        tester,
        const ItemGroup(
          children: [
            Item(key: ValueKey('a'), children: [_content]),
            Item(key: ValueKey('b'), children: [_content]),
          ],
        ),
      );
      Border? borderAbove(String key) =>
          (tester
                          .widget<DecoratedBox>(
                            find
                                .ancestor(
                                  of: find.byKey(ValueKey(key)),
                                  matching: find.byType(DecoratedBox),
                                )
                                .first,
                          )
                          .decoration
                      as BoxDecoration)
                  .border
              as Border?;
      final theme = themeOf(tester);
      expect(tester.getSize(find.byType(ItemGroup)).height, 56 + 1 + 56);
      expect(borderAbove('a')!.bottom.color, theme.borderNeutral);
      expect(borderAbove('b')!.bottom, BorderSide.none);
      expect(
        (containerOf(tester, find.byKey(const ValueKey('a'))).decoration!
                as BoxDecoration)
            .borderRadius,
        BorderRadius.zero,
      );
    });

    testWidgets('separated spaces outline rows by 8', (tester) async {
      await pump(
        tester,
        const ItemGroup(
          variant: ItemGroupVariant.separated,
          children: [
            Item(key: ValueKey('a'), children: [_content]),
            Item(key: ValueKey('b'), children: [_content]),
          ],
        ),
      );
      expect(
        tester.getTopLeft(find.byKey(const ValueKey('b'))).dy -
            tester.getBottomLeft(find.byKey(const ValueKey('a'))).dy,
        8,
      );
      expect(
        containerOf(
          tester,
          find.byKey(const ValueKey('a')),
        ).foregroundDecoration,
        isNotNull,
      );
    });

    testWidgets('rows follow the group size unless they say so', (
      tester,
    ) async {
      await pump(
        tester,
        const ItemGroup(
          size: IdsSize.tiny,
          children: [
            Item(key: ValueKey('a'), children: [_content]),
            Item(
              key: ValueKey('b'),
              size: IdsSize.standard,
              children: [_content],
            ),
          ],
        ),
      );
      expect(tester.getSize(find.byKey(const ValueKey('a'))).height, 40);
      expect(tester.getSize(find.byKey(const ValueKey('b'))).height, 56);
    });

    testWidgets('is a named list whose separators are not items', (
      tester,
    ) async {
      final semantics = tester.ensureSemantics();
      await pump(
        tester,
        const ItemGroup(
          variant: ItemGroupVariant.ghost,
          semanticLabel: '설정',
          children: [
            Item(children: [_content]),
            ItemSeparator(),
            Item(children: [_content]),
          ],
        ),
      );
      final list = tester.getSemantics(find.bySemanticsLabel('설정'));
      expect(list.role, SemanticsRole.list);
      var items = 0;
      list.visitChildren((child) {
        if (child.role == SemanticsRole.listItem) items++;
        return true;
      });
      expect(items, 2);
      semantics.dispose();
    });

    testWidgets('fits a row without a set width', (tester) async {
      await pump(
        tester,
        const Row(
          children: [
            ItemGroup(
              children: [
                Item(children: [_content]),
              ],
            ),
          ],
        ),
      );
      expect(tester.takeException(), isNull);
    });
  });

  group('scale', () {
    double gapBetween(WidgetTester tester, Finder before, Finder after) =>
        tester.getTopLeft(after).dy - tester.getBottomLeft(before).dy;

    testWidgets('a row, its tile and its type grow by the theme scale', (
      tester,
    ) async {
      await pump(
        tester,
        const ItemGroup(
          variant: ItemGroupVariant.separated,
          children: [
            Item(
              key: ValueKey('a'),
              children: [
                ItemMedia(
                  variant: ItemVariant.soft,
                  child: Icon(Icons.inbox_outlined),
                ),
                ItemContent(children: [ItemTitle(child: Text('Title'))]),
                ItemActions(
                  children: [
                    SizedBox(key: ValueKey('x'), width: 10, height: 10),
                    SizedBox(key: ValueKey('y'), width: 10, height: 10),
                  ],
                ),
              ],
            ),
            Item(
              key: ValueKey('b'),
              size: IdsSize.tiny,
              children: [
                ItemContent(
                  children: [SizedBox(key: ValueKey('c'), height: 4)],
                ),
              ],
            ),
          ],
        ),
        theme: scaled,
      );
      final row = find.byKey(const ValueKey('a'));
      final tiny = find.byKey(const ValueKey('b'));
      expect(tester.getSize(row).height, 56 * 1.5);
      expect(tester.getSize(find.byType(ItemMedia)), const Size.square(48));
      expect(offsetIn(tester, find.byType(ItemMedia), row).dx, 12 * 1.5);
      expect(
        offsetIn(tester, find.byType(ItemContent).first, row).dx,
        (12 + 32 + 12) * 1.5,
      );
      expect(IconTheme.of(tester.element(find.byType(Icon))).size, 16 * 1.5);
      expect(
        DefaultTextStyle.of(tester.element(find.text('Title'))).style.fontSize,
        14 * 1.5,
      );
      expect(
        tester.getTopLeft(find.byKey(const ValueKey('y'))).dx -
            tester.getTopRight(find.byKey(const ValueKey('x'))).dx,
        8 * 1.5,
      );
      expect(gapBetween(tester, row, tiny), 8 * 1.5);
      expect(tester.getSize(tiny).height, 40 * 1.5);
      expect(
        offsetIn(tester, find.byKey(const ValueKey('c')), tiny).dx,
        8 * 1.5,
      );
    });

    testWidgets('a described tile row sizes its tile from the scaled row', (
      tester,
    ) async {
      await pump(
        tester,
        const Item(
          children: [
            ItemMedia(
              variant: ItemVariant.soft,
              child: Icon(Icons.inbox_outlined),
            ),
            ItemContent(
              children: [
                ItemTitle(child: Text('Title')),
                ItemDescription(child: Text('one')),
              ],
            ),
          ],
        ),
        theme: scaled,
      );
      const row = (20 + 2 + 20 + 24) * 1.5;
      final tile = tester.getSize(find.byType(ItemMedia));
      final inset = offsetIn(tester, find.byType(ItemMedia));
      expect(tester.getSize(find.byType(Item)).height, row);
      expect(tile.width, tile.height);
      expect(tile.height, moreOrLessEquals(row * 8 / 14));
      expect(inset.dx, moreOrLessEquals((row - tile.height) / 2));
      expect(inset.dy, moreOrLessEquals((row - tile.height) / 2));
    });

    testWidgets('the outline edges and the group line stay 1 wide', (
      tester,
    ) async {
      await pump(
        tester,
        const ItemGroup(
          children: [
            Item(
              key: ValueKey('a'),
              variant: ItemVariant.outline,
              children: [
                ItemMedia(
                  variant: ItemVariant.outline,
                  child: Icon(Icons.inbox_outlined),
                ),
                _content,
              ],
            ),
            Item(key: ValueKey('b'), children: [_content]),
          ],
        ),
        theme: scaled,
      );
      final row = find.byKey(const ValueKey('a'));
      BoxBorder borderOf(Decoration decoration) =>
          (decoration as BoxDecoration).border!;
      DecoratedBox boxIn(Finder finder) => tester.widget(
        find.descendant(of: finder, matching: find.byType(DecoratedBox)).first,
      );
      DecoratedBox boxAround(Finder finder) => tester.widget(
        find.ancestor(of: finder, matching: find.byType(DecoratedBox)).first,
      );
      expect(
        tester.getSize(find.byType(ItemGroup)).height,
        56 * 1.5 + 1 + 56 * 1.5,
      );
      expect(borderOf(boxAround(row).decoration).bottom.width, 1);
      expect(
        borderOf(containerOf(tester, row).foregroundDecoration!).top.width,
        1,
      );
      expect(
        ((boxIn(find.byType(ItemMedia)).decoration as ShapeDecoration).shape
                as OutlinedBorder)
            .side
            .width,
        1,
      );
    });

    testWidgets('a bare icon, the description and the gap above it grow too', (
      tester,
    ) async {
      await pump(
        tester,
        const Item(
          size: IdsSize.tiny,
          children: [
            ItemMedia(child: Icon(Icons.inbox_outlined)),
            ItemContent(
              children: [
                ItemTitle(child: Text('Title')),
                ItemDescription(child: Text('Description')),
              ],
            ),
          ],
        ),
        theme: scaled,
      );
      DefaultTextStyle textOf(String text) =>
          DefaultTextStyle.of(tester.element(find.text(text)));
      expect(IconTheme.of(tester.element(find.byType(Icon))).size, 16 * 1.5);
      expect(textOf('Title').style.fontSize, 12 * 1.5);
      expect(textOf('Description').style.fontSize, 12 * 1.5);
      expect(
        gapBetween(
          tester,
          find.byType(ItemTitle),
          find.byType(ItemDescription),
        ),
        moreOrLessEquals(2 * 1.5),
      );
    });
  });

  testWidgets('every part outside an Item is a mistake', (tester) async {
    for (final part in const <Widget>[
      ItemMedia(),
      ItemContent(),
      ItemTitle(child: Text('Title')),
      ItemDescription(child: Text('Description')),
      ItemActions(),
    ]) {
      await pump(tester, part);
      expect(
        tester.takeException(),
        isAssertionError,
        reason: '${part.runtimeType}',
      );
    }
  });
}
