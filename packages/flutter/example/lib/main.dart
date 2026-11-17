import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import 'components/button_usecase.dart';
import 'components/divider_usecase.dart';
import 'components/field_usecase.dart';
import 'components/icon_button_usecase.dart';
import 'components/kbd_usecase.dart';
import 'components/label_usecase.dart';
import 'components/spinner_usecase.dart';
import 'components/text_field_usecase.dart';
import 'components/provider_usecase.dart';
import 'components/provider_integration_preview.dart';

void main() {
  runApp(const WidgetbookApp());
}

class WidgetbookApp extends StatelessWidget {
  const WidgetbookApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Widgetbook.material(
      appBuilder: (context, child) => MaterialApp(
        theme: ThemeData(
          fontFamily: IdsTypography.sansFontFamily,
          package: IdsTypography.sansFontPackage,
        ),
        home: child,
      ),
      directories: [
        WidgetbookComponent(
          name: 'IdsProvider',
          useCases: [...providerUseCases, ...providerIntegrationUseCases],
        ),
        WidgetbookComponent(name: 'IdsButton', useCases: buttonUseCases),
        WidgetbookComponent(name: 'IdsDivider', useCases: dividerUseCases),
        WidgetbookComponent(name: 'IdsField', useCases: fieldUseCases),
        WidgetbookComponent(
          name: 'IdsIconButton',
          useCases: iconButtonUseCases,
        ),
        WidgetbookComponent(name: 'IdsKbd', useCases: kbdUseCases),
        WidgetbookComponent(name: 'IdsLabel', useCases: labelUseCases),
        WidgetbookComponent(name: 'IdsSpinner', useCases: spinnerUseCases),
        WidgetbookComponent(name: 'IdsTextField', useCases: textFieldUseCases),
      ],
    );
  }
}
