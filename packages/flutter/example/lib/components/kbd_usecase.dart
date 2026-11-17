import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

final kbdUseCases = [
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => themed(
      context,
      const Column(
        mainAxisSize: MainAxisSize.min,
        spacing: 16,
        children: [
          Text('Single key and literal'),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            spacing: 8,
            children: [
              IdsKbd(keys: 'Enter'),
              IdsKbd(keys: 'Escape', size: IdsSize.tiny),
              IdsKbd(child: '⌘K'),
            ],
          ),
          Text('macOS · Windows · Linux'),
          IdsKbd(keys: 'Mod+Shift+K', platform: TargetPlatform.macOS),
          IdsKbd(keys: 'Mod+Shift+K', platform: TargetPlatform.windows),
          IdsKbd(keys: 'Meta+ArrowUp', platform: TargetPlatform.linux),
          IdsField(
            size: IdsSize.tiny,
            children: [
              IdsFieldLabel(child: Text('단축키')),
              IdsKbd(keys: 'Escape'),
            ],
          ),
        ],
      ),
    ),
  ),
];
