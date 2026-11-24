import 'dart:ui' show Tristate;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

Future<void> _pump(WidgetTester tester, Widget toggle) async {
  await tester.pumpWidget(
    MaterialApp(
      home: IdsProvider(
        theme: testTheme,
        child: Material(child: Center(child: toggle)),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('uses a square surface and an accessible name', (tester) async {
    final handle = tester.ensureSemantics();
    for (final (size, side) in [
      (IdsSize.standard, 36.0),
      (IdsSize.tiny, 32.0),
    ]) {
      await _pump(
        tester,
        IdsIconToggle(
          size: size,
          icon: const Icon(Icons.star),
          semanticLabel: 'Favorite',
        ),
      );
      expect(tester.getSize(find.byType(IdsIconToggle)), Size.square(side));
      expect(find.semantics.byLabel('Favorite'), findsOne);
      await tester.tap(find.byType(IdsIconToggle));
      await tester.pumpAndSettle();
      expect(tester.getSize(find.byType(IdsIconToggle)), Size.square(side));
      expect(find.semantics.byLabel('Favorite'), findsOne);
    }
    handle.dispose();
  });

  testWidgets('an explicit label replaces the icon name', (tester) async {
    final handle = tester.ensureSemantics();
    try {
      await _pump(
        tester,
        const IdsIconToggle(
          icon: Icon(Icons.push_pin, semanticLabel: 'Pin'),
          semanticLabel: 'Keep',
        ),
      );
      expect(find.semantics.byLabel('Keep'), findsOneWidget);
      expect(find.semantics.byLabel('Pin'), findsNothing);
    } finally {
      handle.dispose();
    }
  });

  testWidgets('builder changes the glyph and reports the pressed state', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    await _pump(
      tester,
      IdsIconToggle.builder(
        semanticLabel: 'Favorite',
        style: (state, base) => state.pressed
            ? ShapeDecoration(color: Colors.red, shape: base.shape)
            : base,
        icon: (_, state) =>
            Icon(state.pressed ? Icons.star : Icons.star_border),
      ),
    );
    expect(find.byIcon(Icons.star_border), findsOneWidget);
    await tester.tap(find.byType(IdsIconToggle));
    await tester.pumpAndSettle();
    expect(find.byIcon(Icons.star), findsOneWidget);
    expect(
      (tester
                  .widget<AnimatedContainer>(find.byType(AnimatedContainer))
                  .decoration!
              as ShapeDecoration)
          .color,
      Colors.red,
    );
    final semantics = find.semantics
        .byLabel('Favorite')
        .evaluate()
        .single
        .getSemanticsData();
    expect(semantics.flagsCollection.isToggled, Tristate.isTrue);
    handle.dispose();
  });

  testWidgets(
    'controlled pressed state can keep the icon in its previous state',
    (tester) async {
      var clicks = 0;
      final changes = <bool>[];
      await _pump(
        tester,
        IdsIconToggle.builder(
          semanticLabel: 'Favorite',
          pressed: true,
          icon: (_, state) =>
              Icon(state.pressed ? Icons.star : Icons.star_border),
          onPressed: () => clicks++,
          onPressedChange: changes.add,
        ),
      );
      await tester.tap(find.byType(IdsIconToggle));
      await tester.pumpAndSettle();
      expect(find.byIcon(Icons.star), findsOneWidget);
      expect(clicks, 1);
      expect(changes, [false]);
    },
  );
}
