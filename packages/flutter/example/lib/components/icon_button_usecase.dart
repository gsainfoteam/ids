import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final iconButtonUseCases = [
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
        child: const Center(
          child: IdsHStack(
            gap: 8,
            mainAxis: MainAxis.center,
            crossAxis: CrossAxis.center,
            children: [
              IdsIconButton(
                icon: HugeIcon(icon: HugeIcons.strokeRoundedBookmark01, color: Colors.transparent),
                variant: IdsVariant.solid,
                label: 'solid',
              ),
              IdsIconButton(
                icon: HugeIcon(icon: HugeIcons.strokeRoundedBookmark01, color: Colors.transparent),
                variant: IdsVariant.soft,
                label: 'soft',
              ),
              IdsIconButton(
                icon: HugeIcon(icon: HugeIcons.strokeRoundedBookmark01, color: Colors.transparent),
                variant: IdsVariant.outline,
                label: 'outline',
              ),
              IdsIconButton(
                icon: HugeIcon(icon: HugeIcons.strokeRoundedBookmark01, color: Colors.transparent),
                variant: IdsVariant.ghost,
                label: 'ghost',
              ),
            ],
          ),
        ),
      );
    },
  ),
];
