import 'dart:ui' show ImageByteFormat, PictureRecorder, SemanticsRole;

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';
import 'package:ids_flutter/src/interaction/control_surface.dart';

import 'test_theme.dart';

enum _Section { docs, api }

Future<void> _pump(
  WidgetTester tester,
  Widget tabs, {
  TextDirection direction = TextDirection.ltr,
}) async {
  await tester.pumpWidget(
    MaterialApp(
      home: IdsProvider(
        theme: testTheme,
        child: Material(
          child: Directionality(
            textDirection: direction,
            child: Center(child: SizedBox(width: 300, child: tabs)),
          ),
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('vertical tabs stay anchored when panel widths differ', (
    tester,
  ) async {
    await _pump(
      tester,
      const Center(
        child: IdsTabs(
          orientation: Axis.vertical,
          defaultValue: 'first',
          children: [
            IdsTabsList(
              children: [
                IdsTabsTrigger(value: 'first', child: Text('First')),
                IdsTabsTrigger(value: 'second', child: Text('Second')),
              ],
            ),
            IdsTabsContent(value: 'first', child: SizedBox(width: 160)),
            IdsTabsContent(value: 'second', child: SizedBox(width: 80)),
          ],
        ),
      ),
    );
    final bar = find.byType(IdsTabsList);
    final before = tester.getRect(bar);
    await tester.tap(find.text('Second'));
    await tester.pumpAndSettle();
    expect(tester.getRect(bar), before);
  });

  testWidgets('vertical panels constrain fields while mounted offstage', (
    tester,
  ) async {
    final controller = TextEditingController(text: 'Draft');
    addTearDown(controller.dispose);
    await _pump(
      tester,
      IdsTabs(
        orientation: Axis.vertical,
        defaultValue: 'first',
        children: [
          const IdsTabsList(
            children: [
              IdsTabsTrigger(value: 'first', child: Text('Editor')),
              IdsTabsTrigger(value: 'second', child: Text('Notes')),
            ],
          ),
          IdsTabsContent(
            value: 'first',
            forceMount: true,
            child: IdsTextField(controller: controller),
          ),
          const IdsTabsContent(
            value: 'second',
            forceMount: true,
            child: Text(
              'A panel with enough text to wrap at the available width.',
            ),
          ),
        ],
      ),
    );
    final editor = find.byType(IdsTextField);
    final tabs = find.bySubtype<IdsTabs>();
    final list = find.byType(IdsTabsList);
    expect(
      tester.getRect(editor).right,
      lessThanOrEqualTo(tester.getRect(tabs).right),
    );
    expect(
      tester.getRect(editor).left,
      greaterThan(tester.getRect(list).right),
    );
    await tester.tap(find.text('Notes'));
    await tester.pumpAndSettle();
    expect(editor, findsNothing);
    await tester.tap(find.text('Editor'));
    await tester.pumpAndSettle();
    expect(find.text('Draft'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('stretched labels truncate and update the panel name', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    final label = ValueNotifier(
      'A very long tab name that cannot fit in half the bar',
    );
    final focus = FocusNode();
    addTearDown(label.dispose);
    addTearDown(focus.dispose);
    await _pump(
      tester,
      IdsTabs(
        defaultValue: 'first',
        children: [
          IdsTabsList(
            stretch: true,
            children: [
              ValueListenableBuilder(
                valueListenable: label,
                builder: (_, text, _) => IdsTabsTrigger(
                  value: 'first',
                  focusNode: focus,
                  child: Text(text),
                ),
              ),
              const IdsTabsTrigger(value: 'second', child: Text('Other')),
            ],
          ),
          const IdsTabsContent(value: 'first', child: Text('First panel')),
          const IdsTabsContent(value: 'second', child: Text('Second panel')),
        ],
      ),
    );
    final content = find.bySubtype<IdsTabsContent>().first;
    final panel = find.descendant(
      of: content,
      matching: find.byWidgetPredicate(
        (widget) =>
            widget is Semantics &&
            widget.properties.role == SemanticsRole.tabPanel,
      ),
    );
    String? panelName() => tester.widget<Semantics>(panel).properties.label;
    expect(panelName(), label.value);
    label.value = 'Renamed';
    await tester.pumpAndSettle();
    expect(panelName(), 'Renamed');
    focus.requestFocus();
    await tester.pumpAndSettle();
    await tester.sendKeyDownEvent(LogicalKeyboardKey.metaLeft);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.sendKeyUpEvent(LogicalKeyboardKey.metaLeft);
    await tester.pumpAndSettle();
    expect(focus.hasPrimaryFocus, isTrue);
    expect(find.text('First panel'), findsOneWidget);
    expect(tester.takeException(), isNull);
    handle.dispose();
  });

  testWidgets('tab positions stay stable when selection moves', (tester) async {
    for (final (appearance, variant) in [
      (IdsTabsAppearance.enclosed, null),
      (IdsTabsAppearance.pill, IdsVariant.outline),
      (IdsTabsAppearance.pill, IdsVariant.glossy),
    ]) {
      await _pump(
        tester,
        IdsTabs(
          key: ValueKey((appearance, variant)),
          appearance: appearance,
          variant: variant,
          defaultValue: 'first',
          children: const [
            IdsTabsList(
              children: [
                IdsTabsTrigger(value: 'first', child: Text('First')),
                IdsTabsTrigger(value: 'second', child: Text('Second')),
              ],
            ),
            IdsTabsContent(value: 'first', child: Text('First panel')),
            IdsTabsContent(value: 'second', child: Text('Second panel')),
          ],
        ),
      );
      final triggers = find.bySubtype<IdsTabsTrigger>();
      final before = [
        for (var i = 0; i < 2; i++) tester.getRect(triggers.at(i)),
      ];
      await tester.tap(find.text('Second'));
      await tester.pumpAndSettle();
      expect(find.text('Second panel'), findsOneWidget);
      for (var i = 0; i < before.length; i++) {
        expect(tester.getRect(triggers.at(i)), before[i]);
      }
    }
  });

  testWidgets('focused selected outline pills use the primary border', (
    tester,
  ) async {
    final manager = FocusManager.instance;
    final strategy = manager.highlightStrategy;
    manager.highlightStrategy = FocusHighlightStrategy.alwaysTraditional;
    addTearDown(() => manager.highlightStrategy = strategy);
    final focus = FocusNode();
    addTearDown(focus.dispose);
    await _pump(
      tester,
      IdsTabs(
        appearance: IdsTabsAppearance.pill,
        variant: IdsVariant.outline,
        colorScheme: IdsColorScheme.secondary,
        defaultValue: 'first',
        children: [
          IdsTabsList(
            children: [
              IdsTabsTrigger(
                value: 'first',
                focusNode: focus,
                child: const Text('First'),
              ),
            ],
          ),
        ],
      ),
    );
    final surface = find.byType(AnimatedContainer);
    final colors = IdsProvider.of(tester.element(surface)).colors;
    Color border() {
      final decoration =
          tester.widget<AnimatedContainer>(surface).decoration!
              as ShapeDecoration;
      return (decoration.shape as OutlinedBorder).side.color;
    }

    expect(border(), colors.borderNeutral);
    focus.requestFocus();
    await tester.pumpAndSettle();
    expect(border(), colors.borderPrimary);
  });

  testWidgets('enclosed focus preserves square corners against the panel', (
    tester,
  ) async {
    final manager = FocusManager.instance;
    final previousStrategy = manager.highlightStrategy;
    manager.highlightStrategy = FocusHighlightStrategy.alwaysTraditional;
    addTearDown(() => manager.highlightStrategy = previousStrategy);
    for (final (axis, direction, expected) in [
      (Axis.horizontal, TextDirection.ltr, [false, false, true, true]),
      (Axis.vertical, TextDirection.ltr, [false, true, false, true]),
      (Axis.vertical, TextDirection.rtl, [true, false, true, false]),
    ]) {
      final focus = FocusNode();
      addTearDown(focus.dispose);
      await _pump(
        tester,
        IdsTabs(
          appearance: IdsTabsAppearance.enclosed,
          colorScheme: IdsColorScheme.tertiary,
          orientation: axis,
          defaultValue: 'first',
          children: [
            IdsTabsList(
              children: [
                IdsTabsTrigger(
                  value: 'first',
                  focusNode: focus,
                  child: const Text('First'),
                ),
              ],
            ),
            const IdsTabsContent(value: 'first', child: Text('Panel')),
          ],
        ),
        direction: direction,
      );
      focus.requestFocus();
      await tester.pumpAndSettle();
      final paint = find.descendant(
        of: find.bySubtype<IdsTabsTrigger>(),
        matching: find.byWidgetPredicate(
          (widget) =>
              widget is CustomPaint &&
              widget.foregroundPainter is ControlFocusRing,
        ),
      );
      final painter =
          tester.widget<CustomPaint>(paint).foregroundPainter!
              as ControlFocusRing;
      final colors = IdsProvider.of(tester.element(paint)).colors;
      expect(painter.color, colors.borderPrimary.withValues(alpha: .4));
      const size = Size(72, 36);
      final pixels = await tester.runAsync(() async {
        final recorder = PictureRecorder();
        final canvas = Canvas(recorder)..translate(8, 8);
        painter.paint(canvas, size);
        final picture = recorder.endRecording();
        final image = await picture.toImage(88, 52);
        final bytes = (await image.toByteData(
          format: ImageByteFormat.rawRgba,
        ))!;
        final pixels = [
          for (final (x, y) in [(6, 6), (81, 6), (6, 45), (81, 45)])
            bytes.getUint8((y * image.width + x) * 4 + 3) != 0,
        ];
        image.dispose();
        picture.dispose();
        return pixels;
      });
      expect(pixels, expected, reason: '$axis / $direction');
      final edges = await tester.runAsync(() async {
        final recorder = PictureRecorder();
        final canvas = Canvas(recorder);
        painter.shape.paint(
          canvas,
          Offset.zero & size,
          textDirection: direction,
        );
        final picture = recorder.endRecording();
        final image = await picture.toImage(
          size.width.toInt(),
          size.height.toInt(),
        );
        final bytes = (await image.toByteData(
          format: ImageByteFormat.rawRgba,
        ))!;
        final edges = [
          for (final (x, y) in [(36, 0), (71, 18), (36, 35), (0, 18)])
            bytes.getUint32((y * image.width + x) * 4),
        ];
        image.dispose();
        picture.dispose();
        return edges;
      });
      final primary =
          (colors.borderPrimary.toARGB32() << 8 & 0xffffffff) | 0xff;
      expect(edges, [
        primary,
        axis == Axis.vertical && direction == TextDirection.ltr ? 0 : primary,
        axis == Axis.horizontal ? 0 : primary,
        axis == Axis.vertical && direction == TextDirection.rtl ? 0 : primary,
      ]);
    }
  });

  testWidgets('horizontal tab bars fill bounded width without panel shifts', (
    tester,
  ) async {
    const tabs = IdsTabs(
      defaultValue: 'a',
      children: [
        IdsTabsList(
          children: [
            IdsTabsTrigger(value: 'a', child: Text('First')),
            IdsTabsTrigger(value: 'b', child: Text('Second')),
          ],
        ),
        IdsTabsContent(
          value: 'a',
          forceMount: true,
          child: SizedBox(width: 260, height: 24),
        ),
        IdsTabsContent(
          value: 'b',
          forceMount: true,
          child: SizedBox(key: Key('smaller-panel'), width: 140, height: 24),
        ),
      ],
    );
    await _pump(tester, const Center(child: tabs));
    final bar = find.byType(IdsTabsList);
    final before = tester.getRect(bar);
    expect(before.width, 300);
    await tester.tap(find.text('Second'));
    await tester.pumpAndSettle();
    expect(tester.getRect(bar), before);
    expect(tester.getSize(find.byKey(const Key('smaller-panel'))).width, 300);

    await _pump(
      tester,
      const SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: tabs,
      ),
    );
    expect(tester.getSize(bar).width, lessThan(300));
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'automatic activation skips disabled tabs and uses logical arrows',
    (tester) async {
      final first = FocusNode();
      final last = FocusNode();
      addTearDown(first.dispose);
      addTearDown(last.dispose);
      final changes = <String>[];
      await _pump(
        tester,
        IdsTabs(
          onValueChange: changes.add,
          children: [
            IdsTabsList(
              stretch: true,
              children: [
                IdsTabsTrigger(
                  value: 'first',
                  focusNode: first,
                  child: const Text('First'),
                ),
                const IdsTabsTrigger(
                  value: 'skip',
                  disabled: true,
                  child: Text('Skip'),
                ),
                IdsTabsTrigger(
                  value: 'last',
                  focusNode: last,
                  child: const Text('Last'),
                ),
              ],
            ),
            const IdsTabsContent(value: 'first', child: Text('First panel')),
            const IdsTabsContent(value: 'last', child: Text('Last panel')),
          ],
        ),
        direction: TextDirection.rtl,
      );
      expect(find.text('First panel'), findsOneWidget);
      expect(tester.getSize(find.bySubtype<IdsTabsTrigger>().first).width, 100);
      first.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();
      expect(last.hasPrimaryFocus, isTrue);
      expect(find.text('Last panel'), findsOneWidget);
      expect(changes, ['last']);
    },
  );

  testWidgets('manual mode focuses on arrows and switches on Space', (
    tester,
  ) async {
    final first = FocusNode();
    final last = FocusNode();
    addTearDown(first.dispose);
    addTearDown(last.dispose);
    await _pump(
      tester,
      IdsTabs(
        defaultValue: 'first',
        activationMode: IdsTabsActivationMode.manual,
        orientation: Axis.vertical,
        children: [
          IdsTabsList(
            children: [
              IdsTabsTrigger(
                value: 'first',
                focusNode: first,
                child: const Text('First'),
              ),
              IdsTabsTrigger(
                value: 'last',
                focusNode: last,
                child: const Text('Last'),
              ),
            ],
          ),
          const IdsTabsContent(value: 'first', child: Text('First panel')),
          const IdsTabsContent(value: 'last', child: Text('Last panel')),
        ],
      ),
    );
    first.requestFocus();
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.pumpAndSettle();
    expect(last.hasPrimaryFocus, isTrue);
    expect(find.text('First panel'), findsOneWidget);
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    await tester.pumpAndSettle();
    expect(find.text('Last panel'), findsOneWidget);
  });

  testWidgets(
    'controlled tabs stay selected until the caller updates the value',
    (tester) async {
      final archiveFocus = FocusNode();
      addTearDown(archiveFocus.dispose);
      final changes = <String>[];
      await _pump(
        tester,
        IdsTabs<String>(
          value: 'inbox',
          activationMode: IdsTabsActivationMode.manual,
          onValueChange: changes.add,
          children: [
            IdsTabsList(
              children: [
                IdsTabsTrigger<String>(
                  value: 'inbox',
                  child: const Text('Inbox'),
                ),
                IdsTabsTrigger<String>.builder(
                  value: 'archive',
                  focusNode: archiveFocus,
                  builder: (context, state) => const Text('Archive'),
                ),
                IdsTabsTrigger<String>(
                  value: 'sent',
                  child: const Text('Sent'),
                ),
              ],
            ),
            IdsTabsContent<String>(
              value: 'inbox',
              child: const Text('Inbox panel'),
            ),
            IdsTabsContent<String>(
              value: 'archive',
              child: const Text('Archive panel'),
            ),
            IdsTabsContent<String>(
              value: 'sent',
              child: const Text('Sent panel'),
            ),
          ],
        ),
      );
      await tester.tap(find.text('Archive'));
      await tester.pumpAndSettle();
      expect(archiveFocus.hasPrimaryFocus, isTrue);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(changes, ['archive', 'archive', 'archive']);
      expect(find.text('Inbox panel'), findsOneWidget);
      expect(find.text('Archive panel'), findsNothing);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(changes.last, 'sent');
      expect(find.text('Inbox panel'), findsOneWidget);
    },
  );

  testWidgets('Tab moves from the selected trigger to a visible panel ring', (
    tester,
  ) async {
    final trigger = FocusNode();
    final panel = FocusNode();
    final focusManager = FocusManager.instance;
    final originalStrategy = focusManager.highlightStrategy;
    focusManager.highlightStrategy = FocusHighlightStrategy.alwaysTraditional;
    addTearDown(() => focusManager.highlightStrategy = originalStrategy);
    addTearDown(trigger.dispose);
    addTearDown(panel.dispose);
    await _pump(
      tester,
      IdsTabs(
        defaultValue: 'editor',
        children: [
          IdsTabsList(
            children: [
              IdsTabsTrigger(
                value: 'editor',
                focusNode: trigger,
                child: const Text('Editor'),
              ),
            ],
          ),
          IdsTabsContent(
            value: 'editor',
            focusNode: panel,
            child: const IdsTextField(),
          ),
        ],
      ),
    );
    final panelPaint = find.descendant(
      of: find.bySubtype<IdsTabsContent>(),
      matching: find.byWidgetPredicate(
        (widget) =>
            widget is CustomPaint &&
            widget.foregroundPainter is ControlFocusRing,
      ),
    );
    double ringAlpha() =>
        (tester.widget<CustomPaint>(panelPaint.first).foregroundPainter!
                as ControlFocusRing)
            .color
            .a;

    trigger.requestFocus();
    await tester.pumpAndSettle();
    expect(ringAlpha(), 0);
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pumpAndSettle();
    expect(panel.hasPrimaryFocus, isTrue);
    expect(ringAlpha(), .4);
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pumpAndSettle();
    expect(panel.hasFocus, isTrue);
    expect(panel.hasPrimaryFocus, isFalse);
    expect(ringAlpha(), 0);
  });

  testWidgets('typed parts report the same value type as the root', (
    tester,
  ) async {
    final selected = ValueNotifier(_Section.docs);
    addTearDown(selected.dispose);
    final changes = <_Section>[];
    await _pump(
      tester,
      ValueListenableBuilder(
        valueListenable: selected,
        builder: (context, value, _) => IdsTabs(
          value: value,
          onValueChange: (_Section value) {
            changes.add(value);
            selected.value = value;
          },
          children: [
            IdsTabsList(
              children: [
                IdsTabsTrigger<_Section>(
                  value: _Section.docs,
                  child: const Text('Docs'),
                ),
                IdsTabsTrigger<_Section>.builder(
                  value: _Section.api,
                  style: (state, base) => state.selected
                      ? ShapeDecoration(color: Colors.green, shape: base.shape)
                      : base,
                  builder: (context, state) {
                    final _Section value = state.value;
                    return Text(value.name);
                  },
                ),
              ],
            ),
            IdsTabsContent<_Section>(
              value: _Section.docs,
              child: const Text('Guide'),
            ),
            IdsTabsContent<_Section>.builder(
              value: _Section.api,
              builder: (context, state) {
                final _Section value = state.value;
                return Text('${value.name} reference');
              },
            ),
          ],
        ),
      ),
    );

    expect(find.text('Guide'), findsOneWidget);
    await tester.tap(find.text('api'));
    await tester.pumpAndSettle();
    expect(changes, [_Section.api]);
    expect(find.text('api reference'), findsOneWidget);
    final triggerSurface = tester.widget<AnimatedContainer>(
      find.ancestor(
        of: find.text('api'),
        matching: find.byType(AnimatedContainer),
      ),
    );
    expect((triggerSurface.decoration! as ShapeDecoration).color, Colors.green);
    selected.value = _Section.docs;
    await tester.pumpAndSettle();
    expect(find.text('Guide'), findsOneWidget);
    expect(changes, [_Section.api]);
  });

  testWidgets('trigger builder reports selection separately from press state', (
    tester,
  ) async {
    late IdsTabsTriggerState<String> triggerState;
    await _pump(
      tester,
      IdsTabs(
        defaultValue: 'docs',
        children: [
          IdsTabsList(
            children: [
              IdsTabsTrigger.builder(
                value: 'docs',
                builder: (context, state) {
                  triggerState = state;
                  return const Text('Docs');
                },
              ),
              const IdsTabsTrigger(value: 'api', child: Text('API')),
            ],
          ),
        ],
      ),
    );

    expect(triggerState.selected, isTrue);
    expect(triggerState.interaction.pressed, isFalse);
    await tester.tap(find.text('API'));
    await tester.pumpAndSettle();
    expect(triggerState.selected, isFalse);
    expect(triggerState.interaction.pressed, isFalse);
  });

  testWidgets('vertical tab paint fills the shared trigger width', (
    tester,
  ) async {
    await _pump(
      tester,
      const IdsTabs(
        defaultValue: 'api',
        orientation: Axis.vertical,
        appearance: IdsTabsAppearance.pill,
        children: [
          IdsTabsList(
            children: [
              IdsTabsTrigger(value: 'docs', child: Text('Documentation')),
              IdsTabsTrigger(value: 'api', child: Text('API')),
            ],
          ),
        ],
      ),
    );
    final tabs = find.bySubtype<IdsTabsTrigger>();
    final first = tester.getSize(tabs.first);
    final last = tester.getSize(tabs.last);
    final surface = find.descendant(
      of: tabs.last,
      matching: find.byType(AnimatedContainer),
    );
    expect(last.width, first.width);
    expect(tester.getSize(surface).width, last.width);
  });

  testWidgets('clicking another tab after keyboard navigation hides the ring', (
    tester,
  ) async {
    final focusManager = FocusManager.instance;
    final strategy = focusManager.highlightStrategy;
    focusManager.highlightStrategy = FocusHighlightStrategy.alwaysTraditional;
    addTearDown(() => focusManager.highlightStrategy = strategy);

    final docsFocus = FocusNode();
    final apiFocus = FocusNode();
    addTearDown(docsFocus.dispose);
    addTearDown(apiFocus.dispose);
    await _pump(
      tester,
      IdsTabs(
        defaultValue: 'docs',
        children: [
          IdsTabsList(
            children: [
              IdsTabsTrigger(
                value: 'docs',
                focusNode: docsFocus,
                child: const Text('Docs'),
              ),
              IdsTabsTrigger(
                value: 'api',
                focusNode: apiFocus,
                child: const Text('API'),
              ),
            ],
          ),
        ],
      ),
    );

    double ringAlpha(FocusNode focus) {
      final trigger = find.byWidgetPredicate(
        (widget) => widget is IdsTabsTrigger && widget.focusNode == focus,
      );
      final paints = tester.widgetList<CustomPaint>(
        find.descendant(of: trigger, matching: find.byType(CustomPaint)),
      );
      return paints
          .map((paint) => paint.foregroundPainter)
          .whereType<ControlFocusRing>()
          .single
          .color
          .a;
    }

    await tester.tap(find.text('Docs'), kind: PointerDeviceKind.mouse);
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pumpAndSettle();
    expect(apiFocus.hasPrimaryFocus, isTrue);
    expect(ringAlpha(apiFocus), .4);

    await tester.tap(find.text('Docs'), kind: PointerDeviceKind.mouse);
    await tester.pumpAndSettle();
    expect(docsFocus.hasPrimaryFocus, isTrue);
    expect(docsFocus.skipTraversal, isFalse);
    expect(ringAlpha(docsFocus), 0);
    expect(ringAlpha(apiFocus), 0);

    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pumpAndSettle();
    expect(ringAlpha(apiFocus), .4);
  });

  testWidgets(
    'forceMount preserves input and keeps its hidden panel offstage',
    (tester) async {
      final input = FocusNode();
      final preview = FocusNode();
      addTearDown(input.dispose);
      addTearDown(preview.dispose);
      await _pump(
        tester,
        IdsTabs(
          defaultValue: 'editor',
          children: [
            const IdsTabsList(
              children: [
                IdsTabsTrigger(value: 'editor', child: Text('Editor')),
                IdsTabsTrigger(value: 'help', child: Text('Help')),
              ],
            ),
            IdsTabsContent(
              value: 'editor',
              forceMount: true,
              child: IdsTextField(focusNode: input),
            ),
            IdsTabsContent(
              value: 'help',
              focusNode: preview,
              forceMount: true,
              skipTraversal: true,
              child: const Text('Help panel'),
            ),
          ],
        ),
      );
      await tester.enterText(find.byType(TextField), 'draft');
      await tester.tap(find.text('Help'));
      await tester.pumpAndSettle();
      expect(find.byType(IdsTextField), findsNothing);
      expect(find.byType(IdsTextField, skipOffstage: false), findsOneWidget);
      expect(input.canRequestFocus, isFalse);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      expect(preview.hasPrimaryFocus, isFalse);
      expect(input.hasFocus, isFalse);
      preview.requestFocus();
      await tester.pump();
      expect(preview.hasPrimaryFocus, isTrue);
      await tester.tap(find.text('Editor'));
      await tester.pumpAndSettle();
      expect(
        tester.widget<TextField>(find.byType(TextField)).controller!.text,
        'draft',
      );
    },
  );
}
