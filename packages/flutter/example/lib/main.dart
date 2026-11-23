import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import 'catalog/addons.dart';
import 'components/feedback/spinner.dart';
import 'components/form/field.dart';
import 'components/layout/divider.dart';
import 'components/typography/label.dart';
import 'components/utility/provider.dart';

final directories = <WidgetbookNode>[
  WidgetbookCategory(
    name: 'Components',
    isInitiallyExpanded: true,
    children: [
      WidgetbookFolder(name: 'Form', children: [field]),
      WidgetbookFolder(name: 'Feedback', children: [spinner]),
      WidgetbookFolder(name: 'Layout', children: [divider]),
      WidgetbookFolder(name: 'Typography', children: [label]),
      WidgetbookFolder(name: 'Utility', children: [provider]),
    ],
  ),
  WidgetbookCategory(
    name: 'Checks',
    isInitiallyExpanded: false,
    children: [
      WidgetbookFolder(name: 'Form', children: [fieldChecks]),
      WidgetbookFolder(name: 'Feedback', children: [spinnerChecks]),
      WidgetbookFolder(name: 'Layout', children: [dividerChecks]),
      WidgetbookFolder(name: 'Typography', children: [labelChecks]),
      WidgetbookFolder(name: 'Utility', children: [providerChecks]),
    ],
  ),
];

void main() {
  runApp(const WidgetbookApp());
}

class WidgetbookApp extends StatelessWidget {
  const WidgetbookApp({super.key, this.initialRoute = '/'});

  final String initialRoute;

  @override
  Widget build(BuildContext context) {
    return Widgetbook.material(
      initialRoute: initialRoute,
      appBuilder: (context, child) => MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          fontFamily: IdsTypography.sansFontFamily,
          package: IdsTypography.sansFontPackage,
        ),
        home: child,
      ),
      addons: [
        IdsThemeAddon(),
        IdsLocaleAddon(),
        TextScaleAddon(min: 1, max: 3, divisions: 4),
      ],
      directories: directories,
    );
  }
}
