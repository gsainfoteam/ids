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
    child: ThemeProvider(child: Center(child: child)),
  ),
);

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
      expect(cut.contains(const Offset(11, 20)), isFalse);
      expect(cut.contains(const Offset(13, 20)), isTrue);
      expect(cut.contains(const Offset(39, 20)), isTrue);
    });

    testWidgets('cuts 2px around a tiny neighbour and a square one', (
      tester,
    ) async {
      await pump(tester, AvatarGroup(size: IdsSize.tiny, children: people(2)));
      final tiny = cutoutOf(tester, find.byType(Avatar).last)!;
      expect(tiny.contains(const Offset(7, 12)), isFalse);
      expect(tiny.contains(const Offset(9, 12)), isTrue);

      await pump(tester, AvatarGroup(children: people(2)));
      final round = cutoutOf(tester, find.byType(Avatar).last)!;
      expect(round.contains(const Offset(8, 3)), isTrue);

      await pump(
        tester,
        AvatarGroup(shape: AvatarShape.square, children: people(2)),
      );
      final square = cutoutOf(tester, find.byType(Avatar).last)!;
      expect(square.contains(const Offset(8, 3)), isFalse);
      expect(square.contains(const Offset(11, 20)), isFalse);
      expect(square.contains(const Offset(13, 20)), isTrue);
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
}
