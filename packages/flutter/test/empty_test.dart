import 'package:flutter/material.dart' show Icons;
import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

Future<void> pump(
  WidgetTester tester,
  Widget child, {
  TextDirection direction = TextDirection.ltr,
}) => tester.pumpWidget(
  Directionality(
    textDirection: direction,
    child: ThemeProvider(
      child: Align(
        alignment: Alignment.topLeft,
        child: SizedBox(width: 400, child: child),
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

    testWidgets('a soft tile turns to the surface on a soft Empty', (
      tester,
    ) async {
      Color tileOf() =>
          (tester
                      .widget<DecoratedBox>(
                        find
                            .descendant(
                              of: find.byType(EmptyMedia),
                              matching: find.byType(DecoratedBox),
                            )
                            .first,
                      )
                      .decoration
                  as BoxDecoration)
              .color!;

      await pump(tester, const Empty(children: [_title]));
      final theme = ThemeProvider.of(tester.element(find.byType(Empty)));
      expect(tileOf(), theme.muted);

      await pump(
        tester,
        const Empty(variant: EmptyVariant.soft, children: [_title]),
      );
      expect(tileOf(), theme.surface);
    });
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
      final theme = ThemeProvider.of(tester.element(find.byType(Empty)));
      expect(styleOf('Title').fontSize, 16);
      expect(styleOf('Title').fontWeight, FontWeight.w600);
      expect(styleOf('Title').color, theme.onSurface);
      expect(styleOf('Description').fontSize, 14);
      expect(styleOf('Description').color, theme.onMuted);
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

  testWidgets('has no role of its own', (tester) async {
    final semantics = tester.ensureSemantics();
    await pump(tester, const Empty(children: [_title]));
    final node = tester.getSemantics(find.text('Title'));
    expect(node.flagsCollection.isLiveRegion, isFalse);
    expect(node.role, SemanticsRole.none);
    semantics.dispose();
  });
}
