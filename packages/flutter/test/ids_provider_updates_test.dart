import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

class _Messages with IdsMessages {
  const _Messages(this.dialogClose);

  @override
  final String? dialogClose;
}

class _Consumer extends StatefulWidget {
  const _Consumer(this.name);
  final String name;

  @override
  State<_Consumer> createState() => _ConsumerState();
}

class _ConsumerState extends State<_Consumer> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    final scope = IdsProvider.of(context);
    return GestureDetector(
      onTap: () => setState(() => count++),
      child: DecoratedBox(
        key: ValueKey('${widget.name}-surface'),
        decoration: ShapeDecoration(
          color: scope.theme.primary,
          shape: scope.theme.shape(),
        ),
        child: Text(
          '${widget.name}: $count / ${scope.locale} / ${scope.translation?.dialogClose ?? IdsMessages.ko.dialogClose}',
          key: ValueKey(widget.name),
          style: scope.theme.textStyle(
            IdsTypography.bodyB3Regular,
            color: scope.theme.onPrimary,
          ),
        ),
      ),
    );
  }
}

IdsScope scopeOf(WidgetTester tester, String name) =>
    IdsProvider.of(tester.element(find.byKey(ValueKey(name))));

TextStyle renderedStyle(WidgetTester tester, String name) => tester
    .widget<RichText>(
      find.descendant(
        of: find.byKey(ValueKey(name)),
        matching: find.byType(RichText),
      ),
    )
    .text
    .style!;

void main() {
  testWidgets(
    'theme updates reach a stable child without resetting its state',
    (tester) async {
      Widget build(IdsThemeData theme, IdsPalette palette) => MaterialApp(
        home: IdsProvider(
          theme: theme,
          palette: palette,
          child: const _Consumer('child'),
        ),
      );
      await tester.pumpWidget(build(const IdsThemeData(), testPalette));
      await tester.tap(find.byKey(const ValueKey('child')));
      await tester.pump();
      final state = tester.state(find.byType(_Consumer));
      expect(find.text('child: 1 / ko_KR / 닫기'), findsOneWidget);
      await tester.pumpWidget(
        build(
          const IdsThemeData(
            fontFamily: 'Service Sans',
            radius: 18,
            cornerShape: IdsCornerShape.squircle,
          ),
          alternatePalette,
        ),
      );
      expect(tester.state(find.byType(_Consumer)), same(state));
      expect(find.text('child: 1 / ko_KR / 닫기'), findsOneWidget);
      expect(renderedStyle(tester, 'child').fontFamily, 'Service Sans');
      final decoration =
          tester
                  .widget<DecoratedBox>(
                    find.byKey(const ValueKey('child-surface')),
                  )
                  .decoration
              as ShapeDecoration;
      expect(decoration.color, alternatePalette.shade600);
      expect(decoration.shape, isA<ContinuousRectangleBorder>());
      expect(
        (decoration.shape as ContinuousRectangleBorder).borderRadius,
        BorderRadius.circular(18),
      );
      await tester.pumpWidget(build(const IdsThemeData(), testPalette));
      expect(tester.state(find.byType(_Consumer)), same(state));
      expect(
        renderedStyle(tester, 'child').fontFamily,
        'packages/ids_flutter/Pretendard GOV Variable',
      );
      expect(find.text('child: 1 / ko_KR / 닫기'), findsOneWidget);
    },
  );

  testWidgets(
    'nested overrides survive parent updates and resume inheritance when removed',
    (tester) async {
      Widget build({required bool changed, required bool overridden}) =>
          MaterialApp(
            home: IdsProvider(
              theme: changed
                  ? const IdsThemeData(fontFamily: 'Parent New', radius: 20)
                  : const IdsThemeData(),
              palette: changed ? alternatePalette : testPalette,
              translation: changed
                  ? const _Messages('Fermer')
                  : const _Messages('Close'),
              locale: changed ? const Locale('fr') : const Locale('en'),
              child: Column(
                children: [
                  const _Consumer('parent'),
                  const IdsProvider(child: _Consumer('inherited')),
                  IdsProvider(
                    theme: overridden
                        ? const IdsThemeData(
                            fontFamily: 'Child Font',
                            radius: 3,
                          )
                        : null,
                    translation: overridden ? const _Messages(null) : null,
                    locale: overridden ? const Locale('ja') : null,
                    child: const _Consumer('overridden'),
                  ),
                ],
              ),
            ),
          );
      await tester.pumpWidget(build(changed: false, overridden: true));
      expect(find.text('inherited: 0 / en / Close'), findsOneWidget);
      expect(find.text('overridden: 0 / ja / 닫기'), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('overridden')));
      await tester.pump();
      await tester.pumpWidget(build(changed: true, overridden: true));
      expect(find.text('parent: 0 / fr / Fermer'), findsOneWidget);
      expect(find.text('inherited: 0 / fr / Fermer'), findsOneWidget);
      expect(find.text('overridden: 1 / ja / 닫기'), findsOneWidget);
      expect(renderedStyle(tester, 'inherited').fontFamily, 'Parent New');
      expect(renderedStyle(tester, 'overridden').fontFamily, 'Child Font');
      expect(scopeOf(tester, 'inherited').theme.radius.standard, 20);
      expect(scopeOf(tester, 'overridden').theme.radius.standard, 3);
      expect(scopeOf(tester, 'overridden').palette, alternatePalette);
      await tester.pumpWidget(build(changed: true, overridden: false));
      expect(find.text('overridden: 1 / fr / Fermer'), findsOneWidget);
      expect(renderedStyle(tester, 'overridden').fontFamily, 'Parent New');
      expect(scopeOf(tester, 'overridden').theme.radius.standard, 20);
    },
  );

  testWidgets(
    'changed defaults do not replace user choices on the same provider',
    (tester) async {
      final palettes = <IdsPalette>[];
      final modes = <IdsMode>[];
      Widget build(IdsPalette palette, IdsMode mode) => MaterialApp(
        home: IdsProvider(
          theme: const IdsThemeData(),
          defaultPalette: palette,
          defaultMode: mode,
          onPaletteChange: palettes.add,
          onModeChange: modes.add,
          child: const _Consumer('child'),
        ),
      );
      await tester.pumpWidget(build(testPalette, IdsMode.light));
      scopeOf(tester, 'child').setColor(alternatePalette);
      scopeOf(tester, 'child').setMode(IdsMode.dark);
      await tester.pump();
      await tester.pumpWidget(build(alternatePalette, IdsMode.system));
      await tester.pumpWidget(build(testPalette, IdsMode.light));
      expect(scopeOf(tester, 'child').palette, alternatePalette);
      expect(scopeOf(tester, 'child').mode, IdsMode.dark);
      expect(palettes, [alternatePalette]);
      expect(modes, [IdsMode.dark]);
    },
  );

  testWidgets(
    'system mode uses MediaQuery and can resume after an explicit mode',
    (tester) async {
      tester.platformDispatcher.platformBrightnessTestValue = Brightness.dark;
      addTearDown(tester.platformDispatcher.clearPlatformBrightnessTestValue);
      Widget build(Brightness brightness) => MaterialApp(
        home: MediaQuery(
          data: MediaQueryData(platformBrightness: brightness),
          child: const IdsProvider(
            theme: IdsThemeData(),
            palette: testPalette,
            defaultMode: IdsMode.system,
            child: IdsProvider(child: _Consumer('child')),
          ),
        ),
      );
      await tester.pumpWidget(build(Brightness.light));
      expect(scopeOf(tester, 'child').resolvedMode, IdsMode.light);
      await tester.pumpWidget(build(Brightness.dark));
      expect(scopeOf(tester, 'child').resolvedMode, IdsMode.dark);
      scopeOf(tester, 'child').setMode(IdsMode.light);
      await tester.pump();
      expect(scopeOf(tester, 'child').resolvedMode, IdsMode.light);
      scopeOf(tester, 'child').setMode(IdsMode.system);
      await tester.pump();
      expect(scopeOf(tester, 'child').resolvedMode, IdsMode.dark);
      await tester.pumpWidget(build(Brightness.light));
      expect(scopeOf(tester, 'child').resolvedMode, IdsMode.light);
      await tester.pumpWidget(const SizedBox());
      tester.platformDispatcher.platformBrightnessTestValue = Brightness.light;
      await tester.pump();
      expect(tester.takeException(), isNull);
    },
  );
}
