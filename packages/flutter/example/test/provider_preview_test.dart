import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';
import 'package:ids_flutter_example/components/provider_preview.dart';
import 'package:ids_flutter_example/i18n/translations.g.dart';
import 'package:ids_flutter_example/ids_theme.dart';

void main() {
  testWidgets(
    'runtime preview changes colors and translations without scaling overflow',
    (tester) async {
      for (final mode in [IdsMode.light, IdsMode.dark]) {
        for (final primary in [blue, purple]) {
          final theme = IdsTheme(
            primary: primary,
            radius: 18,
            cornerShape: IdsCornerShape.squircle,
          );
          await tester.pumpWidget(
            MaterialApp(
              home: ProviderPreview(
                theme: theme,
                mode: mode,
                translation: AppLocale.en.buildSync().ids,
                textScale: 3,
              ),
            ),
          );
          await tester.pump();
          final bgPrimarySolid = IdsResolvedTheme(
            theme: theme,
            mode: mode,
          ).colors.bgPrimarySolid;
          expect(find.text('Loading'), findsOneWidget);
          expect(find.text('닫기'), findsOneWidget);
          expect(find.text('primary ${hexOf(bgPrimarySolid)}'), findsOneWidget);
          expect(tester.takeException(), isNull);
        }
      }
    },
  );

  testWidgets(
    'nested mode buttons update their owner without crossing scopes',
    (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: NestedProviderPreview(mode: IdsMode.light)),
      );
      expect(find.text('Blue / light'), findsNWidgets(3));
      expect(find.text('Purple / light'), findsOneWidget);

      await tester.ensureVisible(find.text('Toggle Inherited child mode'));
      await tester.tap(find.text('Toggle Inherited child mode'));
      await tester.pumpAndSettle();
      expect(find.text('Blue / dark'), findsNWidgets(3));
      expect(find.text('Purple / light'), findsOneWidget);

      await tester.ensureVisible(find.text('Toggle Isolated child mode'));
      await tester.tap(find.text('Toggle Isolated child mode'));
      await tester.pumpAndSettle();
      expect(find.text('Blue / dark'), findsNWidgets(3));
      expect(find.text('Purple / dark'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
}
