import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'fixtures/slang/generated/translations.g.dart';
import 'test_theme.dart';

class _MissingMessages with IdsMessages {
  const _MissingMessages();
}

class _EmptyMessages with IdsMessages {
  const _EmptyMessages();

  @override
  String get spinnerLabel => '';
}

Widget host(Widget child) =>
    Directionality(textDirection: TextDirection.ltr, child: child);

void main() {
  testWidgets('the root requires an explicit theme and palette', (
    tester,
  ) async {
    await tester.pumpWidget(host(const IdsProvider(child: SizedBox())));
    expect(tester.takeException(), isA<FlutterError>());
    await tester.pumpWidget(
      host(const IdsProvider(theme: IdsThemeData(), child: SizedBox())),
    );
    expect(tester.takeException(), isA<FlutterError>());
    await tester.pumpWidget(
      host(const IdsProvider(palette: testPalette, child: SizedBox())),
    );
    expect(tester.takeException(), isA<FlutterError>());
  });

  testWidgets('lookup outside a provider fails clearly', (tester) async {
    await tester.pumpWidget(
      host(
        Builder(
          builder: (context) {
            expect(IdsProvider.maybeOf(context), isNull);
            expect(() => IdsProvider.of(context), throwsFlutterError);
            return const SizedBox();
          },
        ),
      ),
    );
  });

  testWidgets('controlled setters report changes and wait for incoming props', (
    tester,
  ) async {
    late IdsScope scope;
    final palettes = <IdsPalette>[];
    final modes = <IdsMode>[];
    Widget build(IdsPalette palette, IdsMode mode) => host(
      IdsProvider(
        theme: const IdsThemeData(),
        palette: palette,
        mode: mode,
        onPaletteChange: palettes.add,
        onModeChange: modes.add,
        child: Builder(
          builder: (context) {
            scope = IdsProvider.of(context);
            return const SizedBox();
          },
        ),
      ),
    );
    await tester.pumpWidget(build(testPalette, IdsMode.light));
    scope.setColor(testPalette);
    scope.setMode(IdsMode.light);
    expect(palettes, isEmpty);
    expect(modes, isEmpty);
    scope.setColor(alternatePalette);
    scope.toggleMode();
    await tester.pump();
    expect(scope.palette, testPalette);
    expect(scope.mode, IdsMode.light);
    expect(palettes, [alternatePalette]);
    expect(modes, [IdsMode.dark]);
    await tester.pumpWidget(build(alternatePalette, IdsMode.dark));
    expect(scope.palette, alternatePalette);
    expect(scope.resolvedMode, IdsMode.dark);
  });

  testWidgets(
    'uncontrolled defaults initialize once and setters update locally',
    (tester) async {
      late IdsScope scope;
      final changes = <IdsPalette>[];
      Widget build(IdsPalette initial) => host(
        IdsProvider(
          theme: const IdsThemeData(),
          defaultPalette: initial,
          onPaletteChange: changes.add,
          child: Builder(
            builder: (context) {
              scope = IdsProvider.of(context);
              return const SizedBox();
            },
          ),
        ),
      );
      await tester.pumpWidget(build(testPalette));
      expect(scope.mode, IdsMode.light);
      expect(scope.locale, const Locale('ko', 'KR'));
      scope.setColor(alternatePalette);
      scope.setColor(alternatePalette);
      scope.toggleMode();
      await tester.pump();
      expect(changes, [alternatePalette]);
      expect(scope.palette, alternatePalette);
      expect(scope.mode, IdsMode.dark);
      await tester.pumpWidget(build(testPalette));
      expect(scope.palette, alternatePalette);
      expect(scope.mode, IdsMode.dark);
    },
  );

  testWidgets(
    'nested settings and setters inherit their nearest owner independently',
    (tester) async {
      late IdsScope root;
      late IdsScope inherited;
      late IdsScope nested;
      final translations = Translations().ids;
      await tester.pumpWidget(
        host(
          IdsProvider(
            theme: const IdsThemeData(),
            defaultPalette: testPalette,
            translation: translations,
            locale: const Locale('en', 'US'),
            child: Builder(
              builder: (context) {
                root = IdsProvider.of(context);
                return Column(
                  children: [
                    IdsProvider(
                      child: Builder(
                        builder: (context) {
                          inherited = IdsProvider.of(context);
                          return const SizedBox();
                        },
                      ),
                    ),
                    IdsProvider(
                      theme: const IdsThemeData(radius: 12),
                      defaultMode: IdsMode.dark,
                      locale: const Locale('ja'),
                      child: Builder(
                        builder: (context) {
                          nested = IdsProvider.of(context);
                          return const SizedBox();
                        },
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      );
      expect(inherited.theme.data, root.theme.data);
      expect(nested.theme.radius.standard, 12);
      expect(nested.translation, translations);
      expect(nested.locale, const Locale('ja'));
      inherited.setMode(IdsMode.dark);
      nested.setColor(alternatePalette);
      await tester.pump();
      expect(root.palette, alternatePalette);
      expect(inherited.palette, alternatePalette);
      expect(root.mode, IdsMode.dark);
      nested.toggleMode();
      await tester.pump();
      expect(nested.mode, IdsMode.light);
      expect(root.mode, IdsMode.dark);
    },
  );

  testWidgets('a nested palette isolates changes from its parent', (
    tester,
  ) async {
    late IdsScope root;
    late IdsScope nested;
    await tester.pumpWidget(
      host(
        IdsProvider(
          theme: const IdsThemeData(),
          defaultPalette: testPalette,
          child: Builder(
            builder: (context) {
              root = IdsProvider.of(context);
              return IdsProvider(
                defaultPalette: alternatePalette,
                child: Builder(
                  builder: (context) {
                    nested = IdsProvider.of(context);
                    return const SizedBox();
                  },
                ),
              );
            },
          ),
        ),
      ),
    );
    nested.setColor(testPalette);
    await tester.pump();
    expect(root.palette, testPalette);
    expect(nested.palette, testPalette);
    root.setColor(alternatePalette);
    await tester.pump();
    expect(nested.palette, testPalette);
  });

  testWidgets(
    'system mode reacts to brightness and toggles to an explicit mode',
    (tester) async {
      tester.platformDispatcher.platformBrightnessTestValue = Brightness.light;
      addTearDown(tester.platformDispatcher.clearPlatformBrightnessTestValue);
      late IdsScope scope;
      await tester.pumpWidget(
        host(
          IdsProvider(
            theme: const IdsThemeData(),
            palette: testPalette,
            defaultMode: IdsMode.system,
            child: IdsProvider(
              child: Builder(
                builder: (context) {
                  scope = IdsProvider.of(context);
                  return const SizedBox();
                },
              ),
            ),
          ),
        ),
      );
      expect(scope.mode, IdsMode.system);
      expect(scope.resolvedMode, IdsMode.light);
      tester.platformDispatcher.platformBrightnessTestValue = Brightness.dark;
      await tester.pump();
      expect(scope.resolvedMode, IdsMode.dark);
      scope.toggleMode();
      await tester.pump();
      expect(scope.mode, IdsMode.light);
      expect(scope.resolvedMode, IdsMode.light);
      tester.platformDispatcher.platformBrightnessTestValue = Brightness.light;
      await tester.pump();
      expect(scope.mode, IdsMode.light);
    },
  );

  testWidgets(
    'slang object changes rebuild IDS semantics and missing messages fall back',
    (tester) async {
      final semantics = tester.ensureSemantics();
      Widget build(
        IdsMessages? translation, {
        String? label,
        bool decorative = false,
      }) => host(
        IdsProvider(
          theme: const IdsThemeData(),
          palette: testPalette,
          translation: translation,
          locale: const Locale('en'),
          child: IdsSpinner(semanticLabel: label, decorative: decorative),
        ),
      );
      await tester.pumpWidget(build(Translations().ids));
      await tester.pump(const Duration(milliseconds: 100));
      expect(find.semantics.byLabel('Loading'), findsOne);
      final japanese = await tester.runAsync(() => AppLocale.ja.build());
      await tester.pumpWidget(build(japanese!.ids));
      expect(find.semantics.byLabel('読み込み中'), findsOne);
      await tester.pumpWidget(build(const _MissingMessages()));
      expect(find.semantics.byLabel('불러오는 중'), findsOne);
      await tester.pumpWidget(build(const _EmptyMessages()));
      expect(find.semantics.byLabel('불러오는 중'), findsNothing);
      await tester.pumpWidget(build(Translations().ids, label: 'Custom'));
      expect(find.semantics.byLabel('Custom'), findsOne);
      await tester.pumpWidget(build(Translations().ids, decorative: true));
      expect(find.semantics.byLabel('Loading'), findsNothing);
      await tester.pumpWidget(build(null));
      expect(find.semantics.byLabel('불러오는 중'), findsOne);
      semantics.dispose();
    },
  );

  testWidgets(
    'IDS settings leave application themes, text, icons and locale intact',
    (tester) async {
      late ThemeData materialTheme;
      late TextStyle plainStyle;
      late IconThemeData icons;
      late Locale locale;
      late double textScale;
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData(fontFamily: 'Service Sans'),
          home: DefaultTextStyle(
            style: const TextStyle(fontFamily: 'Plain', color: Colors.pink),
            child: IconTheme(
              data: const IconThemeData(color: Colors.green),
              child: MediaQuery(
                data: const MediaQueryData(textScaler: TextScaler.linear(1.5)),
                child: IdsProvider(
                  theme: const IdsThemeData(fontFamily: 'IDS Custom'),
                  palette: testPalette,
                  mode: IdsMode.dark,
                  locale: const Locale('ko', 'KR'),
                  child: Builder(
                    builder: (context) {
                      materialTheme = Theme.of(context);
                      plainStyle = DefaultTextStyle.of(context).style;
                      icons = IconTheme.of(context);
                      locale = Localizations.localeOf(context);
                      textScale = MediaQuery.textScalerOf(context).scale(10);
                      return const IdsLabel(child: Text('IDS'));
                    },
                  ),
                ),
              ),
            ),
          ),
        ),
      );
      expect(materialTheme.textTheme.bodyMedium!.fontFamily, 'Service Sans');
      expect(plainStyle.fontFamily, 'Plain');
      expect(plainStyle.color, Colors.pink);
      expect(icons.color, Colors.green);
      expect(locale.languageCode, 'en');
      expect(textScale, 15);
      final rich = tester.widget<RichText>(
        find.descendant(of: find.text('IDS'), matching: find.byType(RichText)),
      );
      expect(rich.text.style!.fontFamily, 'IDS Custom');
      expect(rich.text.style!.color, const Color(0xfffafafa));
    },
  );
}
