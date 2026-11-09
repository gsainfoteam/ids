import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

final spinnerUseCases = [
  WidgetbookUseCase(
    name: 'Size',
    builder: (context) => themed(
      context,
      Row(
        mainAxisAlignment: MainAxisAlignment.center,
        spacing: 16,
        children: [
          const ids.Spinner(size: ids.IdsSize.standard, decorative: true),
          const ids.Spinner(size: ids.IdsSize.tiny, decorative: true),
          IconTheme.merge(
            data: const IconThemeData(size: 32),
            child: const ids.Spinner(decorative: true),
          ),
        ],
      ),
    ),
  ),
];
