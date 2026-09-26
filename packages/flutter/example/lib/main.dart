import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

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
      directories: const [],
    );
  }
}
