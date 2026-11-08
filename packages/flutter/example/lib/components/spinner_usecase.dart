import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
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
          const IdsSpinner(size: IdsSize.standard, decorative: true),
          const IdsSpinner(size: IdsSize.tiny, decorative: true),
          IconTheme.merge(
            data: const IconThemeData(size: 32),
            child: const IdsSpinner(decorative: true),
          ),
        ],
      ),
    ),
  ),
];
