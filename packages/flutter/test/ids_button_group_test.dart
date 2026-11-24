import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

void _press() {}

Future<void> _pump(
  WidgetTester tester,
  IdsButtonGroup group, {
  TextDirection direction = TextDirection.ltr,
  double textScale = 1,
}) async {
  await tester.pumpWidget(
    MaterialApp(
      builder: (context, child) => MediaQuery(
        data: MediaQuery.of(
          context,
        ).copyWith(textScaler: TextScaler.linear(textScale)),
        child: child!,
      ),
      home: Directionality(
        textDirection: direction,
        child: IdsProvider(
          theme: testTheme,
          mode: IdsMode.light,
          child: Material(child: Center(child: group)),
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

ShapeDecoration _surface(WidgetTester tester, Key key) =>
    tester
            .widget<AnimatedContainer>(
              find.descendant(
                of: find.byKey(key),
                matching: find.byType(AnimatedContainer),
              ),
            )
            .decoration!
        as ShapeDecoration;

void main() {
  testWidgets('surface borders do not add to the control width', (
    tester,
  ) async {
    const item = Key('action');
    for (final size in IdsSize.values) {
      double? width;
      for (final variant in IdsVariant.values) {
        await _pump(
          tester,
          IdsButtonGroup(
            size: size,
            variant: variant,
            children: const [
              IdsButton(key: item, onPressed: _press, child: Text('Save')),
              IdsButton(onPressed: _press, child: Text('Delete')),
            ],
          ),
        );
        final buttonWidth = tester.getSize(find.byKey(item)).width;
        width ??= buttonWidth;
        expect(buttonWidth, width, reason: variant.name);
      }
    }
  });

  testWidgets('an explicit standard size does not stretch tiny siblings', (
    tester,
  ) async {
    const tiny = Key('tiny');
    const standard = Key('standard');
    await _pump(
      tester,
      const IdsButtonGroup(
        size: IdsSize.tiny,
        variant: IdsVariant.outline,
        children: [
          IdsIconButton(
            key: tiny,
            semanticLabel: 'Decrease',
            icon: Icon(Icons.remove),
            onPressed: _press,
          ),
          IdsButton(
            key: standard,
            size: IdsSize.standard,
            variant: IdsVariant.solid,
            onPressed: _press,
            child: Text('Fit'),
          ),
        ],
      ),
    );
    final tinyRect = tester.getRect(find.byKey(tiny));
    final standardRect = tester.getRect(find.byKey(standard));
    expect(tinyRect.size, const Size.square(32));
    expect(standardRect.height, 36);
    expect(tinyRect.top, standardRect.top);
  });

  testWidgets('a one-pixel separator sits flush against both controls', (
    tester,
  ) async {
    const first = Key('separator-first');
    const line = Key('separator-line');
    const last = Key('separator-last');
    await _pump(
      tester,
      IdsButtonGroup(
        variant: IdsVariant.solid,
        children: [
          const IdsButton(key: first, onPressed: _press, child: Text('Save')),
          IdsButtonGroup.separator(key: line),
          const IdsIconButton(
            key: last,
            semanticLabel: 'Options',
            icon: Icon(Icons.expand_more),
            onPressed: _press,
          ),
        ],
      ),
    );
    final firstRect = tester.getRect(find.byKey(first));
    final lineRect = tester.getRect(find.byKey(line));
    final lastRect = tester.getRect(find.byKey(last));
    expect(lineRect.width, 1);
    expect(lineRect.left, firstRect.right);
    expect(lastRect.left, lineRect.right);
  });

  testWidgets('labelled separators preserve text unless decorative', (
    tester,
  ) async {
    final semantics = tester.ensureSemantics();
    const line = Key('labelled-line');
    for (final decorated in [false, true]) {
      await _pump(
        tester,
        IdsButtonGroup(
          orientation: Axis.vertical,
          attached: false,
          decorativeSeparator: decorated,
          children: [
            const IdsButton(onPressed: _press, child: Text('Save')),
            IdsButtonGroup.separator(key: line, child: const Text('or')),
            const IdsButton(onPressed: _press, child: Text('Delete')),
          ],
        ),
      );
      expect(find.text('or'), findsOneWidget);
      expect(find.semantics.byLabel('or'), decorated ? findsNothing : findsOne);
      final divider = tester.widget<IdsDivider>(
        find.descendant(
          of: find.byKey(line),
          matching: find.byType(IdsDivider),
        ),
      );
      expect(divider.orientation, Axis.horizontal);
    }
    semantics.dispose();
  });

  testWidgets('inherits group size and variant with explicit overrides', (
    tester,
  ) async {
    const inherited = Key('inherited');
    const explicit = Key('explicit');
    await _pump(
      tester,
      const IdsButtonGroup(
        semanticLabel: 'Actions',
        size: IdsSize.tiny,
        variant: IdsVariant.outline,
        children: [
          IdsButtonGroup(
            children: [
              IdsIconButton(
                key: inherited,
                icon: Icon(Icons.add),
                semanticLabel: 'Add',
                onPressed: _press,
              ),
            ],
          ),
          IdsButton(
            key: explicit,
            size: IdsSize.standard,
            variant: IdsVariant.solid,
            onPressed: _press,
            child: Text('Save'),
          ),
        ],
      ),
    );
    expect(tester.getSize(find.byKey(inherited)).width, 32);
    expect((_surface(tester, inherited).shape as OutlinedBorder).side.width, 1);
    expect(
      (_surface(tester, explicit).shape as OutlinedBorder).side,
      BorderSide.none,
    );
  });

  testWidgets('attached groups square the inner corners in RTL', (
    tester,
  ) async {
    const first = Key('first');
    const last = Key('last');
    await _pump(
      tester,
      const IdsButtonGroup(
        semanticLabel: 'Actions',
        children: [
          IdsButton(key: first, onPressed: _press, child: Text('First')),
          IdsButton(key: last, onPressed: _press, child: Text('Last')),
        ],
      ),
      direction: TextDirection.rtl,
    );
    final shape = _surface(tester, first).shape as RoundedRectangleBorder;
    final radius = shape.borderRadius.resolve(TextDirection.rtl);
    expect(radius.topLeft.x, 0);
    expect(radius.topRight.x, greaterThan(0));
    expect(
      tester.getRect(find.byKey(first)).left,
      tester.getRect(find.byKey(last)).right,
    );
  });
  testWidgets('attached outline controls meet without a gap', (tester) async {
    const first = Key('first');
    const last = Key('last');
    await _pump(
      tester,
      const IdsButtonGroup(
        variant: IdsVariant.outline,
        semanticLabel: 'Actions',
        children: [
          IdsButton(key: first, onPressed: _press, child: Text('First')),
          IdsButton(key: last, onPressed: _press, child: Text('Last')),
        ],
      ),
    );
    expect(
      tester.getRect(find.byKey(last)).left,
      tester.getRect(find.byKey(first)).right,
    );
  });
  testWidgets('detached siblings keep their gap and Tab order', (tester) async {
    final first = FocusNode();
    final last = FocusNode();
    addTearDown(first.dispose);
    addTearDown(last.dispose);
    await _pump(
      tester,
      IdsButtonGroup(
        attached: false,
        variant: IdsVariant.outline,
        children: [
          IdsButton(
            focusNode: first,
            onPressed: _press,
            child: const Text('First'),
          ),
          IdsButton(
            focusNode: last,
            onPressed: _press,
            child: const Text('Last'),
          ),
        ],
      ),
    );
    final surfaces = find.byType(AnimatedContainer);
    final firstBounds = tester.getRect(surfaces.first);
    final lastBounds = tester.getRect(surfaces.last);
    expect(lastBounds.left - firstBounds.right, 8);
    first.requestFocus();
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pumpAndSettle();
    expect(last.hasPrimaryFocus, isTrue);
  });

  testWidgets('clear controls keep their own style inside scaled groups', (
    tester,
  ) async {
    for (final attached in [true, false]) {
      await _pump(
        tester,
        IdsButtonGroup(
          attached: attached,
          variant: IdsVariant.solid,
          children: const [
            SizedBox(
              width: 180,
              child: IdsTextField(clearable: true, defaultValue: 'Example'),
            ),
            IdsButton(onPressed: _press, child: Text('Go')),
          ],
        ),
        textScale: 1.5,
      );
      final clear = find.byType(IdsIconButton);
      expect(tester.widget<IdsIconButton>(clear).variant, IdsVariant.ghost);
      final surface = tester.widget<AnimatedContainer>(
        find.descendant(of: clear, matching: find.byType(AnimatedContainer)),
      );
      final shape =
          (surface.decoration! as ShapeDecoration).shape
              as RoundedRectangleBorder;
      final corners = shape.borderRadius.resolve(TextDirection.ltr);
      expect(corners.topLeft.x, 10);
      expect(corners.topRight.x, 10);
      final fieldSurface = find
          .descendant(
            of: find.byType(IdsTextField),
            matching: find.byType(AnimatedContainer),
          )
          .first;
      final button = find.byType(IdsButton);
      expect(
        tester.getSize(fieldSurface).height,
        tester.getSize(button).height,
      );
    }
  });

  testWidgets('an input surface and its adjacent button have equal height', (
    tester,
  ) async {
    await _pump(
      tester,
      const IdsButtonGroup(
        semanticLabel: 'Address',
        children: [
          SizedBox(
            width: 256,
            child: IdsTextField(
              placeholder: 'example.com',
              leading: Text('https://'),
            ),
          ),
          IdsButton(onPressed: _press, child: Text('Go')),
        ],
      ),
    );
    final surfaces = find.byType(AnimatedContainer);
    expect(
      tester.getSize(surfaces.first).height,
      tester.getSize(surfaces.last).height,
    );
  });
}
