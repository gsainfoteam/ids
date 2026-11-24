import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:ids_flutter/ids.dart';
import 'package:ids_flutter_example/catalog/strings.dart';
import 'package:ids_flutter_example/i18n/translations.g.dart';
import 'package:ids_flutter_example/main.dart';
import 'package:widgetbook/widgetbook.dart';

void main() {
  final useCases = WidgetbookRoot(
    children: directories,
  ).leaves.whereType<WidgetbookUseCase>();

  for (final useCase in useCases) {
    for (final mode in [IdsMode.light, IdsMode.dark]) {
      for (final locale in AppLocale.values) {
        testWidgets(
          '${useCase.path} renders in ${mode.name} ${locale.languageCode}',
          (tester) async {
            final route = Uri(
              path: '/',
              queryParameters: {
                'path': useCase.path,
                'preview': '',
                'ids-theme': '{mode:${mode.name}}',
                'locale': '{locale:${locale.languageCode}}',
              },
            );
            await tester.pumpWidget(WidgetbookApp(initialRoute: '$route'));
            await tester.pump(const Duration(milliseconds: 200));

            expect(tester.takeException(), isNull);
            final ids = IdsProvider.of(
              tester.element(find.byType(ExampleStrings)),
            );
            expect(ids.resolvedMode, mode);
            expect(ids.locale, locale.ids);
          },
        );
      }
    }
  }

  test('use case code holds no Korean literal', () {
    final hangul = RegExp('[\u3131-\u318E\uAC00-\uD7A3]');
    final offenders = Directory('lib')
        .listSync(recursive: true)
        .whereType<File>()
        .where((file) => file.path.endsWith('.dart'))
        .where((file) => !file.path.startsWith('lib/i18n/'))
        .where((file) => hangul.hasMatch(file.readAsStringSync()))
        .map((file) => file.path);
    expect(offenders, isEmpty);
  });
}
