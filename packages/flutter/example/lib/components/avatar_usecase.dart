import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final avatarUseCases = [
  WidgetbookUseCase(
    name: 'With Image',
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
          child: IdsAvatar(
            src: 'https://i.pravatar.cc/80',
            name: '홍길동',
            size: IdsSize.standard,
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'With Initials',
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
          child: IdsAvatar(
            name: '홍길동',
            size: IdsSize.standard,
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
            children: const [
              IdsAvatar(name: '홍길동', size: IdsSize.tiny),
              IdsAvatar(name: '홍길동', size: IdsSize.standard),
            ],
          ),
        ),
      );
    },
  ),
];
