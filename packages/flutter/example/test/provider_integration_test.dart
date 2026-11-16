import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter_example/components/provider_integration_preview.dart';
import 'package:ids_flutter_example/i18n/translations.g.dart';

void main() {
  Future<void> pumpIntegration(WidgetTester tester) async {
    final previousLocale = LocaleSettings.currentLocale;
    addTearDown(() => LocaleSettings.setLocale(previousLocale));
    await LocaleSettings.setLocale(AppLocale.ko);
    await tester.pumpWidget(
      TranslationProvider(
        child: const MaterialApp(home: ProviderIntegration()),
      ),
    );
  }

  testWidgets('slang locale reaches IDS without replacing child state', (
    tester,
  ) async {
    await pumpIntegration(tester);
    await tester.tap(find.text('Increment Child'));
    await tester.pump();
    await tester.tap(find.text('Change language'));
    await tester.pumpAndSettle();
    expect(find.text('Loading / 닫기'), findsNWidgets(2));
    expect(find.textContaining('Child: count 1'), findsOneWidget);
    expect(find.textContaining('locale en'), findsNWidgets(2));

    await tester.tap(find.text('Toggle child override'));
    await tester.pumpAndSettle();
    expect(
      find.textContaining(
        'Child: count 1, radius 4.0, locale fr, corner squircle',
      ),
      findsOneWidget,
    );

    await tester.tap(find.text('Toggle child override'));
    await tester.pumpAndSettle();
    expect(
      find.textContaining(
        'Child: count 1, radius 10.0, locale en, corner round',
      ),
      findsOneWidget,
    );
  });

  testWidgets('a theme change on the parent reaches the child scope', (
    tester,
  ) async {
    await pumpIntegration(tester);
    await tester.tap(find.text('Change radius'));
    await tester.pumpAndSettle();
    expect(find.textContaining('radius 18.0'), findsNWidgets(2));
    expect(tester.takeException(), isNull);
  });

  testWidgets('a scope with its own default mode takes setMode', (
    tester,
  ) async {
    await pumpIntegration(tester);
    expect(find.text('Default scope: light'), findsOneWidget);
    await tester.tap(find.text('Select dark'));
    await tester.pumpAndSettle();
    expect(find.text('Default scope: dark'), findsOneWidget);
  });
}
