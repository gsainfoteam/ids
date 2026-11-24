import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import 'catalog/addons.dart';
import 'components/button_usecase.dart';
import 'components/icon_button_usecase.dart';
import 'components/kbd_usecase.dart';
import 'components/text_field_usecase.dart';
import 'components/button_group_usecase.dart';
import 'components/checkbox_usecase.dart';
import 'components/checkbox_group_usecase.dart';
import 'components/floating_button_usecase.dart';
import 'components/toggle_usecase.dart';
import 'components/toggle_group_usecase.dart';
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
      WidgetbookFolder(
        name: 'Action',
        children: [
          WidgetbookComponent(name: 'IdsButton', useCases: buttonUseCases),
          WidgetbookComponent(
            name: 'IdsIconButton',
            useCases: iconButtonUseCases,
          ),
          WidgetbookComponent(
            name: 'IdsButtonGroup',
            useCases: buttonGroupUseCases,
          ),
          WidgetbookComponent(
            name: 'IdsFloatingButton',
            useCases: floatingButtonUseCases,
          ),
          WidgetbookComponent(name: 'IdsToggle', useCases: toggleUseCases),
          WidgetbookComponent(
            name: 'IdsToggleGroup',
            useCases: toggleGroupUseCases,
          ),
        ],
      ),
      WidgetbookFolder(
        name: 'Form',
        children: [
          field,
          WidgetbookComponent(
            name: 'IdsTextField',
            useCases: textFieldUseCases,
          ),
          WidgetbookComponent(name: 'IdsCheckbox', useCases: checkboxUseCases),
          WidgetbookComponent(
            name: 'IdsCheckboxGroup',
            useCases: checkboxGroupUseCases,
          ),
        ],
      ),
      WidgetbookFolder(name: 'Feedback', children: [spinner]),
      WidgetbookFolder(name: 'Layout', children: [divider]),
      WidgetbookFolder(
        name: 'Typography',
        children: [
          label,
          WidgetbookComponent(name: 'IdsKbd', useCases: kbdUseCases),
        ],
      ),
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
