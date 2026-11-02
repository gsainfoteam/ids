import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

final labelUseCases = [
  WidgetbookUseCase(
    name: 'Default',
    builder: (context) => themed(
      context,
      Center(
        child: IdsLabel(
          size: context.knobs.object.dropdown(
            label: 'Size',
            options: IdsSize.values,
            labelBuilder: (s) => s.name,
          ),
          required: context.knobs.boolean(label: 'Required'),
          disabled: context.knobs.boolean(label: 'Disabled'),
          invalid: context.knobs.boolean(label: 'Invalid'),
          child: const Text('이메일'),
        ),
      ),
    ),
  ),
];
