import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final cardUseCases = [
  WidgetbookUseCase(
    name: 'Basic',
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
        child: const Center(
          child: SizedBox(
            width: 320,
            child: IdsCard(
              child: IdsText('기본 카드', variant: IdsTextVariant.body),
            ),
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Potg Route',
    builder: (context) {
      final color = context.knobs.object.dropdown(
        label: 'Color',
        options: IdsColor.values,
        initialOption: IdsColor.green,
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
            child: IdsCard(
              child: IdsVStack(
                gap: 4,
                crossAxis: CrossAxis.start,
                children: [
                  const IdsText('지스트 → 송정역', variant: IdsTextVariant.label, color: Colors.grey),
                  const IdsText('13:10~14:00', variant: IdsTextVariant.title),
                  IdsHStack(
                    mainAxis: MainAxis.end,
                    children: const [
                      IdsBadge('정원 1/4', variant: IdsVariant.outline),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    },
  ),
];
