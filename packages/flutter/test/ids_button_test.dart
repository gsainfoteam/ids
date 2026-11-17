import 'dart:ui' show Tristate;

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

Future<void> pumpButton(
  WidgetTester tester,
  Widget button, {
  IdsMode mode = IdsMode.light,
}) => tester.pumpWidget(
  MaterialApp(
    home: IdsProvider(
      theme: testTheme,
      mode: mode,
      child: Center(child: button),
    ),
  ),
);

void press() {}

void main() {
  testWidgets('sizes the label, icon and padding from the selected size', (
    tester,
  ) async {
    for (final (size, height, iconSize, start, end, gap, fontSize) in [
      (IdsSize.standard, 36.0, 16.0, 12.0, 16.0, 8.0, 14.0),
      (IdsSize.tiny, 32.0, 14.0, 10.0, 12.0, 6.0, 12.0),
    ]) {
      await pumpButton(
        tester,
        IdsButton(
          onPressed: press,
          size: size,
          leading: const Icon(Icons.add),
          child: const Text('Add'),
        ),
      );
      await tester.pumpAndSettle();

      final button = tester.getRect(find.byType(IdsButton));
      final labelFinder = find.text('Add');
      final label = tester.getRect(labelFinder);
      final icon = tester.getRect(find.byIcon(Icons.add));
      expect(button.height, height);
      expect(icon.size, Size.square(iconSize));
      expect(icon.left - button.left, start);
      expect(label.left - icon.right, gap);
      expect(button.right - label.right, end);
      final style = DefaultTextStyle.of(tester.element(labelFinder)).style;
      expect(style.fontSize, fontSize);
      expect(style.leadingDistribution, TextLeadingDistribution.even);
    }
  });

  testWidgets('fills a bounded width and responds to taps near the edge', (
    tester,
  ) async {
    var presses = 0;
    await pumpButton(
      tester,
      SizedBox(
        width: 280,
        child: SizedBox(
          width: double.infinity,
          child: IdsButton(
            onPressed: () => presses++,
            child: const Text('Save'),
          ),
        ),
      ),
    );

    final button = tester.getRect(find.byType(IdsButton));
    expect(button.size, const Size(280, 36));
    expect(tester.getCenter(find.text('Save')), button.center);
    await tester.tapAt(button.centerRight.translate(-8, 0));
    expect(presses, 1);
  });

  testWidgets('uses the generated status colors for solid and outline states', (
    tester,
  ) async {
    final surface = find.descendant(
      of: find.byType(IdsButton),
      matching: find.byType(AnimatedContainer),
    );
    ShapeDecoration decoration() =>
        tester.widget<AnimatedContainer>(surface).decoration!
            as ShapeDecoration;
    Color background() =>
        (decoration().gradient! as LinearGradient).colors.last;
    final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
    await mouse.addPointer(location: Offset.zero);
    addTearDown(mouse.removePointer);

    await pumpButton(
      tester,
      const IdsButton(
        onPressed: press,
        colorScheme: IdsColorScheme.danger,
        child: Text('Delete'),
      ),
    );
    final lightColors = IdsProvider.of(tester.element(surface)).colors;
    final rest = background();
    expect(rest, lightColors.bgDanger);
    final center = tester.getCenter(find.byType(IdsButton));
    await mouse.moveTo(center);
    await tester.pumpAndSettle();
    expect(background(), lightColors.bgDangerHover);
    await mouse.down(center);
    await tester.pump(kPressTimeout);
    expect(background(), lightColors.bgDangerActive);
    await mouse.up();
    await mouse.moveTo(Offset.zero);

    await pumpButton(
      tester,
      const IdsButton(
        onPressed: press,
        variant: IdsVariant.outline,
        colorScheme: IdsColorScheme.danger,
        child: Text('Delete'),
      ),
      mode: IdsMode.dark,
    );
    await tester.pumpAndSettle();
    final darkColors = IdsProvider.of(tester.element(surface)).colors;
    expect(background(), darkColors.bgNeutralSoft.withValues(alpha: .30));
    expect(
      (decoration().shape as RoundedRectangleBorder).side.color,
      darkColors.borderNeutral,
    );
    expect(
      DefaultTextStyle.of(tester.element(find.text('Delete'))).style.color,
      darkColors.textDanger,
    );
    await pumpButton(
      tester,
      const IdsButton(
        onPressed: press,
        variant: IdsVariant.glossy,
        child: Text('Delete'),
      ),
      mode: IdsMode.dark,
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 75));
    await tester.pumpAndSettle();
    expect(background(), darkColors.bgPrimary);
  });

  testWidgets(
    'keeps keyboard focus while saving and prevents repeat activation',
    (tester) async {
      final focus = FocusNode();
      addTearDown(focus.dispose);
      var presses = 0;
      var saving = false;
      late StateSetter update;
      await pumpButton(
        tester,
        StatefulBuilder(
          builder: (context, setState) {
            update = setState;
            return IdsButton(
              onPressed: () => setState(() {
                presses++;
                saving = true;
              }),
              focusNode: focus,
              disabled: saving,
              busy: saving,
              focusableWhenDisabled: true,
              leading: saving ? const IdsSpinner(decorative: true) : null,
              child: Text(saving ? 'Saving' : 'Save'),
            );
          },
        ),
      );
      final button = find.byType(IdsButton);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(focus.hasPrimaryFocus, isTrue);
      expect(
        tester
            .getSemantics(button)
            .getSemanticsData()
            .hasAction(SemanticsAction.tap),
        isTrue,
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();
      expect(presses, 1);
      expect(focus.hasPrimaryFocus, isTrue);
      expect(find.byType(IdsSpinner), findsOneWidget);
      final data = tester.getSemantics(button).getSemanticsData();
      expect(data.label, 'Saving');
      expect(data.flagsCollection.isButton, isTrue);
      expect(data.flagsCollection.isEnabled, Tristate.isFalse);
      expect(data.flagsCollection.isLiveRegion, isTrue);
      expect(data.hasAction(SemanticsAction.tap), isFalse);

      await tester.tap(button);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      expect(presses, 1);
      update(() => saving = false);
      await tester.pumpAndSettle();
      expect(focus.hasPrimaryFocus, isTrue);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      expect(presses, 2);
    },
  );

  testWidgets(
    'builder reflects keyboard focus and disabled buttons are skipped by Tab',
    (tester) async {
      final disabledFocus = FocusNode();
      addTearDown(disabledFocus.dispose);
      final states = <IdsInteractiveState>[];
      await pumpButton(
        tester,
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IdsButton(focusNode: disabledFocus, child: const Text('Disabled')),
            IdsButton.builder(
              onPressed: press,
              onInteractionChange: states.add,
              builder: (_, state) =>
                  Text(state.focusVisible ? 'Focused' : 'Ready'),
            ),
          ],
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();
      expect(disabledFocus.hasFocus, isFalse);
      expect(find.text('Focused'), findsOneWidget);
      expect(states.last.focusVisible, isTrue);
    },
  );
}
