import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final dividerUseCases = [
  WidgetbookUseCase(
    name: 'Horizontal',
    builder: (context) {
      final color = context.knobs.object.dropdown(
        label: 'Color',
        options: IdsColor.values,
        initialOption: IdsColor.blue,
        labelBuilder: (c) => c.name,
      );
      final mode = context.knobs.object.dropdown(
        label: 'Mode',
        options: IdsMode.values,
        initialOption: IdsMode.light,
        labelBuilder: (m) => m.name,
      );

      return ThemeProvider(
        color: color,
        mode: mode,
        child: Center(
          child: SizedBox(
            width: 320,
            child: IdsVStack(
              gap: 12,
              mainAxis: MainAxis.center,
              children: const [
                Text('위 콘텐츠'),
                IdsDivider(),
                Text('아래 콘텐츠'),
              ],
            ),
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Vertical',
    builder: (context) {
      final color = context.knobs.object.dropdown(
        label: 'Color',
        options: IdsColor.values,
        initialOption: IdsColor.blue,
        labelBuilder: (c) => c.name,
      );
      final mode = context.knobs.object.dropdown(
        label: 'Mode',
        options: IdsMode.values,
        initialOption: IdsMode.light,
        labelBuilder: (m) => m.name,
      );

      return ThemeProvider(
        color: color,
        mode: mode,
        child: Center(
          child: SizedBox(
            height: 48,
            child: IdsHStack(
              gap: 12,
              crossAxis: CrossAxis.center,
              children: const [
                Text('왼쪽'),
                IdsDivider(orientation: IdsDividerOrientation.vertical),
                Text('오른쪽'),
              ],
            ),
          ),
        ),
      );
    },
  ),
];
