import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

final labelUseCases = [
  WidgetbookUseCase(
    name: 'Default',
    builder: (context) => themed(
      context,
      Center(
        child: ids.Label(
          size: context.knobs.object.dropdown(
            label: 'Size',
            options: ids.IdsSize.values,
            labelBuilder: (s) => s.name,
          ),
          required: context.knobs.boolean(label: 'Required'),
          disabled: context.knobs.boolean(label: 'Disabled'),
          child: const Text('이메일'),
        ),
      ),
    ),
  ),
];
