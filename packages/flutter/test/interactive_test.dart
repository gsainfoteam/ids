import 'package:flutter/gestures.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

late InteractiveState state;
late int presses;

Future<FocusNode> pump(
  WidgetTester tester, {
  bool disabled = false,
  bool pressed = false,
  ValueChanged<InteractiveState>? onInteractionChange,
}) async {
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
            child: Interactive(
              focusNode: node,
              disabled: disabled,
              pressed: pressed,
              onInteractionChange: onInteractionChange,
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

const outside = Offset(1, 1);

void main() {
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
      await tester.tap(find.byType(Interactive), kind: PointerDeviceKind.mouse);
      await tester.pump();
      expect(state.focused, isTrue);
      expect(state.focusVisible, isFalse);
    });

    testWidgets('touch tap', (tester) async {
      await pump(tester);
      await tester.tap(find.byType(Interactive));
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
    final center = tester.getCenter(find.byType(Interactive));
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
      tester.getCenter(find.byType(Interactive)),
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

  testWidgets('losing focus drops active', (tester) async {
    final node = await pump(tester);
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.sendKeyDownEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    expect(state.active, isTrue);
    node.unfocus();
    await tester.pumpAndSettle();
    expect(state.active, isFalse);
    await tester.sendKeyUpEvent(LogicalKeyboardKey.enter);
  });

  testWidgets('a Space pressed elsewhere does not press on release', (
    tester,
  ) async {
    final node = await pump(tester);
    await tester.sendKeyDownEvent(LogicalKeyboardKey.space);
    node.requestFocus();
    await tester.pump();
    await tester.sendKeyUpEvent(LogicalKeyboardKey.space);
    await tester.pump();
    expect(presses, 0);
    expect(state.active, isFalse);
  });

  testWidgets('keys stay with a focused descendant', (tester) async {
    final inner = FocusNode();
    addTearDown(inner.dispose);
    presses = 0;
    await tester.pumpWidget(
      WidgetsApp(
        color: const Color(0xFF000000),
        builder: (_, _) => Interactive(
          onPressed: () => presses++,
          builder: (_, s) {
            state = s;
            return Focus(
              focusNode: inner,
              autofocus: true,
              child: const SizedBox(width: 100, height: 40),
            );
          },
        ),
      ),
    );
    await tester.pump();
    expect(inner.hasPrimaryFocus, isTrue);
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    expect(presses, 0);
    expect(state.active, isFalse);
  });

  testWidgets('a press that turns into a drag takes no focus', (tester) async {
    final node = await pump(tester);
    final drag = await tester.startGesture(
      tester.getCenter(find.byType(Interactive)),
    );
    await tester.pump(const Duration(milliseconds: 150));
    expect(state.active, isTrue);
    await drag.moveBy(const Offset(0, -60));
    await drag.up();
    await tester.pump();
    expect(node.hasFocus, isFalse);
    expect(presses, 0);
    expect(state.active, isFalse);
  });

  testWidgets('a held press on an inner control of another kind keeps its '
      'focus', (tester) async {
    final field = FocusNode();
    addTearDown(field.dispose);
    presses = 0;
    var inner = 0;
    await tester.pumpWidget(
      WidgetsApp(
        color: const Color(0xFF000000),
        builder: (_, _) => Center(
          child: Interactive(
            onPressed: () => presses++,
            builder: (_, _) => SizedBox(
              width: 200,
              height: 100,
              child: Center(
                child: Focus(
                  focusNode: field,
                  autofocus: true,
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => inner++,
                    child: const SizedBox(width: 50, height: 20),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
    await tester.pump();
    final moves = <bool>[];
    field.addListener(() => moves.add(field.hasPrimaryFocus));
    final press = await tester.startGesture(
      tester.getCenter(find.byType(GestureDetector).last),
    );
    await tester.pump(const Duration(milliseconds: 300));
    await press.up();
    await tester.pump();
    expect(moves, isEmpty);
    expect((presses, inner), (0, 1));
  });

  testWidgets('a key held while focus moves inside does not stick', (
    tester,
  ) async {
    final inner = FocusNode();
    addTearDown(inner.dispose);
    await tester.pumpWidget(
      WidgetsApp(
        color: const Color(0xFF000000),
        builder: (_, _) => FocusScope(
          autofocus: true,
          child: Interactive(
            onPressed: inner.requestFocus,
            builder: (_, s) {
              state = s;
              return Focus(
                focusNode: inner,
                child: const SizedBox(width: 100, height: 40),
              );
            },
          ),
        ),
      ),
    );
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.sendKeyDownEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    expect(inner.hasPrimaryFocus, isTrue);
    expect(state.active, isFalse);
    await tester.sendKeyUpEvent(LogicalKeyboardKey.enter);
  });

  group('nested', () {
    late int outerPresses;
    late int innerPresses;

    Future<FocusNode> pumpNested(
      WidgetTester tester, {
      bool innerDisabled = false,
    }) async {
      final inner = FocusNode();
      addTearDown(inner.dispose);
      outerPresses = 0;
      innerPresses = 0;
      await tester.pumpWidget(
        WidgetsApp(
          color: const Color(0xFF000000),
          builder: (_, _) => Center(
            child: Interactive(
              onPressed: () => outerPresses++,
              builder: (_, _) => SizedBox(
                width: 200,
                height: 100,
                child: Center(
                  child: Interactive(
                    focusNode: inner,
                    disabled: innerDisabled,
                    onPressed: () => innerPresses++,
                    builder: (_, _) => const SizedBox(width: 50, height: 20),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
      return inner;
    }

    testWidgets('a held press keeps focus on the inner one', (tester) async {
      final inner = await pumpNested(tester);
      final press = await tester.startGesture(
        tester.getCenter(find.byType(Interactive).last),
      );
      await tester.pump(const Duration(milliseconds: 300));
      await press.up();
      await tester.pump();
      expect((outerPresses, innerPresses), (0, 1));
      expect(inner.hasPrimaryFocus, isTrue);

      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      expect((outerPresses, innerPresses), (0, 2));
    });

    testWidgets('a press on a disabled inner one does not press the outer', (
      tester,
    ) async {
      await pumpNested(tester, innerDisabled: true);
      await tester.tap(find.byType(Interactive).last);
      expect((outerPresses, innerPresses), (0, 0));

      await tester.tapAt(
        tester.getTopLeft(find.byType(Interactive).first) + const Offset(4, 4),
      );
      expect((outerPresses, innerPresses), (1, 0));
    });
  });

  group('nested focus', () {
    late InteractiveState outer;
    late InteractiveState inner;
    late int outerPresses;

    Future<void> pumpNested(WidgetTester tester) async {
      outerPresses = 0;
      await tester.pumpWidget(
        WidgetsApp(
          color: const Color(0xFF000000),
          builder: (_, _) => FocusScope(
            autofocus: true,
            child: Center(
              child: Interactive(
                onPressed: () => outerPresses++,
                builder: (_, s) {
                  outer = s;
                  return SizedBox(
                    width: 200,
                    height: 100,
                    child: Center(
                      child: Interactive(
                        onPressed: () {},
                        builder: (_, s) {
                          inner = s;
                          return const SizedBox(width: 50, height: 20);
                        },
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      );
    }

    testWidgets('a mouse click on the inner one rings neither', (tester) async {
      await pumpNested(tester);
      await tester.tap(
        find.byType(Interactive).last,
        kind: PointerDeviceKind.mouse,
      );
      await tester.pump();
      expect(inner.focused, isTrue);
      expect(inner.focusVisible, isFalse);
      expect(outer.focusVisible, isFalse);
    });

    testWidgets('Tab rings only the one that holds focus', (tester) async {
      await pumpNested(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect((outer.focusVisible, inner.focusVisible), (true, false));

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect((outer.focusVisible, inner.focusVisible), (false, true));

      await tester.sendKeyDownEvent(LogicalKeyboardKey.shift);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.sendKeyUpEvent(LogicalKeyboardKey.shift);
      await tester.pump();
      expect((outer.focusVisible, inner.focusVisible), (true, false));
    });

    testWidgets('a mouse click on the outer one after the inner rings none', (
      tester,
    ) async {
      await pumpNested(tester);
      await tester.tap(
        find.byType(Interactive).last,
        kind: PointerDeviceKind.mouse,
      );
      await tester.tapAt(
        tester.getTopLeft(find.byType(Interactive).first) + const Offset(4, 4),
        kind: PointerDeviceKind.mouse,
      );
      await tester.pump();
      expect(outer.focused, isTrue);
      expect(outer.focusVisible, isFalse);
    });

    testWidgets('an accessibility tap still presses after a nested press', (
      tester,
    ) async {
      final semantics = tester.ensureSemantics();
      await pumpNested(tester);
      await tester.tap(find.byType(Interactive).last);
      await tester.pump();
      tester.semantics.tap(find.semantics.byAction(SemanticsAction.tap).first);
      await tester.pump();
      expect(outerPresses, 1);
      semantics.dispose();
    });
  });

  testWidgets('becoming disabled while held drops active quietly', (
    tester,
  ) async {
    await pump(tester);
    final press = await tester.startGesture(
      tester.getCenter(find.byType(Interactive)),
    );
    await tester.pump(const Duration(milliseconds: 200));
    expect(state.active, isTrue);

    await pump(tester, disabled: true);
    expect(tester.takeException(), isNull);
    expect(state.active, isFalse);
    await press.up();
  });

  testWidgets('becoming disabled drops hover', (tester) async {
    await pump(tester);
    final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
    addTearDown(mouse.removePointer);
    await mouse.addPointer(location: outside);
    await mouse.moveTo(tester.getCenter(find.byType(Interactive)));
    await tester.pump();
    expect(state.hovered, isTrue);

    await pump(tester, disabled: true);
    expect(state.hovered, isFalse);
  });

  testWidgets('disabled ignores input and focus', (tester) async {
    await pump(tester, disabled: true);
    expect(state.disabled, isTrue);
    await tester.tap(find.byType(Interactive), kind: PointerDeviceKind.mouse);
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pump();
    expect(state.focused, isFalse);
    expect(state.active, isFalse);
    expect(presses, 0);
  });

  testWidgets('onInteractionChange mirrors state', (tester) async {
    final log = <InteractiveState>[];
    await pump(tester, pressed: true, onInteractionChange: log.add);
    await tester.pump();
    expect(log, [const InteractiveState(pressed: true)]);
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pump();
    expect(
      log.last,
      const InteractiveState(pressed: true, focused: true, focusVisible: true),
    );
  });
}
