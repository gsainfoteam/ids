import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../ids_theme.dart';

Widget themed(BuildContext context, Widget child) {
  final mode = context.knobs.object.dropdown(
    label: 'Mode',
    options: IdsMode.values,
    initialOption: IdsMode.light,
    labelBuilder: (m) => m.name,
  );
  final scale = context.knobs.object.dropdown(
    label: 'Text scale (MediaQuery)',
    options: ['System', '1.0', '2.0', '3.0'],
  );
  final preview = IdsProvider(
    theme: appTheme,
    palette: brandPalette,
    mode: mode,
    child: Builder(
      builder: (context) => Material(
        color: IdsProvider.of(context).theme.surface,
        textStyle: Theme.of(context).textTheme.bodyMedium!.copyWith(
          color: IdsProvider.of(context).theme.onSurface,
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Center(child: SizedBox(width: 320, child: child)),
        ),
      ),
    ),
  );
  return scale == 'System'
      ? preview
      : MediaQuery(
          data: MediaQuery.of(
            context,
          ).copyWith(textScaler: TextScaler.linear(double.parse(scale))),
          child: preview,
        );
}
