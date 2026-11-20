import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../../catalog/showcase.dart';
import '../../catalog/strings.dart';

final divider = WidgetbookComponent(
  name: 'Divider',
  useCases: [
    WidgetbookUseCase(
      name: 'Playground',
      builder: (context) {
        final orientation = context.knobs.object.segmented(
          label: 'orientation',
          options: Axis.values,
          labelBuilder: (axis) => axis.name,
        );
        final decorative = context.knobs.boolean(label: 'decorative');
        final label = context.knobs.stringOrNull(
          label: 'child',
          initialValue: context.strings.demo.divider.or,
        );
        final line = IdsDivider(
          orientation: orientation,
          decorative: decorative,
          child: label == null ? null : Text(label),
        );
        return SizedBox(
          width: 320,
          height: orientation == Axis.vertical ? 160 : null,
          child: line,
        );
      },
    ),
    WidgetbookUseCase(
      name: 'Usage',
      builder: (context) => SizedBox(
        width: 320,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 16,
          children: [
            Text(context.strings.demo.divider.above),
            const IdsDivider(),
            Text(context.strings.demo.divider.below),
          ],
        ),
      ),
    ),
    WidgetbookUseCase(
      name: 'Gallery',
      builder: (context) {
        final strings = context.strings.demo.divider;
        return Showcase(
          children: [
            ShowcaseSection(
              title: 'Horizontal',
              children: [
                const ShowcaseRow(
                  label: 'plain',
                  children: [SizedBox(width: 320, child: IdsDivider())],
                ),
                ShowcaseRow(
                  label: 'child',
                  children: [
                    SizedBox(
                      width: 320,
                      child: IdsDivider(child: Text(strings.or)),
                    ),
                  ],
                ),
              ],
            ),
            ShowcaseSection(
              title: 'Vertical',
              description:
                  'Without a height to fill, it is as tall as the line of text.',
              children: [
                ShowcaseRow(
                  label: 'plain',
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      spacing: 12,
                      children: [
                        Text(strings.account),
                        const IdsDivider(orientation: Axis.vertical),
                        Text(strings.settings),
                      ],
                    ),
                  ],
                ),
                ShowcaseRow(
                  label: 'child',
                  children: [
                    SizedBox(
                      height: 120,
                      child: IdsDivider(
                        orientation: Axis.vertical,
                        child: Text(strings.or),
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
      name: 'Separate alternatives',
      builder: (context) {
        final strings = context.strings.demo.divider;
        return Example(
          description: context.strings.examples.divider.separateAlternatives,
          child: SizedBox(
            width: 320,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: 16,
              children: [
                Text(strings.signInWithSchool),
                IdsDivider(child: Text(strings.or)),
                Text(strings.signInWithEmail),
              ],
            ),
          ),
        );
      },
    ),
    WidgetbookUseCase(
      name: 'Split a toolbar',
      builder: (context) {
        final strings = context.strings.demo.divider;
        return Example(
          description: context.strings.examples.divider.splitAToolbar,
          child: IntrinsicHeight(
            child: Row(
              spacing: 12,
              children: [
                Text(strings.account),
                const IdsDivider(orientation: Axis.vertical, decorative: true),
                Text(strings.settings),
                const IdsDivider(orientation: Axis.vertical, decorative: true),
                Text(strings.help),
              ],
            ),
          ),
        );
      },
    ),
  ],
);

final dividerChecks = WidgetbookComponent(
  name: 'Divider',
  useCases: [
    WidgetbookUseCase(
      name: 'Right to left',
      builder: (context) => Directionality(
        textDirection: TextDirection.rtl,
        child: SizedBox(
          width: 320,
          child: Column(
            spacing: 24,
            children: [
              IdsDivider(child: Text(context.strings.demo.divider.or)),
              Row(
                spacing: 12,
                children: [
                  Text(context.strings.demo.divider.account),
                  const IdsDivider(orientation: Axis.vertical),
                  Text(context.strings.demo.divider.settings),
                ],
              ),
            ],
          ),
        ),
      ),
    ),
    WidgetbookUseCase(
      name: 'Long child',
      builder: (context) => SizedBox(
        width: 240,
        child: IdsDivider(child: Text(context.strings.demo.field.longLabel)),
      ),
    ),
  ],
);
