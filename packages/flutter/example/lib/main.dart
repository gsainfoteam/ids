import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';
import 'components/avatar_usecase.dart';
import 'components/badge_usecase.dart';
import 'components/button_usecase.dart';
import 'components/card_usecase.dart';
import 'components/divider_usecase.dart';
import 'components/item_usecase.dart';
import 'components/icon_button_usecase.dart';
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
      appBuilder: (context, child) => MaterialApp(
        theme: ThemeData(fontFamily: 'ids_flutter/Pretendard Variable'),
        home: child,
      ),
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
        WidgetbookComponent(
          name: 'IdsAvatar',
          useCases: avatarUseCases,
        ),
        WidgetbookComponent(
          name: 'IdsBadge',
          useCases: badgeUseCases,
        ),
        WidgetbookComponent(
          name: 'IdsIconButton',
          useCases: iconButtonUseCases,
        ),
        WidgetbookComponent(
          name: 'IdsCard',
          useCases: cardUseCases,
        ),
        WidgetbookComponent(
          name: 'IdsItem',
          useCases: itemUseCases,
        ),
      ],
    );
  }
}
