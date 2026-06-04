import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final badgeUseCases = [
  WidgetbookUseCase(
    name: 'All Variants',
    builder: (context) {
      final color = context.knobs.object.dropdown(
        label: 'Color',
        options: IdsColor.values,
        initialOption: IdsColor.orange,
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
          child: IdsHStack(
            gap: 8,
            mainAxis: MainAxis.center,
            children: const [
              IdsBadge('Solid', variant: IdsVariant.solid),
              IdsBadge('Soft', variant: IdsVariant.soft),
              IdsBadge('Outline', variant: IdsVariant.outline),
            ],
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Tag Chips',
    builder: (context) {
      final color = context.knobs.object.dropdown(
        label: 'Color',
        options: IdsColor.values,
        initialOption: IdsColor.orange,
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
          child: Wrap(
            spacing: 6,
            runSpacing: 6,
            children: const [
              IdsBadge('#모집', variant: IdsVariant.soft),
              IdsBadge('#인포팀', variant: IdsVariant.soft),
              IdsBadge('#개발', variant: IdsVariant.soft),
              IdsBadge('#지글', variant: IdsVariant.soft),
              IdsBadge('#비대위', variant: IdsVariant.soft),
            ],
          ),
        ),
      );
    },
  ),
];
