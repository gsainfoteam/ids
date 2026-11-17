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
            const Text('Icons and states'),
            for (final size in IdsSize.values)
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
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
                    disabled: true,
                    onPressed: () {},
                    child: const Text('비활성'),
                  ),
                ],
              ),
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
      width: 560,
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
