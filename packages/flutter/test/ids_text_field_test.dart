import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    home: Scaffold(
      body: IdsProvider(
        theme: testTheme,
        child: Align(
          alignment: Alignment.topLeft,
          child: SizedBox(width: 300, child: child),
        ),
      ),
    ),
  ),
);

void main() {
  testWidgets('validation uses Field spacing and styling and clears on reset', (
    tester,
  ) async {
    final form = GlobalKey<FormState>();
    await pump(
      tester,
      Form(
        key: form,
        child: const IdsField(
          required: true,
          children: [
            IdsFieldLabel(child: Text('Name')),
            IdsTextField(),
            IdsFieldHint(child: Text('Hint')),
          ],
        ),
      ),
    );

    final label = find.text('Name');
    final error = find.text(IdsMessages.ko.textFieldRequired);
    final surface = find
        .descendant(
          of: find.byType(IdsTextField),
          matching: find.byType(AnimatedContainer),
        )
        .first;
    final colors = IdsProvider.of(tester.element(label)).colors;
    Color? labelColor() =>
        DefaultTextStyle.of(tester.element(label)).style.color;
    expect(labelColor(), colors.onSurface);
    expect(form.currentState!.validate(), isFalse);
    await tester.pumpAndSettle();

    expect(labelColor(), colors.textDanger);
    expect(find.text('Hint'), findsNothing);
    expect(tester.widget<Text>(error).style!.fontSize, 14);
    expect(tester.getTopLeft(error).dy - tester.getBottomLeft(surface).dy, 8);

    form.currentState!.reset();
    await tester.pumpAndSettle();
    expect(labelColor(), colors.onSurface);
    expect(error, findsNothing);
    expect(find.text('Hint'), findsOneWidget);
  });

  testWidgets('a provider update preserves the first registered input', (
    tester,
  ) async {
    final first = FocusNode();
    final second = FocusNode();
    addTearDown(first.dispose);
    addTearDown(second.dispose);
    var mode = IdsMode.light;
    late StateSetter rebuild;
    await pump(
      tester,
      StatefulBuilder(
        builder: (context, setState) {
          rebuild = setState;
          return IdsField(
            children: [
              const IdsFieldLabel(child: Text('Name')),
              IdsProviderScope(
                mode: mode,
                child: IdsTextField(focusNode: first),
              ),
              IdsTextField(focusNode: second),
            ],
          );
        },
      ),
    );

    rebuild(() => mode = IdsMode.dark);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Name'));
    await tester.pumpAndSettle();
    expect(first.hasPrimaryFocus, isTrue);
    expect(second.hasPrimaryFocus, isFalse);
  });

  testWidgets(
    'moves the focus ring with the input rather than a trailing action',
    (tester) async {
      await pump(
        tester,
        IdsTextField(
          semanticLabel: 'Search',
          trailing: IdsIconButton(
            icon: const Icon(Icons.copy),
            semanticLabel: 'Copy',
            onPressed: () {},
          ),
        ),
      );
      final surface = find
          .descendant(
            of: find.byType(IdsTextField),
            matching: find.byType(AnimatedContainer),
          )
          .first;
      final colors = IdsProvider.of(tester.element(surface)).colors;
      Color border() =>
          ((tester.widget<AnimatedContainer>(surface).decoration!
                          as ShapeDecoration)
                      .shape
                  as RoundedRectangleBorder)
              .side
              .color;

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();
      expect(border(), colors.borderPrimary);
      expect(
        tester.widget<EditableText>(find.byType(EditableText)).selectionColor,
        colors.bgPrimary.withValues(alpha: .3),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();
      expect(border(), colors.borderNeutral);
    },
  );

  testWidgets(
    'Field label focuses the input and supplies size, name and required validation',
    (tester) async {
      final form = GlobalKey<FormState>();
      await pump(
        tester,
        Form(
          key: form,
          child: const IdsField(
            size: IdsSize.tiny,
            required: true,
            children: [
              IdsFieldLabel(child: Text('Name')),
              IdsTextField(),
            ],
          ),
        ),
      );
      final input = find.byType(TextField);
      expect(tester.getSize(find.byType(IdsTextField)).height, 32);
      expect(find.bySemanticsLabel('Name'), findsAtLeastNWidgets(1));
      await tester.tap(find.text('Name'));
      await tester.pumpAndSettle();
      expect(tester.widget<TextField>(input).focusNode!.hasFocus, isTrue);
      expect(form.currentState!.validate(), isFalse);
      await tester.pump();
      expect(find.bySemanticsLabel(RegExp('값을 입력해 주세요')), findsOneWidget);
      await tester.enterText(input, 'Ada');
      expect(form.currentState!.validate(), isTrue);
      await tester.pumpAndSettle();
    },
  );

  testWidgets(
    'Clear and Escape keep input focus and reset restores the default silently',
    (tester) async {
      final form = GlobalKey<FormState>();
      final values = <String>[];
      await pump(
        tester,
        Form(
          key: form,
          child: IdsTextField(
            defaultValue: 'saved',
            clearable: true,
            semanticLabel: 'Search',
            onValueChange: values.add,
          ),
        ),
      );
      final input = find.byType(TextField);
      final editable = tester.widget<TextField>(input);
      final clear = find.byType(IdsIconButton);
      expect(clear, findsOneWidget);
      await tester.tap(input);
      await tester.pumpAndSettle();
      await tester.tap(clear);
      await tester.pumpAndSettle();
      expect(editable.focusNode!.hasFocus, isTrue);
      expect(editable.controller!.text, '');
      expect(clear, findsNothing);
      await tester.enterText(input, 'new');
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();
      expect(editable.controller!.text, '');
      expect(editable.focusNode!.hasFocus, isTrue);
      expect(values, ['', 'new', '']);
      form.currentState!.reset();
      await tester.pumpAndSettle();
      expect(editable.controller!.text, 'saved');
      expect(clear, findsOneWidget);
      expect(values, ['', 'new', '']);
    },
  );

  testWidgets('controller changes are silent and Field disabled blocks edits', (
    tester,
  ) async {
    final controller = TextEditingController(text: 'initial');
    addTearDown(controller.dispose);
    final form = GlobalKey<FormState>();
    final values = <String>[];
    final saved = <String?>[];
    bool disabled = false;
    late StateSetter update;
    await pump(
      tester,
      Form(
        key: form,
        child: StatefulBuilder(
          builder: (context, setState) {
            update = setState;
            return IdsField(
              disabled: disabled,
              children: [
                const IdsFieldLabel(child: Text('Name')),
                IdsTextField(
                  controller: controller,
                  clearable: true,
                  onValueChange: values.add,
                  onSaved: saved.add,
                ),
              ],
            );
          },
        ),
      ),
    );
    controller.text = 'programmatic';
    await tester.pump();
    form.currentState!.save();
    expect(saved, ['programmatic']);
    expect(values, isEmpty);
    expect(find.byType(IdsIconButton), findsOneWidget);
    update(() => disabled = true);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Name'));
    await tester.pumpAndSettle();
    final input = tester.widget<TextField>(find.byType(TextField));
    expect(input.enabled, isFalse);
    expect(input.focusNode!.hasFocus, isFalse);
    expect(find.byType(IdsIconButton), findsNothing);
    form.currentState!.reset();
    await tester.pumpAndSettle();
    expect(controller.text, 'initial');
    expect(values, isEmpty);
  });
}
