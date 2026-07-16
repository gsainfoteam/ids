import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final headingUseCases = [
  WidgetbookUseCase(
    name: 'Levels',
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
              gap: 12,
              crossAxis: CrossAxis.start,
              children: const [
                IdsHeading('h1 Display', style: IdsTypography.headlineH1Bold),
                IdsHeading('h2 Heading', style: IdsTypography.headlineH5Semibold),
                IdsHeading('h3 Title', style: IdsTypography.headlineH6Semibold),
              ],
            ),
          ),
        ),
      );
    },
  ),
];

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
                IdsText('Display', style: IdsTypography.headlineH1Bold),
                IdsText('Heading', style: IdsTypography.headlineH5Semibold),
                IdsText('Title', style: IdsTypography.headlineH6Semibold),
                IdsText('Body — 본문 텍스트입니다', style: IdsTypography.bodyB2Regular),
                IdsText('Label', style: IdsTypography.bodyB3Medium),
                IdsText('Caption — 보조 텍스트', style: IdsTypography.captionC1Regular),
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
                    IdsText('onSurface (기본)', style: IdsTypography.bodyB2Regular, color: theme.onSurface),
                    IdsText('onMuted (보조)', style: IdsTypography.bodyB2Regular, color: theme.onMuted),
                    IdsText('primary (강조)', style: IdsTypography.bodyB2Regular, color: theme.primary),
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
