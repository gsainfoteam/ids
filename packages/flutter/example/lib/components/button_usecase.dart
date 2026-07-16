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
            size: IdsSize.standard,
            children: const [Text('확인')],
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Soft',
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
            variant: IdsVariant.soft,
            size: IdsSize.standard,
            children: const [Text('보조')],
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
            size: IdsSize.standard,
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
            size: IdsSize.standard,
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
                variant: IdsVariant.soft,
                children: const [Text('보조')],
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
                size: IdsSize.standard,
                children: const [Text('standard')],
              ),
              IdsButton(
                onPressed: () {},
                size: IdsSize.tiny,
                children: const [Text('tiny')],
              ),
            ],
          ),
        ),
      );
    },
  ),
];
