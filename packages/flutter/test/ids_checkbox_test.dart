import 'dart:ui' show CheckedState, ImageByteFormat;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart' show RenderRepaintBoundary;
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

Future<void> _pump(
  WidgetTester tester,
  Widget checkbox, {
  IdsMode mode = IdsMode.light,
}) => tester.pumpWidget(
  MaterialApp(
    home: IdsProvider(
      theme: testTheme,
      mode: mode,
      child: Material(child: Center(child: checkbox)),
    ),
  ),
);

SemanticsData _semantics() =>
    find.semantics.byLabel('Permission').evaluate().single.getSemanticsData();

CheckedState _checked() => _semantics().flagsCollection.isChecked;

FormFieldState<IdsCheckedState> _field(WidgetTester tester) =>
    tester.state(find.byType(FormField<IdsCheckedState>));

void main() {
  testWidgets('visible label activates and names the checkbox', (tester) async {
    final semantics = tester.ensureSemantics();
    final focus = FocusNode();
    addTearDown(focus.dispose);
    final changes = <bool>[];
    await _pump(
      tester,
      IdsCheckbox(
        label: 'Permission',
        focusNode: focus,
        onCheckedChange: changes.add,
      ),
    );
    expect(_checked(), CheckedState.isFalse);
    await tester.tap(find.text('Permission'));
    await tester.pumpAndSettle();
    expect(focus.hasPrimaryFocus, isTrue);
    expect(_checked(), CheckedState.isTrue);
    expect(changes, [true]);
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    await tester.pumpAndSettle();
    expect(_checked(), CheckedState.isFalse);
    expect(changes, [true, false]);
    semantics.dispose();
  });

  testWidgets('invalid checkbox uses the selected fill for its resting edge', (
    tester,
  ) async {
    await _pump(tester, const IdsCheckbox(invalid: true));

    ShapeDecoration decoration() =>
        tester
                .widget<AnimatedContainer>(find.byType(AnimatedContainer))
                .decoration!
            as ShapeDecoration;
    Color edge(ShapeDecoration value) =>
        (value.shape as OutlinedBorder).side.color;

    final unchecked = decoration();
    expect(edge(unchecked), isNot(unchecked.color));
    await tester.tap(find.byType(IdsCheckbox));
    await tester.pumpAndSettle();
    final selected = decoration();
    expect(edge(selected), selected.color);
  });

  testWidgets(
    'custom indicator follows checkbox state and hides when unchecked',
    (tester) async {
      final semantics = tester.ensureSemantics();
      const glyph = Key('glyph');
      final states = <IdsCheckboxState>[];
      await _pump(
        tester,
        IdsCheckbox(
          semanticLabel: 'Permission',
          defaultChecked: IdsCheckedState.indeterminate,
          child: IdsCheckboxIndicator(
            style: (state, base) => base.copyWith(size: state.checked ? 8 : 12),
            builder: (_, state) {
              states.add(state);
              return Icon(
                state.indeterminate ? Icons.remove : Icons.star,
                key: glyph,
                semanticLabel: 'Decorative indicator',
              );
            },
          ),
        ),
      );
      final checkbox = find.byType(IdsCheckbox);
      final indicator = find.byType(IdsCheckboxIndicator);
      expect(states.last.indeterminate, isTrue);
      expect(tester.getSize(find.byKey(glyph)), const Size.square(12));
      expect(find.semantics.byLabel('Decorative indicator'), findsNothing);
      await tester.tap(checkbox);
      await tester.pumpAndSettle();
      expect(states.last.checked, isTrue);
      expect(tester.widget<Icon>(find.byKey(glyph)).icon, Icons.star);
      expect(tester.getSize(find.byKey(glyph)), const Size.square(8));
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(states.last.checked || states.last.indeterminate, isFalse);
      expect(
        tester
            .widget<AnimatedOpacity>(
              find.descendant(
                of: indicator,
                matching: find.byType(AnimatedOpacity),
              ),
            )
            .opacity,
        0,
      );
      semantics.dispose();
    },
  );

  testWidgets('keyboard focus paints outside the dark checkbox surface', (
    tester,
  ) async {
    const captureKey = Key('paint');
    final focus = FocusNode();
    addTearDown(focus.dispose);
    Widget sample({bool circle = false}) => RepaintBoundary(
      key: captureKey,
      child: ColoredBox(
        color: const Color(0xff0d0d0d),
        child: SizedBox.square(
          dimension: 40,
          child: Center(
            child: IdsCheckbox(
              focusNode: focus,
              style: circle
                  ? (_, base) => ShapeDecoration(
                      color: base.color,
                      shape: const CircleBorder(),
                      shadows: base.shadows,
                    )
                  : null,
            ),
          ),
        ),
      ),
    );

    Future<List<int>> colors() async {
      final boundary = tester.renderObject<RenderRepaintBoundary>(
        find.byKey(captureKey),
      );
      return (await tester.runAsync(() async {
        final image = await boundary.toImage();
        final bytes = (await image.toByteData(
          format: ImageByteFormat.rawRgba,
        ))!;
        final colors = [
          bytes.getUint32((20 * image.width + 20) * 4),
          bytes.getUint32((20 * image.width + 10) * 4),
          bytes.getUint32((11 * image.width + 11) * 4),
        ];
        image.dispose();
        return colors;
      }))!;
    }

    await _pump(tester, sample(), mode: IdsMode.dark);
    final idle = await colors();
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pumpAndSettle();
    expect(focus.hasPrimaryFocus, isTrue);
    final focused = await colors();
    expect(focused.first, idle.first);
    expect(focused[1], isNot(idle[1]));
    expect(focused[2], isNot(idle[2]));

    focus.unfocus();
    await _pump(tester, sample(circle: true), mode: IdsMode.dark);
    await tester.pumpAndSettle();
    final idleCircle = await colors();
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pumpAndSettle();
    final circle = await colors();
    expect(circle[1], isNot(idleCircle[1]));
    expect(circle[2], idleCircle[2]);
  });

  testWidgets('a controlled checkbox can keep its mixed state', (tester) async {
    final handle = tester.ensureSemantics();
    final changes = <bool>[];
    await _pump(
      tester,
      IdsCheckbox(
        checked: IdsCheckedState.indeterminate,
        semanticLabel: 'Permission',
        onCheckedChange: changes.add,
      ),
    );
    await tester.tap(find.byType(IdsCheckbox));
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    await tester.pumpAndSettle();
    expect(_checked(), CheckedState.mixed);
    expect(changes, [true, true]);
    handle.dispose();
  });

  testWidgets('an uncontrolled mixed checkbox checks on Space but not Enter', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    final focus = FocusNode();
    addTearDown(focus.dispose);
    final changes = <bool>[];
    await _pump(
      tester,
      IdsCheckbox(
        defaultChecked: IdsCheckedState.indeterminate,
        focusNode: focus,
        semanticLabel: 'Permission',
        onCheckedChange: changes.add,
      ),
    );
    focus.requestFocus();
    await tester.pump();
    expect(_checked(), CheckedState.mixed);
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    expect(changes, isEmpty);
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    await tester.pumpAndSettle();
    expect(changes, [true]);
    expect(_checked(), CheckedState.isTrue);
    await tester.tap(find.byType(IdsCheckbox));
    await tester.pumpAndSettle();
    expect(changes, [true, false]);
    expect(_checked(), CheckedState.isFalse);
    handle.dispose();
  });

  testWidgets(
    'a controlled checkbox reports changes without changing until rebuilt',
    (tester) async {
      final handle = tester.ensureSemantics();
      final changes = <bool>[];
      await _pump(
        tester,
        IdsCheckbox(
          semanticLabel: 'Permission',
          checked: IdsCheckedState.indeterminate,
          onCheckedChange: changes.add,
        ),
      );
      await tester.tap(find.byType(IdsCheckbox));
      await tester.pumpAndSettle();
      expect(changes, [true]);
      expect(_checked(), CheckedState.mixed);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(changes, [true, true]);
      expect(_checked(), CheckedState.mixed);
      await _pump(
        tester,
        const IdsCheckbox(
          checked: IdsCheckedState.checked,
          readOnly: true,
          semanticLabel: 'Permission',
        ),
      );
      await tester.tap(find.byType(IdsCheckbox));
      await tester.pumpAndSettle();
      expect(_checked(), CheckedState.isTrue);
      expect(_semantics().hasAction(SemanticsAction.tap), isFalse);
      handle.dispose();
    },
  );

  testWidgets(
    'required validation and reset use the form without firing change',
    (tester) async {
      final handle = tester.ensureSemantics();
      final form = GlobalKey<FormState>();
      final changes = <bool>[];
      await _pump(
        tester,
        Form(
          key: form,
          child: IdsCheckbox(
            semanticLabel: 'Permission',
            required: true,
            onCheckedChange: changes.add,
          ),
        ),
      );
      expect(form.currentState!.validate(), isFalse);
      await tester.pump();
      expect(_field(tester).hasError, isTrue);
      await tester.tap(find.byType(IdsCheckbox));
      await tester.pumpAndSettle();
      expect(_field(tester).hasError, isFalse);
      expect(form.currentState!.validate(), isTrue);
      form.currentState!.reset();
      await tester.pumpAndSettle();
      expect(_checked(), CheckedState.isFalse);
      expect(changes, [true]);
      handle.dispose();
    },
  );

  testWidgets('an external checked value clears a submitted required error', (
    tester,
  ) async {
    final form = GlobalKey<FormState>();
    final checked = ValueNotifier(IdsCheckedState.unchecked);
    addTearDown(checked.dispose);
    final changes = <bool>[];
    await _pump(
      tester,
      Form(
        key: form,
        child: ValueListenableBuilder(
          valueListenable: checked,
          builder: (context, value, _) => IdsCheckbox(
            required: true,
            checked: value,
            onCheckedChange: changes.add,
          ),
        ),
      ),
    );
    expect(form.currentState!.validate(), isFalse);
    await tester.pump();
    checked.value = IdsCheckedState.checked;
    await tester.pumpAndSettle();
    expect(_field(tester).hasError, isFalse);
    expect(changes, isEmpty);
  });
}
