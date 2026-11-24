import 'dart:ui' show PointerDeviceKind;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

import 'package:ids_flutter/src/interaction/control_color_states.dart';

Future<void> _pump(
  WidgetTester tester,
  Widget button, {
  TextDirection direction = TextDirection.ltr,
  IdsTheme theme = testTheme,
}) => tester.pumpWidget(
  MaterialApp(
    home: IdsProvider(
      theme: theme,
      child: Material(
        child: Directionality(
          textDirection: direction,
          child: Center(
            child: SizedBox(
              key: const Key('frame'),
              width: 320,
              height: 240,
              child: button,
            ),
          ),
        ),
      ),
    ),
  ),
);

void main() {
  testWidgets('a floating outline uses neutral hover and press surfaces', (
    tester,
  ) async {
    await _pump(
      tester,
      IdsFloatingButton(
        variant: IdsVariant.outline,
        colorScheme: IdsColorScheme.danger,
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
    );
    final surface = find.byType(AnimatedContainer);
    final colors = IdsProvider.of(tester.element(surface)).colors;
    Color? fill() =>
        (tester.widget<AnimatedContainer>(surface).decoration!
                as ShapeDecoration)
            .color;
    final center = tester.getCenter(surface);
    final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
    await mouse.addPointer(location: center);
    await tester.pumpAndSettle();
    expect(fill(), colors.bgNeutralSoft);

    await mouse.down(center);
    await tester.pump(const Duration(milliseconds: 150));
    await tester.pumpAndSettle();
    expect(fill(), colors.bgNeutralSoftHover);
    await mouse.up();
    await mouse.removePointer();
  });

  testWidgets('an icon supplies the button name unless overridden', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    final label = ValueNotifier<String?>(null);
    addTearDown(label.dispose);
    var presses = 0;
    await _pump(
      tester,
      ValueListenableBuilder(
        valueListenable: label,
        builder: (context, value, _) => IdsFloatingButton(
          semanticLabel: value,
          onPressed: () => presses++,
          child: const Icon(Icons.edit, semanticLabel: 'Compose'),
        ),
      ),
    );
    final compose = find.semantics.byLabel('Compose');
    expect(compose, findsOne);
    expect(
      compose.evaluate().single.getSemanticsData().flagsCollection.isButton,
      isTrue,
    );
    await tester.tap(find.byType(Icon));
    await tester.pumpAndSettle();
    expect(presses, 1);

    label.value = 'New draft';
    await tester.pumpAndSettle();
    expect(compose, findsNothing);
    expect(find.semantics.byLabel('New draft'), findsOne);
    handle.dispose();
  });

  testWidgets(
    'icon-only buttons are circular and move with logical placement',
    (tester) async {
      const icon = Icon(Icons.add, semanticLabel: 'Add');
      const placements = IdsFloatingPlacement.values;
      for (final size in IdsSize.values) {
        final side = size == IdsSize.tiny ? 44.0 : 56.0;
        for (final direction in TextDirection.values) {
          for (final placement in placements) {
            await _pump(
              tester,
              IdsFloatingButton(placement: placement, size: size, child: icon),
              direction: direction,
            );
            await tester.pumpAndSettle();
            final surface = find.byType(AnimatedContainer);
            final frame = tester.getRect(find.byKey(const Key('frame')));
            final bounds = tester.getRect(surface);
            final isTop =
                placement == IdsFloatingPlacement.topLeft ||
                placement == IdsFloatingPlacement.topRight;
            final isStart =
                placement == IdsFloatingPlacement.topLeft ||
                placement == IdsFloatingPlacement.bottomLeft;
            final isLeft = isStart == (direction == TextDirection.ltr);
            expect(bounds.size, Size.square(side));
            expect(
              bounds.left,
              isLeft ? frame.left + 24 : frame.right - 24 - side,
            );
            expect(
              bounds.top,
              isTop ? frame.top + 24 : frame.bottom - 24 - side,
            );
            final decoration =
                tester.widget<AnimatedContainer>(surface).decoration!
                    as ShapeDecoration;
            final border = decoration.shape as RoundedRectangleBorder;
            expect(border.borderRadius.resolve(direction).topLeft.x, side / 2);
          }
        }
      }
    },
  );

  testWidgets(
    'an extended button uses standard corners and activates by keyboard',
    (tester) async {
      final focus = FocusNode();
      addTearDown(focus.dispose);
      var presses = 0;
      await _pump(
        tester,
        IdsFloatingButton(
          leading: const Icon(Icons.add),
          focusNode: focus,
          onPressed: () => presses++,
          child: const Text('Compose'),
        ),
      );
      final surface = find.byType(AnimatedContainer);
      final bounds = tester.getRect(surface);
      expect(bounds.height, 56);
      expect(bounds.width, greaterThan(56));
      final decoration =
          tester.widget<AnimatedContainer>(surface).decoration!
              as ShapeDecoration;
      final border = decoration.shape as RoundedRectangleBorder;
      expect(border.borderRadius.resolve(TextDirection.ltr).topLeft.x, 10);
      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      expect(presses, 1);
      await tester.tap(find.text('Compose'));
      expect(presses, 2);
    },
  );

  testWidgets('loading keeps focus, blocks presses and uses the icon size', (
    tester,
  ) async {
    final focus = FocusNode();
    addTearDown(focus.dispose);
    final busy = ValueNotifier(false);
    addTearDown(busy.dispose);
    var presses = 0;
    await _pump(
      tester,
      ValueListenableBuilder(
        valueListenable: busy,
        builder: (context, loading, _) => IdsFloatingButton(
          focusNode: focus,
          disabled: loading,
          busy: loading,
          focusableWhenDisabled: true,
          leading: loading
              ? const IdsSpinner(decorative: true)
              : const Icon(Icons.check),
          onPressed: () {
            presses++;
            busy.value = true;
          },
          child: Text(loading ? 'Uploading' : 'Upload'),
        ),
      ),
      theme: const IdsTheme(
        primary: IdsThemeColor.seed(Color(0xFF155DFC)),
        scale: 1.5,
      ),
    );
    await tester.tap(find.text('Upload'));
    await tester.pump();
    expect(focus.hasPrimaryFocus, isTrue);
    expect(tester.getSize(find.byType(IdsSpinner)), const Size.square(36));
    await tester.tap(find.text('Uploading'));
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    expect(presses, 1);
    expect(focus.hasPrimaryFocus, isTrue);
    busy.value = false;
    await tester.pumpAndSettle();
    expect(find.text('Upload'), findsOneWidget);
    expect(focus.hasPrimaryFocus, isTrue);
  });
}
