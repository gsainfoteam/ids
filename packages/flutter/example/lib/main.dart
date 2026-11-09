import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'components/aspect_ratio_usecase.dart';
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
          fontFamily: ids.IdsTypography.sansFontFamily,
          package: ids.IdsTypography.sansFontPackage,
        ),
        home: child,
      ),
      directories: [
        WidgetbookComponent(name: 'AspectRatio', useCases: aspectRatioUseCases),
        WidgetbookComponent(name: 'ids.Divider', useCases: dividerUseCases),
        WidgetbookComponent(name: 'ids.Field', useCases: fieldUseCases),
        WidgetbookComponent(name: 'ids.Label', useCases: labelUseCases),
        WidgetbookComponent(name: 'ids.Spinner', useCases: spinnerUseCases),
      ],
    );
  }
}
