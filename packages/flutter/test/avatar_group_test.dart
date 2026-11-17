import 'dart:math' as math;
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

Future<void> pump(
  WidgetTester tester,
  Widget child, {
  TextDirection direction = TextDirection.ltr,
  IdsTheme theme = testTheme,
  IdsMode? mode,
  IdsMessages? translation,
}) => tester.pumpWidget(
  Directionality(
    textDirection: direction,
    child: IdsProvider(
      theme: theme,
      mode: mode,
      translation: translation,
      child: Center(child: child),
    ),
  ),
);

class _English with IdsMessages {
  const _English();

  @override
  String? avatarGroupOverflow({required Object count}) => '$count more';
}

List<Widget> people(int count) => [
  for (var index = 0; index < count; index++) Avatar(name: 'Person $index'),
];

Size groupSize(WidgetTester tester) => tester.getSize(find.byType(AvatarGroup));

double avatarLeft(WidgetTester tester, Finder avatar) =>
    tester.getTopLeft(avatar).dx -
    tester.getTopLeft(find.byType(AvatarGroup)).dx;

Path? cutoutOf(WidgetTester tester, Finder avatar) => tester
    .widget<ClipPath>(
      find.descendant(of: avatar, matching: find.byType(ClipPath)).first,
    )
    .clipper
    ?.getClip(tester.getSize(avatar));

ShapeBorder shapeOf(WidgetTester tester, Finder avatar) =>
    (tester
                .widget<Container>(
                  find.descendant(of: avatar, matching: find.byType(Container)),
                )
                .decoration!
            as ShapeDecoration)
        .shape;

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

double cornerGap(WidgetTester tester) {
  final avatars = find.byType(Avatar);
  final top = tester.getRect(avatars.first);
  final cut = tester.getRect(avatars.last);
  final corner = top.topRight;
  final inward = Offset(cut.left, top.top + top.right - cut.left);
  final outline = shapeOf(tester, avatars.first).getOuterPath(top);
  final kept = cutoutOf(tester, avatars.last)!.shift(cut.topLeft);
  return (edgeBetween(outline, inward, corner) -
          edgeBetween(kept, corner, inward))
      .distance;
}

List<SemanticsRole> rolesUnder(SemanticsNode node) {
  final roles = <SemanticsRole>[];
  node.visitChildren((child) {
    roles
      ..add(child.role)
      ..addAll(rolesUnder(child));
    return true;
  });
  return roles;
}

class _Probe extends StatefulWidget {
  const _Probe({super.key, this.child = const SizedBox.shrink()});

  final Widget child;

  @override
  State<_Probe> createState() => _ProbeState();
}

class _ProbeState extends State<_Probe> {
  @override
  Widget build(BuildContext context) => widget.child;
}

void main() {
  group('overflow', () {
    testWidgets('shows max people and counts the rest', (tester) async {
      await pump(tester, AvatarGroup(max: 3, children: people(5)));
      expect(find.byType(Avatar), findsNWidgets(4));
      expect(find.text('+2'), findsOneWidget);
    });

    testWidgets('counts people it was not given through total', (tester) async {
      await pump(tester, AvatarGroup(total: 128, children: people(3)));
      expect(find.text('+125'), findsOneWidget);
    });

    testWidgets('treats max below one as one and warns', (tester) async {
      final printed = <String>[];
      final original = debugPrint;
      debugPrint = (message, {wrapWidth}) => printed.add(message!);
      try {
        await pump(tester, AvatarGroup(max: 0, children: people(3)));
      } finally {
        debugPrint = original;
      }
      expect(find.text('+2'), findsOneWidget);
      expect(printed, contains(startsWith('[IDS] AvatarGroup:')));
    });

    testWidgets('reads the count as a sentence', (tester) async {
      final semantics = tester.ensureSemantics();
      await pump(tester, AvatarGroup(max: 1, children: people(3)));
      expect(find.bySemanticsLabel('외 2명'), findsOneWidget);

      await pump(
        tester,
        AvatarGroup(
          max: 1,
          overflowLabel: (count) => '$count more',
          children: people(3),
        ),
      );
      expect(find.bySemanticsLabel('2 more'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('reads the sentence from the translation of the provider', (
      tester,
    ) async {
      final semantics = tester.ensureSemantics();
      await pump(
        tester,
        AvatarGroup(max: 1, children: people(3)),
        translation: const _English(),
      );
      expect(find.bySemanticsLabel('2 more'), findsOneWidget);

      await pump(
        tester,
        AvatarGroup(
          max: 1,
          overflowLabel: (count) => '$count hidden',
          children: people(3),
        ),
        translation: const _English(),
      );
      expect(find.bySemanticsLabel('2 hidden'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('draws given content, first when asked', (tester) async {
      await pump(
        tester,
        AvatarGroup(
          max: 2,
          overflowFirst: true,
          overflowBuilder: (count) => Text('$count+'),
          children: people(3),
        ),
      );
      expect(find.text('1+'), findsOneWidget);
      expect(avatarLeft(tester, find.byType(Avatar).first), 0);
      expect(
        find.descendant(
          of: find.byType(Avatar).first,
          matching: find.text('1+'),
        ),
        findsOneWidget,
      );
    });

    testWidgets('shrinks the count as digits grow', (tester) async {
      double fontSize(String text) =>
          DefaultTextStyle.of(tester.element(find.text(text))).style.fontSize!;

      await pump(tester, AvatarGroup(max: 1, children: people(3)));
      expect(fontSize('+2'), closeTo(40 * 0.36, 0.001));

      await pump(tester, AvatarGroup(max: 1, total: 101, children: people(1)));
      expect(fontSize('+100'), closeTo(40 * 0.28, 0.001));

      await pump(tester, AvatarGroup(max: 1, total: 1001, children: people(1)));
      expect(fontSize('+1000'), closeTo(40 * 0.22, 0.001));

      await pump(
        tester,
        AvatarGroup(max: 1, size: IdsSize.tiny, children: people(3)),
      );
      expect(fontSize('+2'), 9);
    });

    testWidgets('the count keeps its size and line at any text scale', (
      tester,
    ) async {
      await pump(tester, AvatarGroup(max: 1, children: people(3)));
      final unscaled = tester.getSize(find.text('+2'));

      await pump(
        tester,
        MediaQuery(
          data: const MediaQueryData(textScaler: TextScaler.linear(2)),
          child: AvatarGroup(max: 1, children: people(3)),
        ),
      );
      expect(tester.getSize(find.text('+2')), unscaled);

      await pump(
        tester,
        AvatarGroup(max: 1, total: 1000001, children: people(1)),
      );
      expect(tester.getSize(find.text('+1000000')).height, lessThan(12));
    });

    for (final mode in [IdsMode.light, IdsMode.dark]) {
      testWidgets('draws the count in onSurface (${mode.name})', (
        tester,
      ) async {
        await pump(
          tester,
          AvatarGroup(max: 1, children: people(3)),
          mode: mode,
        );
        expect(
          DefaultTextStyle.of(tester.element(find.text('+2'))).style.color,
          IdsProvider.of(
            tester.element(find.byType(AvatarGroup)),
          ).colors.onSurface,
        );
      });
    }

    testWidgets('adds no count when nobody is hidden', (tester) async {
      await pump(tester, AvatarGroup(max: 5, children: people(3)));
      expect(find.byType(Avatar), findsNWidgets(3));

      await pump(tester, AvatarGroup(total: 2, children: people(3)));
      expect(find.byType(Avatar), findsNWidgets(3));

      await pump(tester, const AvatarGroup(children: []));
      expect(find.byType(Avatar), findsNothing);
      expect(groupSize(tester), Size.zero);
    });

    testWidgets('counts with max and total together', (tester) async {
      await pump(tester, AvatarGroup(max: 2, total: 10, children: people(3)));
      expect(find.text('+8'), findsOneWidget);
    });
  });

  group('layout', () {
    testWidgets('stack overlaps by 10, or 6 when tiny', (tester) async {
      await pump(tester, AvatarGroup(children: people(3)));
      expect(groupSize(tester), const Size(40 + 30 + 30, 40));

      await pump(tester, AvatarGroup(size: IdsSize.tiny, children: people(3)));
      expect(groupSize(tester), const Size(24 + 18 + 18, 24));
    });

    testWidgets('inline spaces by 6, or 4 when tiny', (tester) async {
      await pump(
        tester,
        AvatarGroup(layout: AvatarGroupLayout.inline, children: people(3)),
      );
      expect(groupSize(tester), const Size(40 * 3 + 6 * 2, 40));

      await pump(
        tester,
        AvatarGroup(
          layout: AvatarGroupLayout.inline,
          size: IdsSize.tiny,
          children: people(3),
        ),
      );
      expect(groupSize(tester), const Size(24 * 3 + 4 * 2, 24));
    });

    testWidgets('follows the theme scale', (tester) async {
      await pump(
        tester,
        AvatarGroup(max: 3, children: people(5)),
        theme: scaledTheme,
      );
      expect(groupSize(tester), const Size(60 + 45 * 3, 60));
      expect(
        DefaultTextStyle.of(tester.element(find.text('+2'))).style.fontSize,
        closeTo(60 * 0.36, 0.001),
      );
      final cut = cutoutOf(tester, find.byType(Avatar).at(1))!;
      expect(cut.contains(const Offset(16.5, 30)), isFalse);
      expect(cut.contains(const Offset(17.5, 30)), isTrue);

      await pump(
        tester,
        AvatarGroup(size: IdsSize.tiny, children: people(3)),
        theme: scaledTheme,
      );
      expect(groupSize(tester), const Size(36 + 27 * 2, 36));

      await pump(
        tester,
        AvatarGroup(layout: AvatarGroupLayout.inline, children: people(3)),
        theme: scaledTheme,
      );
      expect(groupSize(tester), const Size(60 * 3 + 9 * 2, 60));

      await pump(
        tester,
        AvatarGroup(
          layout: AvatarGroupLayout.inline,
          size: IdsSize.tiny,
          children: people(3),
        ),
        theme: scaledTheme,
      );
      expect(groupSize(tester), const Size(36 * 3 + 6 * 2, 36));

      const smallerThanEveryFloorNeeds = 20.0;
      for (final (total, floor) in [(3, 9.0), (101, 7.0), (1001, 6.0)]) {
        await pump(
          tester,
          SizedBox(
            height: smallerThanEveryFloorNeeds,
            child: AvatarGroup(max: 1, total: total, children: people(1)),
          ),
          theme: scaledTheme,
        );
        expect(
          DefaultTextStyle.of(
            tester.element(find.text('+${total - 1}')),
          ).style.fontSize,
          floor,
        );
      }
    });

    testWidgets('avatars follow the group unless they say otherwise', (
      tester,
    ) async {
      await pump(
        tester,
        const AvatarGroup(
          size: IdsSize.tiny,
          shape: AvatarShape.square,
          children: [
            Avatar(name: 'Acme'),
            Avatar(name: 'Globex', size: IdsSize.standard),
          ],
        ),
      );
      expect(tester.getSize(find.byType(Avatar).first), const Size.square(24));
      expect(tester.getSize(find.byType(Avatar).last), const Size.square(40));
      expect(groupSize(tester), const Size(24 + 40 - 6, 40));
    });

    testWidgets('an avatar follows the shape of the group unless it says so', (
      tester,
    ) async {
      await pump(
        tester,
        const AvatarGroup(
          shape: AvatarShape.square,
          children: [
            Avatar(name: 'Acme'),
            Avatar(name: 'Alice', shape: AvatarShape.circle),
          ],
        ),
      );
      final avatars = find.byType(Avatar);
      expect(shapeOf(tester, avatars.first), isA<RoundedRectangleBorder>());
      expect(shapeOf(tester, avatars.last), isA<CircleBorder>());
    });

    testWidgets('reports its overlapped width as its intrinsic width', (
      tester,
    ) async {
      await pump(
        tester,
        IntrinsicWidth(child: AvatarGroup(children: people(3))),
      );
      expect(groupSize(tester).width, 100);
    });

    testWidgets('keeps the state of keyed children that change places', (
      tester,
    ) async {
      const alice = _Probe(
        key: ValueKey('alice'),
        child: Avatar(name: 'Alice'),
      );
      const bob = _Probe(
        key: ValueKey('bob'),
        child: Avatar(name: 'Bob'),
      );

      await pump(tester, const AvatarGroup(children: [alice, bob]));
      final before = tester.state(find.byKey(const ValueKey('alice')));

      await pump(tester, const AvatarGroup(children: [bob, alice]));
      expect(tester.state(find.byKey(const ValueKey('alice'))), same(before));
    });

    testWidgets('right-to-left text lays the first avatar on the right', (
      tester,
    ) async {
      await pump(
        tester,
        AvatarGroup(children: people(3)),
        direction: TextDirection.rtl,
      );
      expect(groupSize(tester), const Size(100, 40));
      expect(avatarLeft(tester, find.byType(Avatar).first), 60);
      expect(avatarLeft(tester, find.byType(Avatar).last), 0);
    });
  });

  group('semantics', () {
    testWidgets('is a named list with an item for each avatar', (tester) async {
      final semantics = tester.ensureSemantics();
      await pump(
        tester,
        AvatarGroup(max: 2, semanticLabel: '회의 참석자', children: people(3)),
      );
      final group = tester.getSemantics(find.bySemanticsLabel('회의 참석자'));
      expect(group.role, SemanticsRole.list);
      expect(
        rolesUnder(group).where((role) => role == SemanticsRole.listItem),
        hasLength(3),
      );
      semantics.dispose();
    });
  });

  group('cutout', () {
    testWidgets('first on top cuts every later avatar on its start', (
      tester,
    ) async {
      await pump(tester, AvatarGroup(children: people(3)));
      final avatars = find.byType(Avatar);
      expect(cutoutOf(tester, avatars.at(0)), isNull);
      final cut = cutoutOf(tester, avatars.at(1))!;
      expect(cut.contains(const Offset(1, 20)), isFalse);
      expect(cut.contains(const Offset(11.5, 20)), isFalse);
      expect(cut.contains(const Offset(12.5, 20)), isTrue);
      expect(cut.contains(const Offset(39, 20)), isTrue);
    });

    testWidgets('cuts 2px around a tiny neighbour and a square one', (
      tester,
    ) async {
      await pump(tester, AvatarGroup(size: IdsSize.tiny, children: people(2)));
      final tiny = cutoutOf(tester, find.byType(Avatar).last)!;
      expect(tiny.contains(const Offset(7.5, 12)), isFalse);
      expect(tiny.contains(const Offset(8.5, 12)), isTrue);

      await pump(tester, AvatarGroup(children: people(2)));
      final round = cutoutOf(tester, find.byType(Avatar).last)!;
      expect(round.contains(const Offset(8, 3)), isTrue);

      await pump(
        tester,
        AvatarGroup(shape: AvatarShape.square, children: people(2)),
      );
      final square = cutoutOf(tester, find.byType(Avatar).last)!;
      expect(square.contains(const Offset(8, 3)), isFalse);
      expect(square.contains(const Offset(11.5, 20)), isFalse);
      expect(square.contains(const Offset(12.5, 20)), isTrue);
    });

    testWidgets('cuts a square neighbour along the squircle of the theme', (
      tester,
    ) async {
      await pump(
        tester,
        AvatarGroup(shape: AvatarShape.square, children: people(2)),
        theme: const IdsTheme(
          primary: IdsThemeColor.seed(Color(0xFF155DFC)),
          cornerShape: IdsCornerShape.squircle,
        ),
      );
      final cut = find.byType(Avatar).last;
      expect(
        shapeOf(tester, cut),
        RoundedSuperellipseBorder(borderRadius: BorderRadius.circular(10)),
      );
      final kept = cutoutOf(tester, cut)!;
      expect(cornerGap(tester), closeTo(2, 0.01));
      expect(kept.contains(const Offset(11.5, 20)), isFalse);
      expect(kept.contains(const Offset(12.5, 20)), isTrue);

      const neighbour = Rect.fromLTWH(-30, 0, 40, 40);
      const whereTheShapesDifferMost = -8 * math.pi / 180;
      final hole = neighbour.inflate(2);
      final holeCorner = BorderRadius.circular(12);
      final arcCentre = hole.topRight + const Offset(-12, 12);
      final outsideTheHole =
          arcCentre + Offset.fromDirection(whereTheShapesDifferMost, 15);
      final squircleEdge = edgeBetween(
        RoundedSuperellipseBorder(borderRadius: holeCorner).getOuterPath(hole),
        arcCentre,
        outsideTheHole,
      );
      final roundedEdge = edgeBetween(
        RoundedRectangleBorder(borderRadius: holeCorner).getOuterPath(hole),
        arcCentre,
        outsideTheHole,
      );
      final cutOnlyByARoundedHole = Offset.lerp(
        squircleEdge,
        roundedEdge,
        0.5,
      )!;
      expect((roundedEdge - squircleEdge).distance, greaterThan(0.05));
      expect(kept.contains(cutOnlyByARoundedHole), isTrue);

      await pump(tester, AvatarGroup(children: people(2)));
      expect(cornerGap(tester), closeTo(2, 0.01));
    });

    testWidgets('a press on the cut side reaches the avatar on top', (
      tester,
    ) async {
      final taps = <String>[];
      await pump(
        tester,
        AvatarGroup(
          children: [
            for (final name in ['Alice', 'Bob'])
              GestureDetector(
                onTap: () => taps.add(name),
                child: Avatar(name: name),
              ),
          ],
        ),
      );
      await tester.tapAt(
        tester.getTopLeft(find.byType(Avatar).last) + const Offset(4, 20),
      );
      expect(taps, ['Alice']);
    });

    testWidgets('keeps what an avatar holds when its cutout comes or goes', (
      tester,
    ) async {
      Widget group(AvatarGroupLayout layout) => AvatarGroup(
        layout: layout,
        children: const [
          Avatar(name: 'Alice'),
          Avatar(name: 'Bob', fallback: _Probe()),
        ],
      );

      await pump(tester, group(AvatarGroupLayout.stack));
      final before = tester.state(find.byType(_Probe));

      await pump(tester, group(AvatarGroupLayout.inline));
      expect(tester.state(find.byType(_Probe)), same(before));
    });

    testWidgets('last on top cuts every earlier avatar on its end', (
      tester,
    ) async {
      await pump(
        tester,
        AvatarGroup(
          stacking: AvatarGroupStacking.lastOnTop,
          children: people(3),
        ),
      );
      final avatars = find.byType(Avatar);
      expect(cutoutOf(tester, avatars.at(2)), isNull);
      final cut = cutoutOf(tester, avatars.at(0))!;
      expect(cut.contains(const Offset(39, 20)), isFalse);
      expect(cut.contains(const Offset(1, 20)), isTrue);
    });

    testWidgets('the start is on the right in right-to-left text', (
      tester,
    ) async {
      await pump(
        tester,
        AvatarGroup(children: people(2)),
        direction: TextDirection.rtl,
      );
      final cut = cutoutOf(tester, find.byType(Avatar).at(1))!;
      expect(cut.contains(const Offset(39, 20)), isFalse);
      expect(cut.contains(const Offset(1, 20)), isTrue);
    });

    testWidgets('cuts an avatar wrapped in another widget', (tester) async {
      await pump(
        tester,
        AvatarGroup(
          children: [
            const Avatar(name: 'Alice'),
            GestureDetector(
              onTap: () {},
              child: const Avatar(name: 'Bob'),
            ),
          ],
        ),
      );
      expect(cutoutOf(tester, find.byType(Avatar).at(1)), isNotNull);
    });

    testWidgets('a press on the overlapping edge reaches the avatar on top', (
      tester,
    ) async {
      final taps = <String>[];
      await pump(
        tester,
        AvatarGroup(
          stacking: AvatarGroupStacking.lastOnTop,
          children: [
            for (final name in ['Alice', 'Bob'])
              GestureDetector(
                onTap: () => taps.add(name),
                child: Avatar(name: name),
              ),
          ],
        ),
      );
      await tester.tapAt(
        tester.getTopLeft(find.byType(Avatar).last) + const Offset(4, 20),
      );
      expect(taps, ['Bob']);
    });

    testWidgets('inline cuts nothing', (tester) async {
      await pump(
        tester,
        AvatarGroup(layout: AvatarGroupLayout.inline, children: people(3)),
      );
      for (final avatar in find.byType(Avatar).evaluate()) {
        expect(cutoutOf(tester, find.byWidget(avatar.widget)), isNull);
      }
    });
  });

  for (final stacking in AvatarGroupStacking.values) {
    testWidgets('a badge stays above the avatar beside it ($stacking)', (
      tester,
    ) async {
      final boundary = GlobalKey();
      await pump(
        tester,
        RepaintBoundary(
          key: boundary,
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: AvatarGroup(
              stacking: stacking,
              children: const [
                Badge(
                  content: SizedBox.shrink(),
                  child: Avatar(name: 'A'),
                ),
                Avatar(name: 'B'),
              ],
            ),
          ),
        ),
      );
      final danger = IdsProvider.of(
        tester.element(find.byType(AvatarGroup)),
      ).colors.bgDanger;
      final indicator = tester.getRect(
        find.byWidgetPredicate(
          (widget) =>
              widget is Container &&
              widget.decoration is ShapeDecoration &&
              (widget.decoration! as ShapeDecoration).shape is StadiumBorder,
        ),
      );
      final origin = tester.getTopLeft(find.byKey(boundary));
      late ui.Image image;
      late ByteData bytes;
      await tester.runAsync(() async {
        image =
            await (boundary.currentContext!.findRenderObject()!
                    as RenderRepaintBoundary)
                .toImage();
        bytes = (await image.toByteData())!;
      });
      for (var dx = -6.0; dx <= 6; dx += 3) {
        for (var dy = -6.0; dy <= 6; dy += 3) {
          final at = indicator.center + Offset(dx, dy) - origin;
          final index = (at.dy.floor() * image.width + at.dx.floor()) * 4;
          expect(
            (bytes.getUint8(index), bytes.getUint8(index + 1)),
            ((danger.r * 255).round(), (danger.g * 255).round()),
            reason: 'offset ($dx, $dy)',
          );
        }
      }
    });
  }
}
