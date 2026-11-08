import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import 'components/divider_usecase.dart';
import 'components/field_usecase.dart';
import 'components/label_usecase.dart';
import 'components/spinner_usecase.dart';

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
        WidgetbookComponent(name: 'IdsDivider', useCases: dividerUseCases),
        WidgetbookComponent(name: 'IdsField', useCases: fieldUseCases),
        WidgetbookComponent(name: 'IdsLabel', useCases: labelUseCases),
        WidgetbookComponent(name: 'IdsSpinner', useCases: spinnerUseCases),
      ],
    );
  }
}
