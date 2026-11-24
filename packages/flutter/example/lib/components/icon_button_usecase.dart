import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../catalog/strings.dart';
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
                          semanticLabel:
                              context.strings.demo.iconButtonSample.add,
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
            galleryRow('disabled', [
              for (final variant in IdsVariant.values)
                IdsIconButton(
                  icon: const Icon(Icons.close),
                  semanticLabel: context.strings.demo.iconButtonSample.close,
                  variant: variant,
                  disabled: true,
                ),
            ]),
            galleryRow('loading', [
              for (final size in IdsSize.values)
                for (final variant in IdsVariant.values)
                  IdsIconButton(
                    icon: const IdsSpinner(decorative: true),
                    semanticLabel: context.strings.demo.iconButtonSample.saving,
                    variant: variant,
                    size: size,
                    disabled: true,
                    busy: true,
                  ),
            ]),
            galleryRow('asChild · navigation', [
              IdsIconButton(
                icon: const Icon(Icons.open_in_new),
                semanticLabel: context.strings.demo.iconButtonSample.openLink,
                variant: IdsVariant.outline,
                onPressed: () => openGalleryLink(context),
              ),
            ]),
            galleryRow('state icon', [
              IdsIconButton.builder(
                icon: (context, state) => Icon(
                  state.hovered ? Icons.favorite : Icons.favorite_border,
                ),
                semanticLabel: context.strings.demo.iconButtonSample.like,
                onPressed: () {},
              ),
              IdsIconButton(
                icon: const Icon(Icons.more_horiz),
                semanticLabel: context.strings.demo.iconButtonSample.more,
                onPressed: () {},
              ),
            ]),
          ],
        ),
      ),
      width: 600,
    ),
  ),
];
