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
        for (final palette in [brandPalette, purplePalette]) {
          await tester.pumpWidget(
            MaterialApp(
              home: ProviderPreview(
                theme: const IdsThemeData(
                  fontFamily: 'Helvetica',
                  monoFontFamily: 'Courier',
                  radius: 24,
                  cornerShape: IdsCornerShape.squircle,
                ),
                palette: palette,
                mode: mode,
                translation: AppLocale.en.buildSync().ids,
                textScale: 3,
              ),
            ),
          );
          await tester.pump();
          expect(find.text('Sans: Helvetica'), findsOneWidget);
          expect(find.text('Mono: Courier'), findsOneWidget);
          expect(find.text('Loading'), findsOneWidget);
          expect(find.text('닫기'), findsOneWidget);
          expect(
            find.text(
              'primary: ${palette.resolve(mode == IdsMode.dark ? Brightness.dark : Brightness.light).primary.toARGB32().toRadixString(16)}',
            ),
            findsOneWidget,
          );
          expect(tester.takeException(), isNull);
        }
      }
    },
  );

  testWidgets(
    'nested palette buttons update their owner without crossing scopes',
    (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: NestedProviderPreview(mode: IdsMode.light)),
      );
      expect(find.text('Blue / light'), findsNWidgets(3));
      expect(find.text('Purple / light'), findsOneWidget);
      await tester.ensureVisible(find.text('Change Inherited child palette'));
      await tester.tap(find.text('Change Inherited child palette'));
      await tester.pumpAndSettle();
      expect(find.text('Purple / light'), findsNWidgets(4));
      await tester.ensureVisible(find.text('Change Isolated child palette'));
      await tester.tap(find.text('Change Isolated child palette'));
      await tester.pumpAndSettle();
      expect(find.text('Purple / light'), findsNWidgets(3));
      expect(find.text('Blue / light'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
}
