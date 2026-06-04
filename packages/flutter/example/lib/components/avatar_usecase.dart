import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final avatarUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
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
      final size = context.knobs.object.dropdown(
        label: 'Size',
        options: [IdsSize.sm, IdsSize.md, IdsSize.lg, IdsSize.xl],
        initialOption: IdsSize.md,
        labelBuilder: (s) => s.name,
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
              IdsAvatar(name: '홍길동', size: size),
              IdsAvatar(
                src: 'https://i.pravatar.cc/80',
                name: '홍길동',
                size: size,
              ),
            ],
          ),
        ),
      );
    },
  ),
];
