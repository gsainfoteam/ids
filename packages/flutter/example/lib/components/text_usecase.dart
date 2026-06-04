import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final textUseCases = [
  WidgetbookUseCase(
    name: 'All Variants',
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
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: IdsVStack(
              gap: 8,
              crossAxis: CrossAxis.start,
              children: [
                IdsText('Display', variant: IdsTextVariant.display),
                IdsText('Heading', variant: IdsTextVariant.heading),
                IdsText('Title', variant: IdsTextVariant.title),
                IdsText('Body — 본문 텍스트입니다', variant: IdsTextVariant.body),
                IdsText('Label', variant: IdsTextVariant.label),
                IdsText('Caption — 보조 텍스트', variant: IdsTextVariant.caption),
              ],
            ),
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Colors',
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
        child: Builder(
          builder: (context) {
            final theme = ThemeProvider.of(context);
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: IdsVStack(
                  gap: 8,
                  crossAxis: CrossAxis.start,
                  children: [
                    IdsText('onSurface (기본)', variant: IdsTextVariant.body, color: theme.onSurface),
                    IdsText('onMuted (보조)', variant: IdsTextVariant.body, color: theme.onMuted),
                    IdsText('primary (강조)', variant: IdsTextVariant.body, color: theme.primary),
                  ],
                ),
              ),
            );
          },
        ),
      );
    },
  ),
];
