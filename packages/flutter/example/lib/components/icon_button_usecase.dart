import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import 'themed.dart';

final iconButtonUseCases = [
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => themed(
      context,
      SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 12,
          children: [
            Row(
              spacing: 8,
              children: [
                const SizedBox(width: 70),
                for (final variant in IdsVariant.values)
                  SizedBox(width: 52, child: Text(variant.name)),
              ],
            ),
            const Text('Variant × Size'),
            for (final size in IdsSize.values)
              Row(
                spacing: 8,
                children: [
                  SizedBox(width: 70, child: Text(size.name)),
                  for (final variant in IdsVariant.values)
                    SizedBox(
                      width: 52,
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: IdsIconButton(
                          icon: const Icon(Icons.add),
                          semanticLabel: '추가',
                          onPressed: () {},
                          size: size,
                          variant: variant,
                        ),
                      ),
                    ),
                ],
              ),
            const Text('Variant × Color scheme'),
            for (final scheme in IdsColorScheme.values)
              Row(
                spacing: 8,
                children: [
                  SizedBox(width: 70, child: Text(scheme.name)),
                  for (final variant in IdsVariant.values)
                    SizedBox(
                      width: 52,
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: IdsIconButton(
                          icon: Icon(
                            scheme == IdsColorScheme.danger
                                ? Icons.delete_outline
                                : Icons.check,
                          ),
                          semanticLabel: scheme.name,
                          onPressed: () {},
                          colorScheme: scheme,
                          variant: variant,
                        ),
                      ),
                    ),
                ],
              ),
            const Text('States'),
            for (final disabled in [true, false])
              Row(
                spacing: 8,
                children: [
                  SizedBox(
                    width: 70,
                    child: Text(disabled ? 'disabled' : 'loading'),
                  ),
                  for (final variant in IdsVariant.values)
                    SizedBox(
                      width: 52,
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: IdsIconButton(
                          icon: disabled
                              ? const Icon(Icons.close)
                              : const IdsSpinner(decorative: true),
                          semanticLabel: disabled ? '닫기' : '저장 중',
                          variant: variant,
                          disabled: true,
                          busy: !disabled,
                        ),
                      ),
                    ),
                ],
              ),
          ],
        ),
      ),
      width: 440,
    ),
  ),
];
