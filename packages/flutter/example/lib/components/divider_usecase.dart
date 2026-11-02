import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

final dividerUseCases = [
  WidgetbookUseCase(
    name: 'Horizontal',
    builder: (context) => themed(
      context,
      const Column(
        mainAxisSize: MainAxisSize.min,
        spacing: 16,
        children: [Text('위'), IdsDivider(), Text('아래')],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Vertical',
    builder: (context) => themed(
      context,
      const IntrinsicHeight(
        child: Row(
          spacing: 12,
          children: [
            Text('계정'),
            IdsDivider(orientation: Axis.vertical),
            Text('설정'),
          ],
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Label',
    builder: (context) => themed(
      context,
      Column(
        mainAxisSize: MainAxisSize.min,
        spacing: 24,
        children: [
          IdsDivider(
            child: Text(
              context.knobs.string(label: 'Label', initialValue: '또는'),
            ),
          ),
          const SizedBox(
            height: 120,
            child: IdsDivider(orientation: Axis.vertical, child: Text('또는')),
          ),
        ],
      ),
    ),
  ),
];
