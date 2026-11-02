import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

Widget _themed(BuildContext context, Widget child) {
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
        child: Center(child: SizedBox(width: 320, child: child)),
      ),
    ),
  );
}

final dividerUseCases = [
  WidgetbookUseCase(
    name: 'Horizontal',
    builder: (context) => _themed(
      context,
      const Column(
        mainAxisSize: MainAxisSize.min,
        spacing: 16,
        children: [Text('위'), IdsDivider(), Text('아래')],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Vertical',
    builder: (context) => _themed(
      context,
      const IntrinsicHeight(
        child: Row(
          spacing: 12,
          children: [
            Text('계정'),
            IdsDivider(orientation: Axis.vertical),
            Text('설정'),
          ],
        ),
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Label',
    builder: (context) => _themed(
      context,
      Column(
        mainAxisSize: MainAxisSize.min,
        spacing: 24,
        children: [
          IdsDivider(
            child: Text(
              context.knobs.string(label: 'Label', initialValue: '또는'),
            ),
          ),
          const SizedBox(
            height: 120,
            child: IdsDivider(orientation: Axis.vertical, child: Text('또는')),
          ),
        ],
      ),
    ),
  ),
];
