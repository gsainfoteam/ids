import 'dart:ui' show CheckedState;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

enum _Channel { email, push }

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

CheckedState _state(String label) => find.semantics
    .byLabel(label)
    .evaluate()
    .single
    .getSemanticsData()
    .flagsCollection
    .isChecked;

FormFieldState<List<String>> _field(WidgetTester tester) =>
    tester.state(find.byType(FormField<List<String>>));

void main() {
  testWidgets('typed parts keep enum values through selection and saving', (
    tester,
  ) async {
    final form = GlobalKey<FormState>();
    final changes = <List<_Channel>>[];
    List<_Channel>? saved;
    await _pump(
      tester,
      Form(
        key: form,
        child: IdsCheckboxGroup<_Channel>(
          defaultValue: const [_Channel.email],
          onValueChange: changes.add,
          onSaved: (values) => saved = values,
          children: [
            IdsCheckboxGroupAll(label: 'Select all'),
            IdsCheckboxGroupItem<_Channel>(value: _Channel.email),
            IdsCheckboxGroupItem<_Channel>(value: _Channel.push),
          ],
        ),
      ),
    );
    final email = tester.widget<IdsCheckboxGroupItem<_Channel>>(
      find.byType(IdsCheckboxGroupItem<_Channel>).first,
    );
    expect(email.value, _Channel.email);
    await tester.tap(find.text('Select all'));
    await tester.pumpAndSettle();
    final expected = [_Channel.email, _Channel.push];
    expect(changes.single, expected);
    form.currentState!.save();
    expect(saved, expected);
  });

  testWidgets('root style gets the current selection and keeps the group', (
    tester,
  ) async {
    const styled = Key('styled');
    Color color() => tester.widget<ColoredBox>(find.byKey(styled)).color;

    await _pump(
      tester,
      IdsCheckboxGroup<String>(
        defaultValue: const ['a'],
        style: (_, state, child) => ColoredBox(
          key: styled,
          color: state.value.length > 1 ? Colors.blue : Colors.transparent,
          child: child,
        ),
        children: [
          IdsCheckboxGroupItem<String>(value: 'a'),
          IdsCheckboxGroupItem<String>(key: const Key('b'), value: 'b'),
        ],
      ),
    );
    expect(color(), Colors.transparent);
    await tester.tap(find.byKey(const Key('b')));
    await tester.pumpAndSettle();
    expect(color(), Colors.blue);
  });

  testWidgets(
    'read-only group keeps its value when items and all are pressed',
    (tester) async {
      final form = GlobalKey<FormState>();
      final changes = <List<String>>[];
      List<String>? saved;
      await _pump(
        tester,
        Form(
          key: form,
          child: IdsCheckboxGroup<String>(
            defaultValue: const ['a'],
            readOnly: true,
            onValueChange: changes.add,
            onSaved: (values) => saved = values,
            children: const [
              IdsCheckboxGroupAll(label: 'Select all'),
              IdsCheckbox(value: 'a'),
              IdsCheckbox(value: 'b', label: 'Option B'),
            ],
          ),
        ),
      );
      await tester.tap(find.text('Option B'));
      await tester.tap(find.text('Select all'));
      await tester.pumpAndSettle();
      expect(changes, isEmpty);
      form.currentState!.save();
      expect(saved, ['a']);
    },
  );

  testWidgets('select all ignores disabled items and reports mixed state', (
    tester,
  ) async {
    final semantics = tester.ensureSemantics();
    final changes = <List<String>>[];
    final states = <IdsCheckboxState>[];
    final focus = FocusNode();
    addTearDown(focus.dispose);
    await _pump(
      tester,
      IdsCheckboxGroup(
        defaultValue: const ['a', 'c'],
        onValueChange: changes.add,
        children: [
          IdsCheckboxGroupAll(
            semanticLabel: 'All',
            focusNode: focus,
            autofocus: true,
            builder: (_, state) {
              states.add(state);
              return const IdsCheckboxIndicator();
            },
            style: (state, base) => state.checked
                ? ShapeDecoration(
                    color: base.color,
                    shape: const CircleBorder(),
                  )
                : base,
          ),
          const IdsCheckboxGroupItem(value: 'a', semanticLabel: 'Alpha'),
          const IdsCheckbox(value: 'b', semanticLabel: 'Beta'),
          const IdsCheckboxGroupItem(
            value: 'c',
            disabled: true,
            semanticLabel: 'Gamma',
          ),
        ],
      ),
    );
    expect(_state('All'), CheckedState.mixed);
    expect(states.last.indeterminate, isTrue);
    expect(focus.hasPrimaryFocus, isTrue);
    await tester.tap(find.byType(IdsCheckboxGroupAll));
    await tester.pumpAndSettle();
    expect(_state('All'), CheckedState.isTrue);
    expect(states.last.checked, isTrue);
    expect(
      tester
          .widget<AnimatedContainer>(
            find.descendant(
              of: find.byType(IdsCheckboxGroupAll),
              matching: find.byType(AnimatedContainer),
            ),
          )
          .decoration,
      isA<ShapeDecoration>().having(
        (value) => value.shape,
        'shape',
        isA<CircleBorder>(),
      ),
    );
    expect(_state('Beta'), CheckedState.isTrue);
    expect(changes.single, ['a', 'c', 'b']);
    await tester.tap(find.byType(IdsCheckboxGroupAll));
    await tester.pumpAndSettle();
    expect(_state('All'), CheckedState.isFalse);
    expect(states.last.checked || states.last.indeterminate, isFalse);
    expect(_state('Gamma'), CheckedState.isTrue);
    expect(changes.last, ['c']);
    semantics.dispose();
  });

  testWidgets('the group hands focus to the checked enabled item', (
    tester,
  ) async {
    final group = FocusNode();
    final first = FocusNode();
    final checked = FocusNode();
    addTearDown(group.dispose);
    addTearDown(first.dispose);
    addTearDown(checked.dispose);
    await _pump(
      tester,
      IdsCheckboxGroup(
        focusNode: group,
        defaultValue: const ['b'],
        children: [
          IdsCheckboxGroupItem(value: 'a', focusNode: first),
          IdsCheckboxGroupItem(value: 'b', focusNode: checked),
        ],
      ),
    );
    group.requestFocus();
    await tester.pumpAndSettle();
    expect(checked.hasPrimaryFocus, isTrue);
    expect(first.hasFocus, isFalse);
  });

  testWidgets(
    'the required group validates and resets without emitting a change',
    (tester) async {
      final key = GlobalKey<FormState>();
      final changes = <List<String>>[];
      await _pump(
        tester,
        Form(
          key: key,
          child: IdsCheckboxGroup<String>(
            required: true,
            onValueChange: changes.add,
            children: const [IdsCheckboxGroupItem(value: 'a')],
          ),
        ),
      );
      expect(key.currentState!.validate(), isFalse);
      await tester.pump();
      expect(_field(tester).hasError, isTrue);
      await tester.tap(find.byType(IdsCheckboxGroupItem<String>));
      await tester.pumpAndSettle();
      expect(_field(tester).hasError, isFalse);
      expect(key.currentState!.validate(), isTrue);
      key.currentState!.reset();
      await tester.pumpAndSettle();
      expect(key.currentState!.validate(), isFalse);
      expect(changes, [
        ['a'],
      ]);
    },
  );

  testWidgets('a mixed select-all indicator does not invalidate the field', (
    tester,
  ) async {
    final form = GlobalKey<FormState>();
    await _pump(
      tester,
      Form(
        key: form,
        child: const IdsField(
          required: true,
          children: [
            IdsFieldLabel(child: Text('Channels')),
            IdsCheckboxGroup<String>(
              children: [
                IdsCheckboxGroupAll(label: 'All'),
                IdsCheckboxGroupItem(value: 'a', label: 'First'),
                IdsCheckboxGroupItem(value: 'b', label: 'Second'),
              ],
            ),
          ],
        ),
      ),
    );
    expect(form.currentState!.validate(), isFalse);
    await tester.tap(find.text('First'));
    await tester.pumpAndSettle();
    expect(form.currentState!.validate(), isTrue);
  });

  testWidgets('external group selection clears a submitted required error', (
    tester,
  ) async {
    final form = GlobalKey<FormState>();
    final values = ValueNotifier<List<String>>([]);
    addTearDown(values.dispose);
    final changes = <List<String>>[];
    await _pump(
      tester,
      Form(
        key: form,
        child: ValueListenableBuilder(
          valueListenable: values,
          builder: (context, value, _) => IdsCheckboxGroup(
            required: true,
            value: value,
            onValueChange: changes.add,
            children: const [IdsCheckboxGroupItem(value: 'a')],
          ),
        ),
      ),
    );
    expect(form.currentState!.validate(), isFalse);
    await tester.pump();
    values.value = ['a'];
    await tester.pumpAndSettle();
    expect(_field(tester).hasError, isFalse);
    expect(changes, isEmpty);
  });
}
