import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final iconButtonUseCases = [
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
          child: IdsIconButton(
            icon: (color, size) => HugeIcon(
              icon: HugeIcons.strokeRoundedBookmark01,
              color: color,
              size: size,
            ),
            variant: IdsVariant.ghost,
            label: '북마크',
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
            gap: 8,
            mainAxis: MainAxis.center,
            crossAxis: CrossAxis.center,
            children: [
              IdsIconButton(
                icon: (color, size) => HugeIcon(
                  icon: HugeIcons.strokeRoundedBookmark01,
                  color: color,
                  size: size,
                ),
                variant: IdsVariant.solid,
                label: 'solid',
              ),
              IdsIconButton(
                icon: (color, size) => HugeIcon(
                  icon: HugeIcons.strokeRoundedBookmark01,
                  color: color,
                  size: size,
                ),
                variant: IdsVariant.soft,
                label: 'soft',
              ),
              IdsIconButton(
                icon: (color, size) => HugeIcon(
                  icon: HugeIcons.strokeRoundedBookmark01,
                  color: color,
                  size: size,
                ),
                variant: IdsVariant.outline,
                label: 'outline',
              ),
              IdsIconButton(
                icon: (color, size) => HugeIcon(
                  icon: HugeIcons.strokeRoundedBookmark01,
                  color: color,
                  size: size,
                ),
                variant: IdsVariant.ghost,
                label: 'ghost',
              ),
            ],
          ),
        ),
      );
    },
  ),
  WidgetbookUseCase(
    name: 'Actions',
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
            gap: 4,
            mainAxis: MainAxis.center,
            crossAxis: CrossAxis.center,
            children: [
              IdsIconButton(
                icon: (color, size) => HugeIcon(
                  icon: HugeIcons.strokeRoundedBookmark01,
                  color: color,
                  size: size,
                ),
                variant: IdsVariant.ghost,
                label: '북마크',
              ),
              IdsIconButton(
                icon: (color, size) => HugeIcon(
                  icon: HugeIcons.strokeRoundedShare01,
                  color: color,
                  size: size,
                ),
                variant: IdsVariant.ghost,
                label: '공유',
              ),
            ],
          ),
        ),
      );
    },
  ),
];
