import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart' show Icons;
import 'dart:ui' show Tristate;

import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

Future<void> pump(
  WidgetTester tester,
  Widget child, {
  TextDirection direction = TextDirection.ltr,
}) => tester.pumpWidget(
  WidgetsApp(
    color: const Color(0xFFFFFFFF),
    builder: (context, _) => Directionality(
      textDirection: direction,
      child: ThemeProvider(
        child: Align(
          alignment: Alignment.topLeft,
          child: SizedBox(width: 300, child: child),
        ),
      ),
    ),
  ),
);

const _content = ItemContent(children: [ItemTitle(child: Text('Title'))]);

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

BoxDecoration surfaceOf(WidgetTester tester, [Finder? item]) =>
    containerOf(tester, item).decoration! as BoxDecoration;

IdsTheme themeOf(WidgetTester tester) =>
    ThemeProvider.of(tester.element(find.byType(Item).first));

void main() {
  group('size', () {
    testWidgets('height, padding and corner follow size and dense', (
      tester,
    ) async {
      for (final (size, dense, height, pad, radius) in [
        (IdsSize.standard, false, 56.0, 12.0, 16.0),
        (IdsSize.tiny, false, 40.0, 8.0, 16.0),
        (IdsSize.standard, true, 48.0, 6.0, 16.0),
        (IdsSize.tiny, true, 32.0, 4.0, 14.0),
      ]) {
        await pump(
          tester,
          Item(
            size: size,
            dense: dense,
            children: const [
              ItemContent(children: [SizedBox(key: ValueKey('c'), height: 4)]),
            ],
          ),
        );
        final label = '$size dense: $dense';
        expect(tester.getSize(find.byType(Item)).height, height, reason: label);
        expect(
          offsetIn(tester, find.byKey(const ValueKey('c'))).dx,
          pad,
          reason: label,
        );
        expect(
          surfaceOf(tester).borderRadius,
          BorderRadius.circular(radius),
          reason: label,
        );
      }
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

    testWidgets('media rises to the top only beside a description', (
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

      await pump(tester, item(described: false));
      final row = tester.getSize(find.byType(Item)).height;
      expect(offsetIn(tester, find.byType(ItemMedia)).dy, (row - 16) / 2);

      await pump(tester, item(described: true));
      expect(offsetIn(tester, find.byType(ItemMedia)).dy, 12);
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
      expect(textOf('Description').style.color, theme.onMuted);
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
      expect(surfaceOf(tester).color, theme.muted);
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
      expect(borderAbove('a')!.bottom.color, theme.border);
      expect(borderAbove('b')!.bottom, BorderSide.none);
      expect(
        surfaceOf(tester, find.byKey(const ValueKey('a'))).borderRadius,
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

    testWidgets('rows follow the group size and dense unless they say so', (
      tester,
    ) async {
      await pump(
        tester,
        const ItemGroup(
          size: IdsSize.tiny,
          dense: true,
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
      expect(tester.getSize(find.byKey(const ValueKey('a'))).height, 32);
      expect(tester.getSize(find.byKey(const ValueKey('b'))).height, 48);
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
