import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';

import 'test_theme.dart';

class _Japanese extends IdsMessagesEn {
  const _Japanese();

  @override
  String get language => 'ja';

  @override
  String get commonLoading => '読み込み中';
}

class _Silent extends IdsMessagesKo {
  const _Silent();

  @override
  String get commonLoading => '';
}

Widget host(Widget child) =>
    Directionality(textDirection: TextDirection.ltr, child: child);

IdsColors colorsOf(IdsTheme theme, IdsMode mode) =>
    IdsResolvedTheme(theme: theme, mode: mode).colors;

void main() {
  testWidgets('colors read as the CSS role names in camelCase', (tester) async {
    late IdsScope scope;
    await tester.pumpWidget(
      host(
        IdsProvider(
          theme: testTheme,
          child: Builder(
            builder: (context) {
              scope = IdsProvider.of(context);
              return const SizedBox();
            },
          ),
        ),
      ),
    );
    final colors = scope.colors;
    expect(colors.bgBase, const Color(0xFFFFFFFF));
    expect(colors.textNeutralStrong, const Color(0xFF0A0A0A));
    expect(colors.borderNeutral, const Color(0xFFE5E5E5));
    expect(colors.textNeutral, const Color(0xFF525252));
    expect(colors.bgPrimarySolid, const Color(0xFF155DFC));
    expect(colors['bg-primary-soft'], colors.bgPrimarySoft);
    expect(colors['text-on-primary-soft'], colors.textOnPrimarySoft);
    expect(colors.roles.keys, IdsColorRoles.all);
  });

  testWidgets(
    'resolved text styles replace inherited font packages at render time',
    (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData(fontFamily: 'Service Sans', package: 'service'),
          home: Material(
            child: IdsProvider(
              theme: testTheme,
              child: Builder(
                builder: (context) {
                  final ids = IdsProvider.of(context);
                  return Column(
                    children: [
                      Text(
                        'Sans',
                        style: ids.textStyle(
                          IdsTypography.bodyB3Regular,
                          color: ids.colors.textNeutralStrong,
                        ),
                      ),
                      Text(
                        'Mono',
                        style: ids.textStyle(
                          IdsTypography.bodyB3Regular,
                          color: ids.colors.textNeutralStrong,
                          mono: true,
                        ),
                      ),
                      TextField(
                        style: ids.textStyle(
                          IdsTypography.bodyB3Regular,
                          color: ids.colors.textNeutralStrong,
                          mono: true,
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),
        ),
      );
      expect(tester.takeException(), isNull);
      for (final (text, family, fallback) in [
        ('Sans', 'packages/ids_flutter/Pretendard GOV Variable', null),
        (
          'Mono',
          'packages/ids_flutter/Geist Mono Variable',
          IdsTypography.monoFontFamilyFallback,
        ),
      ]) {
        final style = tester
            .widget<RichText>(
              find.descendant(
                of: find.text(text),
                matching: find.byType(RichText),
              ),
            )
            .text
            .style!;
        expect(style.fontFamily, family);
        expect(style.fontFamilyFallback, fallback);
        expect(style.fontSize, IdsTypography.bodyB3Regular.fontSize);
        expect(style.fontWeight, IdsTypography.bodyB3Regular.fontWeight);
        expect(style.color, const Color(0xff0a0a0a));
      }
    },
  );

  testWidgets('the outermost provider needs a primary color', (tester) async {
    await tester.pumpWidget(
      host(
        const IdsProviderScope(
          theme: IdsThemeOverrides(radius: 12),
          child: SizedBox(),
        ),
      ),
    );
    expect(tester.takeException(), isA<FlutterError>());
    await tester.pumpWidget(host(const IdsProviderScope(child: SizedBox())));
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

  testWidgets('a controlled mode reports changes and waits for the prop', (
    tester,
  ) async {
    late IdsScope scope;
    final modes = <IdsMode>[];
    Widget build(IdsMode mode) => host(
      IdsProvider(
        theme: testTheme,
        mode: mode,
        onModeChange: modes.add,
        child: Builder(
          builder: (context) {
            scope = IdsProvider.of(context);
            return const SizedBox();
          },
        ),
      ),
    );
    await tester.pumpWidget(build(IdsMode.light));
    scope.setMode(IdsMode.light);
    expect(modes, isEmpty);
    scope.toggleMode();
    await tester.pump();
    expect(scope.mode, IdsMode.light);
    expect(modes, [IdsMode.dark]);
    await tester.pumpWidget(build(IdsMode.dark));
    expect(scope.resolvedMode, IdsMode.dark);
    expect(scope.colors, colorsOf(testTheme, IdsMode.dark));
  });

  testWidgets('an uncontrolled default mode initializes once', (tester) async {
    late IdsScope scope;
    final changes = <IdsMode>[];
    Widget build(IdsMode initial) => host(
      IdsProvider(
        theme: testTheme,
        defaultMode: initial,
        onModeChange: changes.add,
        child: Builder(
          builder: (context) {
            scope = IdsProvider.of(context);
            return const SizedBox();
          },
        ),
      ),
    );
    await tester.pumpWidget(build(IdsMode.light));
    expect(scope.mode, IdsMode.light);
    expect(scope.locale, IdsLocale.ko);
    scope.toggleMode();
    scope.toggleMode();
    await tester.pump();
    expect(changes, [IdsMode.dark]);
    expect(scope.mode, IdsMode.dark);
    await tester.pumpWidget(build(IdsMode.light));
    expect(scope.mode, IdsMode.dark);
  });

  testWidgets(
    'nested settings and setters inherit their nearest owner independently',
    (tester) async {
      late IdsScope root;
      late IdsScope inherited;
      late IdsScope nested;
      await tester.pumpWidget(
        host(
          IdsProvider(
            theme: testTheme,
            locale: IdsLocale.en,
            child: Builder(
              builder: (context) {
                root = IdsProvider.of(context);
                return Column(
                  children: [
                    IdsProviderScope(
                      child: Builder(
                        builder: (context) {
                          inherited = IdsProvider.of(context);
                          return const SizedBox();
                        },
                      ),
                    ),
                    IdsProviderScope(
                      theme: const IdsThemeOverrides(radius: 12),
                      defaultMode: IdsMode.dark,
                      locale: IdsLocale.ko,
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
      expect(inherited.theme, root.theme);
      expect(nested.radius.standard, 12);
      expect(nested.theme.primary, testTheme.primary);
      expect(inherited.locale, IdsLocale.en);
      expect(nested.locale, IdsLocale.ko);
      inherited.setMode(IdsMode.dark);
      await tester.pump();
      expect(root.mode, IdsMode.dark);
      expect(inherited.resolvedMode, IdsMode.dark);
      nested.toggleMode();
      await tester.pump();
      expect(nested.mode, IdsMode.light);
      expect(root.mode, IdsMode.dark);
    },
  );

  testWidgets('a scope changes only the colors it names', (tester) async {
    late IdsScope root;
    late IdsScope scope;
    await tester.pumpWidget(
      host(
        IdsProvider(
          theme: testTheme,
          child: Builder(
            builder: (context) {
              root = IdsProvider.of(context);
              return IdsProviderScope(
                theme: const IdsThemeOverrides(
                  primary: IdsThemeColor.seed(Color(0xFF418501)),
                  neutral: IdsNeutral.tinted,
                ),
                child: Builder(
                  builder: (context) {
                    scope = IdsProvider.of(context);
                    return const SizedBox();
                  },
                ),
              );
            },
          ),
        ),
      ),
    );
    expect(scope.colors.bgPrimarySolid, isNot(root.colors.bgPrimarySolid));
    expect(scope.colors.bgBase, root.colors.bgBase);
    expect(scope.colors.borderNeutral, isNot(root.colors.borderNeutral));
    expect(root.colors, colorsOf(testTheme, IdsMode.light));
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
            theme: testTheme,
            defaultMode: IdsMode.system,
            child: IdsProviderScope(
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
    'locale changes rebuild IDS semantics, and a subclass overrides one message',
    (tester) async {
      final semantics = tester.ensureSemantics();
      Widget build(
        IdsLocale? locale, {
        String? label,
        bool decorative = false,
      }) => host(
        IdsProvider(
          theme: testTheme,
          locale: locale,
          child: IdsSpinner(semanticLabel: label, decorative: decorative),
        ),
      );
      await tester.pumpWidget(build(IdsLocale.en));
      await tester.pump(const Duration(milliseconds: 100));
      expect(find.semantics.byLabel('Loading'), findsOne);
      await tester.pumpWidget(
        build(
          IdsLocale(
            locale: const Locale('ja', 'JP'),
            messages: const _Japanese(),
          ),
        ),
      );
      expect(find.semantics.byLabel('読み込み中'), findsOne);
      await tester.pumpWidget(
        build(
          IdsLocale(
            locale: const Locale('ko', 'KR'),
            messages: const _Silent(),
          ),
        ),
      );
      expect(find.semantics.byLabel('불러오는 중'), findsNothing);
      await tester.pumpWidget(build(IdsLocale.en, label: 'Custom'));
      expect(find.semantics.byLabel('Custom'), findsOne);
      await tester.pumpWidget(build(IdsLocale.en, decorative: true));
      expect(find.semantics.byLabel('Loading'), findsNothing);
      await tester.pumpWidget(build(null));
      expect(find.semantics.byLabel('불러오는 중'), findsOne);
      semantics.dispose();
    },
  );

  testWidgets('with no locale, the outermost provider follows the app locale', (
    tester,
  ) async {
    late IdsScope english;
    late IdsScope german;
    Widget app(Locale locale, void Function(IdsScope) read) => Localizations(
      locale: locale,
      delegates: const [DefaultWidgetsLocalizations.delegate],
      child: host(
        IdsProvider(
          theme: testTheme,
          child: Builder(
            builder: (context) {
              read(IdsProvider.of(context));
              return const SizedBox();
            },
          ),
        ),
      ),
    );
    await tester.pumpWidget(
      app(const Locale('en', 'GB'), (scope) => english = scope),
    );
    expect(english.locale.locale, const Locale('en', 'GB'));
    expect(english.messages.commonClose, 'Close');
    await tester.pumpWidget(
      app(const Locale('de', 'DE'), (scope) => german = scope),
    );
    expect(german.locale, IdsLocale.ko);
  });

  test('a locale in another language than its messages fails an assert', () {
    expect(
      () => IdsLocale(
        locale: const Locale('de'),
        messages: const IdsMessagesEn(),
      ),
      throwsAssertionError,
    );
  });

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
                  theme: testTheme,
                  mode: IdsMode.dark,
                  locale: IdsLocale.ko,
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
      expect(
        rich.text.style!.fontFamily,
        'packages/ids_flutter/Pretendard GOV Variable',
      );
      expect(rich.text.style!.color, const Color(0xfffafafa));
    },
  );
}
