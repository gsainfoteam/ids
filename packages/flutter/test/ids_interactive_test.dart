import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

late IdsInteractiveState state;
late int presses;

Future<FocusNode> pump(WidgetTester tester, {bool disabled = false}) async {
  final node = FocusNode();
  addTearDown(node.dispose);
  presses = 0;
  await tester.pumpWidget(
    WidgetsApp(
      color: const Color(0xFF000000),
      builder: (_, _) => FocusScope(
        autofocus: true,
        child: Center(
          child: SizedBox(
            width: 100,
            height: 40,
            child: IdsInteractive(
              focusNode: node,
              disabled: disabled,
              onPressed: () => presses++,
              builder: (_, s) {
                state = s;
                return const SizedBox.expand();
              },
            ),
          ),
        ),
      ),
    ),
  );
  return node;
}

// Center 밖의 빈 곳. 직전 입력 종류만 바꾼다.
const outside = Offset(1, 1);

void main() {
  // MIGRATION.md focusVisible 표.
  group('focusVisible', () {
    testWidgets('Tab', (tester) async {
      await pump(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(state.focused, isTrue);
      expect(state.focusVisible, isTrue);
    });

    testWidgets('mouse click', (tester) async {
      await pump(tester);
      await tester.tap(
        find.byType(IdsInteractive),
        kind: PointerDeviceKind.mouse,
      );
      await tester.pump();
      expect(state.focused, isTrue);
      expect(state.focusVisible, isFalse);
    });

    testWidgets('touch tap', (tester) async {
      await pump(tester);
      await tester.tap(find.byType(IdsInteractive));
      await tester.pump();
      expect(state.focused, isTrue);
      expect(state.focusVisible, isFalse);
    });

    testWidgets('requestFocus after keyboard', (tester) async {
      final node = await pump(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.shiftLeft);
      node.requestFocus();
      await tester.pumpAndSettle();
      expect(state.focusVisible, isTrue);
    });

    testWidgets('requestFocus after mouse', (tester) async {
      final node = await pump(tester);
      await tester.tapAt(outside, kind: PointerDeviceKind.mouse);
      node.requestFocus();
      await tester.pumpAndSettle();
      expect(state.focusVisible, isTrue);
    });

    testWidgets('requestFocus after touch', (tester) async {
      final node = await pump(tester);
      await tester.tapAt(outside);
      node.requestFocus();
      await tester.pumpAndSettle();
      expect(state.focused, isTrue);
      expect(state.focusVisible, isFalse);
    });

    testWidgets('blur clears it', (tester) async {
      final node = await pump(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      node.unfocus();
      await tester.pumpAndSettle();
      expect(state.focused, isFalse);
      expect(state.focusVisible, isFalse);
    });
  });

  testWidgets('hover is mouse only', (tester) async {
    await pump(tester);
    final center = tester.getCenter(find.byType(IdsInteractive));
    final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
    addTearDown(mouse.removePointer);
    await mouse.addPointer(location: outside);
    await mouse.moveTo(center);
    await tester.pump();
    expect(state.hovered, isTrue);
    await mouse.moveTo(outside);
    await tester.pump();
    expect(state.hovered, isFalse);
  });

  testWidgets('pointer press is active, not pressed', (tester) async {
    await pump(tester);
    final touch = await tester.startGesture(
      tester.getCenter(find.byType(IdsInteractive)),
    );
    await tester.pump(kPressTimeout);
    expect(state.active, isTrue);
    expect(state.pressed, isFalse);
    await touch.up();
    await tester.pump();
    expect(state.active, isFalse);
    expect(presses, 1);
  });

  testWidgets('Enter fires on down, Space on up', (tester) async {
    await pump(tester);
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);

    await tester.sendKeyDownEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    expect(state.active, isTrue);
    expect(presses, 1);
    await tester.sendKeyUpEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    expect(state.active, isFalse);

    await tester.sendKeyDownEvent(LogicalKeyboardKey.space);
    await tester.pump();
    expect(state.active, isTrue);
    expect(presses, 1);
    await tester.sendKeyUpEvent(LogicalKeyboardKey.space);
    await tester.pump();
    expect(state.active, isFalse);
    expect(presses, 2);
  });

  testWidgets('disabled ignores input and focus', (tester) async {
    await pump(tester, disabled: true);
    expect(state.disabled, isTrue);
    await tester.tap(
      find.byType(IdsInteractive),
      kind: PointerDeviceKind.mouse,
    );
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pump();
    expect(state.focused, isFalse);
    expect(state.active, isFalse);
    expect(presses, 0);
  });

  testWidgets('onInteractionChange mirrors state', (tester) async {
    final log = <IdsInteractiveState>[];
    await tester.pumpWidget(
      WidgetsApp(
        color: const Color(0xFF000000),
        builder: (_, _) => FocusScope(
          autofocus: true,
          child: IdsInteractive(
            pressed: true,
            onInteractionChange: log.add,
            builder: (_, _) => const SizedBox.expand(),
          ),
        ),
      ),
    );
    await tester.pump();
    expect(log, [const IdsInteractiveState(pressed: true)]);
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pump();
    expect(
      log.last,
      const IdsInteractiveState(
        pressed: true,
        focused: true,
        focusVisible: true,
      ),
    );
  });
}
