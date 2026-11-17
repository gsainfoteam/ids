import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

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
              Row(
                spacing: 8,
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
              Row(
                spacing: 8,
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
                  child: const Text('새 글'),
                ),
                IdsButton(
                  size: size,
                  variant: IdsVariant.soft,
                  trailing: const Icon(Icons.arrow_forward),
                  onPressed: () {},
                  child: const Text('다음'),
                ),
                IdsButton(
                  size: size,
                  variant: IdsVariant.outline,
                  leading: const Icon(Icons.file_upload_outlined),
                  trailing: const Icon(Icons.expand_more),
                  onPressed: () {},
                  child: const Text('내보내기'),
                ),
                IdsButton(
                  size: size,
                  variant: IdsVariant.ghost,
                  colorScheme: IdsColorScheme.danger,
                  leading: const Icon(Icons.delete_outline),
                  onPressed: () {},
                  child: const Text('삭제'),
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
                  child: const Text('저장 중'),
                ),
              const IdsButton(
                size: IdsSize.tiny,
                disabled: true,
                busy: true,
                leading: IdsSpinner(decorative: true),
                child: Text('저장 중'),
              ),
            ]),
            galleryRow('asChild · navigation', [
              IdsButton(
                onPressed: () => openGalleryLink(context),
                child: const Text('링크'),
              ),
              const IdsButton(
                variant: IdsVariant.outline,
                disabled: true,
                child: Text('비활성 링크'),
              ),
            ]),
            const Text('Full width'),
            SizedBox(
              width: double.infinity,
              child: IdsButton(
                leading: const Icon(Icons.check),
                onPressed: () {},
                child: const Text('확인'),
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
    child: Text(_saving ? '저장 중' : '저장'),
  );
}
