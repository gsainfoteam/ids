import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

Widget themed(BuildContext context, Widget child) {
  final mode = context.knobs.object.dropdown(
    label: 'Mode',
    options: IdsMode.values,
    initialOption: IdsMode.light,
    labelBuilder: (m) => m.name,
  );
  return ThemeProvider(
    mode: mode,
    child: Builder(
      builder: (context) => Material(
        color: ThemeProvider.of(context).surface,
        textStyle: Theme.of(context).textTheme.bodyMedium!.copyWith(
          color: ThemeProvider.of(context).onSurface,
        ),
        child: Center(child: SizedBox(width: 320, child: child)),
      ),
    ),
  );
}
