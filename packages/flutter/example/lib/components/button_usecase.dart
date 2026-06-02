import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

final buttonUseCases = [
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
      final variant = context.knobs.object.dropdown(
        label: 'Variant',
        options: IdsVariant.values,
        initialOption: IdsVariant.solid,
        labelBuilder: (v) => v.name,
      );
      final size = context.knobs.object.dropdown(
        label: 'Size',
        options: IdsSize.values,
        initialOption: IdsSize.md,
        labelBuilder: (s) => s.name,
      );
      final disabled = context.knobs.boolean(label: 'Disabled');

      return ThemeProvider(
        color: color,
        mode: mode,
        child: Center(
          child: IdsButton(
            onPressed: () {},
            variant: variant,
            size: size,
            disabled: disabled,
            child: const Text('Button'),
          ),
        ),
      );
    },
  ),
];
