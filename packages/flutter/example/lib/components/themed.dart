import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

Widget themed(BuildContext context, Widget child, {double width = 320}) {
  final mode = context.knobs.object.dropdown(
    label: 'Mode',
    options: IdsMode.values,
    initialOption: IdsMode.light,
    labelBuilder: (m) => m.name,
  );
  final seed = context.knobs.object.dropdown(
    label: 'Seed',
    options: const ['Blue', 'Purple'],
    initialOption: 'Blue',
  );
  return IdsProvider(
    theme: IdsTheme(
      primary: IdsThemeColor.seed(
        seed == 'Purple' ? const Color(0xFFAD46FF) : const Color(0xFF2B7FFF),
      ),
    ),
    mode: mode,
    child: Builder(
      builder: (context) => Material(
        color: IdsProvider.of(context).colors.surface,
        textStyle: Theme.of(context).textTheme.bodyMedium!.copyWith(
          color: IdsProvider.of(context).colors.onSurface,
        ),
        child: Center(
          child: SizedBox(width: width, child: child),
        ),
      ),
    ),
  );
}

Widget galleryRow(String label, List<Widget> children) => Wrap(
  spacing: 8,
  runSpacing: 8,
  crossAxisAlignment: WrapCrossAlignment.center,
  children: [
    SizedBox(width: 100, child: Text(label)),
    ...children,
  ],
);

void openGalleryLink(BuildContext context) {
  Navigator.of(context).push<void>(
    MaterialPageRoute<void>(
      builder: (context) => Scaffold(
        appBar: AppBar(title: const Text('Gallery')),
        body: const Center(child: Text('링크 대상')),
      ),
    ),
  );
}
