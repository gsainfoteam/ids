import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../catalog/strings.dart';
import 'themed.dart';

final buttonUseCases = [
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => themed(
      context,
      SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 16,
          children: [
            const Text('Variant × Color scheme'),
            for (final scheme in IdsColorScheme.values)
              Wrap(
                spacing: 8,
                runSpacing: 8,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  SizedBox(width: 70, child: Text(scheme.name)),
                  for (final variant in IdsVariant.values)
                    IdsButton(
                      variant: variant,
                      colorScheme: scheme,
                      onPressed: () {},
                      child: Text(variant.name),
                    ),
                ],
              ),
            const Text('Variant × Size'),
            for (final size in IdsSize.values)
              Wrap(
                spacing: 8,
                runSpacing: 8,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  SizedBox(width: 70, child: Text(size.name)),
                  for (final variant in IdsVariant.values)
                    IdsButton(
                      size: size,
                      variant: variant,
                      onPressed: () {},
                      child: Text(variant.name),
                    ),
                ],
              ),
            const Text('Icons'),
            for (final size in IdsSize.values)
              galleryRow(size.name, [
                IdsButton(
                  size: size,
                  leading: const Icon(Icons.add),
                  onPressed: () {},
                  child: Text(context.strings.demo.buttonSample.newPost),
                ),
                IdsButton(
                  size: size,
                  variant: IdsVariant.soft,
                  trailing: const Icon(Icons.arrow_forward),
                  onPressed: () {},
                  child: Text(context.strings.demo.buttonSample.next),
                ),
                IdsButton(
                  size: size,
                  variant: IdsVariant.outline,
                  leading: const Icon(Icons.file_upload_outlined),
                  trailing: const Icon(Icons.expand_more),
                  onPressed: () {},
                  child: Text(context.strings.demo.buttonSample.export),
                ),
                IdsButton(
                  size: size,
                  variant: IdsVariant.ghost,
                  colorScheme: IdsColorScheme.danger,
                  leading: const Icon(Icons.delete_outline),
                  onPressed: () {},
                  child: Text(context.strings.demo.buttonSample.delete),
                ),
              ]),
            const Text('States'),
            galleryRow('disabled', [
              for (final variant in IdsVariant.values)
                IdsButton(
                  variant: variant,
                  disabled: true,
                  child: Text(variant.name),
                ),
            ]),
            galleryRow('loading', [
              for (final variant in IdsVariant.values)
                IdsButton(
                  variant: variant,
                  disabled: true,
                  busy: true,
                  leading: const IdsSpinner(decorative: true),
                  child: Text(context.strings.demo.buttonSample.saving),
                ),
              IdsButton(
                size: IdsSize.tiny,
                disabled: true,
                busy: true,
                leading: IdsSpinner(decorative: true),
                child: Text(context.strings.demo.buttonSample.saving),
              ),
            ]),
            galleryRow('asChild · navigation', [
              IdsButton(
                onPressed: () => openGalleryLink(context),
                child: Text(context.strings.demo.buttonSample.link),
              ),
              IdsButton(
                variant: IdsVariant.outline,
                disabled: true,
                child: Text(context.strings.demo.buttonSample.disabledLink),
              ),
            ]),
            const Text('Full width'),
            SizedBox(
              width: double.infinity,
              child: IdsButton(
                leading: const Icon(Icons.check),
                onPressed: () {},
                child: Text(context.strings.demo.buttonSample.confirm),
              ),
            ),
          ],
        ),
      ),
      width: 710,
    ),
  ),
  WidgetbookUseCase(
    name: 'Loading',
    builder: (context) => themed(context, const Center(child: _SaveButton())),
  ),
];

class _SaveButton extends StatefulWidget {
  const _SaveButton();

  @override
  State<_SaveButton> createState() => _SaveButtonState();
}

class _SaveButtonState extends State<_SaveButton> {
  bool _saving = false;

  Future<void> _save() async {
    setState(() => _saving = true);
    await Future<void>.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _saving = false);
  }

  @override
  Widget build(BuildContext context) => IdsButton(
    onPressed: _save,
    disabled: _saving,
    busy: _saving,
    focusableWhenDisabled: true,
    leading: _saving ? const IdsSpinner(decorative: true) : null,
    child: Text(
      _saving
          ? context.strings.demo.buttonSample.saving
          : context.strings.demo.buttonSample.save,
    ),
  );
}
