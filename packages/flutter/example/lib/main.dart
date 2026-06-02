import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';
import 'components/button_usecase.dart';
import 'components/stack_usecase.dart';

void main() {
  runApp(const WidgetbookApp());
}

class WidgetbookApp extends StatelessWidget {
  const WidgetbookApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Widgetbook.material(
      directories: [
        WidgetbookComponent(
          name: 'IdsButton',
          useCases: buttonUseCases,
        ),
        WidgetbookComponent(
          name: 'Stack',
          useCases: stackUseCases,
        ),
      ],
    );
  }
}
