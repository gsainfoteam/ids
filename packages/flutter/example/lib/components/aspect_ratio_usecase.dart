import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

final aspectRatioUseCases = [
  WidgetbookUseCase(
    name: 'Ratio',
    builder: (context) => themed(
      context,
      Column(
        mainAxisSize: MainAxisSize.min,
        spacing: 16,
        children: [
          for (final (label, ratio) in [
            ('1 : 1', 1.0),
            ('4 : 3', 4 / 3),
            ('16 : 9', 16 / 9),
          ])
            ids.AspectRatio(
              ratio: ratio,
              child: Builder(
                builder: (context) => ColoredBox(
                  color: ids.ThemeProvider.of(context).muted,
                  child: Center(child: Text(label)),
                ),
              ),
            ),
        ],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Image',
    builder: (context) => themed(
      context,
      ClipRRect(
        borderRadius: BorderRadius.circular(ids.IdsRadius.standard),
        child: ids.AspectRatio(
          ratio: 16 / 9,
          child: Image.network(
            'https://picsum.photos/seed/ids/640/480',
            fit: BoxFit.cover,
          ),
        ),
      ),
    ),
  ),
];
