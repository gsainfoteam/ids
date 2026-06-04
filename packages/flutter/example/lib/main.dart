import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';
import 'components/button_usecase.dart';
import 'components/divider_usecase.dart';
import 'components/stack_usecase.dart';
import 'components/text_usecase.dart';

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
        WidgetbookComponent(
          name: 'IdsSpacer',
          useCases: spacerUseCases,
        ),
        WidgetbookComponent(
          name: 'IdsDivider',
          useCases: dividerUseCases,
        ),
        WidgetbookComponent(
          name: 'IdsText',
          useCases: textUseCases,
        ),
        WidgetbookComponent(
          name: 'IdsHeading',
          useCases: headingUseCases,
        ),
      ],
    );
  }
}
