import 'dart:ui' show Tristate;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

Future<void> _pump(WidgetTester tester, Widget toggle) => tester.pumpWidget(
  MaterialApp(
    home: IdsProvider(
      theme: testTheme,
      child: Material(child: Center(child: toggle)),
    ),
  ),
);

Tristate _pressed() => find.semantics
    .byLabel('Bold')
    .evaluate()
    .single
    .getSemanticsData()
    .flagsCollection
    .isToggled;

void main() {
  testWidgets('a surface style receives the current pressed state', (
    tester,
  ) async {
    await _pump(
      tester,
      IdsToggle(
        style: (state, base) => state.pressed
            ? ShapeDecoration(
                color: Colors.green,
                shape: base.shape,
                shadows: base.shadows,
              )
            : base,
        child: const Text('Bold'),
      ),
    );
    Color? fill() =>
        (tester
                    .widget<AnimatedContainer>(find.byType(AnimatedContainer))
                    .decoration!
                as ShapeDecoration)
            .color;
    expect(
      fill(),
      IdsProvider.of(tester.element(find.byType(IdsToggle))).colors.bgSurface,
    );
    await tester.tap(find.text('Bold'));
    await tester.pumpAndSettle();
    expect(fill(), Colors.green);
  });

  testWidgets('outline toggle uses the decoration shadow', (tester) async {
    await _pump(tester, const IdsToggle(child: Text('Bold')));
    final widget = tester.widget<AnimatedContainer>(
      find.byType(AnimatedContainer),
    );
    expect((widget.decoration! as ShapeDecoration).shadows, isNotEmpty);
  });

  testWidgets('glossy toggle animates between a solid color and a gradient', (
    tester,
  ) async {
    await _pump(
      tester,
      const IdsToggle(variant: IdsVariant.glossy, child: Text('Bold')),
    );
    await tester.tap(find.text('Bold'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 50));
    expect(tester.takeException(), isNull);
    await tester.pumpAndSettle();
    final widget = tester.widget<AnimatedContainer>(
      find.byType(AnimatedContainer),
    );
    expect((widget.decoration! as ShapeDecoration).gradient, isNotNull);
  });

  testWidgets(
    'reports a pressed state through pointer and keyboard activation',
    (tester) async {
      final semantics = tester.ensureSemantics();
      final focus = FocusNode();
      addTearDown(focus.dispose);
      final changes = <bool>[];
      await _pump(
        tester,
        IdsToggle(
          semanticLabel: 'Bold',
          focusNode: focus,
          onPressedChange: changes.add,
          child: const Text('Bold'),
        ),
      );
      expect(_pressed(), Tristate.isFalse);
      await tester.tap(find.byType(IdsToggle));
      await tester.pumpAndSettle();
      expect(_pressed(), Tristate.isTrue);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(_pressed(), Tristate.isFalse);
      expect(changes, [true, false]);
      semantics.dispose();
    },
  );

  testWidgets('controlled and disabled toggles retain the supplied state', (
    tester,
  ) async {
    final semantics = tester.ensureSemantics();
    final changes = <bool>[];
    await _pump(
      tester,
      IdsToggle(
        pressed: true,
        semanticLabel: 'Bold',
        onPressedChange: changes.add,
        child: const Text('Bold'),
      ),
    );
    await tester.tap(find.byType(IdsToggle));
    await tester.pumpAndSettle();
    expect(_pressed(), Tristate.isTrue);
    expect(changes, [false]);
    final focus = FocusNode();
    addTearDown(focus.dispose);
    await _pump(
      tester,
      IdsToggle(
        pressed: false,
        disabled: true,
        focusableWhenDisabled: true,
        focusNode: focus,
        semanticLabel: 'Bold',
        onPressedChange: changes.add,
        child: const Text('Bold'),
      ),
    );
    focus.requestFocus();
    await tester.pumpAndSettle();
    expect(focus.hasPrimaryFocus, isTrue);
    await tester.tap(find.byType(IdsToggle));
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();
    expect(_pressed(), Tristate.isFalse);
    expect(changes, [false]);
    semantics.dispose();
  });

  testWidgets(
    'controlled state stays fixed after pointer and keyboard activation',
    (tester) async {
      final semantics = tester.ensureSemantics();
      final events = <String>[];
      await _pump(
        tester,
        IdsToggle(
          semanticLabel: 'Bold',
          pressed: false,
          onPressed: () => events.add('pressed'),
          onPressedChange: (next) => events.add('change:$next'),
          child: const Text('Bold'),
        ),
      );
      await tester.tap(find.byType(IdsToggle));
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(_pressed(), Tristate.isFalse);
      expect(events, ['pressed', 'change:true', 'pressed', 'change:true']);
      semantics.dispose();
    },
  );
}
