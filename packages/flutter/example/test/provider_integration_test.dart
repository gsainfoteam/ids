import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter_example/components/provider_integration_preview.dart';
import 'package:ids_flutter_example/i18n/translations.g.dart';

void main() {
  testWidgets('slang locale reaches IDS without replacing child state', (
    tester,
  ) async {
    final previousLocale = LocaleSettings.currentLocale;
    addTearDown(() => LocaleSettings.setLocale(previousLocale));
    await LocaleSettings.setLocale(AppLocale.ko);
    await tester.pumpWidget(
      TranslationProvider(
        child: const MaterialApp(home: ProviderIntegration()),
      ),
    );
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
      find.textContaining('Child: count 1, radius 2.0, locale fr'),
      findsOneWidget,
    );
    await tester.tap(find.text('Toggle child override'));
    await tester.pumpAndSettle();
    expect(
      find.textContaining('Child: count 1, radius 10.0, locale en'),
      findsOneWidget,
    );
  });
}
