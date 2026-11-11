import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

Widget themed(BuildContext context, Widget child) {
  final mode = context.knobs.object.dropdown(
    label: 'Mode',
    options: ids.IdsMode.values,
    initialOption: ids.IdsMode.light,
    labelBuilder: (m) => m.name,
  );
  return ids.ThemeProvider(
    mode: mode,
    child: Builder(
      builder: (context) => Material(
        color: ids.ThemeProvider.of(context).surface,
        textStyle: Theme.of(context).textTheme.bodyMedium!.copyWith(
          color: ids.ThemeProvider.of(context).onSurface,
        ),
        child: Center(child: SizedBox(width: 320, child: child)),
      ),
    ),
  );
}

T dropdown<T extends Enum>(
  BuildContext context,
  String label,
  List<T> options, {
  T? initial,
}) => context.knobs.object.dropdown(
  label: label,
  options: options,
  initialOption: initial ?? options.first,
  labelBuilder: (value) => value.name,
);
