import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../../catalog/showcase.dart';
import '../../catalog/strings.dart';

final spinner = WidgetbookComponent(
  name: 'Spinner',
  useCases: [
    WidgetbookUseCase(
      name: 'Playground',
      builder: (context) => IdsSpinner(
        size: context.knobs.objectOrNull.segmented(
          label: 'size',
          description: 'Leave it off to follow IconTheme.',
          options: IdsSize.values,
          labelBuilder: (size) => size.name,
          defaultToNull: true,
        ),
        semanticLabel: context.knobs.stringOrNull(label: 'semanticLabel'),
        decorative: context.knobs.boolean(label: 'decorative'),
      ),
    ),
    WidgetbookUseCase(name: 'Usage', builder: (context) => const IdsSpinner()),
    WidgetbookUseCase(
      name: 'Gallery',
      builder: (context) {
        final ids = IdsProvider.of(context);
        return Showcase(
          children: [
            ShowcaseSection(
              title: 'Size',
              children: [
                const ShowcaseRow(
                  label: 'auto',
                  children: [IdsSpinner(decorative: true)],
                ),
                for (final size in IdsSize.values)
                  ShowcaseRow(
                    label: size.name,
                    children: [IdsSpinner(size: size, decorative: true)],
                  ),
                ShowcaseRow(
                  label: 'IconTheme 32',
                  children: [
                    IconTheme.merge(
                      data: const IconThemeData(size: 32),
                      child: const IdsSpinner(decorative: true),
                    ),
                  ],
                ),
              ],
            ),
            ShowcaseSection(
              title: 'Color',
              description: 'The color comes from IconTheme.',
              children: [
                const ShowcaseRow(
                  label: 'textNeutralStrong',
                  children: [IdsSpinner(decorative: true)],
                ),
                ShowcaseRow(
                  label: 'textPrimary',
                  children: [
                    IconTheme.merge(
                      data: IconThemeData(color: ids.colors.textPrimary),
                      child: const IdsSpinner(decorative: true),
                    ),
                  ],
                ),
                ShowcaseRow(
                  label: 'textOnPrimarySolid',
                  children: [
                    DecoratedBox(
                      decoration: ShapeDecoration(
                        color: ids.colors.bgPrimarySolid,
                        shape: ids.shape(),
                      ),
                      child: Padding(
                        padding: EdgeInsets.all(ids.dimension(8)),
                        child: IconTheme.merge(
                          data: IconThemeData(
                            color: ids.colors.textOnPrimarySolid,
                          ),
                          child: const IdsSpinner(decorative: true),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        );
      },
    ),
    WidgetbookUseCase(
      name: 'Show progress beside text',
      builder: (context) {
        final ids = IdsProvider.of(context);
        final style = ids.textStyle(
          IdsTypography.bodyB3Medium,
          color: ids.colors.textNeutral,
        );
        return Example(
          description: context.strings.examples.spinner.showProgressBesideText,
          child: IconTheme.merge(
            data: IconThemeData(size: style.fontSize, color: style.color),
            child: Row(
              spacing: ids.dimension(8),
              children: [
                const IdsSpinner(decorative: true),
                Text(context.strings.demo.spinner.loadingList, style: style),
              ],
            ),
          ),
        );
      },
    ),
  ],
);

final spinnerChecks = WidgetbookComponent(
  name: 'Spinner',
  useCases: [
    WidgetbookUseCase(
      name: 'Reduced motion pulses instead of turning',
      builder: (context) => MediaQuery(
        data: MediaQuery.of(context).copyWith(disableAnimations: true),
        child: const IdsSpinner(size: IdsSize.standard),
      ),
    ),
  ],
);
