import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart' as ids;
import 'package:widgetbook/widgetbook.dart';

import 'story_kit.dart';

Widget _labelled(ids.Label label) => SizedBox(
  width: 192,
  child: Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.stretch,
    spacing: 8,
    children: [
      label,
      StandInTextField(disabled: label.disabled),
    ],
  ),
);

final labelUseCases = [
  WidgetbookUseCase(
    name: 'Playground',
    builder: (context) => ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 320),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 8,
        children: [
          ids.Label(
            size: dropdown(context, 'size', ids.IdsSize.values),
            required: context.knobs.boolean(label: 'required'),
            disabled: context.knobs.boolean(label: 'disabled'),
            child: const Text('이름'),
          ),
          const StandInTextField(placeholder: '이름을 입력하세요'),
        ],
      ),
    ),
  ),
  WidgetbookUseCase(
    name: 'Gallery',
    builder: (context) => Showcase(
      children: [
        ShowcaseSection(
          title: 'Size × State',
          children: [
            for (final size in ids.IdsSize.values)
              ShowcaseRow(
                label: size.name,
                children: [
                  Wrap(
                    spacing: 32,
                    runSpacing: 32,
                    children: [
                      _labelled(
                        ids.Label(size: size, child: const Text('이메일')),
                      ),
                      _labelled(
                        ids.Label(
                          size: size,
                          required: true,
                          child: const Text('이메일'),
                        ),
                      ),
                      _labelled(
                        ids.Label(
                          size: size,
                          disabled: true,
                          child: const Text('이메일'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
          ],
        ),
      ],
    ),
  ),
];
