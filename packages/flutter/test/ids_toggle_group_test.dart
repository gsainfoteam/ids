import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

enum _Format { bold, italic }

Future<void> _pump(WidgetTester tester, Widget group) async {
  await tester.pumpWidget(
    MaterialApp(
      home: IdsProvider(
        theme: testTheme,
        child: Material(child: Center(child: group)),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('vertical navigation stops at the ends when loop is off', (
    tester,
  ) async {
    final first = FocusNode();
    final last = FocusNode();
    addTearDown(first.dispose);
    addTearDown(last.dispose);
    final selection = <List<String>>[];
    await _pump(
      tester,
      IdsToggleGroup<String>.multiple(
        orientation: Axis.vertical,
        loop: false,
        onValueChange: selection.add,
        children: [
          IdsToggle(value: 'a', focusNode: first, child: const Text('First')),
          IdsToggle(value: 'b', focusNode: last, child: const Text('Last')),
        ],
      ),
    );
    first.requestFocus();
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
    expect(first.hasPrimaryFocus, isTrue);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    expect(last.hasPrimaryFocus, isTrue);
    expect(selection, isEmpty);
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    expect(selection, [
      ['b'],
    ]);
  });

  testWidgets('only a multiple-selection group preserves the separator label', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    try {
      final children = [IdsToggleGroup.separator(child: const Text('Section'))];
      await _pump(tester, IdsToggleGroup<String>(children: children));
      expect(find.semantics.byLabel('Section'), findsNothing);
      await _pump(tester, IdsToggleGroup<String>.multiple(children: children));
      expect(find.semantics.byLabel('Section'), findsOneWidget);
    } finally {
      handle.dispose();
    }
  });

  testWidgets(
    'radio arrows run the target callback before changing selection',
    (tester) async {
      final first = FocusNode();
      final last = FocusNode();
      addTearDown(first.dispose);
      addTearDown(last.dispose);
      final events = <String>[];
      await _pump(
        tester,
        IdsToggleGroup(
          defaultValue: 'first',
          onValueChange: (value) => events.add('change:$value'),
          children: [
            IdsToggle(
              value: 'first',
              focusNode: first,
              child: const Text('First'),
            ),
            IdsToggle(
              value: 'last',
              focusNode: last,
              onPressed: () => events.add('pressed'),
              child: const Text('Last'),
            ),
          ],
        ),
      );
      first.requestFocus();
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();
      expect(last.hasPrimaryFocus, isTrue);
      expect(events, ['pressed', 'change:last']);
    },
  );

  testWidgets('arrow keys select the next enabled radio and wrap', (
    tester,
  ) async {
    final root = FocusNode();
    final first = FocusNode();
    final middle = FocusNode();
    final last = FocusNode();
    for (final focus in [root, first, middle, last]) {
      addTearDown(focus.dispose);
    }
    final changes = <String?>[];
    await _pump(
      tester,
      IdsToggleGroup(
        focusNode: root,
        defaultValue: 'first',
        required: true,
        onValueChange: changes.add,
        children: [
          IdsToggle(
            value: 'first',
            focusNode: first,
            child: const Text('First'),
          ),
          IdsToggle(
            value: 'middle',
            focusNode: middle,
            disabled: true,
            child: const Text('Disabled'),
          ),
          IdsToggle(value: 'last', focusNode: last, child: const Text('Last')),
        ],
      ),
    );
    root.requestFocus();
    await tester.pumpAndSettle();
    expect(first.hasPrimaryFocus, isTrue);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pumpAndSettle();
    expect(last.hasPrimaryFocus, isTrue);
    expect(changes, ['last']);
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    await tester.pumpAndSettle();
    expect(changes, ['last']);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pumpAndSettle();
    expect(first.hasPrimaryFocus, isTrue);
    expect(changes, ['last', 'first']);
  });

  testWidgets(
    'toolbar arrows move focus and Space toggles without clearing peers',
    (tester) async {
      final first = FocusNode();
      final last = FocusNode();
      addTearDown(first.dispose);
      addTearDown(last.dispose);
      final changes = <List<_Format>>[];
      await _pump(
        tester,
        IdsToggleGroup<_Format>.multiple(
          defaultValue: const [_Format.bold],
          onValueChange: changes.add,
          children: [
            IdsToggle(
              value: _Format.bold,
              focusNode: first,
              child: const Text('First'),
            ),
            IdsToggle(
              value: _Format.italic,
              focusNode: last,
              child: const Text('Last'),
            ),
          ],
        ),
      );
      first.requestFocus();
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      expect(last.hasPrimaryFocus, isTrue);
      expect(changes, isEmpty);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(changes, [
        [_Format.bold, _Format.italic],
      ]);
    },
  );

  testWidgets('an external typed selection clears a submitted required error', (
    tester,
  ) async {
    final form = GlobalKey<FormState>();
    final selected = ValueNotifier<_Format?>(null);
    addTearDown(selected.dispose);
    final changes = <_Format?>[];
    _Format? saved;
    await _pump(
      tester,
      Form(
        key: form,
        child: ValueListenableBuilder(
          valueListenable: selected,
          builder: (_, value, _) => IdsToggleGroup<_Format>.controlled(
            value: value,
            required: true,
            onValueChange: changes.add,
            onSaved: (value) => saved = value,
            children: const [
              IdsToggle(value: _Format.bold, child: Text('Bold')),
            ],
          ),
        ),
      ),
    );
    expect(form.currentState!.validate(), isFalse);
    await tester.pumpAndSettle();
    final field = tester.state<FormFieldState<List<_Format>>>(
      find.byType(FormField<List<_Format>>),
    );
    expect(field.hasError, isTrue);
    selected.value = _Format.bold;
    await tester.pumpAndSettle();
    expect(field.hasError, isFalse);
    form.currentState!.save();
    expect(saved, _Format.bold);
    expect(changes, isEmpty);
  });

  testWidgets(
    'a controlled empty selection requests changes without changing',
    (tester) async {
      final changes = <String?>[];
      await _pump(
        tester,
        IdsToggleGroup<String>.controlled(
          value: null,
          onValueChange: changes.add,
          children: const [IdsToggle(value: 'choice', child: Text('Choice'))],
        ),
      );
      await tester.tap(find.text('Choice'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Choice'));
      await tester.pumpAndSettle();
      expect(changes, ['choice', 'choice']);
    },
  );

  testWidgets('Field forwards label focus and reflects group validation', (
    tester,
  ) async {
    final form = GlobalKey<FormState>();
    final focus = FocusNode();
    addTearDown(focus.dispose);
    await _pump(
      tester,
      SizedBox(
        width: 300,
        child: Form(
          key: form,
          child: IdsField(
            required: true,
            children: [
              const IdsFieldLabel(child: Text('Format')),
              IdsToggleGroup<String>(
                validator: (value) => value == 'bold' ? 'Choose italic' : null,
                children: [
                  IdsToggle(
                    value: 'bold',
                    focusNode: focus,
                    child: const Text('Bold'),
                  ),
                  const IdsToggle(value: 'italic', child: Text('Italic')),
                ],
              ),
              const IdsFieldError(child: Text('Invalid format')),
            ],
          ),
        ),
      ),
    );
    await tester.tap(find.text('Format'));
    await tester.pumpAndSettle();
    expect(focus.hasPrimaryFocus, isTrue);
    expect(form.currentState!.validate(), isFalse);
    await tester.pumpAndSettle();
    expect(find.text('Invalid format'), findsOneWidget);
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    await tester.pumpAndSettle();
    expect(form.currentState!.validate(), isFalse);
    await tester.sendKeyDownEvent(LogicalKeyboardKey.altLeft);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.sendKeyUpEvent(LogicalKeyboardKey.altLeft);
    await tester.pumpAndSettle();
    expect(focus.hasPrimaryFocus, isTrue);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pumpAndSettle();
    expect(form.currentState!.validate(), isTrue);
    expect(find.text('Invalid format'), findsNothing);
  });

  testWidgets('a toolbar remembers the focused item after a rebuild', (
    tester,
  ) async {
    final first = FocusNode();
    final last = FocusNode();
    final outside = FocusNode();
    addTearDown(first.dispose);
    addTearDown(last.dispose);
    addTearDown(outside.dispose);
    final selected = ValueNotifier<List<String>>(const ['last']);
    addTearDown(selected.dispose);
    await _pump(
      tester,
      Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ValueListenableBuilder(
            valueListenable: selected,
            builder: (context, value, _) => IdsToggleGroup.multiple(
              value: value,
              children: [
                IdsToggle(
                  value: 'first',
                  focusNode: first,
                  child: const Text('First'),
                ),
                IdsToggle(
                  value: 'last',
                  focusNode: last,
                  child: const Text('Last'),
                ),
              ],
            ),
          ),
          IdsButton(
            focusNode: outside,
            onPressed: () {},
            child: const Text('Outside'),
          ),
        ],
      ),
    );
    expect(first.skipTraversal, isFalse);
    expect(last.skipTraversal, isTrue);
    first.requestFocus();
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pumpAndSettle();
    outside.requestFocus();
    await tester.pumpAndSettle();
    selected.value = const ['first'];
    await tester.pumpAndSettle();
    await tester.sendKeyDownEvent(LogicalKeyboardKey.shiftLeft);
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.sendKeyUpEvent(LogicalKeyboardKey.shiftLeft);
    await tester.pumpAndSettle();
    expect(last.hasPrimaryFocus, isTrue);
  });

  testWidgets('a required form revalidates, saves and resets group values', (
    tester,
  ) async {
    final form = GlobalKey<FormState>();
    final changes = <String?>[];
    String? saved;
    await _pump(
      tester,
      Form(
        key: form,
        child: IdsToggleGroup<String>(
          required: true,
          onValueChange: changes.add,
          onSaved: (value) => saved = value,
          children: const [IdsToggle(value: 'm', child: Text('M'))],
        ),
      ),
    );
    final field = tester.state<FormFieldState<List<String>>>(
      find.byType(FormField<List<String>>),
    );
    expect(form.currentState!.validate(), isFalse);
    await tester.pump();
    expect(field.hasError, isTrue);
    await tester.tap(find.text('M'));
    await tester.pumpAndSettle();
    expect(field.hasError, isFalse);
    await tester.tap(find.text('M'));
    await tester.pumpAndSettle();
    form.currentState!.save();
    expect(saved, 'm');
    form.currentState!.reset();
    await tester.pumpAndSettle();
    expect(field.value, isEmpty);
    expect(changes, ['m']);
  });
}
