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
  return IdsProvider(
    theme: appTheme,
    mode: mode,
    child: Builder(
      builder: (context) => Material(
        color: IdsProvider.of(context).colors.bgBase,
        textStyle: Theme.of(context).textTheme.bodyMedium!.copyWith(
          color: IdsProvider.of(context).colors.textNeutralStrong,
        ),
        child: Center(child: SizedBox(width: 320, child: child)),
      ),
    ),
  );
}
