import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final buttonUseCases = [
  WidgetbookUseCase(
    name: 'Solid',
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
          child: IdsButton(
            onPressed: () {},
            variant: IdsVariant.solid,
            size: IdsSize.md,
            children: const [Text('확인')],
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Outline',
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
          child: IdsButton(
            onPressed: () {},
            variant: IdsVariant.outline,
            size: IdsSize.md,
            children: const [Text('취소')],
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Ghost',
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
          child: IdsButton(
            onPressed: () {},
            variant: IdsVariant.ghost,
            size: IdsSize.md,
            children: const [Text('더보기')],
          ),
        ),
      );
    },
  ),
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
          child: IdsHStack(
            gap: 12,
            mainAxis: MainAxis.center,
            crossAxis: CrossAxis.center,
            children: [
              IdsButton(
                onPressed: () {},
                variant: IdsVariant.solid,
                children: const [Text('확인')],
              ),
              IdsButton(
                onPressed: () {},
                variant: IdsVariant.outline,
                children: const [Text('취소')],
              ),
              IdsButton(
                onPressed: () {},
                variant: IdsVariant.ghost,
                children: const [Text('더보기')],
              ),
            ],
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'All Sizes',
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
          child: IdsHStack(
            gap: 12,
            mainAxis: MainAxis.center,
            crossAxis: CrossAxis.center,
            children: [
              IdsButton(
                onPressed: () {},
                size: IdsSize.xs,
                children: const [Text('xs')],
              ),
              IdsButton(
                onPressed: () {},
                size: IdsSize.sm,
                children: const [Text('sm')],
              ),
              IdsButton(
                onPressed: () {},
                size: IdsSize.md,
                children: const [Text('md')],
              ),
              IdsButton(
                onPressed: () {},
                size: IdsSize.lg,
                children: const [Text('lg')],
              ),
              IdsButton(
                onPressed: () {},
                size: IdsSize.xl,
                children: const [Text('xl')],
              ),
            ],
          ),
        ),
      );
    },
  ),
];
