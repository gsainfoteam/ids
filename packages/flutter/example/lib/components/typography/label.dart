import 'package:flutter/material.dart';
import 'package:ids_flutter/ids.dart';
import 'package:widgetbook/widgetbook.dart';

import '../../catalog/showcase.dart';
import '../../catalog/strings.dart';

final label = WidgetbookComponent(
  name: 'Label',
  useCases: [
    WidgetbookUseCase(
      name: 'Playground',
      builder: (context) => IdsLabel(
        size: context.knobs.object.segmented(
          label: 'size',
          options: IdsSize.values,
          labelBuilder: (size) => size.name,
        ),
        required: context.knobs.boolean(label: 'required'),
        disabled: context.knobs.boolean(label: 'disabled'),
        invalid: context.knobs.boolean(label: 'invalid'),
        child: Text(
          context.knobs.string(
            label: 'child',
            initialValue: context.strings.demo.label.text,
          ),
        ),
      ),
    ),
    WidgetbookUseCase(
      name: 'Usage',
      builder: (context) =>
          IdsLabel(child: Text(context.strings.demo.label.text)),
    ),
    WidgetbookUseCase(
      name: 'Gallery',
      builder: (context) => Showcase(
        children: [
          ShowcaseSection(
            title: 'Size × State',
            children: [
              ShowcaseMatrix(
                rows: IdsSize.values,
                columns: const ['default', 'required', 'disabled'],
                builder: (size, state) => IdsLabel(
                  size: size,
                  required: state == 'required',
                  disabled: state == 'disabled',
                  child: Text(context.strings.demo.label.text),
                ),
              ),
            ],
          ),
        ],
      ),
    ),
  ],
);

final labelChecks = WidgetbookComponent(
  name: 'Label',
  useCases: [
    WidgetbookUseCase(
      name: 'Long text wraps before the asterisk',
      builder: (context) => SizedBox(
        width: context.dimension(200),
        child: IdsLabel(
          required: true,
          child: Text(context.strings.demo.label.longText),
        ),
      ),
    ),
    WidgetbookUseCase(
      name: 'Right to left',
      builder: (context) => Directionality(
        textDirection: TextDirection.rtl,
        child: IdsLabel(
          required: true,
          child: Text(context.strings.demo.label.text),
        ),
      ),
    ),
  ],
);
